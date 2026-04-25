import mongoose from "mongoose";

const userModuleAssignmentSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		moduleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Module",
			required: true,
			index: true,
		},
		assignedBy: {
			type: String,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

userModuleAssignmentSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export const UserModuleAssignment = mongoose.model("UserModuleAssignment", userModuleAssignmentSchema);
