"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      title: "Maximize Existing Wardrobe",
      description: "Get personalized outfit suggestions based on your current clothes.",
    },
    {
      title: "Smart Purchasing Decisions",
      description: "Receive recommendations for new items that complement your style and existing wardrobe.",
    },
    {
      title: "Develop Personal Style",
      description: "Discover and refine your unique fashion identity with AI-powered insights.",
    },
    {
      title: "Reduce Fashion Waste",
      description: "Track your wardrobe's sustainability and make eco-friendly choices.",
    },
  ]

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-hidden">
      <HeroGeometric badge="AI-Powered Wardrobe Assistant" title1="Revolutionize" title2="Your Wardrobe" />

      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center text-lg md:text-xl text-gray-400 mb-16 max-w-3xl mx-auto"
          >
            Stylense combines computer vision, AI styling recommendations, and sustainability tracking to help you make
            the most of your wardrobe.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                custom={index}
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Check className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white/90">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Ready to Transform Your Wardrobe?
            </h2>
            <Button
              onClick={() => router.push("/auth")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Sign Up Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

