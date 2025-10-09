import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  logout
} from "../controllers/userController.js";
import { protect, admin, authLimiter } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// Protected routes (authentication required)
router.use(protect); 

router.get("/me", getMe);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.get("/logout", logout);

// Admin only routes
router.get("/users", admin, getUsers);
router.get("/users/:id", admin, getUser);
router.put("/users/:id", admin, updateUser);
router.delete("/users/:id", admin, deleteUser);

export default router;