import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../db.js';

export const deleteFile = async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();

    // Get file info from DB
    const [[file]] = await db.query(
      `SELECT file_path FROM uploaded_files WHERE id = ?`,
      [id]
    );

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fullPath = path.join('uploads/pdfs', file.file_path);

    // Delete from filesystem
    fs.unlink(fullPath, async (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('File system delete error:', err);
        return res.status(500).json({ message: 'Error deleting file from server' });
      }

      // Delete from database
      await db.query(`DELETE FROM uploaded_files WHERE id = ?`, [id]);
      res.status(200).json({ message: 'File deleted successfully' });
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Error deleting file' });
  }
};
