import express from "express";
import multer from "multer";
import cors from "cors";
import { uploadFile } from "./main.js";
import { create } from "ipfs-http-client";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log('Received file upload');
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cid = await uploadFile(req.file.buffer);
    res.json({
      message: "File uploaded successfully",
      cid,
      url: `https://ipfs.io/ipfs/${cid}`,
      status: !!cid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Text upload endpoint
app.post('/uploadtext', async (req, res) => {
  try {
    const text = req.body.message;
    if (!text) return res.status(400).json({ message: "No text uploaded" });

    const client = create({ url: "http://127.0.0.1:5001" });
    const buffer = Buffer.from(text, "utf-8");

    const result = await client.add(buffer);

    console.log("✅ Text uploaded!");
    console.log("CID:", result.cid.toString());
    console.log("Gateway URL: https://ipfs.io/ipfs/" + result.cid.toString());

    res.json({
      message: "Text uploaded successfully",
      cid: result.cid.toString(),
      url: `https://ipfs.io/ipfs/${result.cid.toString()}`,
      status: !!result.cid.toString()
    });
    
  } catch (err) {
    console.error("❌ Error uploading text:", err);
    res.status(500).json({ message: "Error uploading text", error: err.message });
  }
});

// Root
app.post('/', (req, res) => res.json({ message: "success" }));

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
