"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AddItemForm from "@/components/AddItemForm"

export default function EditItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchItem = async () => {
      const response = await fetch(`/api/wardrobe/${params.id}`)
      const data = await response.json()
      setItem(data)
    }
    fetchItem()
  }, [params.id])

  if (!item) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Item</h1>
      <AddItemForm initialData={item} isEditing={true} />
    </div>
  )
}

