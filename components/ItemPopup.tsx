import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Tag, Calendar, Palette, Box } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WardrobeItem {
  _id: string
  title: string
  category: string
  type: string
  size: string
  brand: string
  color: string
  pattern: string
  season: string
  image_url: string
  purchaseDate?: string
  style?: string
  occasion?: string
}

interface ItemPopupProps {
  item: WardrobeItem
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export function ItemPopup({ item, isOpen, onClose, onDelete }: ItemPopupProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/edit-item/${item._id}`)
    onClose()
  }

  const handleDelete = () => {
    onDelete(item._id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-gray-900/95 backdrop-blur-xl border-gray-800">
        <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
          <div className="w-full md:w-1/2 relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative h-full"
            >
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </motion.div>
          </div>
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-gray-900/50 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                {item.title}
              </DialogTitle>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 space-y-6"
            >
              <div className="space-y-4">
                <InfoItem icon={<Tag className="w-5 h-5" />} label="Category" value={item.category} />
                <InfoItem icon={<Box className="w-5 h-5" />} label="Type" value={item.type} />
                <InfoItem icon={<Tag className="w-5 h-5" />} label="Size" value={item.size} />
                <InfoItem icon={<Tag className="w-5 h-5" />} label="Brand" value={item.brand} />
                <InfoItem icon={<Palette className="w-5 h-5" />} label="Color" value={item.color} />
                <InfoItem icon={<Palette className="w-5 h-5" />} label="Pattern" value={item.pattern} />
                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Season" value={item.season} />
                {item.style && <InfoItem icon={<Tag className="w-5 h-5" />} label="Style" value={item.style} />}
                {item.occasion && (
                  <InfoItem icon={<Calendar className="w-5 h-5" />} label="Occasion" value={item.occasion} />
                )}
              </div>
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-800">
                <Button
                  onClick={handleEdit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-3 text-gray-300"
    >
      <div className="text-purple-400">{icon}</div>
      <div>
        <span className="font-medium text-purple-400">{label}:</span> <span className="text-gray-300">{value}</span>
      </div>
    </motion.div>
  )
}

