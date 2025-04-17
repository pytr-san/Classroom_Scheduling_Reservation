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


router.post('/api/schedule/save', async (req, res) => {
    const { course, year, section, rooms } = req.body;
  
    if (!course || !year || !section || !rooms) {
      return res.status(400).json({ message: 'Missing data' });
    }
  
    const pool = await connectToDatabase();
    const connection = await pool.getConnection(); // ✅ Get connection from pool
  
    try {
      await connection.beginTransaction(); // ✅ Start transaction
  
      // Optional: Clear existing entries for this tab
      await connection.query(
        'DELETE FROM ex_schedules WHERE course = ? AND year = ? AND section = ?',
        [course, year, section]
      );
  
      for (const room of rooms) {
        for (const slot of room.time_slots) {
          const { timeSlot, subject, proctor } = slot;
  
          await connection.query(
            'INSERT INTO ex_schedules (course, year, section, room_name, time_slot, subject, proctor) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [course, year, section, room.room_name, timeSlot, subject, proctor]
          );
        }
      } 
  
      await connection.commit(); // ✅ Commit transaction
      res.status(200).json({ message: 'Schedule saved successfully' });
    } catch (error) {
      console.error('❌ Error saving schedule:', error);
      await connection.rollback(); // ✅ Rollback on failure
      res.status(500).json({ message: 'Failed to save schedule' });
    } finally {
      connection.release(); // ✅ Always release the connection
    }
  });
  

export default router;