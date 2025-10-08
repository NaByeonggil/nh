"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PasswordDialog } from "@/components/features/inquiry/PasswordDialog"
import { CommentForm } from "@/components/features/inquiry/CommentForm"
import { CommentList } from "@/components/features/inquiry/CommentList"
import { 
  MessageSquare, 
  Lock, 
  Calendar, 
  User, 
  Eye, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Download,
  File,
  Image as ImageIcon
} from "lucide-react"
import { formatDateTime, timeAgo, formatFileSize } from "@/lib/helpers"

interface InquiryDetail {
  id: string
  title: string
  content: string
  authorName?: string
  authorEmail?: string
  authorPhone?: string
  isPrivate: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  attachments: string[]
  author?: {
    id: string
    name: string
    isExpert: boolean
  }
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    isExpert: boolean
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

function InquiryDetailContent({ id }: { id: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [...prev, newComment])
  }

  const handleCommentUpdated = (commentId: string, newContent: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, content: newContent, updatedAt: new Date().toISOString() }
        : comment
    ))
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  const fetchInquiry = async (password?: string) => {
    try {
      setLoading(true)
      setError("")
      
      const url = new URL(`/api/inquiries/${id}`, window.location.origin)
      if (password) {
        url.searchParams.set('password', password)
      }

      const response = await fetch(url.toString())
      
      if (response.status === 403) {
        setShowPasswordDialog(true)
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "문의를 불러올 수 없습니다.")
        return
      }

      const data = await response.json()
      setInquiry(data)
      setComments(data.comments || [])
      setShowPasswordDialog(false)
      
    } catch (error) {
      setError("문의를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiry()
  }, [id])

  const handlePasswordSubmit = async (password: string) => {
    setIsPasswordLoading(true)
    setPasswordError("")
    
    try {
      const url = new URL(`/api/inquiries/${id}`, window.location.origin)
      url.searchParams.set('password', password)

      const response = await fetch(url.toString())
      
      if (response.status === 403) {
        setPasswordError("암호가 올바르지 않습니다.")
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        setPasswordError(errorData.error || "오류가 발생했습니다.")
        return
      }

      const data = await response.json()
      setInquiry(data)
      setComments(data.comments || [])
      setShowPasswordDialog(false)
      
    } catch (error) {
      setPasswordError("암호 확인 중 오류가 발생했습니다.")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!inquiry || !confirm("정말로 이 문의를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/inquiry")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "문의 삭제 중 오류가 발생했습니다.")
      }
    } catch (error) {
      alert("문의 삭제 중 오류가 발생했습니다.")
    }
  }

  const canEdit = inquiry && session && (
    inquiry.author?.id === session.user.id || 
    session.user.role === "ADMIN"
  )

  const canDelete = inquiry && session && (
    inquiry.author?.id === session.user.id || 
    session.user.role === "ADMIN"
  )

  const isImageFile = (filePath: string) => {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(filePath)
  }

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">문의를 불러올 수 없습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/inquiry">목록으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!inquiry) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/inquiry">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Link>
          </Button>
          
          {(canEdit || canDelete) && (
            <div className="flex space-x-2">
              {canEdit && (
                <Button variant="outline" asChild>
                  <Link href={`/inquiry/${inquiry.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </Link>
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CardTitle className="text-2xl">{inquiry.title}</CardTitle>
                  {inquiry.isPrivate && (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      비공개
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>
                      {inquiry.author?.name || inquiry.authorName || "익명"}
                      {inquiry.author?.isExpert && (
                        <Badge variant="secondary" className="ml-1 text-xs">전문가</Badge>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{timeAgo(new Date(inquiry.createdAt))}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{inquiry.viewCount}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{inquiry.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Contact Info */}
            {(inquiry.authorEmail || inquiry.authorPhone) && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">연락처 정보</h4>
                <div className="text-sm space-y-1">
                  {inquiry.authorEmail && (
                    <p>이메일: {inquiry.authorEmail}</p>
                  )}
                  {inquiry.authorPhone && (
                    <p>전화번호: {inquiry.authorPhone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none mb-6">
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: inquiry.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Attachments */}
            {inquiry.attachments && inquiry.attachments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">첨부파일</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inquiry.attachments.map((filePath, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      {isImageFile(filePath) ? (
                        <div className="space-y-2">
                          <div className="relative aspect-video bg-muted rounded overflow-hidden">
                            <Image
                              src={filePath}
                              alt={getFileName(filePath)}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm truncate">{getFileName(filePath)}</span>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={filePath} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4 text-gray-500" />
                            <span className="text-sm truncate">{getFileName(filePath)}</span>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={filePath} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Comments Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                답변 ({comments.length})
              </h3>
              
              <CommentList
                comments={comments}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />
              
              <div className="mt-6">
                <CommentForm
                  inquiryId={inquiry.id}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Dialog */}
        <PasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          onSubmit={handlePasswordSubmit}
          isLoading={isPasswordLoading}
          error={passwordError}
        />
      </div>
    </div>
  )
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const { id } = await params
  return <InquiryDetailContent id={id} />
}