import express from 'express';
import multer from 'multer';
import authMiddleware from "../middleware/authMiddleware.js";
import { handleBulkUpload, viewFilesByCourse, viewAllFiles } from '../controllers/uploadController.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../controllers/deleteControllers.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/pdfs');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

// Bulk file upload route (POST request)
router.post('/bulk-upload',authMiddleware , (req, res, next) => {
  upload.array('files', 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Max size is 20MB.' });
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


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

router.get('/download/:filename', authMiddleware, (req, res) => {
  const { filename } = req.params;
  // const filePath = path.join(__dirname, '../uploads/pdfs', filename);
  const filePath = path.join(process.cwd(), 'uploads', 'pdfs', filename);


  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Force download
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error in download:', err);
      res.status(500).send('Download error');
    }
  });
});

//deletes files route
router.delete('/delete-file/:id', authMiddleware, deleteFile);


export default router;
