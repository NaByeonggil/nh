"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { inquirySchema, type InquiryData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/ui/file-upload"
import { MessageSquare, Lock } from "lucide-react"

interface UploadedFile {
  originalName: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  isImage: boolean
}

export default function NewInquiryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const form = useForm<InquiryData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      title: "",
      content: "",
      authorName: session?.user?.name || "",
      authorPhone: "",
      authorEmail: session?.user?.email || "",
      password: "",
      attachments: [],
    },
  })

  async function onSubmit(data: InquiryData) {
    setIsLoading(true)
    setError("")

    try {
      const submitData = {
        ...data,
        password: usePassword ? data.password : undefined,
        attachments: uploadedFiles.map(file => file.filePath),
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const inquiry = await response.json()
        router.push(`/inquiry/${inquiry.id}`)
      } else {
        const result = await response.json()
        setError(result.error || "문의 작성 중 오류가 발생했습니다.")
      }
    } catch (error) {
      setError("문의 작성 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    form.setValue('attachments', files.map(file => file.filePath))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">문의하기</h1>
          </div>
          <p className="text-muted-foreground">
            궁금한 점이나 상담이 필요한 내용을 자세히 작성해주세요. 
            개인적인 문의는 암호를 설정하여 보호할 수 있습니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 문의 작성</CardTitle>
            <CardDescription>
              모든 항목은 선택사항이지만, 자세한 정보를 제공할수록 더 정확한 답변을 받을 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}

                {/* 제목 */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제목 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="문의 제목을 입력하세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 개인정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="이름"
                            {...field}
                            disabled={!!session?.user}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전화번호</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="010-1234-5678"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이메일</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            {...field}
                            disabled={!!session?.user}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 내용 */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>문의 내용 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="문의하실 내용을 자세히 작성해주세요.&#10;&#10;• 현재 상황이나 증상&#10;• 궁금한 점&#10;• 필요한 도움&#10;&#10;개인적인 의료 정보가 포함된 경우 아래 '비공개 문의'를 체크해주세요."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 파일 첨부 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">파일 첨부</label>
                  <p className="text-sm text-muted-foreground">
                    의료 검사 결과, 처방전 등을 첨부할 수 있습니다
                  </p>
                  <FileUpload
                    onFilesUploaded={handleFilesUploaded}
                    maxFiles={5}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                </div>

                {/* 비공개 설정 */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-password"
                      checked={usePassword}
                      onCheckedChange={(checked) => setUsePassword(checked === true)}
                    />
                    <label htmlFor="use-password" className="text-sm font-medium flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      비공개 문의 (암호 설정)
                    </label>
                  </div>
                  
                  {usePassword && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>문의 암호</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="문의를 보호할 암호를 입력하세요"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            암호를 설정하면 해당 암호를 아는 사람만 문의를 볼 수 있습니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* 제출 버튼 */}
                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "작성 중..." : "문의하기"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}