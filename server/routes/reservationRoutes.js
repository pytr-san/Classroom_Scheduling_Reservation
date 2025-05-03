import express from 'express';
import { connectToDatabase } from '../db.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all reservations
router.get('/reservations', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.execute('SELECT * FROM reservations');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Backend route to get a specific reservation by ID
router.get('/reservations/:id', async (req, res) => {
    const { id } = req.params; // Get the reservation ID from the URL
  
    try {
      const db = await connectToDatabase();
      const [rows] = await db.execute('SELECT * FROM reservations WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' }); // If no reservation is found
      }
  
      res.json(rows[0]); // Send the reservation data as response
    } catch (err) {
      console.error('Error fetching reservation:', err);
      res.status(500).json({ error: 'Failed to fetch reservation' });
    }
  });
  

// POST new reservation
router.post('/reservations', async (req, res) => {
  const { reservedBy, reservationDate, reservationStartTime, reservationEndTime, roomName } = req.body;

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(
      `INSERT INTO reservations (reserved_by, reservation_date, reservation_start_time, reservation_end_time, room_name)
       VALUES (?, ?, ?, ?, ?)`,
      [reservedBy, reservationDate, reservationStartTime, reservationEndTime, roomName]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// PUT update reservation
// Backend route to update reservation
router.put('/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const { reservedBy, reservationDate, reservationStartTime, reservationEndTime, roomName } = req.body;
  
    try {
      const db = await connectToDatabase();
      const [result] = await db.execute(
        `UPDATE reservations
         SET reserved_by = ?, reservation_date = ?, reservation_start_time = ?, reservation_end_time = ?, room_name = ?
         WHERE id = ?`,
        [reservedBy, reservationDate, reservationStartTime, reservationEndTime, roomName, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
  
      res.json({ message: 'Reservation updated' });
    } catch (err) {
      console.error('Error updating reservation:', err);
      res.status(500).json({ error: 'Failed to update reservation' });
    }
  });
  

// DELETE reservation
router.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute('DELETE FROM reservations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    console.error('Error deleting reservation:', err);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

export default router;