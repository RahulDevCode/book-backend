import pool from "../config/dbconfig.js";

// 📌 Get cart by userId (with book details)
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
         c.id AS cart_id,
         c.user_id,
         c.book_id, 
         c.quantity, 
         b.title, 
         CAST(b.price AS DECIMAL(10,2)) AS price, 
         b.cover
       FROM cart c
       JOIN book b ON c.book_id = b.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Add book to cart
const addToCart = async (req, res) => {
  try {
    const { user_id, book_id, quantity } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({ message: "User ID and Book ID are required" });
    }

    // Check if book already exists in user's cart
    const [existing] = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? AND book_id = ?",
      [user_id, book_id]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND book_id = ?",
        [quantity || 1, user_id, book_id]
      );
      return res.json({ success: true, message: "Cart updated" });
    } else {
      await pool.query(
        "INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)",
        [user_id, book_id, quantity || 1]
      );
      return res.status(201).json({ success: true, message: "Item added to cart" });
    }
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart table ka primary id
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const [result] = await pool.query(
      "UPDATE cart SET quantity = ? WHERE id = ?",
      [quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Remove cart item
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM cart WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("❌ Error removing cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getCart, addToCart, updateCartItem, removeFromCart };
