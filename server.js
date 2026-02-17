require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const app = express();

// Configure S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration (store file in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload Route

// for single file upload

// app.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     const file = req.file;

//     const params = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `uploads/${Date.now()}-${file.originalname}`,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };

//     const command = new PutObjectCommand(params);
//     await s3.send(command);

//     res.json({
//       message: "File uploaded successfully",
//       fileName: params.Key,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });


//for multiple file uploads

app.post("/upload", upload.array("images", 5), async (req, res) => {
  try {
    const files = req.files;   // <-- multiple files

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      uploadedFiles.push(params.Key);
    }

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
