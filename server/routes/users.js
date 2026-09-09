const express = require('express');
const router = express.Router();
const fs = require('fs');
const os = require('os');
const path = require('path');
const User = require('../models/User');
const { generateLocalVideo, generateAIVideo } = require('../services/videoService');

// Fields that hold large binary payloads — never send these back inline in JSON.
const PUBLIC_FIELDS = '-photoData -videoData';

// Helper to decode a Base64 data URI into a Buffer + content type
const decodeBase64Image = (base64Data) => {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid Base64 format');
  }
  return { contentType: matches[1], buffer: Buffer.from(matches[2], 'base64') };
};

/**
 * @route   POST /api/users
 * @desc    Save user details, capture photo, and generate the video
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, frameId, photo, quizAnswers } = req.body;

    if (!name || !phone || !email || !frameId || !photo) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const { contentType: photoContentType, buffer: photoBuffer } = decodeBase64Image(photo);

    const user = new User({
      name,
      phone,
      email,
      frameId,
      photoUrl: '',
      photoData: photoBuffer,
      photoContentType,
      quizAnswers: quizAnswers || [],
      status: 'pending',
    });

    user.photoUrl = `/api/users/${user._id}/photo`;
    await user.save();

    // Video generation must finish before we respond — a serverless function
    // is frozen right after the response is sent, so "fire and forget" background
    // work would never actually run.
    await processVideo(user._id);

    const finalUser = await User.findById(user._id).select(PUBLIC_FIELDS);

    return res.status(201).json({
      message: 'User registered. Video generation complete.',
      userId: user._id,
      status: finalUser.status,
      videoUrl: finalUser.videoUrl,
    });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id/status
 * @desc    Get video generation status for polling
 */
router.get('/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user._id,
      status: user.status,
      videoUrl: user.videoUrl,
      error: user.error,
    });
  } catch (error) {
    console.error('Error in GET /api/users/:id/status:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id/photo
 * @desc    Stream the user's captured photo
 */
router.get('/:id/photo', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('photoData photoContentType');
    if (!user || !user.photoData) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.set('Content-Type', user.photoContentType || 'image/jpeg');
    return res.send(user.photoData);
  } catch (error) {
    console.error('Error in GET /api/users/:id/photo:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id/video
 * @desc    Stream the user's generated video
 */
router.get('/:id/video', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('videoData videoContentType');
    if (!user || !user.videoData) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.set('Content-Type', user.videoContentType || 'video/mp4');
    return res.send(user.videoData);
  } catch (error) {
    console.error('Error in GET /api/users/:id/video:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get complete user details (excluding binary payloads)
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error in GET /api/users/:id:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details (name, phone, email) once submitted
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    user.phone = phone;
    user.email = email;
    await user.save();

    const publicUser = await User.findById(user._id).select(PUBLIC_FIELDS);
    return res.json({ message: 'User details updated successfully', user: publicUser });
  } catch (error) {
    console.error('Error in PUT /api/users/:id:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/users/:id/quiz
 * @desc    Save a quiz answer
 */
router.post('/:id/quiz', async (req, res) => {
  try {
    const { answer } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.quizAnswers.push(answer);
    await user.save();

    return res.json({ message: 'Quiz answer saved', quizAnswers: user.quizAnswers });
  } catch (error) {
    console.error('Error in POST /api/users/:id/quiz:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Generate the video for a user, using the OS temp dir for intermediate
 * files (the only writable location inside a Vercel serverless function),
 * then persist the final MP4 into MongoDB as binary data.
 */
async function processVideo(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'photobooth-'));
  const photoPath = path.join(tmpDir, 'photo.jpg');
  const videoOutputPath = path.join(tmpDir, 'video.mp4');

  try {
    user.status = 'processing';
    await user.save();

    console.log(`Processing video for User: ${user.name} (${user._id})`);

    fs.writeFileSync(photoPath, user.photoData);

    const frameFile = `${user.frameId}.png`;
    const framePath = path.join(__dirname, '../public/frames', frameFile);
    const audioPath = path.join(__dirname, '../public/audio/bg_music.mp3');

    const mode = process.env.VIDEO_GENERATION_MODE || 'local';

    if (mode === 'AI' && process.env.REPLICATE_API_TOKEN) {
      // Replicate accepts a raw base64 data URI directly, so a public URL
      // for the photo is not required.
      const photoBase64 = `data:${user.photoContentType || 'image/jpeg'};base64,${user.photoData.toString('base64')}`;
      await generateAIVideo(photoBase64, framePath, videoOutputPath, process.env.REPLICATE_API_TOKEN);
    } else {
      await generateLocalVideo(photoPath, framePath, videoOutputPath, audioPath);
    }

    user.videoData = fs.readFileSync(videoOutputPath);
    user.videoContentType = 'video/mp4';
    user.videoUrl = `/api/users/${user._id}/video`;
    user.status = 'completed';
    await user.save();
    console.log(`Video generation completed for User: ${user._id}`);
  } catch (error) {
    console.error(`Video generation failed for User: ${user._id}`, error);
    user.status = 'failed';
    user.error = error.message || 'Video generation failed';
    await user.save();
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = router;
