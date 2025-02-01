import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  
  if (request.nextUrl.pathname.startsWith("/api/auth") || request.method === "OPTIONS") {
    return NextResponse.next()
  }

  try {
   
    const token = request.headers.get("Authorization")?.replace("Bearer ", "") || request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Missing authentication token" }, { status: 401 })
    }

  
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const { payload } = await jwtVerify(token, secret)

    
    const exp = payload.exp as number
    if (Date.now() >= exp * 1000) {
      return NextResponse.json({ error: "Token has expired" }, { status: 401 })
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("userId", payload.userId as string)

   
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    )

    return response
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Invalid or expired authentication token" }, { status: 401 })
  }
}

export const config = {
  matcher: ["/api/wardrobe/:path*", "/api/outfits/:path*", "/wardrobe"],
}

