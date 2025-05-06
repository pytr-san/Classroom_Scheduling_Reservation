import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../db.js';
import authMiddleware from "../middleware/authMiddleware.js";
import refreshTokenMiddleware from '../middleware/refreshTokenMiddleware.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();

const router = express.Router();


const INACTIVITY_PERIOD = 30; // days
//for checking: Runs every 10seconds
//cron.schedule('*/10 * * * * *', async () => { 
cron.schedule('0 0 * * *', async () => {
  console.log('Checking for inactive users...');
  
  try {
    const db = await connectToDatabase();
    const currentDate = new Date();
    const inactivityThresholdDate = new Date(currentDate - INACTIVITY_PERIOD * 24 * 60 * 60 * 1000);

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
        console.log("📩 Register endpoint hit! Request body:", req.body);
        
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ✅ Allowed email domain
        const allowedDomain = "@spist.edu.ph";
        if (!email.endsWith(allowedDomain)) {
            return res.status(403).json({ error: "Unauthorized email. Please use your organization email." });
        }

        let tableName = role.toLowerCase()=== "faculty" ? "faculty" : "student";

        // ✅ Check if user already exists in the respective table
        const [rows] = await db.execute(
            `SELECT * FROM ${tableName} WHERE email = ? OR name = ?`,
            [email, name]
        );

        if (rows.length > 0) {
            return res.status(400).json({ error: "email or name already exists" });
        }

        // ✅ Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert into respective table
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


const MAX_ATTEMPTS = 5;
router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const { email, password } = req.body;

        let user = null;

        // 🟢 Optimized Query to Search in All Tables at Once
        const [users] = await db.query(
            `SELECT admin_id AS id, NULL AS course_id, name, email, password, is_active, status, role FROM admin WHERE email = ?
            UNION 
            SELECT student_id AS id, course_id, name, email, password, is_active, status, role FROM student WHERE email = ?
            UNION 
            SELECT faculty_id AS id, NULL AS course_id, name, email, password, is_active, status, role FROM faculty WHERE email = ?`, 
            [email, email, email]
        );


        if (users.length > 0) { 
            user = users[0]; 
        }

        // ❌ If No User Found
        if (!user) {
            return res.status(401).json({ message: "User not found. Please check your email." });
        }

        // 🔒 Validate Password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        delete user.password;
        
        if (user.status === 'inactive') {
            return res.status(403).json({ message: "Your account is inactive for too long. Please contact admin." });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account is deactivated. Please contact admin.' });
          }
            // if (user.failed_attempts >= MAX_ATTEMPTS) {
            //     return res.status(403).json({ message: 'Account locked. Too many failed login attempts.' });
            //   }
            

        // ✅ Generate JWT Access Token (valid for 1 hour)
        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, courseId: user.course_id },
                                    process.env.JWT_SECRET, 
                                    { expiresIn: '1h' });       

        //✅ Generate JWT Refresh Token (valid for 1 day)
        // const refreshToken = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, 
        //                                 process.env.JWT_REFRESH, 
        //                                 { expiresIn: '1d' });

        const table = user.role;
        await db.query(`UPDATE ${table} SET last_active = NOW() WHERE ${table}_id = ?`, [user.id]);

        // ✅ Store token in HTTP-only cookie
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
          httpOnly: true,
          secure: isProduction, // true in production (requires HTTPS)
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


router.get('/refresh', refreshTokenMiddleware, (req, res) => {
    const user = req.user;

    try {
        const newToken = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        console.log("Generated new access token:", newToken); 
        res.json({ newToken, user }); // Send new token and user details
    } catch (err) {
        console.log("Error generating access token:", err); // Log any token generation errors
        res.status(500).json({ message: "Error generating access token" });
    }
});

    // // ✅ Add this route to verify token
    // router.get("/verify-token", authMiddleware, (req, res) => {
    //     console.log("Token verified successfully:", req.user);
    //     res.json({ user: req.user });
    // });
    
    // ✅ Logout User - Clears the Token Cookie
    router.post("/logout", (req, res) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,  // Set `true` in production with HTTPS
            sameSite: "Lax",
            // secure: false,//process.env.NODE_ENV === "production", // Secure in production
            // sameSite: 'none',//"Lax",
             path: "/" // Ensures it clears properly
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
        console.log(user);
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
export default router;
