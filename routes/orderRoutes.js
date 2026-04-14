import express from "express";
import pool from "../config/dbconfig.js";

const router = express.Router();

// ✅ Create order
router.post("/", async (req, res) => {
  try {
    const { user_id, total } = req.body;
    const [result] = await pool.query("INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')", [user_id, total]);
    res.json({ success: true, orderId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Get orders (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, u.email, o.total, o.status, o.created_at 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// ✅ Top Selling Books
router.get("/top-books", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.title, SUM(oi.quantity) AS sales, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi
       JOIN book b ON oi.book_id = b.id
       GROUP BY b.id
       ORDER BY sales DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top books" });
  }
});

// ✅ Get orders with items (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    // Get orders with user details
    const [orders] = await pool.query(
      `SELECT o.id, u.name AS customer_name, u.email AS customer_email, u.address AS customer_address,
              o.total, o.status, o.created_at 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );

    if (orders.length === 0) {
      return res.json([]);
    }

    // Extract all order IDs
    const orderIds = orders.map((o) => o.id);

    // Get items for those orders
    const [items] = await pool.query(
      `SELECT oi.order_id, oi.book_id, oi.quantity, oi.price,
              b.title, b.author
       FROM order_items oi
       JOIN book b ON oi.book_id = b.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    // Merge items into orders
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((it) => it.order_id === order.id),
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});



export default router;
