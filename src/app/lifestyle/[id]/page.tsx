import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Eye, User, Clock, ChevronRight } from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/helpers"
import { CONTENT_CATEGORIES } from "@/lib/constants"
import { db } from "@/lib/db"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getContent(id: string) {
  try {
    const content = await db.content.findFirst({
      where: {
        id,
        published: true,
        category: "LIFESTYLE"
      }
    })

    if (!content) {
      return null
    }

    // Increment view count
    await db.content.update({
      where: { id },
      data: { viewCount: content.viewCount + 1 }
    })

    return content
  } catch (error) {
    console.error("Failed to fetch content:", error)
    return null
  }
}

async function getRelatedContents(currentId: string) {
  try {
    const contents = await db.content.findMany({
      where: {
        id: { not: currentId },
        published: true,
        category: "LIFESTYLE"
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        viewCount: true,
        createdAt: true
      }
    })
    return contents
  } catch (error) {
    console.error("Failed to fetch related contents:", error)
    return []
  }
}

export default async function LifestyleDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const content = await getContent(resolvedParams.id)

  if (!content) {
    notFound()
  }

  const relatedContents = await getRelatedContents(resolvedParams.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lifestyle">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="space-y-4">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {CONTENT_CATEGORIES[content.category as keyof typeof CONTENT_CATEGORIES]}
              </Badge>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(new Date(content.createdAt))}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{content.viewCount} 조회</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold">{content.title}</h1>

            {/* Excerpt */}
            {content.excerpt && (
              <p className="text-lg text-muted-foreground">{content.excerpt}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Thumbnail */}
            {content.thumbnail && (
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={content.thumbnail}
                  alt={content.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content Body */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />

            {/* Tags - Uncomment when tags field is added to database */}
            {/* {content.tags && content.tags.length > 0 && (
              <div className="pt-6 border-t">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">태그:</span>
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )} */}

            {/* Update Info */}
            {content.updatedAt !== content.createdAt && (
              <div className="text-sm text-muted-foreground">
                <Clock className="inline-block h-4 w-4 mr-1" />
                마지막 수정: {formatDateTime(new Date(content.updatedAt))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Contents */}
        {relatedContents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">관련 글</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedContents.map((related) => (
                <Card key={related.id} className="hover:shadow-lg transition-shadow">
                  <Link href={`/lifestyle/${related.id}`}>
                    {related.thumbnail && (
                      <div className="aspect-video relative">
                        <Image
                          src={related.thumbnail}
                          alt={related.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{related.title}</h3>
                      {related.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {related.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{timeAgo(new Date(related.createdAt))}</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{related.viewCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/lifestyle">
              목록으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}