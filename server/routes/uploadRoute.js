import express from 'express';
import multer from 'multer';
import authMiddleware from "../middleware/authMiddleware.js";
import { handleBulkUpload, viewFilesByCourse, viewAllFiles } from '../controllers/uploadController.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../controllers/deleteControllers.js';

const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/pdfs');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/pdfs')); // <--- now points to server/uploads/pdfs
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

// Bulk file upload route (POST request)
router.post('/bulk-upload' , (req, res, next) => {
  upload.array('files', 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Max size is 10MB.' });
      }
    } else if (err) {
      return res.status(500).json({ message: 'Upload failed. Please try again.' });
    }

    // Handle bulk upload by storing files and associating with courseId
    handleBulkUpload(req, res);
  });
});

// Route for viewing files, role-based access 
router.get('/view-files',authMiddleware, async (req, res) => {
  const userId = req.user.id; // Assume user info is added to the request via middleware
  const userRole = req.user.role; // Assume user role is passed in the request
  const { courseId } = req.query; // Get the courseId from the query string (for students)

  if (userRole === 'faculty') {
    // Faculty can view all files
    return viewAllFiles(req, res);
  } else if (userRole === 'student' && courseId || userRole === 'admin' && courseId) {
    // Students can view only files associated with their courseId
    return viewFilesByCourse(req, res, courseId);
  } else {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
});


//deletes files route
router.delete('/delete-file/:id',  deleteFile);


export default router;
