const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Ensure .env variables are loaded

// 1. Configure Cloudinary
// Make sure these variables are in your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agriconnect-products', // The folder name in your Cloudinary dashboard
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Optional: Resize images automatically on upload to save bandwidth
    // transformation: [{ width: 800, height: 600, crop: 'limit' }], 
  },
});

// 3. Initialize Multer with Cloudinary Storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to handle single file upload
const uploadProductImage = upload.single('productImage');

module.exports = {
  uploadProductImage
};
