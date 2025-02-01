import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://technospace899:OPZx2XScW1LEQDEs@cluster0.0kc0v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = request.headers.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const updatedOutfit = await request.json()
    await client.connect()
    const database = client.db("wardrobe")
    const outfits = database.collection("outfits")
    const result = await outfits.updateOne(
      { _id: new ObjectId(params.id), userId: new ObjectId(userId) },
      { $set: updatedOutfit },
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update outfit" }, { status: 500 })
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
    const outfits = database.collection("outfits")
    const result = await outfits.deleteOne({ _id: new ObjectId(params.id), userId: new ObjectId(userId) })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete outfit" }, { status: 500 })
  } finally {
    await client.close()
  }
}

