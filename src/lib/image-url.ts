/**
 * 업로드된 이미지의 URL을 생성합니다.
 * Docker 환경에서는 API 라우트를 통해, 개발 환경에서는 직접 정적 파일을 제공합니다.
 */
export function getImageUrl(path: string): string {
  // path가 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // 슬래시로 시작하는 경우 제거
  const cleanPath = path.startsWith("/") ? path.slice(1) : path

  // uploads로 시작하는 경우
  if (cleanPath.startsWith("uploads/")) {
    // Docker 환경 또는 production에서는 API 라우트 사용
    if (process.env.NODE_ENV === "production") {
      return `/api/images/${cleanPath.replace("uploads/", "")}`
    }
  }

  // 기본값: 원본 경로 반환
  return path.startsWith("/") ? path : `/${path}`
}