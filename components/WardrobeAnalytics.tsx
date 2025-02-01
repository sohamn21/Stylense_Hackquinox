"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #2D3748;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4A5568;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #718096;
  }
`

interface WardrobeItem {
  _id: string
  title: string
  category: string
  color: string
  pattern: string
  season: string
  image_url: string
  lastUsed?: Date
}

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  let retries = 0
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429) {
        const retryAfter = Number.parseInt(response.headers.get("Retry-After") || "10", 10)
        await wait(retryAfter * 1000)
        retries++
      } else {
        return response
      }
    } catch (error) {
      if (retries === maxRetries - 1) throw error
      retries++
      await wait(Math.pow(2, retries) * 1000)
    }
  }
  throw new Error("Max retries reached")
}

export default function WardrobeAnalytics() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [underusedItems, setUnderusedItems] = useState<WardrobeItem[]>([])
  const [suggestions, setSuggestions] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const response = await fetch("/api/wardrobe")
    const data = await response.json()
    setItems(data)
    identifyUnderusedItems(data)
  }

  const identifyUnderusedItems = (items: WardrobeItem[]) => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const underused = items
      .filter((item) => {
        const lastUsed = item.lastUsed ? new Date(item.lastUsed) : new Date(0)
        return lastUsed < threeMonthsAgo
      })
      .slice(0, 5) 

    setUnderusedItems(underused)
  }

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {}
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }

  const getSeasonCounts = () => {
    const counts: { [key: string]: number } = {}
    items.forEach((item) => {
      counts[item.season] = (counts[item.season] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }

  const generateSuggestions = async () => {
    console.log("API Key:", process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)
    setIsLoading(true)
    setSuggestions("")
    try {
      const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": `${window.location.origin}`,
          "X-Title": "Fashion AI Wardrobe Assistant",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-thinking-exp-1219:free",
          messages: [
            {
              role: "user",
              content: `I have the following underused items in my wardrobe: ${underusedItems.map((item) => item.title).join(", ")}. 
          Please suggest creative ways to style and reuse these items, focusing on sustainable fashion practices. 
          Provide specific outfit ideas and styling tips for each item.Give me in 2 or 3 lines`,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", JSON.stringify(data, null, 2))

      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        setSuggestions(data.choices[0].message.content)
      } else {
        console.error("Unexpected API response structure:", data)
        throw new Error("Unexpected API response structure")
      }
    } catch (error) {
      console.error("Error generating suggestions:", error)
      setSuggestions(`Failed to generate suggestions. Please try again later.`)
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSuggestions = useCallback(() => {
    generateSuggestions()
  }, [underusedItems])

  return (
    <>
      <style jsx global>
        {scrollbarStyles}
      </style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Items by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryCounts()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {getCategoryCounts().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Items by Season
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getSeasonCounts()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#82ca9d"
                  label
                >
                  {getSeasonCounts().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 bg-gray-800 bg-opacity-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Underused Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Top 5 Underused Items:</h3>
                <ul className="list-disc list-inside">
                  {underusedItems.map((item) => (
                    <li key={item._id}>{item.title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Button onClick={handleGenerateSuggestions} disabled={isLoading} className="w-full mb-4">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Suggestions...
                    </>
                  ) : (
                    "Get Styling Suggestions"
                  )}
                </Button>
                {suggestions ? (
                  <div className="bg-gray-700 p-4 rounded-md max-h-[300px] overflow-y-auto custom-scrollbar">
                    <h4 className="text-lg font-semibold mb-2">Styling Suggestions:</h4>
                    <p className="text-sm whitespace-pre-wrap">{suggestions}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Click the button above to get styling suggestions for your underused items.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}

