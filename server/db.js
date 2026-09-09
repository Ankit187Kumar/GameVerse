const mongoose = require('mongoose');

// Cache the connection promise across serverless invocations (warm containers)
// so we don't open a new MongoDB connection on every request.
let cachedPromise = null;

const connectDB = () => {
  if (cachedPromise) return cachedPromise;

  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/photobooth';
  console.log(`Connecting to MongoDB at: ${connString}...`);

  cachedPromise = mongoose
    .connect(connString)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`MongoDB connection error: ${error.message}`);
      cachedPromise = null;
      throw error;
    });

  return cachedPromise;
};

module.exports = connectDB;
