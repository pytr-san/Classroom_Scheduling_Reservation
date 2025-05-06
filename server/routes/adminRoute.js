import express from "express";
import { verifyAdminPin, getFacultyPasscode } from "../controllers/adminControllers.js";
import {connectToDatabase} from '../db.js'
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from 'bcryptjs';


const router = express.Router();

router.post("/verify-pin", verifyAdminPin);
router.get("/faculty-passcode", getFacultyPasscode);


router.post('/register-admin',authMiddleware, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        // Check if the email is already registered
        const [existingAdmins] = await db.query(
            `SELECT * FROM admin WHERE email = ?`,
            [email]
        );

        if (existingAdmins.length > 0) {
            return res.status(409).json({ message: "Email already exists." });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new admin into the database
        await db.query(
            `INSERT INTO admin (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: "Admin registered successfully." });

    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});

// Example for Express.js
router.get('/users/:role',authMiddleware , async (req, res) => {
    const { role } = req.params;
    
    // Make sure the role is valid
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    // Query based on the role
    let query = '';
    if (role === 'student') {
      query = 'SELECT * FROM student';
    } else if (role === 'faculty') {
      query = 'SELECT * FROM faculty';
    } else if (role === 'admin') {
      query = 'SELECT * FROM admin';
    }
    
    const db = await connectToDatabase();
  
    try {
        
      const [rows] = await db.execute(query);
      res.status(200).json(rows);  // Sending users for the given role
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  


    router.patch('/users/:role/:id/status',authMiddleware, async (req, res) => {
        const { role, id } = req.params;
        const { is_active } = req.body;
      
        const tableMap = {
          student: 'student',
          faculty: 'faculty',
          admin: 'admin'
        };

        const columnMap = {
          student: 'student_id',
          faculty: 'faculty_id',
          admin: 'admin_id'
        };
      
        const table = tableMap[role];
        const column = columnMap[role];
        if (!table || !column) {
          return res.status(400).json({ message: 'Invalid role' });
        }

        try {
          const db = await connectToDatabase();
          await db.execute(`UPDATE ${table} SET is_active = ? WHERE ${column} = ?`, [is_active, id]);
          res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully.` });
        } catch (error) {
          console.error("Update error:", error);
          res.status(500).json({ message: 'Update failed', error: error.message });

        }
      });



export default router;
