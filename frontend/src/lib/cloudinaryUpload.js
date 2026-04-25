function resolveUploadEndpoint({ cloudName, resourceType }) {
	const safeResourceType = resourceType || "auto";
	return `https://api.cloudinary.com/v1_1/${cloudName}/${safeResourceType}/upload`;
}

export async function uploadFileToCloudinary(file, signatureData) {
	if (!file) {
		throw new Error("No file selected for Cloudinary upload.");
	}

	if (!signatureData?.cloudName || !signatureData?.apiKey || !signatureData?.signature || !signatureData?.timestamp) {
		throw new Error("Missing Cloudinary signature payload from backend.");
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("api_key", signatureData.apiKey);
	formData.append("timestamp", String(signatureData.timestamp));
	formData.append("signature", signatureData.signature);

	if (signatureData.folder) {
		formData.append("folder", signatureData.folder);
	}

	if (signatureData.publicId) {
		formData.append("public_id", signatureData.publicId);
	}

	const response = await fetch(resolveUploadEndpoint(signatureData), {
		method: "POST",
		body: formData,
	});

	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(payload?.error?.message || "Cloudinary upload failed.");
	}

	return {
		secureUrl: payload.secure_url,
		publicId: payload.public_id,
		resourceType: payload.resource_type,
		duration: payload.duration,
	};
}
