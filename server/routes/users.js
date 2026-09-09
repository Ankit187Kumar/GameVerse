const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { generateLocalVideo, generateAIVideo } = require('../services/videoService');

// Helper to save Base64 Image to File
const saveBase64Image = (base64Data, filename) => {
  // Strip off helper header like "data:image/jpeg;base64,"
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid Base64 format');
  }

  const imageBuffer = Buffer.from(matches[2], 'base64');
  const uploadDir = path.join(__dirname, '../public/uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, imageBuffer);
  return `/uploads/${filename}`;
};

/**
 * @route   POST /api/users
 * @desc    Save user details, capture photo, and trigger video generation
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, frameId, photo, quizAnswers } = req.body;

    if (!name || !phone || !email || !frameId || !photo) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Save Captured Photo
    const filename = `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const photoUrl = saveBase64Image(photo, filename);

    // Save User to Database
    const user = new User({
      name,
      phone,
      email,
      frameId,
      photoUrl,
      quizAnswers: quizAnswers || [],
      status: 'pending',
    });

    await user.save();

    // Trigger Video Generation in Background
    processVideoInBackground(user._id);

    return res.status(201).json({
      message: 'User registered. Video generation started.',
      userId: user._id,
      status: user.status,
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
    const user = await User.findById(req.params.id);
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
 * @route   GET /api/users/:id
 * @desc    Get complete user details
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
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

    return res.json({ message: 'User details updated successfully', user });
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
 * Helper to run video generation in the background
 */
async function processVideoInBackground(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  try {
    user.status = 'processing';
    await user.save();

    console.log(`[Background] Processing video for User: ${user.name} (${user._id})`);

    const frameFile = `${user.frameId}.png`;
    const framePath = path.join(__dirname, '../public/frames', frameFile);

    // Fallback if frame PNG doesn't exist, we use a basic mock or check
    if (!fs.existsSync(framePath)) {
      console.warn(`Frame file not found: ${framePath}. Creating directories and using a dummy if needed...`);
      // We will ensure public/frames directory exists
      const framesDir = path.dirname(framePath);
      if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
      }
      // Create a small empty image or just warn. We'll pre-create these later in step 5,
      // but if still missing, we will write a tiny blank png/warning.
    }

    const photoPath = path.join(__dirname, '../public', user.photoUrl);
    const videoFilename = `video_${user._id}.mp4`;
    const videoOutputPath = path.join(__dirname, '../public/generated', videoFilename);
    const relativeVideoUrl = `/generated/${videoFilename}`;

    // Ensure output directories exist
    const genDir = path.dirname(videoOutputPath);
    if (!fs.existsSync(genDir)) {
      fs.mkdirSync(genDir, { recursive: true });
    }

    const mode = process.env.VIDEO_GENERATION_MODE || 'local';
    const audioPath = path.join(__dirname, '../public/audio/bg_music.mp3');

    if (mode === 'AI' && process.env.REPLICATE_API_TOKEN) {
      // For AI, we need a public URL of the photo if Replicate needs to download it.
      // Since local servers might run on localhost, if Replicate can't reach localhost,
      // we can upload it, or if Replicate supports Base64, or if we fallback.
      // SVD model on Replicate requires a public web URL. 
      // If localhost, Replicate can fail to fetch photo.
      // To handle this, we can check if SERVER_URL is localhost. If it is localhost, we write a note 
      // and default to local FFmpeg mode, OR we can upload base64 image data using a free image host
      // or inline image. Replicate's API accepts raw base64 data URIs for images! 
      // Yes! Replicate inputs can take "data:image/jpeg;base64,..." directly.
      // Let's pass the raw image data URI to Replicate to avoid public URL issues!
      const photoBase64 = `data:image/jpeg;base64,${fs.readFileSync(photoPath).toString('base64')}`;
      await generateAIVideo(photoBase64, framePath, videoOutputPath, process.env.REPLICATE_API_TOKEN);
    } else {
      // Local mode (FFmpeg)
      await generateLocalVideo(photoPath, framePath, videoOutputPath, audioPath);
    }

    user.videoUrl = relativeVideoUrl;
    user.status = 'completed';
    await user.save();
    console.log(`[Background] Video generation completed for User: ${user._id}`);
  } catch (error) {
    console.error(`[Background] Video generation failed for User: ${user._id}`, error);
    user.status = 'failed';
    user.error = error.message || 'Video generation failed';
    await user.save();
  }
}

module.exports = router;
