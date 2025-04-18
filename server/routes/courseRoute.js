import express from "express";
import {connectToDatabase} from '../db.js'
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// GET all courses
router.get("/course",authMiddleware, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [results] = await db.execute("SELECT course_id, course_name FROM course"); // Using async/await
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Database error1" });
    }
});

router.post('/add/course', async (req, res) => {
    const { course_name, description } = req.body;

    const db = await connectToDatabase();

    const [result] = await db.query(`
      INSERT INTO course ( course_name, description)
      VALUES ( ?, ?)`,
      [ course_name, description]
    );
  
    res.json({ course_id: result.insertId });
  });

  //Inserting subjects from newly added course
  router.post('/subjects', async (req, res) => {
    const { course_id, semester, year_level, subject_name } = req.body;

   const db = await connectToDatabase();
   
    await db.query(`
      INSERT INTO subjects (course_id,  semester, year_level, subject_name  )
      VALUES (?, ?, ?, ? )`,
      [course_id, semester, year_level, subject_name ]
    );
  
    res.sendStatus(200);
  });
  

// PUT update subject names
router.put("/course/:id/subjects/update-names", authMiddleware, async (req, res) => {
    const courseId = req.params.id;
    const updates = req.body; // Expecting: [{ subject_id, subject_name }, ...]

    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array of subject updates." });
    }

    try {
        const db = await connectToDatabase();

        const updatePromises = updates.map(({ subject_id, subject_name }) => {
            return db.execute(
                "UPDATE subjects SET subject_name = ? WHERE subject_id = ? AND course_id = ?",
                [subject_name, subject_id, courseId]
            );
        });

        await Promise.all(updatePromises);

        res.status(200).json({ message: "Subject names updated successfully." });
    } catch (error) {
        console.error("Error updating subject names:", error);
        res.status(500).json({ error: "Failed to update subject names." });
    }
});

// DELETE a subject
router.delete("/course/:id/:subject_id", authMiddleware, async (req, res) => {
    const { subject_id } = req.params; // Extract subject_id from URL params
console.log("ID",subject_id);
    try {
        const db = await connectToDatabase();

        // Query to delete the subject from the database
        const [results] = await db.execute(
            "DELETE FROM subjects WHERE subject_id = ?",
            [subject_id]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({ message: "Subject deleted successfully" });
    } catch (err) {
        console.error("Error deleting subject:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// Add Instructor
router.post('/add', authMiddleware, async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
  
    try {
      const connection = await connectToDatabase();
  
      // Optional: Confirm connection is working
      await connection.query("SELECT 1");
  
      const [existing] = await connection.execute(
        'SELECT * FROM faculty WHERE name = ?',
        [name]
      );
  
      if (existing.length > 0) {
        return res.status(400).json({ error: "Instructor already exists" });
      }
  
      const [result] = await connection.execute(
        'INSERT INTO faculty (name) VALUES (?)',
        [name]
      );
  
      const newInstructor = {
        faculty_id: result.insertId,
        name
      };

        console.log("instructor Id:",newInstructor );
  
      res.status(201).json({
            message: "Instructor added and assigned to subject successfully",
            newInstructor,
      });
  
    } catch (error) {
      console.error("❌ Error adding instructor:", error.message);
      console.error(error);
      res.status(500).json({ error: "Failed to add instructor" });
    }
  });
  


// ✅ GET subjects & instructors for a course
router.get("/course/:id/manage", authMiddleware, async (req, res) => {
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
router.put("/course/:courseId/manage/update", authMiddleware, async (req, res) => {
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


// ✅ Add a New Instructor assined to a subject
router.post("/faculty/add", authMiddleware, async (req, res) => {
    const { name, subject_id } = req.body; // Make sure to get subject_id from the request body

    if (!name || !name.trim() || !subject_id) {
        return res.status(400).json({ error: "Instructor name and subject_id are required" });
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

        // ✅ Add instructor to the subject by inserting into the subjects table
        const [subjectResult] = await db.execute(
            "UPDATE subjects SET faculty_id = ? WHERE subject_id = ?",
            [newFaculty.faculty_id, subject_id]
        );

        if (subjectResult.affectedRows === 0) {
            return res.status(404).json({ error: "Subject not found or already has an instructor" });
        }

        res.status(201).json({
            message: "Instructor added and assigned to subject successfully",
            newFaculty,
        });
    } catch (error) {
        console.error("Database insert error:", error);
        res.status(500).json({ error: "Failed to add instructor" });
    }
});

  
export default router; // Use `export default` for ES modules
