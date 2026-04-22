import "dotenv/config";
import session from "express-session";
import passport from "./config/passport.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NOW import other modules that depend on environment variables
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

/**
 * Middleware Setup
 */

// Configure CORS
app.use(cors({
	origin: [
		"http://localhost:5173",
		"http://localhost:5174",
	],
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	maxAge: 3600,
}));

app.use(express.json());
app.use(cookieParser());
// Session Configuration (Passport ke liye)
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Production mein true karna (https ke liye)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "lax",
  },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
/**
 * Routes
 */

// Health check endpoints
app.get("/", (_request, response) => {
	response.json({
		ok: true,
		service: "signlearn-backend",
		message: "Backend is running. Use /api/health, /api/auth/signup, and /api/auth/login.",
	});
});

app.get("/api/health", (_request, response) => {
	response.json({ ok: true, message: "SignLearn backend is running." });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Learning routes
app.use("/api/learning", learningRoutes);

/**
 * Start Server
 */

async function startServer() {
	try {
		// Connect to MongoDB
		await connectDB();

		app.listen(PORT, () => {
			console.log(`✅ SignLearn backend running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
