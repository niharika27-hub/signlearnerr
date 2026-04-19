import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { sanitizeUser, readUsers, writeUsers } from "../utils/fileStorage.js";

/**
 * GET /api/auth/me
 * Get current user profile from cookie
 */
export async function getProfile(request, response) {
	try {
		const profileCookie = request.cookies?.signlearn_profile;

		if (!profileCookie) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		const user = JSON.parse(profileCookie);
		return response.json({ user });
	} catch (error) {
		console.error("Get user error:", error);
		return response.status(401).json({ message: "Invalid session." });
	}
}

/**
 * POST /api/auth/signup
 * Create new user account
 */
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
		const users = await readUsers();
		const existingUser = users.find((user) => user.email === normalizedEmail);

		if (existingUser) {
			return response.status(409).json({
				message: "An account with this email already exists.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = {
			id: randomUUID(),
			fullName: String(fullName).trim(),
			email: normalizedEmail,
			passwordHash: hashedPassword,
			roleCategory,
			role,
			roleLabel: roleLabel || role,
			joinedAt: new Date().toISOString(),
		};

		users.push(newUser);
		await writeUsers(users);

		// Set user profile cookie
		const userProfile = sanitizeUser(newUser);
		response.cookie("signlearn_profile", JSON.stringify(userProfile), {
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
		});

		// Set session cookie
		response.cookie("signlearn_session", JSON.stringify({ email: newUser.email, createdAt: new Date().toISOString() }), {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
		});

		return response.status(201).json({
			message: "Account created successfully.",
			user: userProfile,
		});
	} catch (error) {
		console.error("Signup error:", error);
		return response.status(500).json({ message: "Something went wrong while creating your account." });
	}
}

/**
 * POST /api/auth/login
 * Login user with email and password
 */
export async function login(request, response) {
	try {
		const { email, password } = request.body ?? {};

		if (!email || !password) {
			return response.status(400).json({
				message: "Email and password are required.",
			});
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const users = await readUsers();
		const user = users.find((item) => item.email === normalizedEmail);

		if (!user) {
			return response.status(401).json({ message: "Invalid email or password." });
		}

		const validPassword = await bcrypt.compare(password, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Invalid email or password." });
		}

		// Set user profile cookie
		const userProfile = sanitizeUser(user);
		response.cookie("signlearn_profile", JSON.stringify(userProfile), {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
		});

		// Set session cookie
		response.cookie("signlearn_session", JSON.stringify({ email: user.email, loggedInAt: new Date().toISOString() }), {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
		});

		return response.json({
			message: "Login successful.",
			user: userProfile,
		});
	} catch (error) {
		console.error("Login error:", error);
		return response.status(500).json({ message: "Something went wrong while logging in." });
	}
}

/**
 * POST /api/auth/logout
 * Clear user session cookies
 */
export async function logout(request, response) {
	response.clearCookie("signlearn_profile");
	response.clearCookie("signlearn_session");
	return response.json({ message: "Logged out successfully." });
}

/**
 * PATCH /api/auth/update
 * Update user profile (fullName, role, etc.)
 */
export async function updateProfile(request, response) {
	try {
		const { fullName, roleCategory, role, roleLabel } = request.body ?? {};
		const profileCookie = request.cookies?.signlearn_profile;

		if (!profileCookie) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		const currentProfile = JSON.parse(profileCookie);
		const users = await readUsers();
		const userIndex = users.findIndex((item) => item.email === currentProfile.email);

		if (userIndex === -1) {
			return response.status(404).json({ message: "User not found." });
		}

		// Update user fields
		if (fullName) users[userIndex].fullName = String(fullName).trim();
		if (roleCategory) users[userIndex].roleCategory = roleCategory;
		if (role) users[userIndex].role = role;
		if (roleLabel) users[userIndex].roleLabel = roleLabel;

		await writeUsers(users);

		const updatedUser = sanitizeUser(users[userIndex]);

		// Update cookie with new profile
		response.cookie("signlearn_profile", JSON.stringify(updatedUser), {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
		});

		return response.json({
			message: "User updated successfully.",
			user: updatedUser,
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
		const profileCookie = request.cookies?.signlearn_profile;

		if (!profileCookie) {
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

		const currentProfile = JSON.parse(profileCookie);
		const users = await readUsers();
		const userIndex = users.findIndex((item) => item.email === currentProfile.email);

		if (userIndex === -1) {
			return response.status(404).json({ message: "User not found." });
		}

		const user = users[userIndex];
		const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Current password is incorrect." });
		}

		// Hash and update password
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		users[userIndex].passwordHash = hashedPassword;
		await writeUsers(users);

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
		const profileCookie = request.cookies?.signlearn_profile;

		if (!profileCookie) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		if (!password) {
			return response.status(400).json({ message: "Password is required to delete account." });
		}

		const currentProfile = JSON.parse(profileCookie);
		const users = await readUsers();
		const userIndex = users.findIndex((item) => item.email === currentProfile.email);

		if (userIndex === -1) {
			return response.status(404).json({ message: "User not found." });
		}

		const user = users[userIndex];
		const validPassword = await bcrypt.compare(password, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Invalid password." });
		}

		// Remove user from array
		users.splice(userIndex, 1);
		await writeUsers(users);

		// Clear cookies
		response.clearCookie("signlearn_profile");
		response.clearCookie("signlearn_session");

		return response.json({
			message: "Account deleted successfully.",
		});
	} catch (error) {
		console.error("Delete error:", error);
		return response.status(500).json({ message: "Something went wrong while deleting account." });
	}
}
