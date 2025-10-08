"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  Shield,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Award,
  Settings,
  CheckCircle,
  XCircle,
  ShieldCheck,
  FileText,
  MessageSquare
} from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/helpers"

interface User {
  id: string
  name: string | null
  email: string
  role: "USER" | "ADMIN"
  isExpert: boolean
  canManageContent: boolean
  canManageInquiry: boolean
  expertField?: string
  expertLicense?: string
  expertVerified: boolean
  emailVerified: Date | null
  createdAt: string
  updatedAt: string
  _count?: {
    inquiries: number
    comments: number
    orders: number
  }
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersThisMonth: number
  totalExperts: number
  totalAdmins: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0,
    totalExperts: 0,
    totalAdmins: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "EXPERT" | "ADMIN">("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // 편집 폼 상태
  const [editForm, setEditForm] = useState({
    isExpert: false,
    expertField: "",
    expertLicense: "",
    expertVerified: false,
    canManageContent: false,
    canManageInquiry: false,
    role: "USER" as "USER" | "EXPERT" | "ADMIN"
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    // role 결정: 사용자가 전문가면 EXPERT, 아니면 실제 role
    const displayRole = user.role === "USER" && user.isExpert ? "EXPERT" : user.role
    setEditForm({
      isExpert: user.isExpert,
      expertField: user.expertField || "",
      expertLicense: user.expertLicense || "",
      expertVerified: user.expertVerified,
      canManageContent: user.canManageContent,
      canManageInquiry: user.canManageInquiry,
      role: displayRole as "USER" | "EXPERT" | "ADMIN"
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      // EXPERT 역할을 선택한 경우 USER 역할 + isExpert=true로 변환
      const dataToSave = { ...editForm }
      if (editForm.role === "EXPERT") {
        dataToSave.role = "USER"
        dataToSave.isExpert = true
      } else if (editForm.role === "USER") {
        // USER 역할을 선택한 경우 전문가 아님
        dataToSave.isExpert = false
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSave)
      })

      if (response.ok) {
        // 사용자 목록 새로고침
        await fetchUsers()
        setIsEditDialogOpen(false)
        setSelectedUser(null)
      } else {
        alert("사용자 정보 업데이트에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("오류가 발생했습니다.")
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === "all" || 
      (roleFilter === "EXPERT" && user.isExpert) ||
      (roleFilter === "ADMIN" && user.role === "ADMIN") ||
      (roleFilter === "USER" && user.role === "USER" && !user.isExpert)
    
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground mt-2">
          사용자 정보 조회 및 권한 관리
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 사용자</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">관리자</p>
                <p className="text-2xl font-bold">{stats.totalAdmins}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전문가</p>
                <p className="text-2xl font-bold">{stats.totalExperts}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 사용자</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">비활성</p>
                <p className="text-2xl font-bold">{stats.inactiveUsers}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">이번달 신규</p>
                <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="USER">일반 사용자</SelectItem>
                <SelectItem value="EXPERT">전문가</SelectItem>
                <SelectItem value="ADMIN">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 사용자 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">사용자</th>
                  <th className="text-left p-4">역할</th>
                  <th className="text-left p-4">권한</th>
                  <th className="text-left p-4">전문가 정보</th>
                  <th className="text-left p-4">활동</th>
                  <th className="text-left p-4">가입일</th>
                  <th className="text-left p-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{user.name || "이름 없음"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {user.role === "ADMIN" && (
                          <Badge variant="destructive">관리자</Badge>
                        )}
                        {user.isExpert && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            전문가
                          </Badge>
                        )}
                        {!user.isExpert && user.role === "USER" && (
                          <Badge variant="outline">일반</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {user.canManageContent && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span className="text-xs">컨텐츠</span>
                          </div>
                        )}
                        {user.canManageInquiry && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">문의</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {user.isExpert && (
                        <div className="text-sm">
                          <p className="font-medium">{user.expertField || "-"}</p>
                          <p className="text-muted-foreground">{user.expertLicense || "-"}</p>
                          {user.expertVerified ? (
                            <Badge variant="outline" className="mt-1">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                              인증됨
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-1">
                              <XCircle className="h-3 w-3 mr-1 text-red-500" />
                              미인증
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        <p>문의: {user._count?.inquiries || 0}</p>
                        <p>답변: {user._count?.comments || 0}</p>
                        <p>주문: {user._count?.orders || 0}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{formatDateTime(user.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(user.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>사용자 권한 관리</DialogTitle>
            <DialogDescription>
              {selectedUser?.name || selectedUser?.email}의 권한을 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 역할 설정 */}
            <div className="space-y-2">
              <Label>역할</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: "USER" | "EXPERT" | "ADMIN") => {
                  const newForm = {...editForm, role: value}
                  // EXPERT 선택시 자동으로 전문가 설정
                  if (value === "EXPERT") {
                    newForm.isExpert = true
                  } else if (value === "USER") {
                    newForm.isExpert = false
                  }
                  setEditForm(newForm)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">일반 사용자</SelectItem>
                  <SelectItem value="EXPERT">전문가</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 전문가 설정 */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="expert">전문가 등록</Label>
                  <p className="text-sm text-muted-foreground">
                    {editForm.role === "EXPERT" 
                      ? "역할이 전문가로 설정되어 자동으로 전문가로 등록됩니다"
                      : "역할을 '전문가'로 선택하면 전문가 설정이 활성화됩니다"
                    }
                  </p>
                </div>
                <Switch
                  id="expert"
                  checked={editForm.isExpert}
                  disabled={editForm.role !== "EXPERT"}
                  onCheckedChange={(checked) => 
                    setEditForm({...editForm, isExpert: checked})
                  }
                />
              </div>

              {editForm.isExpert && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>전문 분야</Label>
                      <Select
                        value={editForm.expertField}
                        onValueChange={(value) => 
                          setEditForm({...editForm, expertField: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="전문 분야 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pharmacist">약사</SelectItem>
                          <SelectItem value="nutritionist">영양사</SelectItem>
                          <SelectItem value="nurse">간호사</SelectItem>
                          <SelectItem value="doctor">의사</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>자격증 번호</Label>
                      <Input
                        value={editForm.expertLicense}
                        onChange={(e) => 
                          setEditForm({...editForm, expertLicense: e.target.value})
                        }
                        placeholder="자격증 번호 입력"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="verified">전문가 인증</Label>
                      <p className="text-sm text-muted-foreground">
                        자격증 검증이 완료된 전문가
                      </p>
                    </div>
                    <Switch
                      id="verified"
                      checked={editForm.expertVerified}
                      onCheckedChange={(checked) => 
                        setEditForm({...editForm, expertVerified: checked})
                      }
                    />
                  </div>
                </>
              )}
            </div>

            {/* 권한 설정 */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">관리 권한</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="content">컨텐츠 관리</Label>
                  <p className="text-sm text-muted-foreground">
                    건강 정보 컨텐츠를 작성하고 관리할 수 있습니다
                  </p>
                </div>
                <Switch
                  id="content"
                  checked={editForm.canManageContent}
                  onCheckedChange={(checked) => 
                    setEditForm({...editForm, canManageContent: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inquiry">문의 관리</Label>
                  <p className="text-sm text-muted-foreground">
                    사용자 문의에 답변하고 관리할 수 있습니다
                  </p>
                </div>
                <Switch
                  id="inquiry"
                  checked={editForm.canManageInquiry}
                  onCheckedChange={(checked) => 
                    setEditForm({...editForm, canManageInquiry: checked})
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveUser}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}