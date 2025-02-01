"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import SavedOutfits from "./SavedOutfits"
import GeneratedOutfits from "./generated-outfits"

export interface Outfit {
  _id?: string
  name: string
  items: {
    _id: string
    title: string
    category: string
    image_url: string
  }[]
}

export default function OutfitSuggestions() {
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([])

  useEffect(() => {
    fetchSavedOutfits()
  }, [])

  const fetchSavedOutfits = async () => {
    try {
      const response = await fetch("/api/outfits")
      if (!response.ok) {
        throw new Error("Failed to fetch saved outfits")
      }
      const data = await response.json()
      setSavedOutfits(data)
    } catch (error) {
      console.error("Error fetching saved outfits:", error)
      toast({
        title: "Error",
        description: "Failed to fetch saved outfits",
        variant: "destructive",
      })
    }
  }

  const handleSaveOutfit = async (outfit: Outfit) => {
    try {
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(outfit),
      })

      if (!response.ok) {
        throw new Error("Failed to save outfit")
      }

      const savedOutfit = await response.json()
      toast({
        title: "Success",
        description: "Outfit saved successfully",
      })
      fetchSavedOutfits()
      return savedOutfit
    } catch (error) {
      console.error("Error saving outfit:", error)
      toast({
        title: "Error",
        description: "Failed to save outfit",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Outfit Suggestions
      </h1>
      <Tabs defaultValue="saved-outfits" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-800 p-1">
          <TabsTrigger value="saved-outfits" className="rounded-lg transition-all data-[state=active]:bg-gray-700">
            Saved Outfits
          </TabsTrigger>
          <TabsTrigger value="generate-outfits" className="rounded-lg transition-all data-[state=active]:bg-gray-700">
            Generate Outfits
          </TabsTrigger>
        </TabsList>
        <TabsContent value="saved-outfits">
          <SavedOutfits outfits={savedOutfits} onUpdate={fetchSavedOutfits} />
        </TabsContent>
        <TabsContent value="generate-outfits">
          <GeneratedOutfits onSave={handleSaveOutfit} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

