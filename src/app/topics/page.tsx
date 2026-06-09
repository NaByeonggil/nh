"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layers, BookOpen } from "lucide-react"

interface TopicItem {
  id: string
  slug: string
  name: string
  overview?: string
  _count: { lectures: number }
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics")
        if (res.ok) {
          const data = await res.json()
          setTopics(data.topics)
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">주제별 보기</h1>
          </div>
          <p className="text-muted-foreground">
            같은 주제의 강의를 한곳에 모았습니다. 주제를 선택하면 통합본과 관련 강의 노트를 볼 수 있습니다.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">주제가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                아직 등록된 주제가 없습니다. 강의 노트를 등록하면 주제가 자동으로 생성됩니다.
              </p>
              <Button asChild variant="outline">
                <Link href="/lectures">전체 강의 보기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/topics/${topic.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{topic.name}</CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {topic._count.lectures}
                      </Badge>
                    </div>
                    {topic.overview && (
                      <CardDescription className="line-clamp-2">
                        {topic.overview}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
