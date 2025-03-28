import express from "express";
import {connectToDatabase} from '../db.js'
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// GET all courses
router.get("/course", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [results] = await db.execute("SELECT course_id, course_name FROM course"); // Using async/await
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error1" });
    }
});


// ✅ GET subjects & instructors for a course
router.get("/course/:id/ManageCourse", authMiddleware, async (req, res) => {
    const courseId = req.params.id;

    try {
        const db = await connectToDatabase();
        const [results] = await db.execute(`
            SELECT 
                subjects.subject_id, 
                subjects.subject_name, 
                subjects.year_level, 
                subjects.semester, 
                faculty.faculty_id, 
                faculty.name AS instructor_name, 
                course.course_name
            FROM subjects
            INNER JOIN course ON subjects.course_id = course.course_id
            LEFT JOIN faculty ON subjects.faculty_id = faculty.faculty_id
            WHERE course.course_id = ?
            ORDER BY subjects.year_level, subjects.semester`, 
            [courseId]
        );

        const [faculty] = await db.execute("SELECT faculty_id, name FROM faculty"); // ✅ Fetch all faculty

        if (results.length > 0) {
            return res.json({ 
                course_name: results[0].course_name, 
                subjects: results, 
                faculty // ✅ Send faculty list
            });
        } else {
            return res.json({ course_name: "Course Not Found", subjects: [], faculty: [] });
        }
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ UPDATE multiple subject instructors
router.put("/course/:courseId/ManageCourse/update", authMiddleware, async (req, res) => {
    const { updates } = req.body;  // Expecting an array of updates

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: "Invalid update data" });
    }

    try {
        const db = await connectToDatabase();
        const updatePromises = updates.map(({ subject_id, faculty_id }) => {
            return db.execute(
                "UPDATE subjects SET faculty_id = ? WHERE subject_id = ?", 
                [faculty_id || null, subject_id]  // Ensures NULL instead of undefined
            );
        });

        await Promise.all(updatePromises); // Run all updates in parallel
        res.json({ message: "Instructors updated successfully" });
    } catch (err) {
        console.error("Database update error:", err);
        res.status(500).json({ error: "Database update failed" });
    }
});


// ✅ Add a New Instructor
router.post("/faculty/add", authMiddleware, async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Instructor name is required" });
    }

    try {
        const db = await connectToDatabase();

        // ✅ Insert new instructor into faculty table
        const [result] = await db.execute(
            "INSERT INTO faculty (name) VALUES (?)",
            [name]
        );

        const newFaculty = {
            faculty_id: result.insertId,
            name,
        };

        res.status(201).json({ message: "Instructor added successfully", newFaculty });
    } catch (error) {
        console.error("Database insert error:", error);
        res.status(500).json({ error: "Failed to add instructor" });
    }
});
  
export default router; // Use `export default` for ES modules
