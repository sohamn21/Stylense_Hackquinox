"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateOutfitWithFailover } from "@/utils/apiHandler"

interface GeneratedOutfit {
  id: string
  imageUrl: string
  description: string
}

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

interface GeneratedOutfitsProps {
  onSave: (outfit: {
    name: string
    items: {
      _id: string
      title: string
      category: string
      image_url: string
    }[]
  }) => void
}

export default function GeneratedOutfits({ onSave }: GeneratedOutfitsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([])
  const [frontOutfit, setFrontOutfit] = useState<string | null>(null)
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [occasion, setOccasion] = useState("everyday")
  const [purpose, setPurpose] = useState("casual")
  // const [weather, setWeather] = useState("all season") // Removed
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [outfitName, setOutfitName] = useState("")

  const occasionOptions = ["everyday", "work", "party", "special event"]
  const purposeOptions = ["casual", "work", "formal", "sport"]
  // const weatherOptions = ["spring", "summer", "autumn", "winter", "all season"] // Removed

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/wardrobe")
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
        const data = await response.json()
        setWardrobeItems(data)
      } catch (error) {
        console.error("Fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to fetch wardrobe items",
          variant: "destructive",
        })
      }
    }
    fetchItems()
  }, [toast])

const generateOutfits = async () => {
  setIsLoading(true);
  try {
    console.log("Wardrobe items:", wardrobeItems); // Debug log

    const filteredItems = wardrobeItems.filter((item) => {
      console.log("Filtering item:", item); // Debug log
      const purposeMatch = item.purpose?.toLowerCase() === purpose.toLowerCase();
      const occasionMatch = item.occasion?.toLowerCase() === occasion.toLowerCase();
      return purposeMatch && occasionMatch;
    });

    console.log("Filtered items:", filteredItems); // Debug log

    if (filteredItems.length === 0) {
      throw new Error("No items match the selected criteria");
    }

    const imageUrls = filteredItems.map((item) => item.image_url);
    console.log("Filtered Image URLs prepared for API:", imageUrls);

    const prompt = `Given the following clothing items for a ${occasion} occasion with a ${purpose} purpose, select one top and one bottom to create an outfit. Return only the image URLs of the selected items in the format: "Top: [URL], Bottom: [URL]". Available items: ${imageUrls.join(", ")}`;

    console.log("Generated Prompt:", prompt);

    const aiResponse = await generateOutfitWithFailover(prompt);
    console.log("AI Response:", aiResponse);

    // Extract URLs and remove any trailing commas or invalid characters
    const urls = aiResponse.match(/https?:\/\/[^\s,]+/g) || [];

    if (urls.length < 2) {
      throw new Error("Failed to generate a valid outfit");
    }

    const [topUrl, bottomUrl] = urls;

    const generatedOutfits: GeneratedOutfit[] = [
      {
        id: "top",
        imageUrl: topUrl,
        description: "Selected top",
      },
      {
        id: "bottom",
        imageUrl: bottomUrl,
        description: "Selected bottom",
      },
    ];

    setOutfits(generatedOutfits);
  } catch (error) {
    console.error("Error generating outfits:", error);
    toast({
      title: "Generation Error",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleSaveOutfit = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication required")

      const outfitToSave = {
        name: outfitName,
        items: outfits.map((outfit) => {
          const item = wardrobeItems.find((i) => i.image_url === outfit.imageUrl)
          return {
            _id: item?._id || "",
            title: item?.title || "",
            category: item?.category || "",
            image_url: item?.image_url || "",
          }
        }),
      }

      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(outfitToSave),
      })

      if (!response.ok) throw new Error("Save failed")

      toast({ title: "Success", description: "Outfit saved!" })
      setIsSaveDialogOpen(false)
      setOutfitName("")
    } catch (error) {
      console.error("Error saving outfit:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {" "}
        {/* Removed one column */}
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger>
            <SelectValue placeholder="Select occasion" />
          </SelectTrigger>
          <SelectContent>
            {occasionOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger>
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            {purposeOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={generateOutfits}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Outfits
            </>
          )}
        </Button>

        <Button
          onClick={() => setIsSaveDialogOpen(true)}
          disabled={outfits.length === 0}
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          Save Outfit
        </Button>
      </div>

      <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating your perfect outfits...</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <AnimatePresence>
              {outfits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {outfits.map((outfit, index) => (
                    <motion.div
                      key={outfit.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "relative aspect-square",
                        "overflow-hidden rounded-lg shadow-xl transition-all duration-300 cursor-pointer",
                        "bg-white bg-opacity-20 backdrop-blur-lg",
                        frontOutfit === outfit.id ? "z-20 scale-105" : "z-10 hover:scale-102",
                      )}
                      onClick={() => setFrontOutfit(outfit.id)}
                    >
                      <Image
                        src={outfit.imageUrl || "/placeholder.svg"}
                        alt={`Outfit item ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-all duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 opacity-0 hover:opacity-100 flex items-end">
                        <p className="text-white text-sm p-2 bg-black bg-opacity-70">{outfit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outfitName" className="text-right">
                Name
              </Label>
              <Input
                id="outfitName"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveOutfit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

