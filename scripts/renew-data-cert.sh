#!/usr/bin/env bash
# data.cancerwith.kr 인증서 갱신 — cron 에서 매일 실행
#   certbot 컨테이너(webroot)로 갱신하고 nh_nginx 를 다시 읽힌다.
#   (live/ 는 root 소유라 갱신 여부를 파일로 비교할 수 없다. reload 는 무중단이라 매번 한다.)
#   만료 30일 전부터 갱신되므로 평소에는 아무 일도 하지 않는다.
#   시험: scripts/renew-data-cert.sh --dry-run
set -euo pipefail

NGINX_DIR="$(cd "$(dirname "$0")/../nginx" && pwd)"
LE_DIR="$NGINX_DIR/ssl/data.cancerwith.kr-le"

echo "== $(date '+%F %T') 인증서 갱신 확인"

docker run --rm \
  -v "$LE_DIR:/etc/letsencrypt" \
  -v "$NGINX_DIR/certbot:/var/www/certbot" \
  certbot/certbot renew --non-interactive "$@"

docker exec nh_nginx nginx -s reload 2>&1 | grep -v "duplicate MIME" || true
echo "완료"
