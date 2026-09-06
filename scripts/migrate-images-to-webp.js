#!/usr/bin/env node
/**
 * 기존 업로드 이미지 일괄 WebP 변환 마이그레이션
 *
 * 동작:
 *   1. DB(Content.content / Content.thumbnail / HeroImage.imageUrl / HeroImage.mobileImageUrl)에서
 *      참조 중인 /uploads/** 이미지 경로를 수집한다.
 *   2. 각 파일을 sharp 로 리사이즈 + WebP 재인코딩해 같은 디렉토리에 .webp 로 저장한다.
 *      원본은 지우지 않는다 (롤백 가능).
 *   3. DB 의 경로 문자열을 새 .webp 경로로 치환한다.
 *
 * 사용:
 *   node scripts/migrate-images-to-webp.js            # 드라이런 (변경 없음)
 *   node scripts/migrate-images-to-webp.js --apply    # 실제 적용
 *
 * 롤백:
 *   backup/pre-webp-migration_*.sql 복원 (원본 파일은 그대로 남아 있다)
 */

const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const { PrismaClient } = require("@prisma/client")

const APPLY = process.argv.includes("--apply")
// 컨테이너 안에서 실행할 때는 PUBLIC_DIR 로 경로를 넘긴다
// (public/uploads 는 컨테이너 uid 1001 소유라 호스트 사용자로는 쓸 수 없다)
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, "..", "public")
const QUALITY = 82

// src/lib/image-processing.ts 의 MAX_WIDTH 와 동일하게 유지할 것
const MAX_WIDTH = { hero: 1920, content: 1600 }
const maxWidthFor = (ref) => (ref.includes("/hero-images/") ? MAX_WIDTH.hero : MAX_WIDTH.content)

const IMAGE_REF = /\/uploads\/[A-Za-z0-9가-힣_./%-]+?\.(?:jpe?g|png|gif|JPE?G|PNG|GIF)/g

// 치환 대상: [모델, id컬럼, 텍스트컬럼]
const TARGETS = [
  ["Content", "content"],
  ["Content", "thumbnail"],
  ["HeroImage", "imageUrl"],
  ["HeroImage", "mobileImageUrl"],
]

const prisma = new PrismaClient()
const mb = (n) => (n / 1048576).toFixed(2) + "MB"

async function main() {
  console.log(APPLY ? "=== 실제 적용 모드 ===\n" : "=== 드라이런 (변경 없음) ===\n")

  // 1. DB 에서 참조 경로 수집
  const rows = { Content: await prisma.content.findMany(), HeroImage: await prisma.heroImage.findMany() }
  const referenced = new Set()
  for (const [model, col] of TARGETS) {
    for (const row of rows[model]) {
      const value = row[col]
      if (typeof value !== "string") continue
      for (const m of value.matchAll(IMAGE_REF)) referenced.add(m[0])
    }
  }
  console.log(`DB 참조 이미지: ${referenced.size}개`)

  // 2. 파일 변환
  const mapping = new Map() // 원본 ref -> 새 ref
  const missing = []
  const skipped = []
  let origBytes = 0
  let newBytes = 0

  for (const ref of [...referenced].sort()) {
    const src = path.join(PUBLIC_DIR, decodeURIComponent(ref))
    if (!fs.existsSync(src)) {
      missing.push(ref)
      continue
    }

    const originalSize = fs.statSync(src).size
    const meta = await sharp(src).metadata()

    // 애니메이션은 변환하지 않는다
    if ((meta.pages ?? 1) > 1) {
      skipped.push(`${ref} (애니메이션 ${meta.pages}프레임)`)
      continue
    }

    let pipeline = sharp(src, { failOn: "none" }).rotate()
    const maxWidth = maxWidthFor(ref)
    if (meta.width && meta.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
    }
    const buffer = await pipeline.webp({ quality: QUALITY }).toBuffer()

    if (buffer.length >= originalSize) {
      skipped.push(`${ref} (변환 결과가 원본보다 큼)`)
      continue
    }

    const newRef = ref.replace(/\.[^.]+$/, ".webp")
    const dest = path.join(PUBLIC_DIR, decodeURIComponent(newRef))

    // 이름 충돌 방지: 이미 다른 .webp 가 있으면 건드리지 않는다
    if (fs.existsSync(dest) && newRef !== ref) {
      skipped.push(`${newRef} (동일 이름의 webp 가 이미 존재)`)
      continue
    }

    if (APPLY) fs.writeFileSync(dest, buffer)
    mapping.set(ref, newRef)
    origBytes += originalSize
    newBytes += buffer.length
  }

  console.log(`변환 대상: ${mapping.size}개`)
  console.log(`  ${mb(origBytes)} -> ${mb(newBytes)} (${Math.round((1 - newBytes / origBytes) * 100)}% 절감)`)
  if (missing.length) console.log(`\n디스크에 없는 참조 (${missing.length}개, 이미 깨진 이미지):\n  ${missing.join("\n  ")}`)
  if (skipped.length) console.log(`\n건너뜀 (${skipped.length}개):\n  ${skipped.join("\n  ")}`)

  // 3. DB 경로 치환
  // 긴 경로부터 치환해 부분 문자열이 잘못 매칭되는 것을 막는다
  const ordered = [...mapping.entries()].sort((a, b) => b[0].length - a[0].length)
  let updatedRows = 0
  let replacements = 0

  for (const [model, col] of TARGETS) {
    for (const row of rows[model]) {
      const value = row[col]
      if (typeof value !== "string") continue
      let next = value
      let hits = 0
      for (const [oldRef, newRef] of ordered) {
        if (!next.includes(oldRef)) continue
        hits += next.split(oldRef).length - 1
        next = next.split(oldRef).join(newRef)
      }
      if (hits === 0) continue
      replacements += hits
      updatedRows++
      if (APPLY) {
        await prisma[model === "Content" ? "content" : "heroImage"].update({
          where: { id: row.id },
          data: { [col]: next },
        })
      }
    }
  }

  console.log(`\nDB 갱신: ${updatedRows}개 행, ${replacements}건의 경로 치환`)
  if (!APPLY) console.log("\n실제로 적용하려면 --apply 를 붙여 다시 실행하세요.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
