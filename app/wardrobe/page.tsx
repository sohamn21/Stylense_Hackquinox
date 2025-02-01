"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import WardrobeGallery from "../../components/WardrobeGallery"
import AddItemForm from "../../components/AddItemForm"
import OutfitSuggestions from "../../components/OutfitSuggestions"
import WardrobeAnalytics from "../../components/WardrobeAnalytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

export default function WardrobePage() {
  const [filters, setFilters] = useState({
    category: "all",
    color: "",
    season: "",
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Stylense
        </h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <Tabs defaultValue="wardrobe" className="space-y-8">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full rounded-xl bg-gray-800 p-1 gap-1">
          <TabsTrigger
            value="wardrobe"
            className="w-full rounded-lg transition-all data-[state=active]:bg-gray-700 py-2 text-sm sm:text-base"
          >
            Wardrobe
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="w-full rounded-lg transition-all data-[state=active]:bg-gray-700 py-2 text-sm sm:text-base"
          >
            Add Item
          </TabsTrigger>
          <TabsTrigger
            value="outfits"
            className="w-full rounded-lg transition-all data-[state=active]:bg-gray-700 py-2 text-sm sm:text-base"
          >
            Outfit
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="w-full rounded-lg transition-all data-[state=active]:bg-gray-700 py-2 text-sm sm:text-base"
          >
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wardrobe" className="space-y-4">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => handleFilterChange("category", value)} defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="dresses">Dresses</SelectItem>
                  <SelectItem value="outerwear">Outerwear</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                type="text"
                id="color"
                placeholder="Enter color"
                onChange={(e) => handleFilterChange("color", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select onValueChange={(value) => handleFilterChange("season", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Seasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="autumn">Autumn</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </MotionDiv>

          <WardrobeGallery filters={filters} />
        </TabsContent>

        <TabsContent value="add">
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <AddItemForm />
          </MotionDiv>
        </TabsContent>

        <TabsContent value="outfits">
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <OutfitSuggestions />
          </MotionDiv>
        </TabsContent>

        <TabsContent value="analytics">
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <WardrobeAnalytics />
          </MotionDiv>
        </TabsContent>
      </Tabs>
    </MotionDiv>
  )
}

