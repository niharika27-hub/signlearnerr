import { Router } from "express";
import {
	getProfile,
	signup,
	login,
	logout,
	updateProfile,
	changePassword,
	deleteAccount,
} from "../controllers/authController.js";
import { authMiddleware, generateToken } from "../middleware/authMiddleware.js";
import { sanitizeUser } from "../services/userService.js";
import {
	validateSignup,
	validateLogin,
	validatePasswordChange,
	validateProfileUpdate,
	handleValidationErrors,
} from "../middleware/validation.js";

const authRoutes = Router();

// JWT-based routes (Email/Password)
authRoutes.get("/me", authMiddleware, getProfile);
authRoutes.post("/signup", validateSignup, handleValidationErrors, signup);
authRoutes.post("/login", validateLogin, handleValidationErrors, login);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.patch("/update", authMiddleware, validateProfileUpdate, handleValidationErrors, updateProfile);
authRoutes.patch("/change-password", authMiddleware, validatePasswordChange, handleValidationErrors, changePassword);
authRoutes.delete("/delete", authMiddleware, deleteAccount);
export default authRoutes;
