/**
 * 업로드된 이미지의 URL을 생성합니다.
 *
 * 업로드 파일(/uploads/**)은 nginx가 정적으로 직접 서빙합니다
 * (docker-compose: ./public/uploads -> /usr/share/nginx/html/uploads).
 * 과거에는 production에서 /api/images 라우트로 우회했으나,
 * 해당 경로는 sendfile / ETag / 304 조건부 요청을 모두 잃게 되므로 제거했습니다.
 */
export function getImageUrl(path: string): string {
  // path가 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  return path.startsWith("/") ? path : `/${path}`
}
