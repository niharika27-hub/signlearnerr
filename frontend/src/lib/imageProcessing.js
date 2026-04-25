export async function prepareAvatarImageFile(file, options = {}) {
  const targetSize = Number(options.size) || 512;
  const quality = typeof options.quality === "number" ? options.quality : 0.9;

  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const cropX = Math.floor((bitmap.width - side) / 2);
  const cropY = Math.floor((bitmap.height - side) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image processing is not supported in this browser.");
  }

  context.drawImage(bitmap, cropX, cropY, side, side, 0, 0, targetSize, targetSize);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to generate processed image."));
          return;
        }
        resolve(result);
      },
      "image/jpeg",
      quality
    );
  });

  return new File([blob], `avatar-${Date.now()}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
