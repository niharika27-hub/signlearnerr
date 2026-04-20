import mongoose from "mongoose";

export async function connectDB() {
	try {
		const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/signlearn";

		const connection = await mongoose.connect(mongoUri, {
			retryWrites: true,
			w: "majority",
		});

		console.log(`✅ MongoDB connected to: ${connection.connection.host}`);
		return connection;
	} catch (error) {
		console.error("❌ MongoDB connection error:", error.message);
		process.exit(1);
	}
}

export async function disconnectDB() {
	try {
		await mongoose.disconnect();
		console.log("✅ MongoDB disconnected");
	} catch (error) {
		console.error("❌ MongoDB disconnection error:", error.message);
		process.exit(1);
	}
}

export default mongoose;
