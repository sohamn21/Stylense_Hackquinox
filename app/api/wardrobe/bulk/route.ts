import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { uploadImage } from "@/utils/cloudinary"
import { removeBackground } from "@/utils/photoroom"
import * as XLSX from "xlsx"

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)

export async function POST(request: Request) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const excelFile = formData.get("excel") as File

    if (!excelFile) {
      return NextResponse.json({ error: "Missing Excel file" }, { status: 400 })
    }

    // Read Excel file
    const excelBuffer = await excelFile.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(excelBuffer), { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const items = XLSX.utils.sheet_to_json(sheet)

    const uploadedItems = []
    const errors = []

    for (const item of items as any[]) {
      try {
        if (!item.image_url) {
          throw new Error(`Missing image URL for item: ${item.title}`)
        }

        // Fetch the image from the provided URL
        try {
          const imageResponse = await fetch(item.image_url)
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${item.image_url}`)
          }

          const imageBuffer = await imageResponse.arrayBuffer()
          let processedImage: Buffer | Blob

          try {
            const backgroundRemovedImage = await removeBackground(new Blob([imageBuffer]))
            processedImage = backgroundRemovedImage
          } catch (backgroundError) {
            console.error("Background removal failed, using original image:", backgroundError)
            processedImage = new Blob([imageBuffer])
          }

          // Convert Blob to base64 for Cloudinary upload
          const base64Image = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(processedImage as Blob)
          })

          // Upload to Cloudinary
          const uploadResult = await uploadImage(base64Image as string, {
            resource_type: "auto",
            folder: "wardrobe",
          })

          if (!uploadResult || !("secure_url" in uploadResult)) {
            throw new Error("Failed to upload image to Cloudinary")
          }

          const imageUrl = uploadResult.secure_url

          // Prepare item data
          const itemData = {
            userId: new ObjectId(userId),
            title: item.title || "",
            category: item.category || "",
            type: item.type || "",
            size: item.size || "",
            brand: item.brand || "",
            source: item.source || "",
            isSecondhand: item.isSecondhand || false,
            purchasePrice: item.purchasePrice || "",
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : new Date(),
            purpose: item.purpose || "",
            seasons: item.seasons || "",
            occasion: item.occasion || "",
            mainColor: item.mainColor || "",
            additionalColors: item.additionalColors || "",
            pattern: item.pattern || "",
            primaryMaterial: item.primaryMaterial || "",
            secondaryMaterials: item.secondaryMaterials || "",
            style: item.style || "",
            embellishments: item.embellishments || "",
            designDetails: item.designDetails || "",
            personalTags: item.personalTags || "",
            notes: item.notes || "",
            image_url: imageUrl,
            created_at: new Date(),
          }

          uploadedItems.push(itemData)
        } catch (fetchError) {
          throw new Error(`Failed to process image: ${fetchError.message}`)
        }
      } catch (error) {
        errors.push({ item: item.title, error: error.message })
        console.error(`Error processing item ${item.title}:`, error)
      }
    }

    if (uploadedItems.length === 0) {
      return NextResponse.json(
        {
          error: "No items were successfully processed",
          errors: errors,
        },
        { status: 400 },
      )
    }

    // Save to database
    await client.connect()
    const database = client.db("wardrobe")
    const itemsCollection = database.collection("items")
    const result = await itemsCollection.insertMany(uploadedItems)

    return NextResponse.json({
      success: true,
      uploadedItems: result.insertedIds,
      errors: errors.length > 0 ? errors : undefined,
      totalProcessed: items.length,
      successfulUploads: uploadedItems.length,
      failedUploads: errors.length,
    })
  } catch (e) {
    console.error("Error in POST /api/wardrobe/bulk:", e)
    return NextResponse.json(
      { error: "Failed to upload items", details: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

