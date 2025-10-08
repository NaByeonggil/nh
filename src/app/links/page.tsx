"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { 
  ExternalLink, 
  Search, 
  Heart, 
  Stethoscope,
  BookOpen,
  Users,
  Shield,
  Phone,
  Globe,
  Award,
  Building,
  FileText,
  Activity,
  Pill
} from "lucide-react"

interface LinkItem {
  id: string
  title: string
  description: string
  url: string
  category: string
  tags: string[]
  verified: boolean
  official: boolean
}

const linkCategories = [
  { id: "all", label: "전체", icon: Globe },
  { id: "hospital", label: "병원", icon: Building },
  { id: "government", label: "정부기관", icon: Shield },
  { id: "association", label: "의료단체", icon: Users },
  { id: "education", label: "교육자료", icon: BookOpen },
  { id: "support", label: "환자지원", icon: Heart },
  { id: "research", label: "연구정보", icon: FileText },
  { id: "pharmacy", label: "약국", icon: Pill },
]

const recommendedLinks: LinkItem[] = [
  {
    id: "1",
    title: "국립암센터",
    description: "국가 암 정책의 중심기관으로 암 예방, 진료, 연구를 총괄하는 종합 암센터입니다.",
    url: "https://www.ncc.re.kr",
    category: "hospital",
    tags: ["국립", "암센터", "진료", "연구"],
    verified: true,
    official: true
  },
  {
    id: "2",
    title: "대한암학회",
    description: "암 연구와 진료의 발전을 위한 학술단체로 최신 암 치료 정보를 제공합니다.",
    url: "https://www.kosco.or.kr",
    category: "association",
    tags: ["학회", "암치료", "의료진", "학술"],
    verified: true,
    official: true
  },
  {
    id: "3",
    title: "암정보센터",
    description: "국립암센터에서 운영하는 암 관련 종합 정보 포털사이트입니다.",
    url: "https://www.cancer.go.kr",
    category: "education",
    tags: ["정보", "교육", "환자", "가족"],
    verified: true,
    official: true
  },
  {
    id: "4",
    title: "희망샘 (한국소아암재단)",
    description: "소아암 환아와 가족을 위한 지원 프로그램과 정보를 제공하는 재단입니다.",
    url: "https://www.kccf.or.kr",
    category: "support",
    tags: ["소아암", "재단", "지원", "가족"],
    verified: true,
    official: true
  },
  {
    id: "5",
    title: "건강보험심사평가원",
    description: "의료비 지원 제도와 건강보험 적용 항목에 대한 정보를 확인할 수 있습니다.",
    url: "https://www.hira.or.kr",
    category: "government",
    tags: ["건강보험", "의료비", "지원", "정부"],
    verified: true,
    official: true
  },
  {
    id: "6",
    title: "서울대학교병원",
    description: "국내 최고 수준의 암 진료와 연구를 수행하는 대학병원입니다.",
    url: "https://www.snuh.org",
    category: "hospital",
    tags: ["대학병원", "암진료", "연구", "서울"],
    verified: true,
    official: true
  },
  {
    id: "7",
    title: "연세암병원",
    description: "세계적 수준의 암 치료 시설과 의료진을 갖춘 전문 암병원입니다.",
    url: "https://cancer.yuhs.ac",
    category: "hospital",
    tags: ["암병원", "연세", "치료", "전문"],
    verified: true,
    official: true
  },
  {
    id: "8",
    title: "삼성서울병원 암센터",
    description: "최첨단 의료 장비와 다학제 진료를 통한 암 치료를 제공합니다.",
    url: "https://www.samsunghospital.com/cancer",
    category: "hospital",
    tags: ["삼성", "암센터", "다학제", "최첨단"],
    verified: true,
    official: true
  },
  {
    id: "9",
    title: "식품의약품안전처",
    description: "항암제와 건강기능식품의 안전성 정보를 제공하는 정부기관입니다.",
    url: "https://www.mfds.go.kr",
    category: "government",
    tags: ["식약처", "안전성", "의약품", "정부"],
    verified: true,
    official: true
  },
  {
    id: "10",
    title: "대한약사회",
    description: "약사 전문성과 의약품 안전사용에 대한 정보를 제공하는 전문단체입니다.",
    url: "https://www.kpharma.or.kr",
    category: "association",
    tags: ["약사회", "의약품", "안전사용", "전문"],
    verified: true,
    official: true
  },
  {
    id: "11",
    title: "한국암환자권익연합",
    description: "암환자의 권익 보호와 삶의 질 향상을 위해 활동하는 시민단체입니다.",
    url: "https://www.cancer-rights.or.kr",
    category: "support",
    tags: ["환자권익", "시민단체", "삶의질", "지원"],
    verified: true,
    official: false
  },
  {
    id: "12",
    title: "국가암정보센터",
    description: "보건복지부와 국립암센터가 공동 운영하는 국가 공식 암정보 사이트입니다.",
    url: "https://www.cancer.go.kr",
    category: "education",
    tags: ["국가", "공식", "암정보", "보건복지부"],
    verified: true,
    official: true
  }
]

export default function LinksPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLinks = recommendedLinks.filter(link => {
    const matchesCategory = selectedCategory === "all" || link.category === selectedCategory
    const matchesSearch = searchQuery === "" || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (categoryId: string) => {
    const category = linkCategories.find(cat => cat.id === categoryId)
    return category ? category.icon : Globe
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">추천 사이트</h1>
          <p className="text-muted-foreground text-lg mb-8">
            암 환자와 가족을 위한 신뢰할 수 있는 의료 정보 사이트를 추천합니다
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사이트명, 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {linkCategories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => {
            const CategoryIcon = getCategoryIcon(link.category)
            return (
              <Card key={link.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{link.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {link.official && (
                            <Badge variant="default" className="text-xs">
                              공식
                            </Badge>
                          )}
                          {link.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              인증
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {link.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {link.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {link.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{link.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    asChild
                  >
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2"
                    >
                      <span>사이트 방문</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              다른 검색어로 시도해보거나 카테고리를 변경해보세요.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}>
              필터 초기화
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">안내사항</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 추천 사이트는 정보 제공 목적으로만 선별되었습니다.</li>
                <li>• 의료진 상담 없이 스스로 진단하거나 치료하지 마세요.</li>
                <li>• 사이트 정보는 변경될 수 있으며, 접속 불가 시 옆집약사로 문의해주세요.</li>
                <li>• 응급상황 시에는 즉시 119에 신고하거나 가까운 응급실을 방문하세요.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">추가 정보가 필요하신가요?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                전문 약사와 1:1 상담을 통해 맞춤형 정보를 받아보세요
              </p>
              <Button asChild>
                <Link href="/inquiry">
                  <Phone className="h-4 w-4 mr-2" />
                  상담 문의하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}