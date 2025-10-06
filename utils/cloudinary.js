// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// CLOUDINARY_URL=cloudinary://777577168343579:P6KIyR7PrIEGSbyrKSUvk4V4OA8@dz9gdqw7l
