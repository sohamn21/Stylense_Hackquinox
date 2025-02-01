import { v2 as cloudinary } from "cloudinary"

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Missing Cloudinary credentials")
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: Buffer | string, options = {}) {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "wardrobe",
          ...options,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(error)
            return
          }
          resolve(result)
        },
      )

      if (typeof file === "string") {
        uploadStream.end(file)
      } else {
        uploadStream.end(file)
      }
    })
  } catch (error) {
    console.error("Error in uploadImage:", error)
    throw error
  }
}

export { cloudinary }

