"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Users, 
  Award, 
  Shield, 
  Target,
  MessageSquare,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  Stethoscope,
  Pill,
  Book
} from "lucide-react"

const teamMembers = [
  {
    name: "김약사",
    role: "수석 약사",
    specialty: "항암치료 전문",
    experience: "15년",
    description: "대학병원 약제부에서 10년간 근무 후, 암환자 상담 전문 약사로 활동 중입니다.",
    image: "/images/team/pharmacist1.jpg"
  },
  {
    name: "이약사",
    role: "임상약사",
    specialty: "영양치료 전문",
    experience: "12년",
    description: "암환자 영양관리와 건강보조제 상담을 전문으로 하고 있습니다.",
    image: "/images/team/pharmacist2.jpg"
  },
  {
    name: "박약사",
    role: "상담약사",
    specialty: "부작용 관리",
    experience: "8년",
    description: "항암치료 부작용 관리와 생활습관 개선 상담을 담당합니다.",
    image: "/images/team/pharmacist3.jpg"
  }
]

const achievements = [
  {
    icon: Users,
    title: "10,000+",
    subtitle: "상담 건수",
    description: "지금까지 1만 건 이상의 환자 상담을 진행했습니다."
  },
  {
    icon: Star,
    title: "4.9/5.0",
    subtitle: "만족도",
    description: "높은 상담 품질로 환자분들의 높은 만족도를 유지하고 있습니다."
  },
  {
    icon: Award,
    title: "전문인증",
    subtitle: "약사면허",
    description: "모든 상담 약사는 정식 약사 면허를 보유하고 있습니다."
  },
  {
    icon: Shield,
    title: "안전성",
    subtitle: "검증된 정보",
    description: "의학적으로 검증된 정보만을 제공합니다."
  }
]

const services = [
  {
    icon: MessageSquare,
    title: "1:1 개인상담",
    description: "개인의 상황에 맞는 맞춤형 상담을 제공합니다.",
    features: ["약물 상호작용 검토", "부작용 관리 방법", "생활습관 개선"]
  },
  {
    icon: Pill,
    title: "보충제 추천",
    description: "검증된 건강보조제를 추천하고 안전한 복용법을 안내합니다.",
    features: ["성분 분석", "안전성 검증", "개인 맞춤 추천"]
  },
  {
    icon: Book,
    title: "교육 자료",
    description: "암 치료와 관리에 도움이 되는 다양한 교육 자료를 제공합니다.",
    features: ["치료법 정보", "식이요법 가이드", "운동 프로그램"]
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                옆집약사
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              암 환자와 가족들을 위한 전문 약사 상담 서비스
              <br />
              <span className="text-primary font-semibold">
                가까운 곳에서, 언제나 함께합니다
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/inquiry">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  무료 상담받기
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/supplements">
                  <Pill className="h-5 w-5 mr-2" />
                  추천 제품 보기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">우리의 미션</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Target className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">환자 중심의 서비스</h3>
                      <p className="text-muted-foreground">
                        암 환자와 가족의 입장에서 생각하며, 실질적이고 도움이 되는 정보를 제공합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">전문성과 신뢰성</h3>
                      <p className="text-muted-foreground">
                        정식 약사 면허를 보유한 전문가들이 의학적으로 검증된 정보만을 제공합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">따뜻한 관심과 배려</h3>
                      <p className="text-muted-foreground">
                        단순한 정보 제공을 넘어, 환자분들의 마음까지 돌보는 서비스를 제공합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:text-center">
                <div className="relative inline-block">
                  <div className="w-80 h-80 bg-gradient-to-br from-primary/20 to-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-32 w-32 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">제공 서비스</h2>
              <p className="text-muted-foreground text-lg">
                암 환자분들을 위한 전문적이고 체계적인 서비스를 제공합니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">우리의 성과</h2>
              <p className="text-muted-foreground text-lg">
                신뢰할 수 있는 수치로 증명하는 서비스 품질
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">{achievement.title}</h3>
                    <h4 className="text-lg font-semibold mb-2">{achievement.subtitle}</h4>
                    <p className="text-muted-foreground text-sm">{achievement.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">전문 약사팀</h2>
              <p className="text-muted-foreground text-lg">
                풍부한 임상 경험을 바탕으로 최고의 상담을 제공합니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <div className="flex justify-center space-x-2 mb-3">
                      <Badge variant="outline">{member.role}</Badge>
                      <Badge variant="secondary">{member.experience}</Badge>
                    </div>
                    <p className="text-primary font-medium mb-3">{member.specialty}</p>
                    <p className="text-muted-foreground text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">문의하기</h2>
              <p className="text-muted-foreground text-lg">
                궁금한 점이 있으시면 언제든지 연락해주세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">전화 상담</h3>
                <p className="text-muted-foreground">1588-0000</p>
                <p className="text-sm text-muted-foreground">평일 09:00-18:00</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">이메일</h3>
                <p className="text-muted-foreground">contact@neighbor-pharmacist.com</p>
                <p className="text-sm text-muted-foreground">24시간 접수</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">온라인 문의</h3>
                <p className="text-muted-foreground">문의게시판 이용</p>
                <p className="text-sm text-muted-foreground">익명 상담 가능</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/inquiry">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  지금 상담받기
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}