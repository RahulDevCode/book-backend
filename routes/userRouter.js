import express from "express";
import pool from "../config/dbconfig.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"


const router = express.Router();
const JWT_SECRET = "supersecretkey"; // 👉 isko .env file me rakho better security ke liye



router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log("Signup hit", req.body);

  try {
    // check if user already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert new user
    await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ LOGIN

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    // 👇 sirf yahi ek res.json hoga
    res.json({
      message: "Login successful",
      token,
      email: user.email
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, created_at FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
