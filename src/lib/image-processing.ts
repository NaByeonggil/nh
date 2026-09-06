// 업로드 이미지 최적화 파이프라인
//
// 업로드된 원본을 그대로 저장하면 5464x8192 / 1.5MB 같은 파일이 그대로 클라이언트로
// 내려가 로딩이 느려진다. 저장 직전에 sharp 로 리사이즈 + WebP 재인코딩을 수행한다.
//
// - CPU 작업은 image-converter 와 동일하게 imageQueue(세마포어) 안에서 실행한다.
// - .rotate() 로 EXIF 회전을 굽고, sharp 기본 동작으로 EXIF 메타데이터가 제거된다
//   (환자가 올린 사진의 GPS 등이 남지 않는다).
// - 애니메이션 GIF / SVG / PDF 등 변환이 부적절한 형식은 원본을 그대로 통과시킨다.

import sharp from "sharp"
import { imageQueue } from "@/lib/concurrency-queue"

/**
 * 용도별 최대 가로 폭(px).
 * 표시 CSS 폭의 약 2배(레티나 기준)로 잡는다. 필요하면 이 값만 조정하면 된다.
 */
export const MAX_WIDTH = {
  hero: 1920, // 전체 폭 히어로 캐러셀
  content: 1600, // 게시글 본문 삽입 이미지 (본문 폭 ~800px)
  product: 1600, // 상품 갤러리 (sizes 50vw)
  inquiry: 1600, // 문의 첨부 (진료 기록 등, 판독 가능해야 함)
} as const

/** sharp 로 재인코딩하지 않고 원본을 그대로 저장할 MIME 타입 */
const PASSTHROUGH_TYPES = new Set([
  "application/pdf",
  "image/svg+xml",
])

export interface ProcessedImage {
  /** 저장할 바이트 (변환됐거나 원본 그대로) */
  buffer: Buffer
  /** 저장할 확장자 (점 없음). 변환 시 "webp" */
  ext: string
  /** 실제 변환이 일어났는지 */
  converted: boolean
  originalSize: number
  size: number
  width: number | null
  height: number | null
}

export interface ProcessImageOptions {
  /** 최대 가로 폭. MAX_WIDTH 의 값을 넘긴다. */
  maxWidth: number
  /** WebP 품질 (기본 82) */
  quality?: number
  /** 원본 파일명 (확장자 fallback 용) */
  originalName?: string
  /** 원본 MIME 타입 */
  mimeType?: string
}

function fallbackExt(originalName?: string, mimeType?: string): string {
  const fromName = originalName?.split(".").pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType === "image/svg+xml") return "svg"
  return "bin"
}

/**
 * 업로드 버퍼를 웹 서빙에 적합한 형태로 변환한다.
 * 변환에 실패하면 원본을 그대로 반환한다 (업로드 자체는 실패시키지 않는다).
 */
export async function processUploadedImage(
  input: Buffer,
  options: ProcessImageOptions
): Promise<ProcessedImage> {
  const { maxWidth, quality = 82, originalName, mimeType } = options
  const originalSize = input.length

  const passthrough = (): ProcessedImage => ({
    buffer: input,
    ext: fallbackExt(originalName, mimeType),
    converted: false,
    originalSize,
    size: originalSize,
    width: null,
    height: null,
  })

  if (mimeType && PASSTHROUGH_TYPES.has(mimeType)) {
    return passthrough()
  }

  try {
    return await imageQueue.run(async () => {
      const meta = await sharp(input).metadata()

      // 애니메이션(GIF / animated WebP)은 프레임이 깨지므로 원본 유지
      if ((meta.pages ?? 1) > 1) {
        return passthrough()
      }

      let pipeline = sharp(input, { failOn: "none" }).rotate()
      if (meta.width && meta.width > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
      }

      const buffer = await pipeline.webp({ quality }).toBuffer()

      // 변환 결과가 원본보다 크면(이미 잘 압축된 작은 이미지) 원본을 쓴다
      if (buffer.length >= originalSize) {
        return passthrough()
      }

      const outMeta = await sharp(buffer).metadata()
      return {
        buffer,
        ext: "webp",
        converted: true,
        originalSize,
        size: buffer.length,
        width: outMeta.width ?? null,
        height: outMeta.height ?? null,
      }
    })
  } catch (error) {
    // 큐가 가득 찼거나 sharp 가 읽지 못하는 형식 → 업로드는 성공시키고 원본 저장
    console.error("Image optimization failed, storing original:", error)
    return passthrough()
  }
}

/** 파일명의 확장자를 변환 결과 확장자로 교체한다. */
export function withExt(fileName: string, ext: string): string {
  return fileName.replace(/\.[^.]*$/, "") + "." + ext
}
