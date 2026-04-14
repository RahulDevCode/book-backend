import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controller/CartController.js";

const router = express.Router();

// ✅ Get all cart items
router.get("/", getCart);

router.get("/:userId", getCart);

// ✅ Add to cart
router.post("/", addToCart);

// ✅ Update cart item by ID
router.put("/:id", updateCartItem);

// ✅ Remove cart item by ID
router.delete("/:id", removeFromCart);

export default router;
