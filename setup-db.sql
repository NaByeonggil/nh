-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS nh_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 설정
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON nh_database.* TO 'root'@'localhost';

-- 또는 기존 root 사용자의 비밀번호 설정
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';

-- 권한 새로고침
FLUSH PRIVILEGES;

-- 데이터베이스 사용
USE nh_database;

-- 연결 테스트
SELECT 'Database setup completed successfully!' AS message;