import axios from "axios"

const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY

export async function removeBackground(image: File | Blob): Promise<Blob | null> {
  if (!PHOTOROOM_API_KEY) {
    console.warn("PhotoRoom API key is not configured")
    return image
  }

  const formData = new FormData()
  formData.append("image_file", image)

  try {
    const response = await axios.post("https://sdk.photoroom.com/v1/segment", formData, {
      headers: {
        "x-api-key": PHOTOROOM_API_KEY,
      },
      responseType: "arraybuffer",
    })

    return new Blob([response.data], { type: "image/png" })
  } catch (error) {
    console.error("Error removing background:", error)

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 402) {
        console.warn("PhotoRoom API limit reached, using original image")
        return image
      }

      if (error.response?.status === 429) {
        console.warn("PhotoRoom API rate limit reached, using original image")
        return image
      }
    }

    // For any other error, return the original image
    console.warn("Background removal failed, using original image")
    return image
  }
}

