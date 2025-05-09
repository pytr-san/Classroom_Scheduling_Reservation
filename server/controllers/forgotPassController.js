import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '../db.js';
import { validationResult, param, body } from 'express-validator';

export const validateResetPassword = [
  param('token')
    .notEmpty().withMessage('Token is required')
    .isLength({ min: 10 }).withMessage('Token is too short'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 16 characters long'),
];

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const db = await connectToDatabase();
  try {
    // Check student_user
    const [studentRows] = await db.query('SELECT * FROM student WHERE email = ?', [email]);
    if (studentRows.length > 0) {
      await db.query('UPDATE student SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?', [token, expiry, email]);
    }

    // Check faculty_user
    const [facultyRows] = await db.query('SELECT * FROM faculty WHERE email = ?', [email]);
    if (facultyRows.length > 0) {
      await db.query('UPDATE faculty SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?', [token, expiry, email]);
    }

    // If not found in either table
    if (studentRows.length === 0 && facultyRows.length === 0) {
      return res.status(404).json({ error: 'Email not found in the system' });
    }

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}


export async function resetPassword(req, res) {


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

    const { token } = req.params;
    const { password } = req.body;
    const db = await connectToDatabase();
    try {
      const hashed = await bcrypt.hash(password, 10);
  
      // Try student_user
      const [studentRows] = await db.query('SELECT * FROM student WHERE resetToken = ? AND resetTokenExpiry > NOW()', [token]);
      if (studentRows.length > 0) {
        await db.query(
          'UPDATE student SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE resetToken = ?',
          [hashed, token]
        );
        return res.json({ message: 'Password reset successfully (student)' });
      }
  
      // Try faculty_user
      const [facultyRows] = await db.query('SELECT * FROM faculty WHERE resetToken = ? AND resetTokenExpiry > NOW()', [token]);
      if (facultyRows.length > 0) {
        await db.query(
          'UPDATE faculty SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE resetToken = ?',
          [hashed, token]
        );
        return res.json({ message: 'Password reset successfully (faculty)' });
      }
  
      return res.status(400).json({ error: 'Invalid or expired token' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
  