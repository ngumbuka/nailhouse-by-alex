import { v2 as cloudinary } from "cloudinary";

// Ensure environment variables are read for server
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 encoded image or video to Cloudinary.
 * If the provided string is already a URL (e.g. from Supabase or Cloudinary), it returns it unchanged.
 */
export async function processMediaUpload(
  mediaString: string | null | undefined,
  folderName: string = "nailhouse",
): Promise<string | null | undefined> {
  if (!mediaString) return mediaString;

  // If it's not a base64 data URI, assume it's already a hosted URL and return it
  if (!mediaString.startsWith("data:image/") && !mediaString.startsWith("data:video/")) {
    return mediaString;
  }

  // If Cloudinary is not configured, fallback to storing the massive base64 string
  // (which is bad, but prevents breaking the flow if keys are missing)
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn(
      "[cloudinary] Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME). Saving base64 string directly to DB.",
    );
    return mediaString;
  }

  try {
    const result = await cloudinary.uploader.upload(mediaString, {
      folder: folderName,
      resource_type: "auto",
    });
    console.log(`[cloudinary] Successfully uploaded to: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("[cloudinary] Upload failed:", error);
    throw new Error("Failed to upload media to Cloudinary");
  }
}

/**
 * Processes an array of media strings (e.g. for a gallery)
 */
export async function processMultipleMediaUploads(
  mediaArray: string[] | null | undefined,
  folderName: string = "nailhouse",
): Promise<string[] | undefined> {
  if (!mediaArray || mediaArray.length === 0) return mediaArray || undefined;

  const uploadPromises = mediaArray.map((media) => processMediaUpload(media, folderName));
  const results = await Promise.all(uploadPromises);

  return results.filter(Boolean) as string[];
}
