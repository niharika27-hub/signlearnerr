import User from "../models/User.js";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { isEmergencyAdminEmail } from "../middleware/accessControl.js";

/**
 * Sanitize user object - remove sensitive fields
 */
export function sanitizeUser(user) {
	if (!user) {
		return null;
	}

	// If it's a Mongoose document, convert to plain object first
	const userObj = user.toObject ? user.toObject() : user;

	return {
		id: userObj.id,
		fullName: userObj.fullName,
		email: userObj.email,
		roleCategory: userObj.roleCategory,
		role: userObj.role,
		roleLabel: userObj.roleLabel,
		joinedAt: userObj.joinedAt,
		isAdminOverride: isEmergencyAdminEmail(userObj.email),
	};
}

/**
 * Get all users
 */
export async function getUsers() {
	try {
		const users = await User.find({ isActive: true });
		return users;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
	try {
		const normalizedEmail = String(email).trim().toLowerCase();
		const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
		return user;
	} catch (error) {
		console.error("Error fetching user by email:", error);
		throw error;
	}
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
	try {
		const filters = [{ id }];

		if (mongoose.Types.ObjectId.isValid(id)) {
			filters.push({ _id: id });
		}

		const user = await User.findOne({ $or: filters });
		return user;
	} catch (error) {
		console.error("Error fetching user by ID:", error);
		throw error;
	}
}

/**
 * Create new user
 */
export async function createUser(userData) {
	try {
		// Generate unique id if not provided
		if (!userData.id) {
			userData.id = randomUUID();
		}
		const user = new User(userData);
		await user.save();
		return user;
	} catch (error) {
		console.error("Error creating user:", error);
		throw error;
	}
}

/**
 * Update user
 */
export async function updateUser(userId, updateData) {
	try {
		const user = await User.findOneAndUpdate({ id: userId }, updateData, {
			new: true,
			runValidators: true,
		});
		return user;
	} catch (error) {
		console.error("Error updating user:", error);
		throw error;
	}
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(userId) {
	try {
		const user = await User.findOneAndUpdate(
			{ id: userId },
			{ isActive: false },
			{ new: true }
		);
		return user;
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
}

/**
 * Check if email exists
 */
export async function emailExists(email) {
	try {
		const normalizedEmail = String(email).trim().toLowerCase();
		const user = await User.findOne({ email: normalizedEmail });
		return !!user;
	} catch (error) {
		console.error("Error checking email existence:", error);
		throw error;
	}
}
