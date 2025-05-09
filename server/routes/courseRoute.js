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

//fetch Sections
router.get('/sections', async (req, res) => {
    const db = await connectToDatabase(); 
    try {
        const [sections] = await db.execute('SELECT * FROM sections');
        res.status(200).json( sections ); 
    } catch (err) {
        console.error('Error fetching sections:', err);
        res.status(500).json({ error: 'Failed to fetch sections' });
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
router.put("/course/:id/subjects/update-names", async (req, res) => {
    const courseId = req.params.id;
    const updates = req.body; 

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
router.delete("/course/:id/:subject_id", async (req, res) => {
    const { subject_id } = req.params; 

    try {
        const db = await connectToDatabase();

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
router.post('/add', async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
  
    try {
      const connection = await connectToDatabase();
  
      const [existing] = await connection.execute(
        'SELECT * FROM instructors WHERE name = ?',
        [name]
      );
  
      if (existing.length > 0) {
        return res.status(400).json({ error: "Instructor already exists" });
      }
  
      const [result] = await connection.execute(
        'INSERT INTO instructors (name) VALUES (?)',
        [name]
      );
  
      const newInstructor = {
        faculty_id: result.insertId,
        name
      };
  
      res.status(201).json({
            message: "Instructor added and assigned to subject successfully",
            newInstructor,
      });
  
    } catch (error) {
      console.error(" Error adding instructor:", error.message);
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
                instructors.instructor_id, 
                instructors.name AS instructor_name, 
                course.course_name
            FROM subjects
            INNER JOIN course ON subjects.course_id = course.course_id
            LEFT JOIN instructors ON subjects.instructor_id = instructors.instructor_id
            WHERE course.course_id = ?
            ORDER BY subjects.year_level, subjects.semester`, 
            [courseId]
        );

        const [faculty] = await db.execute("SELECT instructor_id, name FROM instructors"); // ✅ Fetch all faculty

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
router.put("/course/:courseId/manage/update", async (req, res) => {
    const { updates } = req.body;  // Expecting an array of updates

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: "Invalid update data" });
    }

    try {
        const db = await connectToDatabase();
        const updatePromises = updates.map(({ subject_id, instructor_id }) => {
            return db.execute(
                "UPDATE subjects SET instructor_id = ? WHERE subject_id = ?", 
                [instructor_id || null, subject_id]  
            );
        });

        await Promise.all(updatePromises); 
        res.json({ message: "Instructors updated successfully" });
    } catch (err) {
        console.error("Database update error:", err);
        res.status(500).json({ error: "Database update failed" });
    }
});


// ✅ Add a New Instructor assined to a subject
router.post("/faculty/add", async (req, res) => {
    const { name, subject_id } = req.body; 

    if (!name || !name.trim() || !subject_id) {
        return res.status(400).json({ error: "Instructor name and subject_id are required" });
    }

    try {
        const db = await connectToDatabase();

        // ✅ Insert new instructor into faculty table
        const [result] = await db.execute(
            "INSERT INTO instructors (name) VALUES (?)",
            [name]
        );

        const newFaculty = {
            faculty_id: result.insertId,
            name,
        };

        const [subjectResult] = await db.execute(
            "UPDATE subjects SET instructor_id = ? WHERE subject_id = ?",
            [newFaculty.faculty_id, subject_id]
        );

        if (subjectResult.affectedRows === 0) {
            return res.status(404).json({ error: "Subject not found or already has an instructor" });
        }

        res.status(201).json({
            message: "Instructor added and assigned successfully",
            newFaculty,
        });
    } catch (error) {
        console.error("Database insert error:", error);
        res.status(500).json({ error: "Failed to add instructor" });
    }
});

 
router.post("/student/details", async (req, res) => {
    const { course_id, year_level, section_id } = req.body;
    const { email } = req.query;

    if (!email || !course_id || !year_level || !section_id) {
        return res.status(400).json({ error: "Missing student details" });
    }

    try {
        const db = await connectToDatabase();
        await db.execute(
            "UPDATE student SET course_id = ?, year_level = ?, section_id = ? WHERE email = ?",
            [course_id, year_level, section_id, email]
        );
        res.status(200).json({ message: "Student details saved" });
    } catch (err) {
        console.error("Error saving student details:", err);
        res.status(500).json({ error: "Failed to save student details" });
    }
});

router.delete('/course/:id', async (req, res) => {
    const courseId = req.params.id;
  
    try {
        const db = await connectToDatabase();
  
      // Optional: Check if course exists first
      const [rows] = await db.execute('SELECT * FROM course WHERE course_id = ?', [courseId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Course not found.' });
      }
  
      // Perform the deletion
      await db.execute('DELETE FROM course WHERE course_id = ?', [courseId]);
  
      res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (error) {
      console.error('MySQL delete error:', error);
      res.status(500).json({ error: 'Failed to delete course.' });
    }
  });


export default router; // Use `export default` for ES modules
