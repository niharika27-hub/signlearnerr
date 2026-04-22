import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import User from "../models/User.js";
import { sanitizeUser, getUserByEmail, createUser, updateUser, deleteUser, emailExists } from "../services/userService.js";
import { generateToken } from "../middleware/authMiddleware.js";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export async function getProfile(request, response) {
	try {
		// JWT middleware already validated token and set request.user
		if (!request.user) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		const user = await getUserByEmail(request.user.email);
		if (!user) {
			return response.status(404).json({ message: "User not found." });
		}

		return response.json({
			message: "Profile fetched successfully.",
			user: sanitizeUser(user),
		});
	} catch (error) {
		console.error("Get user error:", error);
		return response.status(401).json({ message: "Invalid session." });
	}
}

export async function signup(request, response) {
	try {
		const { fullName, email, password, roleCategory, role, roleLabel } = request.body ?? {};

		if (!fullName || !email || !password || !roleCategory || !role) {
			return response.status(400).json({
				message: "fullName, email, password, roleCategory and role are required.",
			});
		}

		if (typeof password !== "string" || password.length < 6) {
			return response.status(400).json({
				message: "Password must be at least 6 characters long.",
			});
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const existingUser = await emailExists(normalizedEmail);

		if (existingUser) {
			return response.status(409).json({
				message: "An account with this email already exists.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await createUser({
			id: randomUUID(),
			fullName: String(fullName).trim(),
			email: normalizedEmail,
			passwordHash: hashedPassword,
			roleCategory,
			role,
			roleLabel: roleLabel || role,
		});

		// Generate JWT token
		const token = generateToken(newUser.id, newUser.email);
		const userProfile = sanitizeUser(newUser);

		// Set JWT in httpOnly cookie
		response.cookie("authToken", token, {
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
			path: "/",
		});

		return response.status(201).json({
			message: "Account created successfully.",
			token, // Also return token for frontend storage
			user: userProfile,
		});
	} catch (error) {
		console.error("Signup error:", error);
		return response.status(500).json({ message: "Something went wrong while creating your account: " + error.message });
	}
}
export async function login(request, response) {
	try {
		const { email, password } = request.body ?? {};

		if (!email || !password) {
			return response.status(400).json({
				message: "Email and password are required.",
			});
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const user = await getUserByEmail(normalizedEmail);

		if (!user) {
			return response.status(401).json({ message: "Invalid email or password." });
		}

		const validPassword = await bcrypt.compare(password, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Invalid email or password." });
		}

		// Update last login
		await updateUser(user.id, { lastLogin: new Date() });

		// Generate JWT token
		const token = generateToken(user.id, user.email);
		const userProfile = sanitizeUser(user);

		// Set JWT in httpOnly cookie
		response.cookie("authToken", token, {
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
			path: "/",
		});

		return response.json({
			message: "Login successful.",
			token, // Also return token for frontend storage
			user: userProfile,
		});
	} catch (error) {
		console.error("Login error:", error);
		return response.status(500).json({ message: "Something went wrong while logging in." });
	}
}
export async function logout(request, response) {
	response.clearCookie("authToken", {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "Lax",
	});
	return response.json({ message: "Logged out successfully." });
}
export async function updateProfile(request, response) {
	try {
		const { fullName, roleCategory, role, roleLabel } = request.body ?? {};

		if (!request.user) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		const user = await getUserByEmail(request.user.email);

		if (!user) {
			return response.status(404).json({ message: "User not found." });
		}

		// Build update object
		const updateData = {};
		if (fullName) updateData.fullName = String(fullName).trim();
		if (roleCategory) updateData.roleCategory = roleCategory;
		if (role) updateData.role = role;
		if (roleLabel) updateData.roleLabel = roleLabel;

		const updatedUser = await updateUser(user.id, updateData);
		const updatedProfile = sanitizeUser(updatedUser);

		return response.json({
			message: "User updated successfully.",
			user: updatedProfile,
		});
	} catch (error) {
		console.error("Update error:", error);
		return response.status(500).json({ message: "Something went wrong while updating user." });
	}
}

/**
 * PATCH /api/auth/change-password
 * Change user password
 */
export async function changePassword(request, response) {
	try {
		const { currentPassword, newPassword } = request.body ?? {};

		if (!request.user) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		if (!currentPassword || !newPassword) {
			return response.status(400).json({
				message: "Current password and new password are required.",
			});
		}

		if (typeof newPassword !== "string" || newPassword.length < 6) {
			return response.status(400).json({
				message: "New password must be at least 6 characters long.",
			});
		}

		if (currentPassword === newPassword) {
			return response.status(400).json({
				message: "New password must be different from current password.",
			});
		}

		const user = await getUserByEmail(request.user.email);

		if (!user) {
			return response.status(404).json({ message: "User not found." });
		}

		const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Current password is incorrect." });
		}

		// Hash and update password
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await updateUser(user.id, { passwordHash: hashedPassword });

		return response.json({
			message: "Password changed successfully.",
		});
	} catch (error) {
		console.error("Change password error:", error);
		return response.status(500).json({ message: "Something went wrong while changing password." });
	}
}

/**
 * DELETE /api/auth/delete
 * Delete user account (requires password confirmation)
 */
export async function deleteAccount(request, response) {
	try {
		const { password } = request.body ?? {};

		if (!request.user) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		if (!password) {
			return response.status(400).json({ message: "Password is required to delete account." });
		}

		const user = await getUserByEmail(request.user.email);

		if (!user) {
			return response.status(404).json({ message: "User not found." });
		}

		const validPassword = await bcrypt.compare(password, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Invalid password." });
		}

		// Soft delete - mark as inactive
		await deleteUser(user.id);

		return response.json({
			message: "Account deleted successfully.",
		});
	} catch (error) {
		console.error("Delete error:", error);
		return response.status(500).json({ message: "Something went wrong while deleting account." });
	}
}

/**
 * POST /api/auth/forgot-password
 * Request password reset token (generic response to avoid account enumeration)
 */
export async function forgotPassword(request, response) {
	try {
		const normalizedEmail = String(request.body?.email || "").trim().toLowerCase();

		if (!normalizedEmail) {
			return response.status(400).json({
				message: "Email is required.",
			});
		}

		const user = await getUserByEmail(normalizedEmail);

		if (user && user.isActive) {
			const rawToken = randomBytes(32).toString("hex");
			const tokenHash = createHash("sha256").update(rawToken).digest("hex");

			await updateUser(user.id, {
				resetPasswordTokenHash: tokenHash,
				resetPasswordExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
			});

			const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
			console.log("Password reset URL:", resetUrl);

			if (process.env.NODE_ENV !== "production") {
				return response.json({
					message:
						"If this email exists, a password reset link has been generated.",
					resetUrl,
				});
			}
		}

		return response.json({
			message: "If this email exists, a password reset link has been sent.",
		});
	} catch (error) {
		console.error("Forgot password error:", error);
		return response.status(500).json({
			message: "Something went wrong while requesting password reset.",
		});
	}
}

/**
 * POST /api/auth/reset-password
 * Reset password using token from forgot-password flow
 */
export async function resetPassword(request, response) {
	try {
		const { token, newPassword } = request.body ?? {};

		if (!token || !newPassword) {
			return response.status(400).json({
				message: "Token and new password are required.",
			});
		}

		if (typeof newPassword !== "string" || newPassword.length < 6) {
			return response.status(400).json({
				message: "New password must be at least 6 characters long.",
			});
		}

		const tokenHash = createHash("sha256").update(String(token)).digest("hex");

		const user = await User.findOne({
			resetPasswordTokenHash: tokenHash,
			resetPasswordExpiresAt: { $gt: new Date() },
			isActive: true,
		}).select("+passwordHash +resetPasswordTokenHash +resetPasswordExpiresAt");

		if (!user) {
			return response.status(400).json({
				message: "Invalid or expired reset token.",
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.passwordHash = hashedPassword;
		user.resetPasswordTokenHash = null;
		user.resetPasswordExpiresAt = null;
		await user.save();

		return response.json({
			message: "Password reset successful. Please log in.",
		});
	} catch (error) {
		console.error("Reset password error:", error);
		return response.status(500).json({
			message: "Something went wrong while resetting password.",
		});
	}
}

export async function googleCallback(request, response) {
  try {
    if (!request.user) {
      return response.status(401).json({ message: "Authentication failed." });
    }

    const token = generateToken(request.user);
    
    return response.json({
      success: true,
      user: sanitizeUser(request.user),
      token,
    });
  } catch (error) {
    console.error("Google callback error:", error);
    return response.status(500).json({ message: "Authentication failed." });
  }
}
