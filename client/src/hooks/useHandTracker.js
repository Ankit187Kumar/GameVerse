import { useEffect, useState } from 'react';

// Normalized (0-1) distance between thumb tip and index fingertip below
// which the gesture counts as a "pinch tap".
const PINCH_DIST = 0.07;

// Minimum time between two "thumbs down" back-navigations, so a gesture
// held for a second doesn't fire back through several screens at once.
const BACK_GESTURE_COOLDOWN_MS = 1200;

// Singleton hand tracker (MediaPipe Hands + webcam) shared across whichever
// components need it, so we only ever open one camera/ML pipeline no matter
// how many game screens read from it. Consumers call startHandTracking() /
// stopHandTracking() to ref-count the camera's lifetime, and either
// subscribe() for live updates or getHandState() to poll on demand.

let handsInstance = null;
let cameraInstance = null;
let videoEl = null;
let previewCanvas = null;
let previewCtx = null;
let refCount = 0;
const listeners = new Set();

let backHandler = null;
let lastBackFiredAt = 0;

let state = { xPct: 50, yPct: 50, pinching: false, thumbsDown: false, handVisible: false, status: 'loading' };

function notify() {
  listeners.forEach((fn) => fn(state));
}

function ensureVideoEl() {
  if (videoEl) return videoEl;
  videoEl = document.createElement('video');
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.muted = true;
  Object.assign(videoEl.style, {
    position: 'fixed',
    width: '2px',
    height: '2px',
    opacity: '0',
    pointerEvents: 'none',
    top: '0',
    left: '0',
  });
  document.body.appendChild(videoEl);
  return videoEl;
}

function ensurePreviewCanvas() {
  if (previewCanvas) return previewCanvas;
  previewCanvas = document.createElement('canvas');
  previewCanvas.width = 320;
  previewCanvas.height = 240;
  previewCanvas.style.width = '100%';
  previewCanvas.style.height = '100%';
  previewCtx = previewCanvas.getContext('2d');
  return previewCanvas;
}

// Exposes the live singleton <canvas> node so a React component can mount
// it (appendChild) into its own container, the same way ensureVideoEl()
// owns the hidden <video> that actually feeds MediaPipe.
export function getPreviewCanvas() {
  return ensurePreviewCanvas();
}

function drawPreview(image, landmarks) {
  if (!previewCtx) return;
  const ctx = previewCtx;
  const { width, height } = previewCanvas;

  ctx.save();
  // Mirror horizontally so the preview matches what the player expects
  // (their real hand on the right shows on the right of the preview).
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 0, 0, width, height);

  if (landmarks && window.drawConnectors && window.HAND_CONNECTIONS) {
    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#60A5FA', lineWidth: 3 });
  }
  if (landmarks && window.drawLandmarks) {
    window.drawLandmarks(ctx, landmarks, { color: '#F97316', lineWidth: 1, radius: 3 });
  }
  ctx.restore();
}

// Rough "curled" test for one finger: in an upright hand the fingertip
// sits above its own middle (PIP) joint when extended, and drops below it
// once the finger is folded into a fist.
function isFingerCurled(landmarks, tipIdx, pipIdx) {
  return landmarks[tipIdx].y > landmarks[pipIdx].y;
}

// "Thumbs down": index/middle/ring/pinky folded into a fist while the
// thumb sticks out and points downward (below both the wrist and its own
// knuckle).
function isThumbsDown(landmarks) {
  const fist =
    isFingerCurled(landmarks, 8, 6) &&
    isFingerCurled(landmarks, 12, 10) &&
    isFingerCurled(landmarks, 16, 14) &&
    isFingerCurled(landmarks, 20, 18);
  if (!fist) return false;

  const wrist = landmarks[0];
  const thumbMcp = landmarks[2];
  const thumbTip = landmarks[4];
  return thumbTip.y > thumbMcp.y && thumbTip.y > wrist.y;
}

