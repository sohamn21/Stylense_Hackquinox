import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://technospace899:OPZx2XScW1LEQDEs@cluster0.0kc0v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri)

export async function GET(request: Request) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await client.connect()
    const database = client.db("wardrobe")
    const outfits = database.collection("outfits")
    const result = await outfits.find({ userId: new ObjectId(userId) }).toArray()
    return NextResponse.json(result)
  } catch (e) {
    console.error("Error fetching outfits:", e)
    return NextResponse.json({ error: "Failed to fetch outfits", details: e.message }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const outfit = await request.json()

   
    if (!outfit.name || !Array.isArray(outfit.items) || outfit.items.length === 0) {
      return NextResponse.json({ error: "Invalid outfit data" }, { status: 400 })
    }

    await client.connect()
    const database = client.db("wardrobe")
    const outfits = database.collection("outfits")

    const outfitWithUserId = {
      ...outfit,
      userId: new ObjectId(userId),
    }

    const result = await outfits.insertOne(outfitWithUserId)

    if (!result.acknowledged) {
      throw new Error("Failed to insert outfit into database")
    }

    const savedOutfit = await outfits.findOne({ _id: result.insertedId })

    return NextResponse.json(savedOutfit)
  } catch (e) {
    console.error("Error saving outfit:", e)
    return NextResponse.json({ error: "Failed to save outfit", details: e.message }, { status: 500 })
  } finally {
    await client.close()
  }
}

