import { z } from "zod"

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "이름은 2글자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 6글자 이상이어야 합니다"),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

// Inquiry validation schemas
export const inquirySchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이하여야 합니다"),
  content: z.string().min(10, "내용은 10글자 이상 입력해주세요"),
  authorName: z.string().optional(),
  authorPhone: z.string().optional(),
  authorEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
  password: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, "댓글 내용을 입력해주세요").max(1000, "댓글은 1000자 이하여야 합니다"),
})

// Content validation schemas
export const contentSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이하여야 합니다"),
  content: z.string().min(10, "내용은 10글자 이상 입력해주세요"),
  excerpt: z.string().max(300, "요약은 300자 이하여야 합니다").optional(),
  thumbnail: z.string().optional(),
  category: z.enum(["LIFESTYLE", "TREATMENT", "NOTICE"]),
  published: z.boolean().default(false),
})

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, "상품명을 입력해주세요").max(100, "상품명은 100자 이하여야 합니다"),
  description: z.string().min(10, "상품 설명은 10글자 이상 입력해주세요"),
  price: z.number().positive("가격은 0보다 커야 합니다"),
  discountRate: z.number().min(0).max(100).default(0),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
})

// Order validation schemas
export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive("수량은 1 이상이어야 합니다"),
})

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "주문할 상품을 선택해주세요"),
})

// File upload validation - commented out due to server-side build issues
// export const fileUploadSchema = z.object({
//   file: z.instanceof(File)
//     .refine(file => file.size <= 10 * 1024 * 1024, "파일 크기는 10MB 이하여야 합니다")
//     .refine(
//       file => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type),
//       "지원하지 않는 파일 형식입니다"
//     ),
// })

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>
export type InquiryData = z.infer<typeof inquirySchema>
export type CommentData = z.infer<typeof commentSchema>
export type ContentData = z.infer<typeof contentSchema>
export type ProductData = z.infer<typeof productSchema>
export type OrderData = z.infer<typeof orderSchema>
// export type FileUploadData = z.infer<typeof fileUploadSchema>