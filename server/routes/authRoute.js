import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../db.js';
import authMiddleware from "../middleware/authMiddleware.js";
import dotenv from 'dotenv';
import cron from 'node-cron';
import { forgotPassword, resetPassword } from '../controllers/forgotPassController.js';
import { body, validationResult } from 'express-validator';

dotenv.config();

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

const INACTIVITY_PERIOD = 60; // days
//for checking: Runs every 10seconds
//cron.schedule('*/10 * * * * *', async () => { 
cron.schedule('0 0 * * *', async () => {
 
  try {
    const db = await connectToDatabase();
    const currentDate = new Date();
    const inactivityThresholdDate = new Date(currentDate.getTime() - INACTIVITY_PERIOD * 24 * 60 * 60 * 1000);

    const [studentsToDeactivate] = await db.execute(
      'SELECT * FROM student WHERE last_active < ? AND status = "active"',
      [inactivityThresholdDate]
    );

    if (studentsToDeactivate.length > 0) {
      const studentIds = studentsToDeactivate.map(student => student.student_id);
      const placeholders = studentIds.map(() => '?').join(', ');

      await db.execute(
        `UPDATE student SET status = "inactive" WHERE student_id IN (${placeholders})`,
        studentIds
      );

      console.log(`Deactivated ${studentsToDeactivate.length} students.`);
    } else {
      console.log('No students to deactivate.');
    }
  } catch (error) {
    console.error('Error checking inactive users:', error);
  }
});



// ✅ Register Faculty or Student
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const allowedDomain = "@spist.edu.ph";
        if (!email.endsWith(allowedDomain)) {
            return res.status(403).json({ error: "Unauthorized email. Please use your organization email." });
        }

        let tableName = role.toLowerCase()=== "faculty" ? "faculty" : "student";

        const [rows] = await db.execute(
            `SELECT * FROM ${tableName} WHERE email = ? OR name = ?`,
            [email, name]
        );

        if (rows.length > 0) {
            return res.status(400).json({ error: "email or name already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO ${tableName} (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role.toLowerCase()]
        );
        res.status(201).json({ user: { name, email, role: role.toLowerCase() }, message: `${role.toLowerCase()} registered successfully` });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

const isProduction = process.env.NODE_ENV === "production";
const MAX_ATTEMPTS = 5;
const COOLDOWN_MINUTES = 120;
router.post( '/login',
[

  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail()
    .escape(),

  body('password')
    .trim()
    .isLength({ min: 16 }).withMessage('Password must be at least 16 characters.')
],
async (req, res) => {
 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
    });
  }
    try {
        const db = await connectToDatabase();
        const { email, password } = req.body;

        let user = null;

        const [users] = await db.query(
            `SELECT admin_id AS id, NULL AS course_id, name, email, password, is_active, status, role, failed_attempts, last_failed_login FROM admin WHERE email = ?
            UNION 
            SELECT student_id AS id, course_id, name, email, password, is_active, status, role, failed_attempts, last_failed_login FROM student WHERE email = ?
            UNION 
            SELECT faculty_id AS id, NULL AS course_id, name, email, password, is_active, status, role, failed_attempts, last_failed_login FROM faculty WHERE email = ?`, 
            [email, email, email]
        );


        if (users.length > 0) { 
            user = users[0]; 
        }

        if (!user) {
            return res.status(401).json({ message: "User not found. Please check your email." });
        }

        const table = user.role;

            if (user.failed_attempts >= MAX_ATTEMPTS) {

                if (!user.last_failed_login) {
                    return res.status(403).json({
                    message: "Account locked. Please try again later or contact admin."
                    });
                }
                
                const lastFailed = new Date(user.last_failed_login);
                const now = new Date();
                const minutesSinceLastFail = (now - lastFailed) / 60000;
                
                if (minutesSinceLastFail >= COOLDOWN_MINUTES) {
                  
                    await db.query(
                    `UPDATE ${table} SET failed_attempts = 0, last_failed_login = NULL WHERE ${table}_id = ?`,
                    [user.id]
                    );
                    user.failed_attempts = 0;
                    user.last_failed_login = null;
                } else {
                    const remainingMinutes = Math.ceil(COOLDOWN_MINUTES - minutesSinceLastFail);
                    const hours = Math.floor(remainingMinutes / 60);
                    const minutes = remainingMinutes % 60;
                    return res.status(403).json({
                        message: `Account locked. Try again in ${hours} hour(s) and ${minutes} minute(s).`
                      });
                }
            }

        // 🔐 Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            await db.query(
                `UPDATE ${table} SET failed_attempts = failed_attempts + 1, last_failed_login = NOW() WHERE email = ?`,
                [email]
            );
            return res.status(401).json({ message: "Incorrect password" });
        }


        await db.query(
            `UPDATE ${table} SET failed_attempts = 0, last_failed_login = NULL, last_active = NOW() WHERE ${table}_id = ?`,
            [user.id]
        );

        delete user.password;
        
        if (user.status === 'inactive') {
            return res.status(403).json({ message: "Your account is inactive for too long. Please contact admin." });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account is deactivated. Please contact admin.' });
          }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, courseId: user.course_id },
                                    process.env.JWT_SECRET, 
                                    { expiresIn: '1h' });       

        const refreshToken = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, courseId: user.course_id  }, 
                                        process.env.JWT_REFRESH, 
                                        { expiresIn: '1d' });

        await db.query(`UPDATE ${table} SET last_active = NOW() WHERE ${table}_id = ?`, [user.id]);

        res.cookie("token", refreshToken, {
          httpOnly: true,
          secure: isProduction, 
          sameSite: isProduction ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000,
          path: "/"
        });
         
         res.json({user, token});

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ message: "Internal server error. Please try again later." });

    }
});


// Route: POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.token;

  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        courseId: user.courseId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: newAccessToken });
  });
});

    

  router.post("/logout", (req, res) => {
        res.clearCookie("token", {
          httpOnly: true,
          secure: isProduction,  
          sameSite: isProduction ? "none" : "lax",  
          path: "/"
        });

    return res.status(200).json({ message: "Logged out successfully" });
});

// BAGONG CODE 
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new passwords are required" });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const tableName = user.role === "admin" ? "admin" : user.role === "faculty" ? "faculty" : "student";
        const idField = user.role === "admin" ? "admin_id" : user.role === "faculty" ? "faculty_id" : "student_id";

        const [rows] = await db.execute(
            `SELECT * FROM ${tableName} WHERE ${idField} = ?`,
            [user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const dbUser = rows[0];
        const validPassword = await bcrypt.compare(currentPassword, dbUser.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid current password" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.execute(
            `UPDATE ${tableName} SET password = ? WHERE ${idField} = ?`,
            [hashedNewPassword, user.id]
        );

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: "Server error" });
    }
});



router.delete("/delete-account",authMiddleware , async (req, res) => {
    const { email, role } = req.body;
    const db = await connectToDatabase();

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }
  
    let tableName;
  
    switch (role) {
      case "admin":
        tableName = "admin";
        break;
      case "faculty":
        tableName = "faculty";
        break;
      case "student":
        tableName = "student";
        break;
      default:
        return res.status(400).json({ message: "Invalid role." });
    }
    
    try {
      const [result] = await db.execute(
        `DELETE FROM ${tableName} WHERE email = ?`,
        [email]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Account not found." });
      }
  
      res.status(200).json({ message: "Account deleted successfully." });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Server error. Could not delete account." });
    }
  });
  

export default router;
