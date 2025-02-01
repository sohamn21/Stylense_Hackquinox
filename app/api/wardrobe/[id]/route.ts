import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { cloudinary } from "@/utils/cloudinary"
import { removeBackground } from "@/utils/photoroom"

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://technospace899:OPZx2XScW1LEQDEs@cluster0.0kc0v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await client.connect()
    const database = client.db("wardrobe")
    const items = database.collection("items")
    const item = await items.findOne({ _id: new ObjectId(params.id), userId: new ObjectId(userId) })
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch wardrobe item" }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const image = formData.get("image") as File | null
    let imageUrl = formData.get("image_url") as string

    if (image) {
      try {
        const backgroundRemovedImage = await removeBackground(image)
        const bytes = await new Response(backgroundRemovedImage).arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = buffer.toString("base64")
        const dataURI = `data:${image.type};base64,${base64Image}`
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "wardrobe",
        })
        imageUrl = uploadResponse.secure_url
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
      }
    }

    const updatedItem = {
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
      updated_at: new Date(),
    }

    await client.connect()
    const database = client.db("wardrobe")
    const items = database.collection("items")
    const result = await items.updateOne(
      { _id: new ObjectId(params.id), userId: new ObjectId(userId) },
      { $set: updatedItem },
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update wardrobe item" }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await client.connect()
    const database = client.db("wardrobe")
    const items = database.collection("items")
    const result = await items.deleteOne({ _id: new ObjectId(params.id), userId: new ObjectId(userId) })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete wardrobe item" }, { status: 500 })
  } finally {
    await client.close()
  }
}

