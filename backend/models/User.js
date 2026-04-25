import mongoose from "mongoose";

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		passwordHash: {
			type: String,
			select: false, // Don't include in queries by default
		},
		resetPasswordTokenHash: {
			type: String,
			default: null,
			select: false,
		},
		resetPasswordExpiresAt: {
			type: Date,
			default: null,
			select: false,
			index: true,
		},
		resetPasswordOtpHash: {
			type: String,
			default: null,
			select: false,
		},
		resetPasswordOtpExpiresAt: {
			type: Date,
			default: null,
			select: false,
			index: true,
		},
		resetPasswordOtpAttempts: {
			type: Number,
			default: 0,
			select: false,
		},
		avatar: {
			type: String,
			default: null,
		},
		googleId: {
			type: String,
			default: null,
		},
		photoURL: {
			type: String,
			default: null,
		},
		roleCategory: {
			type: String,
			required: true,
			enum: ["learner", "support-circle", "accessibility-needs"],
		},
		role: {
			type: String,
			required: true,
		},
		roleLabel: {
			type: String,
			required: true,
		},
		joinedAt: {
			type: Date,
			default: () => new Date().toISOString(),
			index: true,
		},
		lastLogin: {
			type: Date,
			index: true,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt
		collection: "users",
	}
);

// Index for faster queries
userSchema.index({ email: 1, isActive: 1 });

/**
 * User Model
 */
const User = mongoose.model("User", userSchema);

export default User;
