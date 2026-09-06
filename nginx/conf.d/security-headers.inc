# 공통 보안 헤더.
#
# nginx 의 add_header 는 "상속"이 아니라 "치환"이다: 하위 블록에 add_header 가
# 하나라도 있으면 상위 블록의 add_header 는 전부 무시된다.
# 따라서 add_header 를 쓰는 모든 location 에서 이 파일을 다시 include 해야 한다.
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
