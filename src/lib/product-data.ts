// Mock data for product page

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  images: string[]
  sizes: string[]
  colors: ProductColor[]
  inStock: boolean
  stockCount: number
  specifications: Record<string, string>
  shippingInfo: string
}

export interface ProductColor {
  name: string
  value: string
  available: boolean
}

export interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  date: string
  verified: boolean
  title: string
  content: string
  helpful: number
}

export interface RelatedProduct {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
}

// Mock product data
export const mockProduct: Product = {
  id: "1",
  name: "프리미엄 무선 헤드폰",
  description:
    "프리미엄 무선 헤드폰으로 최상의 음질을 경험하세요. 액티브 노이즈 캔슬링, 30시간 배터리 수명, 하루 종일 착용해도 편안한 프리미엄 착용감을 제공합니다.",
  price: 299000,
  originalPrice: 399000,
  rating: 4.8,
  reviewCount: 1247,
  images: [
    "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
    "https://images.pexels.com/photos/3394648/pexels-photo-3394648.jpeg",
    "https://images.pexels.com/photos/3394653/pexels-photo-3394653.jpeg",
    "https://images.pexels.com/photos/15840650/pexels-photo-15840650.jpeg",
  ],
  sizes: ["단일 사이즈"],
  colors: [
    { name: "블랙", value: "#000000", available: true },
    { name: "화이트", value: "#FFFFFF", available: true },
    { name: "실버", value: "#C0C0C0", available: false },
  ],
  inStock: true,
  stockCount: 47,
  specifications: {
    브랜드: "프리미엄 오디오",
    모델명: "PH-3000",
    타입: "오버이어",
    노이즈캔슬링: "액티브",
    배터리수명: "30시간",
    블루투스버전: "5.2",
    무게: "250g",
    보증기간: "2년",
  },
  shippingInfo:
    "5만원 이상 구매 시 무료배송. 일반배송 3-5 영업일 소요.",
}

export const mockReviews: Review[] = [
  {
    id: "1",
    author: "김민지",
    avatar: "https://images.pexels.com/photos/30004324/pexels-photo-30004324.jpeg",
    rating: 5,
    date: "2024-01-15",
    verified: true,
    title: "제가 써본 헤드폰 중 최고예요!",
    content:
      "음질이 정말 놀랍고 노이즈 캔슬링도 완벽하게 작동해요. 매일 업무용으로 사용하는데 너무 편해서 쓰고 있는 걸 잊을 정도예요.",
    helpful: 42,
  },
  {
    id: "2",
    author: "이준호",
    avatar: "https://images.pexels.com/photos/30004315/pexels-photo-30004315.jpeg",
    rating: 5,
    date: "2024-01-10",
    verified: true,
    title: "가격 값 합니다",
    content:
      "배터리 수명이 놀랍고 품질도 최고급이에요. 케이스도 프리미엄하고 헤드폰을 잘 보호해줍니다.",
    helpful: 28,
  },
  {
    id: "3",
    author: "박서연",
    avatar: "https://images.pexels.com/photos/6572210/pexels-photo-6572210.jpeg",
    rating: 4,
    date: "2024-01-05",
    verified: true,
    title: "좋지만 가격이 좀 있어요",
    content:
      "음질이 정말 뛰어난 환상적인 헤드폰이에요. 유일한 단점은 가격인데, 확실히 가격만큼의 가치가 있어요.",
    helpful: 15,
  },
  {
    id: "4",
    author: "최영수",
    avatar: "https://images.pexels.com/photos/14589344/pexels-photo-14589344.jpeg",
    rating: 5,
    date: "2023-12-28",
    verified: true,
    title: "여행용으로 완벽해요",
    content:
      "자주 여행을 다니는데 이 헤드폰은 정말 게임체인저예요. 노이즈 캔슬링 덕분에 비행기 탈 때 훨씬 편해졌어요.",
    helpful: 31,
  },
]

export const mockRelatedProducts: RelatedProduct[] = [
  {
    id: "2",
    name: "클래식 가죽 시계",
    image: "https://images.unsplash.com/photo-1544650039-22886fbb4323?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8TW9kZXJuJTIwbWluaW1hbGlzdCUyMHdhdGNoJTIwd2l0aCUyMGxlYXRoZXIlMjBzdHJhcCUyMG9uJTIwd2hpdGUlMjBiYWNrZ3JvdW5kJTIwZm9yJTIwZS1jb21tZXJjZXxlbnwwfDJ8fHdoaXRlfDE3Njg4NjA2OTl8MA&ixlib=rb-4.1.0&q=85",
    price: 189000,
    originalPrice: 249000,
    rating: 4.6,
    reviewCount: 892,
  },
  {
    id: "3",
    name: "프리미엄 스마트폰",
    image: "https://images.pexels.com/photos/18311092/pexels-photo-18311092.jpeg",
    price: 899000,
    rating: 4.7,
    reviewCount: 2156,
  },
  {
    id: "4",
    name: "트래블 백팩 프로",
    image: "https://images.pexels.com/photos/16832036/pexels-photo-16832036.png",
    price: 129000,
    originalPrice: 179000,
    rating: 4.5,
    reviewCount: 634,
  },
  {
    id: "5",
    name: "무선 이어버드",
    image: "https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg",
    price: 149000,
    rating: 4.4,
    reviewCount: 1089,
  },
]

// Utility functions
export function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`
}

export function formatDiscount(originalPrice: number, salePrice: number): string {
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  return `${discount}% 할인`
}

export function formatReviewDate(date: string): string {
  const reviewDate = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - reviewDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "오늘"
  if (diffDays === 1) return "어제"
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return reviewDate.toLocaleDateString('ko-KR')
}

export function formatStockStatus(stockCount: number): string {
  if (stockCount === 0) return "품절"
  if (stockCount < 10) return `${stockCount}개 남음`
  return "재고 있음"
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}
