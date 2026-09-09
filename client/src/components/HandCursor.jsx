import React from 'react';
import { Hand } from 'lucide-react';
import { useHandTrackerState } from '../hooks/useHandTracker';

// Visual overlay for hand-gesture play: a floating cursor that follows the
// player's tracked hand, glowing green on a pinch ("tap"). Mount this only
// while a screen should be playable by hand (Countdown + GamePlay) — it
// owns the camera/tracker lifecycle via useHandTrackerState.
const HandCursor = ({ active }) => {
  const { xPct, yPct, pinching, handVisible, status } = useHandTrackerState(active);

  if (!active) return null;

  return (
    <>
      {status === 'ready' && handVisible && (
        <div
          className="fixed z-[999] pointer-events-none"
          style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={`rounded-full flex items-center justify-center transition-all duration-100 ${
              pinching
                ? 'w-10 h-10 bg-green-400/90 border-4 border-white shadow-[0_0_25px_rgba(74,222,128,0.9)] scale-90'
                : 'w-14 h-14 bg-blue-400/40 border-4 border-white shadow-[0_0_20px_rgba(96,165,250,0.7)]'
            }`}
          >
            <Hand className="w-5 h-5 text-white drop-shadow" />
          </div>
        </div>
      )}
      {status === 'ready' && !handVisible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/85 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none flex items-center gap-2 shadow-lg">
          <Hand className="w-4 h-4" /> Show your hand to the camera
        </div>
      )}
      {status === 'loading' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/85 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none">
          Starting hand tracking...
        </div>
      )}
      {status === 'unavailable' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-red-900/90 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none">
          Camera unavailable — tap to play instead
        </div>
      )}
    </>
  );
};

export default HandCursor;
