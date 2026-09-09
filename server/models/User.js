const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  frameId: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  photoData: {
    type: Buffer,
  },
  photoContentType: {
    type: String,
    default: 'image/jpeg',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  videoData: {
    type: Buffer,
  },
  videoContentType: {
    type: String,
    default: 'video/mp4',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  error: {
    type: String,
    default: '',
  },
  quizAnswers: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
