"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SlideData {
  id: string
  title: string
  subtitle: string
  image_url: string
  button_text?: string
  button_link?: string
}

interface HeroSliderProps {
  slides: SlideData[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-play slides
  useEffect(() => {
    if (!isAutoPlay || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlay, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return null
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <img src={slide.image_url || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-2xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">{currentSlideData.title}</h1>
          <p className="text-xl md:text-2xl text-white/90 text-balance leading-relaxed">{currentSlideData.subtitle}</p>
          {currentSlideData.button_text && currentSlideData.button_link && (
            <Link href={currentSlideData.button_link}>
              <Button size="lg" className="gap-2">
                {currentSlideData.button_text}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
