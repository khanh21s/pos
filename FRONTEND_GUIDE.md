# Frontend Completion Guide

## Mục tiêu
Hướng dẫn này bạn clone repository từ GitHub và hoàn thành nốt phần frontend của hệ thống POS.

## 1. Clone repository

```bash
git clone <repository-url>
cd BookApplication
```

## 2. Cấu trúc chính của dự án

- `BookApplication/` — phần backend Spring Boot
- `src/main/java/...` — source backend
- `src/main/resources/application.properties` — cấu hình kết nối MySQL và JPA
- `API_TEST.http` — file test REST API
- `MY_SQL_SETUP_GUIDE.md` và `HELP.md` — tài liệu hỗ trợ

## 3. Chạy backend

### 3.1 Cài đặt Java/Gradle
- Cài Java 17+ hoặc phiên bản tương thích với Spring Boot
- Dùng Gradle wrapper có sẵn trong repo

### 3.2 Cấu hình cơ sở dữ liệu

Mở file `BookApplication/src/main/resources/application.properties` và kiểm tra:

```properties
spring.datasource.url=jdbc:mysql://<host>:<port>/<database>?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=<username>
spring.datasource.password=<password>
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3.3 Khởi động backend

```bash
cd BookApplication
./gradlew bootRun
```

> Nếu dùng Windows, dùng `gradlew.bat bootRun`.

### 3.4 Kiểm tra backend hoạt động
- Mở trình duyệt hoặc Postman
- Truy cập `http://localhost:8081/api/categories` (hoặc các endpoint khác)

## 4. API chính cho frontend

### Categories
- `GET /api/categories`
- `GET /api/categories/{id}`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

### Products
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Customers
- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

### Employees
- `GET /api/employees`
- `GET /api/employees/{id}`
- `POST /api/employees`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}`

### Suppliers
- `GET /api/suppliers`
- `GET /api/suppliers/{id}`
- `POST /api/suppliers`
- `PUT /api/suppliers/{id}`
- `DELETE /api/suppliers/{id}`

### Promotions
- `GET /api/promotions`
- `GET /api/promotions/{id}`
- `POST /api/promotions`
- `PUT /api/promotions/{id}`
- `DELETE /api/promotions/{id}`

### Invoices
- `GET /api/invoices`
- `GET /api/invoices/{id}`
- `POST /api/invoices`
- `PUT /api/invoices/{id}`
- `DELETE /api/invoices/{id}`

### Import Warehouse
- `GET /api/import-warehouses`
- `GET /api/import-warehouses/{id}`
- `POST /api/import-warehouses`
- `PUT /api/import-warehouses/{id}`
- `DELETE /api/import-warehouses/{id}`

## 5. Hướng dẫn phát triển frontend

### 5.1 Chọn stack đề xuất
- React + Vite / Create React App
- Vue 3 + Vite
- Angular

### 5.2 Cấu trúc frontend gợi ý

- `src/components/` — các component UI chung
- `src/pages/` — trang quản lý danh mục, sản phẩm, khách hàng, hóa đơn
- `src/services/api.js` — hàm gọi API tới backend
- `src/routes.js` — định nghĩa route

### 5.3 Tương tác với API
- Đặt `BASE_URL = 'http://localhost:8081/api'`
- Sử dụng `fetch` hoặc `axios`
- Quản lý lỗi HTTP và hiển thị thông báo

### 5.4 Luồng frontend chính cần hoàn thiện

- Quản lý danh mục sản phẩm
- Quản lý sản phẩm
- Quản lý khách hàng
- Quản lý nhân viên
- Quản lý nhà cung cấp
- Quản lý khuyến mãi
- Lập hóa đơn bán hàng
- Lập phiếu nhập kho

## 6. Chạy frontend mẫu

### 6.1 Tạo frontend mới

```bash
cd BookApplication
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm run dev
```

### 6.2 Kết nối tới backend
- Trong file cấu hình frontend, đặt `VITE_API_BASE_URL=http://localhost:8081/api`
- Dùng `import.meta.env.VITE_API_BASE_URL`

## 7. Gợi ý phối hợp

- Backend đã có API CRUD cho toàn bộ nghiệp vụ chính
- Frontend chỉ cần hoàn thiện giao diện, gọi API, và xử lý dữ liệu trả về
- Nếu cần xác thực, có thể mở rộng thêm endpoint đăng nhập sau này

## 8. Ghi chú khi push lên GitHub

- Bao gồm `FRONTEND_GUIDE.md` trong root repo
- Nếu cần, thêm `README.md` chính để giới thiệu tổng quan dự án
- Ghi rõ `git clone`, cấu hình backend và cách chạy frontend

---

Cảm ơn và chúc bạn hoàn thiện phần frontend nhanh chóng!