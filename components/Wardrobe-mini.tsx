import React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface WardrobeItem {
  _id: string
  title: string
  category: string
  type: string
  color: string
  pattern: string
  season: string
  image_url: string
}

interface Filters {
  category: string
  color: string
  season: string
}

interface WardrobeMiniProps {
  filters: Filters
}

const Wardrobemini: React.FC<WardrobeMiniProps> = ({ filters }) => {
  const [items, setItems] = React.useState<WardrobeItem[]>([])

  React.useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const response = await fetch("/api/wardrobe")
    const data = await response.json()
    setItems(data)
  }

  const filteredItems = items.filter(
    (item) =>
      (!filters.category || item.category.toLowerCase() === filters.category.toLowerCase()) &&
      (!filters.color || item.color.toLowerCase().includes(filters.color.toLowerCase())) &&
      (!filters.season || item.season.toLowerCase() === filters.season.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {filteredItems.map((item) => (
        <Card key={item._id} className="cursor-pointer">
          <CardContent className="p-2">
            <img
              src={item.image_url || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-24 object-cover mb-2 rounded-md"
            />
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <p className="text-xs text-gray-500">{item.category}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default Wardrobemini

