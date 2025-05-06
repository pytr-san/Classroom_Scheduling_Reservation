import express from 'express';
import multer from 'multer';
import authMiddleware from "../middleware/authMiddleware.js";
import { handleBulkUpload, viewFilesByCourse, viewAllFiles } from '../controllers/uploadController.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { deleteFile } from '../controllers/deleteControllers.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/pdfs')); 
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

router.post('/bulk-upload' , (req, res, next) => {
  upload.array('files', 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Max size is 10MB.' });
      }
    } else if (err) {
      return res.status(500).json({ message: 'Upload failed. Please try again.' });
    }

    handleBulkUpload(req, res);
  });
});


router.get('/view-files', authMiddleware, async (req, res) => {
  const userId = req.user.id; 
  const userRole = req.user.role; 
  const { courseId } = req.query; 

  if (userRole === 'faculty') {

    return viewAllFiles(req, res);
  } else if ((userRole === 'student' || userRole === 'admin') && courseId)  {

    return viewFilesByCourse(req, res, courseId);
  } else {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
});

router.delete('/delete-file/:id',  deleteFile);

export default router;
