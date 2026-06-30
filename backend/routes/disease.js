const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const auth = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();

const PYTHON_DISEASE_URL =
  process.env.PYTHON_DISEASE_URL ||
  "http://localhost:5000/v1/detect/pest-disease";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/predict", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Image file is required." });
    }
    const form = new FormData();

    form.append("crop_img", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
    });
    const { data } = await axios.post(PYTHON_DISEASE_URL, form, {
      headers: form.getHeaders(),
    });

    res.json(data);
  } catch (e) {
    const status = e.response?.status || 500;
    const msg = e.response?.data?.message || e.message;
    res.status(status).json({ error: msg || "Disease prediction failed." });
  }
});

module.exports = router;
