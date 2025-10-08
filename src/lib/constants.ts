// App configuration
export const APP_CONFIG = {
  name: "옆집약사",
  description: "암환자를 위한 생활정보 플랫폼",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  author: "옆집약사팀",
} as const

// Pagination
export const PAGINATION = {
  itemsPerPage: 12,
  inquiriesPerPage: 10,
  commentsPerPage: 10,
  productsPerPage: 12,
} as const

// File upload
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  imageTypes: ["image/jpeg", "image/png", "image/webp"],
  documentTypes: ["application/pdf"],
} as const

// Content categories
export const CONTENT_CATEGORIES = {
  LIFESTYLE: "생활습관 식이요법",
  TREATMENT: "표준치료 동향", 
  NOTICE: "공지사항",
} as const

// Order status
export const ORDER_STATUS = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  PROCESSING: "처리 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소",
  REFUNDED: "환불",
} as const

// User roles
export const USER_ROLES = {
  USER: "일반 사용자",
  ADMIN: "관리자",
} as const

// Navigation menu items
export const NAVIGATION_ITEMS = [
  { href: "/about", label: "옆집약사 이야기" },
  { href: "/inquiry", label: "문의게시판" },
  { href: "/lifestyle", label: "생활습관 식이요법" },
  { href: "/treatment", label: "표준치료 동향" },
  { href: "/supplements", label: "보충제 궁금해요" },
  { href: "/links", label: "추천 사이트" },
] as const

// Admin menu items
export const ADMIN_MENU_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드", icon: "BarChart3" },
  { href: "/admin/users", label: "사용자 관리", icon: "Users" },
  { href: "/admin/inquiries", label: "문의 관리", icon: "MessageSquare" },
  { href: "/admin/content", label: "컨텐츠 관리", icon: "FileText" },
  { href: "/admin/products", label: "상품 관리", icon: "Package" },
  { href: "/admin/orders", label: "주문 관리", icon: "ShoppingCart" },
  { href: "/admin/settings", label: "사이트 설정", icon: "Settings" },
] as const

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/signin",
    logout: "/api/auth/signout",
  },
  inquiries: "/api/inquiries",
  comments: "/api/comments",
  content: "/api/content",
  products: "/api/products",
  orders: "/api/orders",
  upload: "/api/upload",
  users: "/api/users",
} as const