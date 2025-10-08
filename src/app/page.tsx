import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MessageSquare, Book, Stethoscope, Pill, ExternalLink } from "lucide-react"
import { HeroCarousel } from "@/components/features/hero/HeroCarousel"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 py-8">
          <HeroCarousel />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                주요 서비스
              </h2>
              <p className="text-lg text-gray-600">
                암환자분들을 위한 전문적이고 신뢰할 수 있는 정보를 제공합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 문의게시판 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <CardTitle>문의게시판</CardTitle>
                  </div>
                  <CardDescription>
                    전문가와 직접 상담하고 궁금한 점을 해결하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• 전문가 1:1 상담</li>
                    <li>• 암호 보호 상담</li>
                    <li>• 의료 자료 첨부 가능</li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/inquiry">문의하기</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* 생활습관 식이요법 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Book className="h-8 w-8 text-primary" />
                    <CardTitle>생활습관 식이요법</CardTitle>
                  </div>
                  <CardDescription>
                    암 환자를 위한 건강한 생활습관과 식이요법 정보
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• 영양 관리 가이드</li>
                    <li>• 운동 및 생활 습관</li>
                    <li>• 면역력 강화 방법</li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/lifestyle">더 보기</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* 표준치료 동향 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-8 w-8 text-primary" />
                    <CardTitle>표준치료 동향</CardTitle>
                  </div>
                  <CardDescription>
                    최신 암 치료 동향과 표준 치료법 정보
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• 최신 치료법 소개</li>
                    <li>• 임상시험 정보</li>
                    <li>• 치료 가이드라인</li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/treatment">더 보기</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* 보충제 쇼핑몰 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Pill className="h-8 w-8 text-primary" />
                    <CardTitle>보충제 궁금해요</CardTitle>
                  </div>
                  <CardDescription>
                    전문가가 추천하는 검증된 건강 보충제
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• 전문가 추천 제품</li>
                    <li>• 안전한 결제 시스템</li>
                    <li>• 상세한 제품 설명</li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/supplements">쇼핑하기</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* 추천 사이트 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-8 w-8 text-primary" />
                    <CardTitle>추천 사이트</CardTitle>
                  </div>
                  <CardDescription>
                    신뢰할 수 있는 의료기관과 정보 사이트
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• 검증된 의료기관</li>
                    <li>• 공신력 있는 정보</li>
                    <li>• 환자 커뮤니티</li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/links">사이트 보기</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* 옆집약사 이야기 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-8 w-8 text-primary" />
                    <CardTitle>옆집약사 이야기</CardTitle>
                  </div>
                  <CardDescription>
                    옆집약사의 철학과 서비스 소개
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• 서비스 소개</li>
                    <li>• 전문가 소개</li>
                    <li>• 플랫폼 비전</li>
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/about">더 알아보기</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg mb-8">
              전문가와 함께하는 건강한 암 치료 여정을 시작해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup">회원가입</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/inquiry">문의하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}