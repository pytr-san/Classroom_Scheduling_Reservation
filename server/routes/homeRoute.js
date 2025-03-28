import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ PROTECTED DEFAULT ROUTE ("/")
router.get("/", authMiddleware, (req, res) => {
    res.json({ message: "Welcome to Home", user: req.user });
});

export default router;
