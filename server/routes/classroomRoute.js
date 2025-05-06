import express from "express";
import {connectToDatabase} from '../db.js'
import authMiddleware from "../middleware/authMiddleware.js"; 

const router = express.Router();


router.get("/list", async  (req, res) => {
    try {
        const db = await connectToDatabase();
        const [results] = await db.execute("SELECT * FROM classroom"); 
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

router.get('/get-all-courses', async (req, res) => {
    try {
      const db = await connectToDatabase();
      const [courses] = await db.execute('SELECT course_id, course_name FROM course');
      res.json(courses); 
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching courses' });
    }
  });
  

export default router;