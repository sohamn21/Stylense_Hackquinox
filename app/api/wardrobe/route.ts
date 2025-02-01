import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { uploadImage } from "@/utils/cloudinary"
import { removeBackground } from "@/utils/photoroom"

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)

export async function POST(request: Request) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const image = formData.get("image") as File | null
    let imageUrl = ""

    if (image) {
      try {
        
        let processedImage: Blob | null = null
        try {
          processedImage = await removeBackground(image)
        } catch (backgroundError) {
          console.error("Background removal failed, using original image:", backgroundError)
          processedImage = image
        }

        
        const bytes = await new Response(processedImage).arrayBuffer()
        const buffer = Buffer.from(bytes)

        try {
          
          const uploadResult = await uploadImage(buffer, {
            resource_type: "auto",
            folder: "wardrobe",
          })
          if (uploadResult && "secure_url" in uploadResult) {
            imageUrl = uploadResult.secure_url
          } else {
            throw new Error("Invalid upload result from Cloudinary")
          }
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError)
          throw new Error("Failed to upload image to Cloudinary")
        }
      } catch (imageProcessingError) {
        console.error("Image processing error:", imageProcessingError)
        return NextResponse.json(
          { error: "Failed to process and upload image", details: imageProcessingError.message },
          { status: 500 },
        )
      }
    }

    const item = {
      userId: new ObjectId(userId),
      title: formData.get("title"),
      category: formData.get("category"),
      type: formData.get("type"),
      size: formData.get("size"),
      brand: formData.get("brand"),
      source: formData.get("source"),
      isSecondhand: formData.get("isSecondhand") === "true",
      purchasePrice: formData.get("purchasePrice"),
      purchaseDate: formData.get("purchaseDate"),
      purpose: formData.get("purpose"),
      seasons: formData.get("seasons"),
      occasion: formData.get("occasion"),
      mainColor: formData.get("mainColor"),
      additionalColors: formData.get("additionalColors"),
      pattern: formData.get("pattern"),
      primaryMaterial: formData.get("primaryMaterial"),
      secondaryMaterials: formData.get("secondaryMaterials"),
      style: formData.get("style"),
      embellishments: formData.get("embellishments"),
      designDetails: formData.get("designDetails"),
      personalTags: formData.get("personalTags"),
      notes: formData.get("notes"),
      image_url: imageUrl,
      created_at: new Date(),
    }

    await client.connect()
    const database = client.db("wardrobe")
    const items = database.collection("items")
    const result = await items.insertOne(item)

    return NextResponse.json({
      success: true,
      _id: result.insertedId,
      image_url: imageUrl,
    })
  } catch (e) {
    console.error("Error in POST /api/wardrobe:", e)
    return NextResponse.json(
      { error: "Failed to add wardrobe item", details: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

export async function GET(request: Request) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await client.connect()
    const database = client.db("wardrobe")
    const items = database.collection("items")
    const result = await items.find({ userId: new ObjectId(userId) }).toArray()
    return NextResponse.json(result)
  } catch (e) {
    console.error("Error in GET /api/wardrobe:", e)
    return NextResponse.json(
      { error: "Failed to fetch wardrobe items", details: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

