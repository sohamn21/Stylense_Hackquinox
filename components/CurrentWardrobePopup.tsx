import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface WardrobeItem {
  _id: string
  title: string
  category: string
  color: string
  image_url: string
}

interface CurrentWardrobePopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function CurrentWardrobePopup({ isOpen, onClose }: CurrentWardrobePopupProps) {
  const [items, setItems] = useState<WardrobeItem[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchWardrobeItems()
    }
  }, [isOpen])

  const fetchWardrobeItems = async () => {
    try {
      const response = await fetch("/api/wardrobe")
      if (!response.ok) {
        throw new Error("Failed to fetch wardrobe items")
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching wardrobe items:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Current Wardrobe</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-32 object-cover mb-2 rounded-md"
                />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm">Category: {item.category}</p>
                <p className="text-sm">Color: {item.color}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