// Simulates a tap at the hand's on-screen position by finding whatever DOM
// element is actually rendered there and clicking it — this lets every
// existing onClick handler in the games work unchanged for hand input.
function simulateTapAt(fractionX, fractionY) {
  const kiosk = document.querySelector('.kiosk-aspect');
  if (!kiosk) return;
  const rect = kiosk.getBoundingClientRect();
  const clientX = rect.left + fractionX * rect.width;
  const clientY = rect.top + fractionY * rect.height;
  const el = document.elementFromPoint(clientX, clientY);
  if (el && typeof el.click === 'function') el.click();
}

function initTracker() {
  if (handsInstance) return;
  if (!window.Hands || !window.Camera) {
    setTimeout(initTracker, 250);
    return;
  }

  try {
    const video = ensureVideoEl();
    ensurePreviewCanvas();
    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });
    hands.onResults((results) => {
      const landmarks = results.multiHandLandmarks && results.multiHandLandmarks[0];
      drawPreview(results.image, landmarks);

      if (!landmarks) {
        state = { ...state, handVisible: false, pinching: false, thumbsDown: false };
        notify();
        return;
      }
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      const dist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
      const wasPinching = state.pinching;
      const nowPinching = dist < PINCH_DIST;
      const fractionX = 1 - indexTip.x; // mirrored so hand-right = cursor-right
      const fractionY = indexTip.y;

      const wasThumbsDown = state.thumbsDown;
      const nowThumbsDown = isThumbsDown(landmarks);

      state = {
        ...state,
        handVisible: true,
        pinching: nowPinching,
        thumbsDown: nowThumbsDown,
        xPct: fractionX * 100,
        yPct: fractionY * 100,
      };
      notify();

      if (nowPinching && !wasPinching) {
        simulateTapAt(fractionX, fractionY);
      }

      if (nowThumbsDown && !wasThumbsDown && backHandler) {
        const now = Date.now();
        if (now - lastBackFiredAt > BACK_GESTURE_COOLDOWN_MS) {
          lastBackFiredAt = now;
          backHandler();
        }
      }
    });
    handsInstance = hands;

    const camera = new window.Camera(video, {
      onFrame: async () => {
        if (handsInstance) await handsInstance.send({ image: video });
      },
      width: 480,
      height: 360,
    });
    camera
      .start()
      .then(() => {
        state = { ...state, status: 'ready' };
        notify();
      })
      .catch(() => {
        state = { ...state, status: 'unavailable' };
        notify();
      });
    cameraInstance = camera;
  } catch (err) {
    console.error('Hand tracker init failed:', err);
    state = { ...state, status: 'unavailable' };
    notify();
  }
}

export function startHandTracking() {
  refCount += 1;
  if (refCount === 1) {
    state = { ...state, status: 'loading' };
    notify();
    initTracker();
  }
}

export function stopHandTracking() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    if (cameraInstance) {
      try { cameraInstance.stop(); } catch (e) { /* noop */ }
    }
    if (handsInstance) {
      try { handsInstance.close(); } catch (e) { /* noop */ }
    }
    cameraInstance = null;
    handsInstance = null;
    state = { xPct: 50, yPct: 50, pinching: false, thumbsDown: false, handVisible: false, status: 'loading' };
  }
}

export function subscribeHandTracking(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function getHandState() {
  return state;
}

// Registers the function to call when the player makes a "thumbs down"
// gesture (e.g. navigate back a screen). Pass null to unregister.
export function setBackGestureHandler(fn) {
  backHandler = fn;
}

// React hook: mounts/unmounts the shared tracker and re-renders the caller
// on every update. Use for the visible cursor dot; for high-frequency
// polling inside a game loop, prefer getHandState() directly to avoid
// re-rendering that component on every frame.
export function useHandTrackerState(active) {
  const [s, setS] = useState(getHandState());
  useEffect(() => {
    if (!active) return undefined;
    startHandTracking();
    const unsubscribe = subscribeHandTracking(setS);
    return () => {
      unsubscribe();
      stopHandTracking();
    };
  }, [active]);
  return s;
}
