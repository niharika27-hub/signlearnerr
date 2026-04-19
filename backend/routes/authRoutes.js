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

const authRoutes = Router();

/**
 * Authentication Routes
 */

// Get current user profile
authRoutes.get("/me", getProfile);

// User signup
authRoutes.post("/signup", signup);

// User login
authRoutes.post("/login", login);

// User logout
authRoutes.post("/logout", logout);

// Update user profile
authRoutes.patch("/update", updateProfile);

// Change password
authRoutes.patch("/change-password", changePassword);

// Delete account
authRoutes.delete("/delete", deleteAccount);

export default authRoutes;
