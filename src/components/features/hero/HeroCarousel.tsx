"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/image-url"

interface HeroImage {
  id: string
  imageUrl: string
  title: string
  subtitle: string | null
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
  order: number
}

export function HeroCarousel() {
  const [images, setImages] = useState<HeroImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000) // 5초마다 변경

    return () => clearInterval(interval)
  }, [images.length])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/hero-images")
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error("Failed to fetch hero images:", error)
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse rounded-lg" />
    )
  }

  if (images.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            옆집약사에 오신 것을 환영합니다
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            암환자를 위한 전문적인 건강 정보와 맞춤형 상담 서비스를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg">
              <Link href="/inquiry">무료 상담 받기</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/supplements">건강보조식품 보기</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden group">
      {/* Main Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(image.imageUrl)}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl text-white">
                  <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                    {image.title}
                  </h1>
                  {image.subtitle && (
                    <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
                      {image.subtitle}
                    </p>
                  )}
                  {image.linkUrl && image.linkText && (
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      <Link href={image.linkUrl} className="flex items-center space-x-2">
                        <span>{image.linkText}</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/70"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {images.length > 1 && (
        <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}