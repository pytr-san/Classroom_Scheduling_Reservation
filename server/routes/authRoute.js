import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../db.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

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

        // ✅ Ensure only Faculty & Students can register via this API
        // const validRoles = ["faculty", "student"];
        // if (!validRoles.includes(role.toLowerCase())) {
        //     return res.status(403).json({ error: "Invalid role. Only Faculty and Students can register." });
        // }

        let tableName = role.toLowerCase()=== "faculty" ? "faculty" : "student";

        // ✅ Check if user already exists in the respective table
        const [existingUserRows] = await db.execute(
            `SELECT * FROM ${tableName} WHERE email = ? OR name = ?`,
            [email, name]
        );

        if (existingUserRows.length > 0) {
            return res.status(400).json({ error: `${role} already exists` });
        }

        // ✅ Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert into respective table
        await db.execute(
            `INSERT INTO ${tableName} (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role.toLowerCase()]
        );

        res.status(201).json({ message: `${role} registered successfully` });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const { email, password } = req.body;

        let user = null;

        // 🟢 Optimized Query to Search in All Tables at Once
        const [users] = await db.query(
            `SELECT admin_id AS id, name, email, password, 'admin' AS role FROM admin WHERE email = ? 
             UNION 
             SELECT student_id AS id, name, email, password, 'student' AS role FROM student WHERE email = ? 
             UNION 
             SELECT faculty_id AS id, name, email, password, 'faculty' AS role FROM faculty WHERE email = ?`, 
            [email, email, email]
        );

        console.log("🟢 Debug: Raw query result:", JSON.stringify(users, null, 2));

        if (users.length > 0) {
            user = users[0]; // ✅ Pick first matched user
            console.log("✅ Extracted user:", user);
        }

        // ❌ If No User Found
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 🟢 Debugging password issue
        console.log("🔍 Retrieved password:", user.password);

        // ❌ Handle Missing Password Field
        if (!user.password) {
            console.error("❌ Error: Password is undefined for user", user);
            return res.status(500).json({ error: "Server error: Missing password field" });
        }

        // 🔒 Validate Password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Remove password before sending response
        delete user.password;

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { id: user.id,name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1hr' }
        );

        // const refreshToken = jwt.sign(
        //     {"username": user.name},
        //     process.env.JWT_REFRESH,
        //     {expiresIn: '1d'}
        // );

        // user.refreshToken = refreshToken;
        // const result = await user.save();
        // console.log(result);
        // console.log(user.role);

        // ✅ Store token in HTTP-only cookie
        res.cookie("token", token,{
            httpOnly: true,
            secure: false,  // Set `true` in production with HTTPS
            sameSite: "lax",//"none",
            maxAge: 24 * 60 * 60 *1000,
            path: "/"
         });
        
         res.json({user, token});

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

    // ✅ Add this route to verify token
    router.get("/verify-token", authMiddleware, (req, res) => {
        res.json({ valid: true, user: req.user });
    });

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


export default router;
