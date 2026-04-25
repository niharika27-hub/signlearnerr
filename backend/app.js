import "dotenv/config";
import session from "express-session";
import passport from "./config/passport.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

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
app.use(session({
	secret: process.env.SESSION_SECRET || "your-secret-key",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000,
		sameSite: "lax",
	},
}));

app.use(passport.initialize());
app.use(passport.session());

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

app.use("/api/auth", authRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/admin", adminRoutes);

export default app;