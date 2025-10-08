"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, X, Check } from "lucide-react"
import { timeAgo } from "@/lib/helpers"

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  author: {
    id: string
    name: string
    isExpert: boolean
  }
}

interface CommentListProps {
  comments: Comment[]
  onCommentUpdated: (commentId: string, newContent: string) => void
  onCommentDeleted: (commentId: string) => void
}

export function CommentList({ comments, onCommentUpdated, onCommentDeleted }: CommentListProps) {
  const { data: session } = useSession()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const saveEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        onCommentUpdated(commentId, editContent)
        setEditingId(null)
        setEditContent("")
      } else {
        const result = await response.json()
        alert(result.error || "댓글 수정 중 오류가 발생했습니다.")
      }
    } catch (error) {
      alert("댓글 수정 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onCommentDeleted(commentId)
      } else {
        const result = await response.json()
        alert(result.error || "댓글 삭제 중 오류가 발생했습니다.")
      }
    } catch (error) {
      alert("댓글 삭제 중 오류가 발생했습니다.")
    }
  }

  const canEdit = (comment: Comment) => {
    return session && (
      comment.author.id === session.user.id || 
      session.user.role === "ADMIN"
    )
  }

  const canDelete = (comment: Comment) => {
    return session && (
      comment.author.id === session.user.id || 
      session.user.role === "ADMIN"
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>아직 답변이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.author.name}</span>
                {comment.author.isExpert && (
                  <Badge variant="secondary" className="text-xs">전문가</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {timeAgo(new Date(comment.createdAt))}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="ml-1">(수정됨)</span>
                  )}
                </span>
                
                {(canEdit(comment) || canDelete(comment)) && editingId !== comment.id && (
                  <div className="flex space-x-1">
                    {canEdit(comment) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(comment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete(comment) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {editingId === comment.id ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveEdit(comment.id)}
                    disabled={isLoading || !editContent.trim()}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isLoading ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {comment.content}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}