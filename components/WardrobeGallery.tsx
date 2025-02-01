"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Changed from next/router to next/navigation
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ItemPopup } from "./ItemPopup"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export interface WardrobeItem {
  _id: string
  userId: string
  title: string
  category: string
  type: string
  size: string
  brand: string
  source: string
  isSecondhand: boolean
  purchasePrice: string
  purchaseDate: string
  purpose: string
  seasons: string
  occasion: string
  mainColor: string
  additionalColors: string
  pattern: string
  primaryMaterial: string
  secondaryMaterials: string
  style: string
  embellishments: string
  designDetails: string
  personalTags: string
  notes: string
  image_url: string
  created_at: string
}

interface Filters {
  category: string
  color: string
  season: string
}

interface WardrobeGalleryProps {
  filters: Filters
  onImageSelect?: (item: WardrobeItem) => void
  selectionMode?: boolean
}

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`

function WardrobeItemSkeleton() {
  return (
    <div className="relative group">
      <div className={cn("h-[300px] rounded-lg bg-gray-800/50", shimmer)} />
      <div className="space-y-2 mt-2">
        <div className={cn("h-4 w-3/4 rounded-lg bg-gray-800/50", shimmer)} />
        <div className={cn("h-3 w-1/2 rounded-lg bg-gray-800/50", shimmer)} />
      </div>
    </div>
  )
}

export default function WardrobeGallery({ filters, onImageSelect, selectionMode = false }: WardrobeGalleryProps) {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([])
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      applyFilters()
    }
  }, [items]) // Removed unnecessary dependency: filters

  const fetchItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/api/wardrobe", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // Add this to include cookies
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth")
          return
        }
        throw new Error(`Failed to fetch wardrobe items: ${response.statusText}`)
      }

      const data = await response.json()
      setItems(data)
      setFilteredItems(data)
    } catch (error) {
      console.error("Error fetching items:", error)
      setError(error.message || "Failed to load wardrobe items. Please try again later.")
      toast({
        title: "Error",
        description: error.message || "Failed to load wardrobe items",
        variant: "destructive",
      })

      // If unauthorized, redirect to auth page
      if (error.message.includes("authentication")) {
        router.push("/auth")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let result = items
    if (filters.category && filters.category !== "all") {
      result = result.filter((item) => item.category.toLowerCase() === filters.category.toLowerCase())
    }
    if (filters.color) {
      result = result.filter((item) => item.mainColor.toLowerCase().includes(filters.color.toLowerCase())) // Updated to use mainColor
    }
    if (filters.season && filters.season !== "all") {
      result = result.filter((item) => item.seasons.toLowerCase() === filters.season.toLowerCase()) // Updated to use seasons
    }
    setFilteredItems(result)
  }

  const handleItemClick = (item: WardrobeItem) => {
    if (selectionMode && onImageSelect) {
      onImageSelect(item)
    } else {
      setSelectedItem(item)
      setIsPopupOpen(true)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/wardrobe/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth")
          return
        }
        throw new Error("Failed to delete item")
      }

      await fetchItems()
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(8)].map((_, index) => (
          <WardrobeItemSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchItems}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-400">No items match the current filters.</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item._id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
            layoutId={item._id}
            className="relative group"
          >
            <Card
              className="overflow-hidden cursor-pointer transform-gpu transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl bg-gray-800/50 backdrop-blur-lg border-0"
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-all duration-700 hover:scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 space-y-2 relative z-10 bg-gray-800/90 backdrop-blur-md">
                  <motion.h3
                    className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors duration-300"
                    layoutId={`title-${item._id}`}
                  >
                    {item.title}
                  </motion.h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>{item.category}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      <span>{item.type}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">{item.mainColor}</span>{" "}
                      {/*Updated to mainColor*/}
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">{item.pattern}</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">{item.seasons}</span>{" "}
                      {/*Updated to seasons*/}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {selectedItem && (
        <ItemPopup
          item={selectedItem}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onDelete={deleteItem}
        />
      )}
    </AnimatePresence>
  )
}

