"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Camera, Pencil, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { removeBackground } from "@/utils/photoroom"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

const MotionForm = dynamic(() => import("framer-motion").then((mod) => mod.motion.form), { ssr: false })
const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

interface AddItemFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function AddItemForm({ initialData, isEditing = false }: AddItemFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "",
    size: "",
    brand: "",
    source: "",
    isSecondhand: false,
    purchasePrice: "",
    purchaseDate: new Date(),
    purpose: "",
    seasons: "",
    occasion: "",
    mainColor: "",
    additionalColors: "",
    pattern: "",
    primaryMaterial: "",
    secondaryMaterials: "",
    style: "",
    embellishments: "",
    designDetails: "",
    personalTags: "",
    notes: "",
    image: null as File | null,
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
 

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate) : new Date(),
      })
    }
  }, [initialData])

  const handleImageCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const handleMobileImageCapture = async () => {
    try {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.capture = "environment"
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          await handleImageUpload(file)
        }
      }
      input.click()
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
  
      const backgroundRemovedImage = await removeBackground(file)

      
      const imageToUse = backgroundRemovedImage || file
      const previewUrl = URL.createObjectURL(imageToUse)

      setPreviewImage(previewUrl)
      setFormData({ ...formData, image: file })
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData()

 
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        if (key === "purchaseDate") {
         
          const dateValue = value instanceof Date ? value : new Date(value)
          form.append(key, dateValue.toISOString())
        } else if (key === "isSecondhand") {
          form.append(key, value.toString())
        } else {
          form.append(key, value)
        }
      }
    })

    try {
      const url = isEditing ? `/api/wardrobe/${initialData._id}` : "/api/wardrobe"
      const method = isEditing ? "PUT" : "POST"

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save item")
      }

      toast({
        title: "Success",
        description: isEditing ? "Item updated successfully" : "Item added successfully",
      })
      router.push("/wardrobe") 
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkUpload = async () => {
    if (!excelFile) {
      toast({
        title: "Error",
        description: "Please select an Excel file.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("excel", excelFile)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/api/wardrobe/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload items")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: `Successfully uploaded ${result.uploadedItems.length} items.`,
      })
      setIsBulkUploadOpen(false)
      router.push("/wardrobe")
    } catch (error) {
      console.error("Error uploading items:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload items. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <MotionForm
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8 dark"
    >
      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">General Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, category: value, type: "" })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Bottoms</SelectItem>
                <SelectItem value="dresses">Dresses</SelectItem>
                <SelectItem value="outerwear">Outerwear</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="bags">Bags</SelectItem>
                <SelectItem value="wedding">Wedding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {formData.category === "tops" && (
                  <>
                    <SelectItem value="tshirt">T-Shirt</SelectItem>
                    <SelectItem value="polo-tshirt">Polo T-Shirt</SelectItem>
                    <SelectItem value="shirt">Shirt</SelectItem>
                    <SelectItem value="sweater">Sweater</SelectItem>
                    <SelectItem value="kurta">Kurta</SelectItem>
                    <SelectItem value="tanktop">Tank Top</SelectItem>
                    <SelectItem value="hoodie">Hoodie</SelectItem>
                    <SelectItem value="kimono">Kimono</SelectItem>
                    <SelectItem value="tunic">Tunic</SelectItem>
                    <SelectItem value="polo">Polo Shirt</SelectItem>
                  </>
                )}
                {formData.category === "bottoms" && (
                  <>
                    <SelectItem value="jeans">Jeans</SelectItem>
                    <SelectItem value="pants">Pants</SelectItem>
                    <SelectItem value="shorts">Shorts</SelectItem>
                    <SelectItem value="skirt">Skirt</SelectItem>
                    <SelectItem value="trousers">Trousers</SelectItem>
                    <SelectItem value="leggings">Leggings</SelectItem>
                    <SelectItem value="dhoti">Dhoti</SelectItem>
                    <SelectItem value="lungi">Lungi</SelectItem>
                    <SelectItem value="cargo">Cargo</SelectItem>
                    <SelectItem value="sarong">Sarong</SelectItem>
                    <SelectItem value="culottes">Culottes</SelectItem>
                  </>
                )}
                {formData.category === "dresses" && (
                  <>
                    <SelectItem value="casual">Casual Dress</SelectItem>
                    <SelectItem value="formal">Formal Dress</SelectItem>
                    <SelectItem value="cocktail">Cocktail Dress</SelectItem>
                    <SelectItem value="anarkali">Anarkali Dress</SelectItem>
                    <SelectItem value="saree">Saree</SelectItem>
                    <SelectItem value="gown">Gown</SelectItem>
                    <SelectItem value="kaftan">Kaftan</SelectItem>
                    <SelectItem value="abaya">Abaya</SelectItem>
                    <SelectItem value="dirndl">Dirndl</SelectItem>
                  </>
                )}
                {formData.category === "wedding" && (
                  <>
                    <SelectItem value="lehenga">Lehenga</SelectItem>
                    <SelectItem value="bridal-saree">Bridal Saree</SelectItem>
                    <SelectItem value="sharara">Sharara</SelectItem>
                    <SelectItem value="anarkali-bridal">Anarkali Bridal Dress</SelectItem>
                    <SelectItem value="reception-gown">Reception Gown</SelectItem>
                    <SelectItem value="sherwani">Sherwani</SelectItem>
                    <SelectItem value="bandhgala">Bandhgala</SelectItem>
                    <SelectItem value="jodhpuri-suit">Jodhpuri Suit</SelectItem>
                    <SelectItem value="ghagra-choli">Ghagra Choli</SelectItem>
                    <SelectItem value="dhoti-kurta">Dhoti Kurta</SelectItem>
                    <SelectItem value="suit">Suit</SelectItem>
                    <SelectItem value="tuxedo">Tuxedo</SelectItem>
                    <SelectItem value="wedding-blazer">Wedding Blazer</SelectItem>
                  </>
                )}
                {formData.category === "outerwear" && (
                  <>
                    <SelectItem value="jacket">Jacket</SelectItem>
                    <SelectItem value="coat">Coat</SelectItem>
                    <SelectItem value="blazer">Blazer</SelectItem>
                    <SelectItem value="cardigan">Cardigan</SelectItem>
                    <SelectItem value="poncho">Poncho</SelectItem>
                    <SelectItem value="cape">Cape</SelectItem>
                    <SelectItem value="windbreaker">Windbreaker</SelectItem>
                  </>
                )}
                {formData.category === "shoes" && (
                  <>
                    <SelectItem value="sneakers">Sneakers</SelectItem>
                    <SelectItem value="sports-shoes">Sports Shoes</SelectItem>
                    <SelectItem value="boots">Boots</SelectItem>
                    <SelectItem value="sandals">Sandals</SelectItem>
                    <SelectItem value="heels">Heels</SelectItem>
                    <SelectItem value="flats">Flats</SelectItem>
                    <SelectItem value="juttis">Juttis</SelectItem>
                    <SelectItem value="kolhapuri">Kolhapuri</SelectItem>
                    <SelectItem value="mojari">Mojari</SelectItem>
                    <SelectItem value="loafers">Loafers</SelectItem>
                    <SelectItem value="clogs">Clogs</SelectItem>
                    <SelectItem value="espadrilles">Espadrilles</SelectItem>
                    <SelectItem value="formalshoes">Formal-Shoes</SelectItem>
                  </>
                )}
                {formData.category === "accessories" && (
                  <>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                    <SelectItem value="hat">Hat</SelectItem>
                    <SelectItem value="scarf">Scarf</SelectItem>
                    <SelectItem value="belt">Belt</SelectItem>
                    <SelectItem value="watch">Watch</SelectItem>
                    <SelectItem value="gloves">Gloves</SelectItem>
                    <SelectItem value="bindi">Bindi</SelectItem>
                    <SelectItem value="maang-tikka">Maang Tikka</SelectItem>
                    <SelectItem value="sunglasses">Sunglasses</SelectItem>
                    <SelectItem value="hairband">Hairband</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <div className="flex gap-2">
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Origin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <div className="flex gap-2">
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail Store</SelectItem>
                <SelectItem value="online">Online Shop</SelectItem>
                <SelectItem value="thrift">Thrift Store</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="secondhand"
              checked={formData.isSecondhand}
              onCheckedChange={(checked) => setFormData({ ...formData, isSecondhand: checked as boolean })}
            />
            <Label htmlFor="secondhand">Secondhand / Thrifted / Vintage</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Purchase Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <div className="flex gap-2">
              <Input
                id="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Purchase Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {formData.purchaseDate ? format(formData.purchaseDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.purchaseDate}
                  onSelect={(date) => date && setFormData({ ...formData, purchaseDate: date })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Usage Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seasons">Seasons</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, seasons: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="autumn">Autumn</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="all">All Seasons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, occasion: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyday">Everyday</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="special">Special Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Visual Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mainColor">Main Color</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, mainColor: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select main color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="gray">Gray</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalColors">Additional Colors</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, additionalColors: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select additional colors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
                <SelectItem value="gray">Gray</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern">Pattern</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, pattern: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="striped">Striped</SelectItem>
                <SelectItem value="plaid">Plaid</SelectItem>
                <SelectItem value="floral">Floral</SelectItem>
                <SelectItem value="polkadot">Polka Dot</SelectItem>
                <SelectItem value="geometric">Geometric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Material Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryMaterial">Primary Material</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, primaryMaterial: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="polyester">Polyester</SelectItem>
                <SelectItem value="wool">Wool</SelectItem>
                <SelectItem value="silk">Silk</SelectItem>
                <SelectItem value="linen">Linen</SelectItem>
                <SelectItem value="leather">Leather</SelectItem>
                <SelectItem value="denim">Denim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryMaterials">Secondary Materials</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, secondaryMaterials: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select secondary materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="polyester">Polyester</SelectItem>
                <SelectItem value="wool">Wool</SelectItem>
                <SelectItem value="silk">Silk</SelectItem>
                <SelectItem value="linen">Linen</SelectItem>
                <SelectItem value="leather">Leather</SelectItem>
                <SelectItem value="denim">Denim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Style Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, style: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="streetwear">Streetwear</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
                <SelectItem value="bohemian">Bohemian</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="embellishments">Embellishments</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, embellishments: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select embellishments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sequins">Sequins</SelectItem>
                <SelectItem value="beads">Beads</SelectItem>
                <SelectItem value="embroidery">Embroidery</SelectItem>
                <SelectItem value="applique">Applique</SelectItem>
                <SelectItem value="studs">Studs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="designDetails">Design Details</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, designDetails: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select design details" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ruffles">Ruffles</SelectItem>
                <SelectItem value="pleats">Pleats</SelectItem>
                <SelectItem value="pockets">Pockets</SelectItem>
                <SelectItem value="buttons">Buttons</SelectItem>
                <SelectItem value="zippers">Zippers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Personal Tags & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personalTags">Personal Tags</Label>
            <Input
              id="personalTags"
              value={formData.personalTags}
              onChange={(e) => setFormData({ ...formData, personalTags: e.target.value })}
              placeholder="Add personal tags"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <div className="flex gap-2">
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add text here"
              />
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Image Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 transform hover:scale-105"
              onClick={handleMobileImageCapture}
            >
              <Camera className="h-6 w-6 mr-2" />
              Take Photo
            </Button>
            <div className="relative h-32">
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="w-full h-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white transition-all duration-300 transform hover:scale-105"
              >
                <Upload className="h-6 w-6 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
          {previewImage && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-full h-48"
            >
              <Image
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreviewImage(null)
                  setFormData({ ...formData, image: null })
                }}
              >
                Remove
              </Button>
            </MotionDiv>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          {isEditing ? "Update Item" : "Save Item"}
        </Button>
        <Button
          type="button"
          onClick={() => setIsBulkUploadOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-2 px-4 roundedfull transition-all duration-300 transformhover:scale105"
        >
          Bulk Upload
        </Button>
      </div>

      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload</DialogTitle>
            <DialogDescription>
              Upload an Excel file (.xlsx) containing item details and image URLs. The file must include an 'image_url'
              column with accessible public URLs for each item's image.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="excelFile" className="text-right">
                Excel File
              </Label>
              <Input
                id="excelFile"
                type="file"
                accept=".xlsx"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBulkUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionForm>
  )
}

