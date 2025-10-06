// routes/uploadRoutes.js
import express from 'express';
import upload from '../middleware/multer.config.js';
import { uploadImage } from '../controller/upload.controller.js';

const router = express.Router();

router.post('/image', upload.single('image'), uploadImage);

export default router;
