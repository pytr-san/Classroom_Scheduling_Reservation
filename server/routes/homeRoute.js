import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {connectToDatabase} from '../db.js'

const router = express.Router();

// ✅ PROTECTED DEFAULT ROUTE ("/")
router.get("/", authMiddleware, (req, res) => {
    res.json({ message: "Welcome to Home", user: req.user });
});

// Fetch professors from the database
router.get('/api/professors', authMiddleware, async (req, res) => {
    try {
      const db = await connectToDatabase();
      const [rows] = await db.query('SELECT faculty_id, name FROM faculty');
  
      if (!rows.length) {
        return res.status(404).json({ message: 'No professors found' });
      }
      res.json(rows);
    } catch (err) {
      console.error('Error fetching professors:', err);
      res.status(500).json({ error: 'Error fetching professors' });
    }
  });

// Fetch subjects from the database
router.get('/api/subjects', authMiddleware , async (req, res) => {
    const { courseId, yearLevel } = req.query;
    
  // Retrieve course and year from query parameters
    const db = await connectToDatabase();
    if (!courseId || !yearLevel) {
        return res.status(400).json({ message: 'Course and Year are required' });
    }

    try {
        const query = `
            SELECT subject_id, subject_name 
            FROM subjects 
            WHERE course_id = ? AND year_level = ?
        `;
        const [rows] = await db.query(query, [courseId, yearLevel]);
        if (!rows.length) {
          return res.status(404).json({ message: 'No subjects found for this course and year' });
        }
console.log("Rows", rows);
        res.json(rows);
        
    } catch (err) {
        console.error('Error fetching subjects:', err);
        res.status(500).json({ error: 'Error fetching subjects' });
    }
});


// Fetch rooms from the database
router.get('/api/rooms',authMiddleware , async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT room_id, room_name FROM classroom');
        if (!rows.length) {
            return res.status(404).json({ message: 'No rooms found' });
        }
        res.json(rows);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: 'Error fetching rooms' });
    }
});



// Fetch professors from the database
router.get('/api/professors', authMiddleware, async (req, res) => {
    try {
      const db = await connectToDatabase();
      const [rows] = await db.query('SELECT faculty_id, name FROM faculty');
  
      if (!rows.length) {
        return res.status(404).json({ message: 'No professors found' });
      }
      res.json(rows);
    } catch (err) {
      console.error('Error fetching professors:', err);
      res.status(500).json({ error: 'Error fetching professors' });
    }
  });

// Fetch subjects from the database
router.get('/api/subjects', authMiddleware , async (req, res) => {
    const { courseId, yearLevel } = req.query;
  // Retrieve course and year from query parameters
    const db = await connectToDatabase();
    if (!courseId || !yearLevel) {
        return res.status(400).json({ message: 'Course and Year are required' });
    }
    try {
        const query = `
            SELECT subject_id, subject_name 
            FROM subjects 
            WHERE course_id = ? AND year_level = ?
        `;
        const [rows] = await db.query(query, [courseId, yearLevel]);
        if (!rows.length) {
          return res.status(404).json({ message: 'No subjects found for this course and year' });
        }
        res.json(rows);
        
    } catch (err) {
        console.error('Error fetching subjects:', err);
        res.status(500).json({ error: 'Error fetching subjects' });
    }
});


// Fetch rooms from the database
router.get('/api/rooms',authMiddleware , async (req, res) => {
    try {
        const db = await connectToDatabase();
        const results = await db.query('SELECT room_id, room_name FROM classroom');
        if (!results.length) {
            return res.status(404).json({ message: 'No rooms found' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: 'Error fetching rooms' });
    }
});


export default router;