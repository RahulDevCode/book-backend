import express from "express";
import BookController from "../controller/BookController.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Routes
// Shortcut route (optional)
router.get("/", BookController.getBookdata);
router.post("/saveBookdata", upload.single("cover"), BookController.addBook);
router.put("/updateBook/:id", upload.single("cover"), BookController.updateBook);
router.get("/getBookdata", BookController.getBookdata);
router.delete("/deleteBook/:bookId", BookController.deleteBook);
router.get("/getBookdata/:id", BookController.getBookById); 

// Error handling middleware for Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
  next();
});

export default router;
