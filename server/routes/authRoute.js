    import express from 'express'
    import {connectToDatabase} from '../db.js'
    const router = express.Router()
    import bcrypt from 'bcryptjs';
    import jwt from 'jsonwebtoken';

    

    // router.post('/register', async (req, res) => {
    //     try {
    //         const db = await connectToDatabase();
    //         console.log("📩 Register endpoint hit! Request body:", req.body);
            

    //         const { name, username, password } = req.body;

    //         if (!name || !username || !password) {
    //             return res.status(400).json({ error: "All fields are required" });
    //         }

    //             // Allowed domain
    //         const allowedDomain = "@spist.edu.ph";

    //         // Check if the email ends with the allowed domain
    //         if (!username.endsWith(allowedDomain)) {
    //             return res.status(403).json({ error: "Unauthorized email. Please use your organization email." });
    //         }

    //         const [existingUser] = await db.execute(
    //             'SELECT * FROM admin WHERE email = ? OR number = ? OR name = ?', 
    //             [username, username, name]
    //         );

    //         if (existingUser.length > 0) {
    //             return res.status(400).json({ error: "User already exists" });
    //         }

    //         // Hash the password before storing
    //         const saltRounds = 10;
    //         const hashedPassword = await bcrypt.hash(password, saltRounds);

    //         // Insert new user into the database
    //         await db.execute(
    //             'INSERT INTO admin (name, email, password) VALUES (?, ?, ?)',
    //             [name, username, hashedPassword] // Hash password before storing in production!
    //         );
            
    //         res.status(201).json({ message: "User registered successfully" });

    //     } catch (err) {
    //         res.status(500).json({ error: "Server error" });
    //     }
    // });


    router.post('/register', async (req, res) => {
        try {
            const db = await connectToDatabase();
            console.log("📩 Register endpoint hit! Request body:", req.body);
    
            const { name, phone, email, password } = req.body;
    
            if (!name || !phone || !email || !password) {
                return res.status(400).json({ error: "All fields are required" });
            }
    
            const allowedDomain = "@spist.edu.ph";
    
            // Check if the email ends with the allowed domain
            if (!email.endsWith(allowedDomain)) {
                return res.status(403).json({ error: "Unauthorized email. Please use your organization email." });
            }
    
            // Check if the email or phone already exists
            const [existingUser] = await db.execute(
                'SELECT * FROM admin WHERE email = ? OR number = ?', 
                [email, phone]
            );
    
            if (existingUser.length > 0) {
                return res.status(400).json({ error: "User with this email or phone number already exists" });
            }
    
            // Hash the password before storing
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            // Insert new user into the database
            await db.execute(
                `INSERT INTO admin (name, email, number, password) VALUES (?, ?, ?, ?)`,
                [name, email, phone, hashedPassword] 
            );
    
            // Respond with success message
            res.status(201).json({ message: "User registered successfully" });
    
        } catch (err) {
            console.error("Error during registration:", err);
            res.status(500).json({ error: "Server error" });
        }
    });
    
        
    


    // router.post('/login', async (req, res) => {
    //     try {
    //         const db = await connectToDatabase();
    //         console.log("JWT Secret:", process.env.JWT_SECRET);
    //         const { username, password } = req.body;

    //         if (!username || !password) {
    //             return res.status(400).json({ error: "All fields are required" });
    //         }

    //         const [existingUser] = await db.execute(
    //             'SELECT * FROM admin WHERE email = ? OR number = ?',
    //             [username, username]
    //         );            

    //         if (existingUser.length === 0) {
    //             return res.status(404).json({ error: "User do not exists" });
    //         }

    //         const user = existingUser[0]; // Get user data
    //         const validPassword = await bcrypt.compare(password, user.password);
    
    //         if (!validPassword) {
    //             return res.status(401).json({ error: "Invalid credentials" });
    //         }

    //         // Generate JWT Token
    //         const token = jwt.sign(
    //             { id: user.admin_id, username: user.username },
    //             process.env.JWT_SECRET,  // Ensure this is set in your .env file
    //             { expiresIn: '1h' }
    //         );

    //         // Send the token as a response
    //         res.status(200).json({ message: "Login successful", token });
    //         // Send a success response (JWT authentication can be added)
    //         //res.status(200).json({ message: "Login successful", user });
    
    //     } catch (err) {
    //         console.error("Login error:", err);
    //         res.status(500).json({ error: "Server error" });
    //     }
    // });
    
    router.post('/login', async (req, res) => {
        try {
            const db = await connectToDatabase();
            console.log("JWT Secret:", process.env.JWT_SECRET);
            const { username, password } = req.body;
    
            if (!username || !password) {
                return res.status(400).json({ error: "All fields are required" });
            }
    
            // Function to check if a string is a valid email
            const isValidEmail = (email) => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(email);
            };
    
            // Function to check if a string is a valid phone number
            const isValidPhoneNumber = (number) => {
                const phoneRegex = /^[0-9]{10}$/; // Assuming a 10-digit phone number
                return phoneRegex.test(number);
            };
    
            let query;
            let queryParams;
    
            if (isValidEmail(username)) {
                // If the username is an email
                query = 'SELECT * FROM admin WHERE email = ?';
                queryParams = [username];
            } else if (isValidPhoneNumber(username)) {
                // If the username is a phone number
                query = 'SELECT * FROM admin WHERE number = ?';
                queryParams = [username];
            } else {
                return res.status(400).json({ error: "Invalid username format" });
            }
    
            const [existingUser] = await db.execute(query, queryParams);
    
            if (existingUser.length === 0) {
                return res.status(404).json({ error: "User does not exist" });
            }
    
            const user = existingUser[0]; // Get user data
            const validPassword = await bcrypt.compare(password, user.password);
    
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
    
            // Generate JWT Token
            const token = jwt.sign(
                { id: user.admin_id, username: user.username },
                process.env.JWT_SECRET,  // Ensure this is set in your .env file
                { expiresIn: '1h' }
            );
    
            // Send the token as a response
            res.status(200).json({ message: "Login successful", token });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ error: "Server error" });
        }
    });
    

    
        // Middleware to verify JWT token
    const verifyToken = (req, res, next) => {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(403).json({ error: "Access denied. No token provided." });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Attach user info to request
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    };

    // Protected Route Example
    router.get("/protected-route", verifyToken, (req, res) => {
        res.json({ message: "You have access to this protected route", user: req.user });
    });

    export default router;