import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Book, Stethoscope, Pill, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react"
import { HeroCarousel } from "@/components/features/hero/HeroCarousel"
import NoticePopup from "@/components/NoticePopup"
import { cn } from "@/lib/utils"

const services = [
  {
    href: "/inquiry",
    icon: MessageSquare,
    title: "문의게시판",
    description: "전문가와 직접 상담하고 궁금한 점을 해결하세요",
    features: ["전문가 1:1 상담", "암호 보호 상담", "의료 자료 첨부 가능"],
    buttonText: "문의하기",
    isPrimary: true,
    gradient: "from-primary-500 to-primary-600",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    href: "/lifestyle",
    icon: Book,
    title: "생활습관 식이요법",
    description: "암 환자를 위한 건강한 생활습관과 식이요법 정보",
    features: ["영양 관리 가이드", "운동 및 생활 습관", "면역력 강화 방법"],
    buttonText: "더 보기",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    href: "/treatment",
    icon: Stethoscope,
    title: "표준치료 동향",
    description: "최신 암 치료 동향과 표준 치료법 정보",
    features: ["최신 치료법 소개", "임상시험 정보", "치료 가이드라인"],
    buttonText: "더 보기",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    href: "/supplements",
    icon: Pill,
    title: "보충제 궁금해요",
    description: "전문가가 추천하는 검증된 건강 보충제",
    features: ["전문가 추천 제품", "안전한 결제 시스템", "상세한 제품 설명"],
    buttonText: "쇼핑하기",
    gradient: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    href: "/links",
    icon: ExternalLink,
    title: "추천 사이트",
    description: "신뢰할 수 있는 의료기관과 정보 사이트",
    features: ["검증된 의료기관", "공신력 있는 정보", "환자 커뮤니티"],
    buttonText: "사이트 보기",
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    href: "/about",
    icon: Heart,
    title: "옆집약사 이야기",
    description: "옆집약사의 철학과 서비스 소개",
    features: ["서비스 소개", "전문가 소개", "플랫폼 비전"],
    buttonText: "더 알아보기",
    gradient: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
]

export default function HomePage() {
  return (
    <>
      <NoticePopup />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative">
          <div className="container mx-auto px-4 py-8">
            <HeroCarousel />
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-gradient-to-b from-white to-gray-50/50">
          <div className="container mx-auto container-padding">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                  서비스 안내
                </span>
                <h2 className="text-headline text-foreground mb-4">
                  주요 서비스
                </h2>
                <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
                  암환자분들을 위한 전문적이고 신뢰할 수 있는 정보를 제공합니다
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {services.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <div
                      key={service.href}
                      className={cn(
                        "group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300",
                        "hover:shadow-soft-lg hover:border-gray-200 hover:-translate-y-1",
                        "animate-fade-in-up opacity-0",
                        index === 0 && "animate-delay-100",
                        index === 1 && "animate-delay-200",
                        index === 2 && "animate-delay-300",
                        index === 3 && "animate-delay-100",
                        index === 4 && "animate-delay-200",
                        index === 5 && "animate-delay-300"
                      )}
                      style={{ animationFillMode: "forwards" }}
                    >
                      {/* Hover gradient overlay */}
                      <div
                        className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                          `bg-gradient-to-br ${service.gradient}`
                        )}
                        style={{ opacity: 0 }}
                      />

                      <div className="relative p-6">
                        {/* Icon */}
                        <div
                          className={cn(
                            "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-all duration-300",
                            service.iconBg,
                            "group-hover:scale-110 group-hover:shadow-lg"
                          )}
                        >
                          <Icon className={cn("h-7 w-7", service.iconColor)} />
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-title text-foreground mb-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-body text-muted-foreground mb-5">
                          {service.description}
                        </p>

                        {/* Features */}
                        <ul className="space-y-2.5 mb-6">
                          {service.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2.5 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Button */}
                        <Button
                          className={cn(
                            "w-full group/btn transition-all",
                            service.isPrimary
                              ? "bg-primary hover:bg-primary-600"
                              : "bg-gray-100 hover:bg-gray-200 text-foreground"
                          )}
                          variant={service.isPrimary ? "default" : "secondary"}
                          asChild
                        >
                          <Link href={service.href} className="flex items-center justify-center gap-2">
                            {service.buttonText}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative section-padding overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto container-padding relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-headline mb-4 drop-shadow-lg">
                지금 바로 시작하세요
              </h2>
              <p className="text-body-lg text-white/90 mb-8 max-w-xl mx-auto">
                전문가와 함께하는 건강한 암 치료 여정을 시작해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/auth/signup" className="flex items-center gap-2">
                    회원가입
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link href="/inquiry">문의하기</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}