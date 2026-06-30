const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function maskMongoUri(uri) {
  if (!uri) return '(not set)';
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@');
}

function connectionHelp(uri, err) {
  const isLocal = /^mongodb:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(uri);
  const refused = err?.message?.includes('ECONNREFUSED');

  console.error('\n--- MongoDB connection failed ---');
  console.error(`URI: ${maskMongoUri(uri)}`);

  if (refused && isLocal) {
    console.error('\nNothing is listening on localhost:27017.');
    console.error('Local MongoDB is not running. Choose one option:\n');
    console.error('  A) Start local MongoDB (Windows service):');
    console.error('     net start MongoDB');
    console.error('     (Run PowerShell/CMD as Administrator if access is denied.)\n');
    console.error('  B) Use MongoDB Atlas (recommended for deployment):');
    console.error('     1. Create a free cluster at https://cloud.mongodb.com');
    console.error('     2. Copy the connection string');
    console.error('     3. Set MONGODB_URI in backend/.env, e.g.:');
    console.error('        MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/crop-yield-predictor');
  } else if (!uri) {
    console.error('\nMONGODB_URI is missing from backend/.env');
    console.error('Copy backend/.env.example to backend/.env and set MONGODB_URI.');
  } else {
    console.error('\nCheck that the host is reachable, credentials are correct, and your IP is allowed (Atlas Network Access).');
  }
  console.error('');
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    connectionHelp(uri, new Error('MONGODB_URI missing'));
    return false;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Connecting to MongoDB: ${maskMongoUri(uri)}`);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    connectionHelp(uri, err);
    return false;
  }
};

module.exports = connectDB;
