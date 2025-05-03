import { error } from 'console';
import { connectToDatabase } from '../db.js';
import path from 'path';

export const handleBulkUpload = async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const db = await connectToDatabase();

    const uploadPromises = req.files.map(file => {
      const query = `
        INSERT INTO uploaded_files (filename, file_path, course_id) 
        VALUES (?, ?, ?)
      `;
      return db.query(query, [file.originalname, path.relative('uploads/pdfs', file.path), courseId]);
      
    });

    await Promise.all(uploadPromises);

    res.status(200).json({ message: `${req.files.length} files uploaded successfully` });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Error saving file metadata' });
  }
};

// Faculty: View all uploaded files
export const viewAllFiles = async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [files] = await db.query(`
    SELECT 
      uf.id,
      uf.filename,
      uf.file_path,
      uf.course_id,
      uf.created_at,
      c.course_name,
      c.description
    FROM uploaded_files uf
    LEFT JOIN course c ON uf.course_id = c.course_id
  `);
    if(files.length === 0){
      res.status(404).json({ error: 'Error retrieving all files: No files uploaded' });
    }
    const fileData = files.map(file => ({
      ...file,
      // Ensure you use the correct file path
      // fileUrl: `${req.protocol}://${req.get('host')}/${file.file_path.replace(/\\/g, '/')}`
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/pdfs/${path.basename(file.file_path)}`

    }));

    res.status(200).json(fileData);
  } catch (err) {
    console.error('View all files error:', err);
    res.status(500).json({ message: 'Error retrieving all files' });
  }
};

// Students: View files by course ID
export const viewFilesByCourse = async (req, res) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  try {
    const db = await connectToDatabase();
    const [files] = await db.query(
      `SELECT u.id,
              u.filename,
              u.file_path,
              u.course_id,
              u.created_at, 
              c.course_name,
              c.description 
       FROM uploaded_files u
       JOIN course c ON u.course_id = c.course_id
       WHERE u.course_id = ?`,
      [courseId]
    );

    const fileData = files.map(file => ({
      ...file,
      // fileUrl: `${req.protocol}://${req.get('host')}/${file.file_path.replace(/\\/g, '/')}`
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/pdfs/${path.basename(file.file_path)}`


    }));

    res.status(200).json(fileData);
  } catch (err) {
    console.error('View course files error:', err);
    res.status(500).json({ message: 'Error retrieving files for course' });
  }
};