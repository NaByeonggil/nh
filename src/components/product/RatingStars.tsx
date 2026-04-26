import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: number
  showValue?: boolean
  className?: string
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  showValue = false,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const fillPercentage = Math.min(Math.max(rating - index, 0), 1) * 100

        return (
          <div key={index} className="relative" style={{ width: size, height: size }}>
            <Star
              className="absolute text-muted-foreground"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            <div
              className="absolute overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className="text-yellow-400 fill-yellow-400"
                style={{ width: size, height: size }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
