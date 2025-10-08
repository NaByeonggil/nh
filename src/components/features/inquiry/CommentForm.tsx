"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { commentSchema, type CommentData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MessageSquare } from "lucide-react"

interface CommentFormProps {
  inquiryId: string
  onCommentAdded: (comment: any) => void
}

export function CommentForm({ inquiryId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<CommentData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  async function onSubmit(data: CommentData) {
    if (!session) {
      setError("로그인이 필요합니다.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          inquiryId,
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        onCommentAdded(comment)
        form.reset()
      } else {
        const result = await response.json()
        setError(result.error || "댓글 작성 중 오류가 발생했습니다.")
      }
    } catch (error) {
      setError("댓글 작성 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">답변 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>답변 내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="도움이 되는 답변을 작성해주세요..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "작성 중..." : "답변 작성"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}