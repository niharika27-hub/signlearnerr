import { body, validationResult } from "express-validator";

/**
 * Validation rules for signup
 */
export const validateSignup = [
	body("fullName")
		.trim()
		.notEmpty().withMessage("Full name is required")
		.isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
	
	body("email")
		.trim()
		.isEmail().withMessage("Invalid email address")
		.normalizeEmail(),
	
	body("password")
		.isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
	
	body("roleCategory")
		.notEmpty().withMessage("Role category is required")
		.isIn(["learner", "support-circle", "accessibility-needs"]).withMessage("Invalid role category"),
	
	body("role")
		.trim()
		.notEmpty().withMessage("Role is required"),

	body("photoURL")
		.optional({ nullable: true, checkFalsy: true })
		.isURL().withMessage("photoURL must be a valid URL"),

	body("avatar")
		.optional({ nullable: true, checkFalsy: true })
		.isURL().withMessage("avatar must be a valid URL"),
];

/**
 * Validation rules for login
 */
export const validateLogin = [
	body("email")
		.trim()
		.isEmail().withMessage("Invalid email address")
		.normalizeEmail(),
	
	body("password")
		.notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for forgot password
 */
export const validateForgotPassword = [
	body("email")
		.trim()
		.isEmail().withMessage("Invalid email address")
		.normalizeEmail(),
];

/**
 * Validation rules for reset password
 */
export const validateResetPassword = [
	body("email")
		.trim()
		.isEmail().withMessage("Invalid email address")
		.normalizeEmail(),

	body("otp")
		.trim()
		.isLength({ min: 6, max: 6 }).withMessage("OTP must be a 6-digit code")
		.isNumeric().withMessage("OTP must contain only numbers"),

	body("newPassword")
		.isLength({ min: 6 }).withMessage("New password must be at least 6 characters long")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain uppercase, lowercase, and number"),
];

/**
 * Validation rules for password change
 */
export const validatePasswordChange = [
	body("currentPassword")
		.notEmpty().withMessage("Current password is required"),
	
	body("newPassword")
		.isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain uppercase, lowercase, and number")
		.custom((value, { req }) => {
			if (value === req.body.currentPassword) {
				throw new Error("New password must be different from current password");
			}
			return true;
		}),
];

/**
 * Validation rules for profile update
 */
export const validateProfileUpdate = [
	body("fullName")
		.optional()
		.trim()
		.isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
	
	body("roleCategory")
		.optional()
		.isIn(["learner", "support-circle", "accessibility-needs"]).withMessage("Invalid role category"),

	body("photoURL")
		.optional({ nullable: true, checkFalsy: true })
		.isURL().withMessage("photoURL must be a valid URL"),

	body("avatar")
		.optional({ nullable: true, checkFalsy: true })
		.isURL().withMessage("avatar must be a valid URL"),
];

/**
 * Middleware: Handle validation errors
 */
export function handleValidationErrors(request, response, next) {
	const errors = validationResult(request);
	
	if (!errors.isEmpty()) {
		return response.status(400).json({
			message: "Validation failed",
			errors: errors.array().map(err => ({
				field: err.param,
				message: err.msg,
			})),
		});
	}
	
	next();
}

export default {
	validateSignup,
	validateLogin,
	validateForgotPassword,
	validateResetPassword,
	validatePasswordChange,
	validateProfileUpdate,
	handleValidationErrors,
};
