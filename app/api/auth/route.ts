import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  const { action, email, password } = await request.json()

  try {
    await client.connect()
    const database = client.db("wardrobe")
    const users = database.collection("users")

    if (action === "signup") {
      const existingUser = await users.findOne({ email })
      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const result = await users.insertOne({ email, password: hashedPassword })
      const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET, {
        expiresIn: "24h",
      })

 
      cookies().set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, 
      })

      return NextResponse.json({ token })
    } else if (action === "login") {
      const user = await users.findOne({ email })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 })
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "24h",
      })


      cookies().set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      })

      return NextResponse.json({ token })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}

