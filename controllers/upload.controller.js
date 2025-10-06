// controllers/uploadController.js
export const uploadImage = async (req, res) => {
  try {
    const imageUrl = req.file.path;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
};
