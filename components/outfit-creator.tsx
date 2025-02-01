"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
    Rotate3D, 
    Expand, 
    Shrink, 
    Trash2, 
    X, 
    PlusCircle,
    ArrowRight,
    ArrowLeft 
} from "lucide-react"
import WardrobeGallery from "./Wardrobe-mini"
import type { WardrobeItem } from "./Wardrobe-mini"

interface OutfitItem extends WardrobeItem {
    x: number
    y: number
    scale: number
    rotation: number
    description?: string
}

interface OutfitCombination {
    items: OutfitItem[]
    description: string
}

export default function OutfitCreator() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [items, setItems] = useState<OutfitItem[]>([])
    const [outfitCombinations, setOutfitCombinations] = useState<OutfitCombination[]>([])
    const [currentCombinationIndex, setCurrentCombinationIndex] = useState(0)
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
    const [isLoading, setIsLoading] = useState(false)
    const [isGeminiOutfit, setIsGeminiOutfit] = useState(false) 

    useEffect(() => {
        const resizeCanvas = () => {
            const container = containerRef.current
            const canvas = canvasRef.current
            if (!container || !canvas) return

            const containerWidth = container.clientWidth
            const newSize = Math.min(containerWidth, 600)
            setCanvasSize({ width: newSize, height: newSize })
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
        }
        drawCanvas()
    }, [items, canvasSize])

    const drawCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = "#f0f0f0"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        items.forEach((item, index) => {
            const img = new Image()
            img.src = item.image_url
            img.onload = () => {
                ctx.save()
                ctx.translate(item.x, item.y)
                ctx.rotate((item.rotation * Math.PI) / 180)
                ctx.scale(item.scale, item.scale)
                ctx.drawImage(img, -img.width / 2, -img.height / 2)
                ctx.restore()

                if (index === activeItemIndex && !isGeminiOutfit) {
                    ctx.strokeStyle = "blue"
                    ctx.lineWidth = 2
                    ctx.strokeRect(
                        item.x - (img.width * item.scale) / 2,
                        item.y - (img.height * item.scale) / 2,
                        img.width * item.scale,
                        img.height * item.scale,
                    )
                }
            }
        })
    }

    const addImageToCanvas = (wardrobeItem: WardrobeItem) => {
        if (isGeminiOutfit) return 

        const canvas = canvasRef.current
        if (!canvas) return

        const newItem: OutfitItem = {
            ...wardrobeItem,
            x: canvas.width / 2,
            y: canvas.height / 2,
            scale: 0.5,
            rotation: 0,
        }

        setItems((prevItems) => [...prevItems, newItem])
        setActiveItemIndex(items.length)
        setIsGalleryOpen(false)
    }

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isGeminiOutfit) return 

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const clickedItemIndex = items.findIndex((item) => {
            const img = new Image()
            img.src = item.image_url
            return (
                x > item.x - (img.width * item.scale) / 2 &&
                x < item.x + (img.width * item.scale) / 2 &&
                y > item.y - (img.height * item.scale) / 2 &&
                y < item.y + (img.height * item.scale) / 2
            )
        })

        setActiveItemIndex(clickedItemIndex !== -1 ? clickedItemIndex : null)
        setIsDragging(clickedItemIndex !== -1)
        setLastMousePos({ x, y })
    }

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isGeminiOutfit || !isDragging || activeItemIndex === null) return 

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const dx = x - lastMousePos.x
        const dy = y - lastMousePos.y

        setItems((prevItems) =>
            prevItems.map((item, index) =>
                index === activeItemIndex
                    ? {
                        ...item,
                        x: item.x + dx,
                        y: item.y + dy,
                    }
                    : item,
            ),
        )

        setLastMousePos({ x, y })
    }

    const handleCanvasMouseUp = () => {
        setIsDragging(false)
    }

    const handleDelete = () => {
        if (isGeminiOutfit) return 

        if (activeItemIndex !== null) {
            setItems((prevItems) => prevItems.filter((_, index) => index !== activeItemIndex))
            setActiveItemIndex(null)
        }
    }

    const handleClear = () => {
        setItems([])
        setActiveItemIndex(null)
        setIsGeminiOutfit(false)
    }

    const handleScale = (scaleChange: number) => {
        if (isGeminiOutfit) return 

        if (activeItemIndex !== null) {
            setItems((prevItems) =>
                prevItems.map((item, index) =>
                    index === activeItemIndex
                        ? {
                            ...item,
                            scale: Math.max(0.1, Math.min(2, item.scale + scaleChange)),
                        }
                        : item,
                ),
            )
        }
    }

    const handleRotate = (rotationChange: number) => {
        if (isGeminiOutfit) return 

        if (activeItemIndex !== null) {
            setItems((prevItems) =>
                prevItems.map((item, index) =>
                    index === activeItemIndex
                        ? {
                            ...item,
                            rotation: (item.rotation + rotationChange) % 360,
                        }
                        : item,
                ),
            )
        }
    }

    const generateOutfitCombinations = async () => {
        setIsLoading(true)
        try {

            const imageUrls = items.map(item => item.image_url)

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-thinking-exp-1219:free",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": `Analyze these clothing items and suggest 3 best outfit combinations. For each combination, provide a style description and recommend the best order of layering the items. Only return the outfit combinations generated by you. Image URLs: ${imageUrls.join(', ')}`
                                },
                                ...imageUrls.map(url => ({
                                    "type": "image_url",
                                    "image_url": { "url": url }
                                }))
                            ]
                        }
                    ]
                })
            })

            const data = await response.json()

        
            console.log('API Response:', data)
            console.log('Response choices:', data.choices)

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid API response structure: ' + JSON.stringify(data))
            }

            const aiResponse = data.choices[0].message.content

        
            console.log('AI Response:', aiResponse)

            const parsedCombinations = parseAIResponse(aiResponse, items)

            setOutfitCombinations(parsedCombinations)
            setCurrentCombinationIndex(0)
            setItems(parsedCombinations[0].items)
            setIsGeminiOutfit(true) 
        } catch (error) {
            console.error("Error generating outfit combinations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const parseAIResponse = (response: string, originalItems: OutfitItem[]): OutfitCombination[] => {

        const combinations: OutfitCombination[] = []
        const combinationTexts = response.split(/Combination \d+:/i)
            .filter(text => text.trim().length > 0)
            .slice(0, 3)

        combinationTexts.forEach(text => {
            const description = text.split('\n')[0].trim()

          
            const combinationItems = originalItems.map(item => ({
                ...item,
                x: canvasRef.current?.width / 2 || 300,
                y: canvasRef.current?.height / 2 || 300,
                scale: 0.5,
                rotation: 0,
                description: description
            }))

            combinations.push({
                items: combinationItems,
                description: description
            })
        })

        return combinations
    }

    const navigateCombinations = (direction: 'next' | 'prev') => {
        const totalCombinations = outfitCombinations.length
        setCurrentCombinationIndex(prev => {
            if (direction === 'next') {
                return (prev + 1) % totalCombinations
            } else {
                return (prev - 1 + totalCombinations) % totalCombinations
            }
        })

        if (outfitCombinations.length > 0) {
            setItems(outfitCombinations[currentCombinationIndex].items)
            setIsGeminiOutfit(true) 
        }
    }

    return (
        <div className="outfit-creator-container">
            <TooltipProvider>
                <div ref={containerRef} className="w-full max-w-4xl mx-auto p-4">
                    <div className="flex flex-wrap gap-2 mb-4 items-center justify-center">
                        <Button 
                            onClick={generateOutfitCombinations} 
                            disabled={items.length === 0 || isLoading}
                        >
                            {isLoading ? "Generating..." : "Generate Outfits"}
                        </Button>

                        {outfitCombinations.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            size="icon" 
                                            variant="outline" 
                                            onClick={() => navigateCombinations('prev')}
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Previous Outfit</TooltipContent>
                                </Tooltip>

                                <div className="text-sm">
                                    Combination {currentCombinationIndex + 1} of {outfitCombinations.length}
                                </div>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            size="icon" 
                                            variant="outline" 
                                            onClick={() => navigateCombinations('next')}
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Next Outfit</TooltipContent>
                                </Tooltip>
                            </div>
                        )}

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button onClick={() => setIsGalleryOpen(true)} disabled={isGeminiOutfit}>
                                    <PlusCircle className="h-5 w-5 mr-2" />
                                    Add Item
                                </Button>
                            </DialogTrigger>
                        </Dialog>

                        {activeItemIndex !== null && !isGeminiOutfit && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="outline" onClick={() => handleScale(0.1)}>
                                            <Expand className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Scale Up</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="outline" onClick={() => handleScale(-0.1)}>
                                            <Shrink className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Scale Down</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="outline" onClick={() => handleRotate(90)}>
                                            <Rotate3D className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Rotate</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="outline" onClick={handleDelete}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Item</TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </div>

                    {outfitCombinations.length > 0 && (
                        <div className="text-center mb-4 text-sm text-gray-600">
                            {outfitCombinations[currentCombinationIndex].description}
                        </div>
                    )}

                    <div className="border rounded-lg overflow-hidden flex justify-center">
                        <canvas
                            ref={canvasRef}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                            className="max-w-full"
                        />
                    </div>

                    <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                        <DialogContent className="max-w-4xl w-full">
                            <DialogHeader>
                                <DialogTitle>Select Item</DialogTitle>
                            </DialogHeader>
                            <WardrobeGallery
                                filters={{ category: "", color: "", season: "" }}
                                onImageSelect={addImageToCanvas}
                                selectionMode={true}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </TooltipProvider>
        </div>
    )
}

