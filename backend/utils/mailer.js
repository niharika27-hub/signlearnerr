import nodemailer from "nodemailer";

function hasSmtpConfig() {
	return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
	if (!hasSmtpConfig()) {
		return null;
	}

	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: String(process.env.SMTP_SECURE || "false") === "true",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});
}

export async function sendPasswordResetOtpEmail({ to, fullName, otp, expiresInMinutes }) {
	const transporter = createTransport();

	const subject = "Your SignLearn password reset code";
	const text = [
		`Hi ${fullName || "there"},`,
		"",
		`Your password reset code is: ${otp}`,
		`This code expires in ${expiresInMinutes} minutes.`,
		"",
		"If you did not request this, you can ignore this email.",
	].join("\n");

	if (!transporter) {
		console.log("Password reset OTP for", to, ":", otp);
		return { delivered: false, provider: "console" };
	}

	await transporter.sendMail({
		from: process.env.SMTP_FROM || process.env.SMTP_USER,
		to,
		subject,
		text,
	});

	return { delivered: true, provider: "smtp" };
}