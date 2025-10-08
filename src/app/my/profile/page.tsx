"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit2,
  Save,
  X,
  ShoppingBag,
  MessageSquare,
  Settings
} from "lucide-react"

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
  role: string
  isExpert: boolean
  image?: string | null
}

interface UserStats {
  totalOrders: number
  totalInquiries: number
  totalComments: number
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    totalInquiries: 0,
    totalComments: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    
    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/user/profile")
      
      if (!response.ok) {
        throw new Error("프로필 정보를 불러올 수 없습니다.")
      }

      const data = await response.json()
      setProfile(data.profile)
      setStats(data.stats)
      
      setEditForm({
        name: data.profile.name || "",
        phone: data.profile.phone || "",
      })
      
    } catch (error) {
      console.error("Profile fetch error:", error)
      setError(error instanceof Error ? error.message : "프로필을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "프로필 업데이트에 실패했습니다.")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      
      // 세션 업데이트
      await update({
        name: updatedProfile.name,
      })

    } catch (error) {
      console.error("Profile update error:", error)
      setError(error instanceof Error ? error.message : "프로필 업데이트 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || "",
      })
    }
    setIsEditing(false)
    setError("")
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">프로필 정보를 불러올 수 없습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchProfile}>다시 시도</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">내 정보</h1>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              편집
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>기본 정보</span>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? "저장 중..." : "저장"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        취소
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.image || ""} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{profile.name || "이름 없음"}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {profile.role === "ADMIN" ? "관리자" : "일반 사용자"}
                      </span>
                      {profile.isExpert && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          전문가
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="이름을 입력하세요"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.name || "이름 없음"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="전화번호를 입력하세요"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone || "전화번호 없음"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="createdAt">가입일</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(profile.createdAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>활동 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">주문 수</span>
                  </div>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm">문의 수</span>
                  </div>
                  <span className="font-semibold">{stats.totalInquiries}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">댓글 수</span>
                  </div>
                  <span className="font-semibold">{stats.totalComments}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 메뉴</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/my/orders">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    주문 내역
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/inquiry">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    문의하기
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/supplements">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    쇼핑하기
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}