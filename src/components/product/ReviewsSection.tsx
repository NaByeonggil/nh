import { Button } from "@/components/ui/button"
import { RatingStars } from "./RatingStars"
import { ReviewCard } from "./ReviewCard"
import { formatRating, type Review } from "@/lib/product-data"

interface ReviewsSectionProps {
  rating: number
  reviewCount: number
  reviews: Review[]
}

export function ReviewsSection({ rating, reviewCount, reviews }: ReviewsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={rating} size={20} />
            <span className="text-lg font-semibold">{formatRating(rating)}</span>
            <span className="text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        </div>
        <Button variant="outline">Write a Review</Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More */}
      {reviewCount > reviews.length && (
        <div className="flex justify-center">
          <Button variant="outline">Load More Reviews</Button>
        </div>
      )}
    </div>
  )
}
