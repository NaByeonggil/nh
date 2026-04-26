import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RatingStars } from "./RatingStars"
import { formatReviewDate, type Review } from "@/lib/product-data"
import { Verified } from "lucide-react"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Reviewer Info */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={review.avatar} alt={review.author} />
                <AvatarFallback>{review.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{review.author}</p>
                  {review.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <Verified className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatReviewDate(review.date)}
                </p>
              </div>
            </div>
            <RatingStars rating={review.rating} size={16} />
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <h4 className="font-semibold">{review.title}</h4>
            <p className="text-muted-foreground leading-relaxed">{review.content}</p>
          </div>

          {/* Review Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm">
              Helpful ({review.helpful})
            </Button>
            <Button variant="ghost" size="sm">
              Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
