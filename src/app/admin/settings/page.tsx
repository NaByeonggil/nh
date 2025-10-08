"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  User,
  Lock,
  Mail,
  Save,
  Shield,
  AlertTriangle
} from "lucide-react"

export default function AdminSettingsPage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 계정 정보 상태
  const [accountForm, setAccountForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || ''
  })

  // 비밀번호 변경 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '계정 정보가 성공적으로 업데이트되었습니다.' })
        // 세션 업데이트
        await update({
          name: accountForm.name,
          email: accountForm.email
        })
      } else {
        setMessage({ type: 'error', text: data.error || '계정 정보 업데이트에 실패했습니다.' })
      }
    } catch (error) {
      console.error('Account update error:', error)
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // 비밀번호 확인 검증
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' })
      setLoading(false)
      return
    }

    // 비밀번호 강도 검증
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: '새 비밀번호는 최소 6자 이상이어야 합니다.' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' })
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage({ type: 'error', text: data.error || '비밀번호 변경에 실패했습니다.' })
      }
    } catch (error) {
      console.error('Password change error:', error)
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">사이트 설정</h1>
        <p className="text-muted-foreground">
          관리자 계정 정보와 사이트 설정을 관리하세요.
        </p>
      </div>

      {/* 메시지 알림 */}
      {message && (
        <Card className={`border-l-4 ${
          message.type === 'success'
            ? 'border-l-green-500 bg-green-50'
            : 'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <Save className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 계정 정보 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <CardTitle>계정 정보</CardTitle>
            </div>
            <CardDescription>
              관리자 계정의 기본 정보를 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="관리자 이름을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700">관리자 권한</span>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    계정 정보 저장
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-red-500" />
              <CardTitle>비밀번호 변경</CardTitle>
            </div>
            <CardDescription>
              보안을 위해 정기적으로 비밀번호를 변경하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                  minLength={6}
                />
              </div>

              <div className="text-sm text-muted-foreground p-3 bg-yellow-50 rounded-md">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">비밀번호 안전 수칙</span>
                </div>
                <ul className="text-yellow-700 ml-6 space-y-1">
                  <li>• 최소 6자 이상 입력</li>
                  <li>• 숫자, 문자, 특수문자 조합 권장</li>
                  <li>• 개인정보 포함 금지</li>
                </ul>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Lock className="h-4 w-4 mr-2 animate-spin" />
                    변경 중...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    비밀번호 변경
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 임시 관리자 계정 정보 */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800">임시 관리자 계정 안내</CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            현재 임시 관리자 계정을 사용 중입니다. 보안을 위해 반드시 계정 정보를 변경하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">임시 계정 정보:</h4>
            <div className="space-y-1 text-sm text-orange-700">
              <p><strong>이메일:</strong> admin@nh.com</p>
              <p><strong>비밀번호:</strong> admin123!</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-orange-600">
            <p className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>위의 설정 양식을 통해 안전한 계정 정보로 변경하세요.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}