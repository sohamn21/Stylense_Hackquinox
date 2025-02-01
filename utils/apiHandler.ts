import { toast } from "@/components/ui/use-toast"

const API_KEYS = [
  process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_4,
].filter(Boolean) as string[]

interface ApiResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function makeApiRequest(apiKey: string, content: string): Promise<ApiResponse> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": `${window.location.origin}`,
      "X-Title": "Fashion AI Wardrobe Assistant",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-thinking-exp-1219:free",
      messages: [{ role: "user", content }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}

export async function generateOutfitWithFailover(content: string): Promise<string> {
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const apiKey = API_KEYS[i]
      console.log(`Attempting API request with key ${i + 1}`)
      const data = await makeApiRequest(apiKey, content)

      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log(`Successfully generated outfit with API key ${i + 1}`)
        return data.choices[0].message.content
      } else {
        console.error(`Unexpected API response structure from key ${i + 1}:`, data)
        throw new Error("Unexpected API response structure")
      }
    } catch (error) {
      console.error(`Error with API key ${i + 1}:`, error)
      if (i === API_KEYS.length - 1) {
        toast({
          title: "Error",
          description: "Failed to generate outfits. Please try again later.",
          variant: "destructive",
        })
        throw error
      }
    }
  }

  throw new Error("All API requests failed")
}

