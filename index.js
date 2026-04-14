import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import bookRoutes from "./routes/bookRouter.js";
import userRoutes from "./routes/userRouter.js";
import cartRoutes  from"./routes/cartRoutes.js";

const app = express();
const PORT = 5000;

// Needed because __dirname is not available in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Enable CORS
app.use(cors());

// ✅ Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// ✅ API routes
app.use("/api/book", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
