import mongoose from "mongoose";

function resolveMongoUri() {
	const primary = process.env.MONGODB_URI;
	const fallback = process.env.MONGO_URI;
	return primary || fallback || "mongodb://localhost:27017/signlearn";
}

export async function connectDB() {
	try {
		const mongoUri = resolveMongoUri();

		const connection = await mongoose.connect(mongoUri, {
			retryWrites: true,
			w: "majority",
		});

		console.log(`MongoDB connected to: ${connection.connection.host}`);
		return connection;
	} catch (error) {
		console.error("MongoDB connection error:", error.message);
		console.error("Checked env vars: MONGODB_URI, MONGO_URI");
		process.exit(1);
	}
}

export async function disconnectDB() {
	try {
		await mongoose.disconnect();
		console.log("MongoDB disconnected");
	} catch (error) {
		console.error("MongoDB disconnection error:", error.message);
		process.exit(1);
	}
}

export default mongoose;
