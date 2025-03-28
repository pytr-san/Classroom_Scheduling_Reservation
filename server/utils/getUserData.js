// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { connectToDatabase } from '../db.js';// Ensure you have this function to connect to MySQL

// const router = express.Router();

// router.get("/user", authMiddleware, async (req, res) => {
//     try {
//         const db = await connectToDatabase();
//         const { id, role } = req.user; // Extract user ID and role from the verified token

//         let userTable = "";

//         // ✅ Determine the correct table based on the role
//         if (role === "admin") {
//             userTable = "admin";
//         } else if (role === "faculty") {
//             userTable = "faculty";
//         } else if (role === "student") {
//             userTable = "student";
//         } else {
//             return res.status(403).json({ message: "Invalid role" });
//         }

//         // ✅ Fetch user details from the correct table
//         const [rows] = await db.execute(`SELECT * FROM ${userTable} WHERE id = ?`, [id]);

//         if (rows.length === 0) {
//             return res.status(404).json({ message: "User not found" });
//         }
        
//         delete user.password;

//         return res.json({ valid: true, user: rows[0] });

//     } catch (error) {
//         console.error("Error verifying token:", error);
//         return res.status(500).json({ message: "Server error" });
//     }
// });

// export default router;
