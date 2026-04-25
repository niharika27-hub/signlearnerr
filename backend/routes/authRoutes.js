import { Router } from "express";
import passport from "passport";
import {
	getProfile,
	signup,
	login,
	logout,
  forgotPassword,
  resetPassword,
	updateProfile,
	changePassword,
	deleteAccount,
} from "../controllers/authController.js";
import { authMiddleware, generateToken } from "../middleware/authMiddleware.js";
import {
	validateSignup,
	validateLogin,
  validateForgotPassword,
  validateResetPassword,
	validatePasswordChange,
	validateProfileUpdate,
	handleValidationErrors,
} from "../middleware/validation.js";

const authRoutes = Router();

// JWT-based routes (Email/Password)
authRoutes.get("/me", authMiddleware, getProfile);
authRoutes.post("/signup", validateSignup, handleValidationErrors, signup);
authRoutes.post("/login", validateLogin, handleValidationErrors, login);
authRoutes.post("/forgot-password", validateForgotPassword, handleValidationErrors, forgotPassword);
authRoutes.post("/reset-password", validateResetPassword, handleValidationErrors, resetPassword);
authRoutes.post("/logout", authMiddleware, logout);
authRoutes.patch("/update", authMiddleware, validateProfileUpdate, handleValidationErrors, updateProfile);
authRoutes.patch("/change-password", authMiddleware, validatePasswordChange, handleValidationErrors, changePassword);
authRoutes.delete("/delete", authMiddleware, deleteAccount);

// Google OAuth Routes (existing routes ke baad add karo)

// Google login initiate
authRoutes.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

// Google callback
authRoutes.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (error, user) => {
    if (error) {
      const oauthDetails =
        error?.oauthError?.data || error?.message || "Google OAuth authentication failed.";
      console.error("Google OAuth callback error:", oauthDetails);
      return res.redirect("http://localhost:5173/login?error=google_oauth");
    }

    if (!user) {
      return res.redirect("http://localhost:5173/login?error=google_oauth");
    }

    const token = generateToken(user.id, user.email);

    res.cookie("authToken", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });

    return res.redirect("http://localhost:5173/");
  })(req, res, next);
});
export default authRoutes;
