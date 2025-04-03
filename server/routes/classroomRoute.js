import express from "express";
import {connectToDatabase} from '../db.js'
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", async  (req, res) => {
    try {
        const db = await connectToDatabase();
        const [results] = await db.execute("SELECT * FROM classroom"); 
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

export default router;