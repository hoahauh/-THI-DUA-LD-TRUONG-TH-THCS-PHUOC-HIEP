<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP

Hệ thống Quản lý Thi đua Nề nếp Học đường Liên cấp K-12 (Khối Tiểu học 19 lớp · Khối THCS 12 lớp).

## Tính năng nổi bật
- **Phân quyền RBAC 3 vai trò**: Tổng phụ trách Đội (Admin), Đội Cờ đỏ (Sao đỏ chấm chéo) và Giáo viên Chủ nhiệm (GVCN).
- **Cơ sở dữ liệu Google Sheets 2 chiều**:
  - **Nhận dữ liệu từ Google Sheets (Database Pull / Import)**:
    1. Kéo dữ liệu tự động qua Webhook Apps Script API hoặc liên kết Google Sheets công khai.
    2. Dán trực tiếp bảng tính từ Google Sheets (Copy/Paste dữ liệu nề nếp, tiêu chí, phân công).
    3. Nhập tệp `.CSV` xuất từ Google Sheets với mã hóa UTF-8 tiếng Việt.
    4. Thử nghiệm tức thì với bộ dữ liệu mẫu thực tế của Trường TH&THCS Phước Hiệp.
  - **Gửi và đồng bộ dữ liệu (Push / Sync)**: Đẩy bảng tổng hợp thi đua và biên bản vi phạm lên Google Drive.
- **Biên bản & Báo cáo chuẩn Đội TNTP**: Xuất bản in biên bản tuần có chữ ký Ban chỉ huy Liên đội, Tổng phụ trách và Ban giám hiệu.

## Hướng dẫn cài đặt & khởi chạy

1. Cài đặt các thư viện:
   ```bash
   npm install
   ```
2. Khởi chạy ứng dụng ở môi trường phát triển:
   ```bash
   npm run dev
   ```
3. Đóng gói bản phát hành:
   ```bash
   npm run build
   ```
