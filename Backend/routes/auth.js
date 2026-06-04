import multer from 'multer';
import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyRecoveryEmail,
  updateStudentPlan,
  deleteStudent,
  listStudents,
} from '../controllers/authController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import { getAvatarUploadsPath } from '../config/uploads.js';

const router = express.Router();

const avatarUploadsPath = getAvatarUploadsPath();
const storage = multer.diskStorage({
  destination: avatarUploadsPath,
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
    const safeName = `${req.user.id}-${Date.now()}.${ext}`;
    cb(null, safeName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-recovery-email', verifyRecoveryEmail);
router.get('/students', verifyToken, adminOnly, listStudents);
router.patch('/students/:id/plan', verifyToken, adminOnly, updateStudentPlan);
router.delete('/students/:id', verifyToken, adminOnly, deleteStudent);

export default router;
