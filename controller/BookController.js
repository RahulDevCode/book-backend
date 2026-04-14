import pool from "../config/dbconfig.js";
import multer from "multer";
import path from "path"
// Storage setup for cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ensure uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Controller
// Save book data
export const addBook = async (req, res) => {
  try {
    console.log("📩 Incoming body:", req.body);
    console.log("📸 Incoming file:", req.file);

    const {
      title,
      author,
      isbn,
      category,
      price,
      stock,
      publishedDate,
      description
    } = req.body;

    const cover = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO book 
      (title, author, isbn, category, price, stock, publishedDate, description, cover) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      title,
      author,
      isbn,
      category,
      price,
      stock,
      publishedDate,
      description,
      cover
    ]);

    res.status(200).json({
      id: result.insertId,
      title,
      author,
      isbn,
      category,
      price,
      stock,
      publishedDate,
      description,
      cover
    });
  } catch (err) {
    console.error("❌ Save book error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};





const getBookdata = async (req, res) => {
  
  try {
    const [rows] = await pool.query("SELECT * FROM book ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateBook = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Book ID is required" });
  }

  try {
    const { title, author, category, isbn, price, stock, publishedDate, description } = req.body;
    const cover = req.file ? req.file.filename : null;

    // Base query + values
    let query = `
      UPDATE book SET
        title = ?, author = ?, category = ?, isbn = ?,
        price = ?, stock = ?, publishedDate = ?, description = ?
    `;
    let values = [title, author, category, isbn, price, stock, publishedDate, description];

    // Add cover if provided
    if (cover) {
      query += `, cover = ?`;
      values.push(cover);
    }

    // Add WHERE
    query += ` WHERE id = ?`;
    values.push(id);

    // Run query
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const [updatedBook] = await pool.query("SELECT * FROM book WHERE id = ?", [id]);
    res.json(updatedBook[0]);

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error during update", details: err.message });
  }
};


// Controller
const deleteBook = async (req, res) => {
  const { bookId } = req.params;


  if (!bookId) {
    console.log("❌ No bookId provided");
    return res.status(400).json({ message: "No bookId provided" });
  }

  const query = "DELETE FROM book WHERE id = ?";

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Execute the DELETE query
    const [result] = await connection.query(query, [bookId]);

    connection.release(); // Release the connection back to the pool

    if (result.affectedRows === 0) {
      console.log("⚠️ No book found with ID:", bookId);
      return res.status(404).json({ message: "Book not found" });
    }

    
    res.status(200).json({ message: "Book deleted successfully", bookId });
  } catch (err) {
    console.error("❌ Error deleting book:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

const getBookById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM book WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(rows[0]); // return single book
  } catch (error) {
    console.error("❌ Error fetching book by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





export default {
  addBook,
  getBookdata,
  getBookById,
  deleteBook,
  updateBook
};

