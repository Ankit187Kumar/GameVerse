require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const userRoutes = require('./routes/users');

const app = express();

// Connect to MongoDB (connection is cached/reused across invocations)
connectDB();

app.use(cors({
  origin: true,
  credentials: true,
}));

// Increase JSON limit to handle Base64 image uploads from client camera
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Serve static assets (frames, audio, download.html) for local dev.
// On Vercel these are read directly from disk by the video service instead.
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Photo-to-Video Kiosk API is running.');
});

module.exports = app;
