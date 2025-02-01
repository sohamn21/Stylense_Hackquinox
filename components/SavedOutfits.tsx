import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import type { Outfit } from "./OutfitSuggestions"
import { useRouter } from "next/navigation"

interface SavedOutfitsProps {
  outfits: Outfit[]
  onUpdate: () => void
}

export default function SavedOutfits({ outfits, onUpdate }: SavedOutfitsProps) {
  const router = useRouter()
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [editedName, setEditedName] = useState("")

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/outfits/${id}`, {
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
        throw new Error("Failed to delete outfit")
      }

      toast({
        title: "Success",
        description: "Outfit deleted successfully",
      })
      onUpdate()
    } catch (error) {
      console.error("Error deleting outfit:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete outfit",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingOutfit) return

    try {
      const response = await fetch(`/api/outfits/${editingOutfit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editingOutfit, name: editedName }),
      })

      if (!response.ok) {
        throw new Error("Failed to update outfit")
      }

      toast({
        title: "Success",
        description: "Outfit updated successfully",
      })
      setEditingOutfit(null)
      onUpdate()
    } catch (error) {
      console.error("Error updating outfit:", error)
      toast({
        title: "Error",
        description: "Failed to update outfit",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {outfits.map((outfit) => (
        <Card key={outfit._id}>
          <CardHeader>
            <CardTitle>{outfit.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {outfit.items.map((item) => (
                <img
                  key={item._id}
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-20 object-cover rounded-md"
                />
              ))}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingOutfit(outfit)
                  setEditedName(outfit.name)
                }}
              >
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(outfit._id!)}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editingOutfit} onOpenChange={() => setEditingOutfit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Outfit</DialogTitle>
            <DialogDescription>Make changes to your outfit details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="outfitName">Outfit Name</Label>
              <Input id="outfitName" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOutfit(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

