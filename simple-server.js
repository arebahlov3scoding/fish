const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static("."));

// Configure multer to save directly to images folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save all files to the images directory
    const uploadPath = "./images/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Single endpoint for both images and videos
app.post(
  "/upload",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const result = {};

      if (req.files.image) {
        // Return relative path for images
        result.imageUrl = `images/${req.files.image[0].filename}`;
      }

      if (req.files.video) {
        // Return relative path for videos
        result.videoUrl = `images/${req.files.video[0].filename}`;
      }

      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload files" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Simple file server running on http://localhost:${PORT}`);
  console.log("Files will be saved to ./images/ directory");
});
