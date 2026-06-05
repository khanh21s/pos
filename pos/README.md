# POS (Point of Sale) System - BookApplication

## Mô tả dự án

Đây là hệ thống POS (Hệ thống bán hàng tại quầy) được phát triển bằng Spring Boot, MySQL, và Hibernate. Hệ thống được thiết kế theo sơ đồ usecase tổng quan và hỗ trợ các chức năng quản lý bán hàng, quản lý sản phẩm, quản lý khách hàng, nhập kho, quản lý nhân sự, và báo cáo thống kê.

### Công nghệ sử dụng
- **Backend**: Spring Boot 3.x, Jakarta Persistence (JPA/Hibernate)
- **Database**: MySQL 8.0+
- **Build Tool**: Gradle
- **Server Port**: 8081
- **API Style**: RESTful JSON API

---

## Yêu cầu hệ thống

### Backend
- Java 17 hoặc cao hơn
- Gradle 7.0 hoặc cao hơn
- MySQL 8.0 hoặc cao hơn

### Frontend (sẽ được phát triển)
- Node.js 16+
- npm hoặc yarn

---

## Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd BookApplication
```

### 2. Cấu hình Database

#### Bước 1: Kết nối MySQL
```bash
mysql -u root -p
```

#### Bước 2: Tạo database
```sql
CREATE DATABASE book_db;
```

#### Bước 3: Tạo user (tuỳ chọn)
```sql
CREATE USER 'bookuser'@'localhost' IDENTIFIED BY 'bookpass123';
GRANT ALL PRIVILEGES ON book_db.* TO 'bookuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Cấu hình ứng dụng

Mở file `src/main/resources/application.properties` và cập nhật thông tin database:

#### Nếu sử dụng local MySQL:
```properties
spring.application.name=BookApplication
server.port=8081

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/book_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=root

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

#### Nếu sử dụng user tùy chỉnh:
```properties
spring.datasource.username=bookuser
spring.datasource.password=bookpass123
```

### 4. Chạy ứng dụng

#### Cách 1: Sử dụng Gradle
```bash
cd BookApplication
./gradlew bootRun
```

#### Cách 2: Build JAR và chạy
```bash
cd BookApplication
./gradlew build
java -jar build/libs/BookApplication-0.0.1-SNAPSHOT.jar
```

#### Cách 3: Sử dụng VS Code
1. Mở thư mục `BookApplication` trong VS Code
2. Nhấn `F5` hoặc chọn "Run" > "Start Debugging"
3. Chọn "Java" làm environment

**Ứng dụng sẽ chạy tại**: `http://localhost:8081`

---

## API Documentation

### Base URL
```
http://localhost:8081/api
```

### Các Endpoint chính

#### 1. Quản lý Danh mục sản phẩm
```
GET    /categories          - Lấy tất cả danh mục
POST   /categories          - Tạo danh mục mới
GET    /categories/{id}     - Lấy danh mục theo ID
PUT    /categories/{id}     - Cập nhật danh mục
DELETE /categories/{id}     - Xóa danh mục
```

#### 2. Quản lý Sản phẩm
```
GET    /products            - Lấy tất cả sản phẩm
POST   /products            - Tạo sản phẩm mới
GET    /products/{id}       - Lấy sản phẩm theo ID
PUT    /products/{id}       - Cập nhật sản phẩm
DELETE /products/{id}       - Xóa sản phẩm
```

#### 3. Quản lý Khách hàng
```
GET    /customers           - Lấy tất cả khách hàng
POST   /customers           - Tạo khách hàng mới
GET    /customers/{id}      - Lấy khách hàng theo ID
PUT    /customers/{id}      - Cập nhật khách hàng
DELETE /customers/{id}      - Xóa khách hàng
```

#### 4. Quản lý Hóa đơn
```
GET    /invoices            - Lấy tất cả hóa đơn
POST   /invoices            - Tạo hóa đơn mới
GET    /invoices/{id}       - Lấy hóa đơn theo ID
PUT    /invoices/{id}       - Cập nhật hóa đơn (thay đổi trạng thái, thanh toán, v.v.)
DELETE /invoices/{id}       - Xóa hóa đơn
```

#### 5. Quản lý Nhân viên
```
GET    /employees           - Lấy tất cả nhân viên
POST   /employees           - Tạo nhân viên mới
GET    /employees/{id}      - Lấy nhân viên theo ID
PUT    /employees/{id}      - Cập nhật nhân viên
DELETE /employees/{id}      - Xóa nhân viên
```

#### 6. Quản lý Nhà cung cấp
```
GET    /suppliers           - Lấy tất cả nhà cung cấp
POST   /suppliers           - Tạo nhà cung cấp mới
GET    /suppliers/{id}      - Lấy nhà cung cấp theo ID
PUT    /suppliers/{id}      - Cập nhật nhà cung cấp
DELETE /suppliers/{id}      - Xóa nhà cung cấp
```

#### 7. Quản lý Nhập kho
```
GET    /import-warehouses   - Lấy tất cả phiếu nhập kho
POST   /import-warehouses   - Tạo phiếu nhập kho mới
GET    /import-warehouses/{id} - Lấy phiếu nhập kho theo ID
PUT    /import-warehouses/{id} - Cập nhật phiếu nhập kho
DELETE /import-warehouses/{id} - Xóa phiếu nhập kho
```

#### 8. Quản lý Khuyến mãi / Voucher
```
GET    /promotions          - Lấy tất cả khuyến mãi
POST   /promotions          - Tạo khuyến mãi mới
GET    /promotions/{id}     - Lấy khuyến mãi theo ID
PUT    /promotions/{id}     - Cập nhật khuyến mãi
DELETE /promotions/{id}     - Xóa khuyến mãi
```

### Format Request/Response

#### Ví dụ: Tạo khách hàng mới
```bash
POST http://localhost:8081/api/customers
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "email": "nguyenvana@email.com",
  "address": "123 Đường Chính, Hà Nội",
  "membershipTier": "Gold",
  "points": 0.0,
  "totalSpent": 0.0
}
```

#### Response (201 Created)
```json
{
  "id": 1,
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "email": "nguyenvana@email.com",
  "address": "123 Đường Chính, Hà Nội",
  "membershipTier": "Gold",
  "points": 0.0,
  "totalSpent": 0.0
}
```

### Status Codes
- `200 OK` - Request thành công
- `201 Created` - Tài nguyên được tạo thành công
- `204 No Content` - Tài nguyên được xóa thành công
- `400 Bad Request` - Dữ liệu không hợp lệ
- `404 Not Found` - Tài nguyên không tìm thấy
- `500 Internal Server Error` - Lỗi server

---

## Test API

### Sử dụng REST Client Extension (VS Code)

1. **Cài đặt extension**: 
   - Mở Extensions (Ctrl+Shift+X)
   - Tìm "REST Client"
   - Cài đặt bởi Huachao Mao

2. **Sử dụng file test**:
   - Mở file `API_TEST.http`
   - Click "Send Request" trên bất kỳ request nào
   - Xem kết quả trong tab response

### Sử dụng Postman

1. Import collection từ file `BookApplication.postman_collection.json`
2. Cấu hình environment với base URL: `http://localhost:8081/api`
3. Chạy các request

### Sử dụng cURL

```bash
# Lấy tất cả khách hàng
curl -X GET http://localhost:8081/api/customers

# Tạo khách hàng mới
curl -X POST http://localhost:8081/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "nguyenvana@email.com",
    "address": "123 Đường Chính, Hà Nội",
    "membershipTier": "Gold",
    "points": 0,
    "totalSpent": 0
  }'
```

---

## Cấu trúc Project

```
BookApplication/
├── src/
│   ├── main/
│   │   ├── java/com/example/BookApplication/
│   │   │   ├── Controller/          # REST Controllers
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── CustomerController.java
│   │   │   │   ├── InvoiceController.java
│   │   │   │   ├── EmployeeController.java
│   │   │   │   ├── SupplierController.java
│   │   │   │   ├── PromotionController.java
│   │   │   │   └── ImportWarehouseController.java
│   │   │   ├── Entity/              # JPA Entities
│   │   │   │   ├── Category.java
│   │   │   │   ├── Product.java
│   │   │   │   ├── Customer.java
│   │   │   │   ├── Invoice.java
│   │   │   │   ├── InvoiceDetail.java
│   │   │   │   ├── Employee.java
│   │   │   │   ├── Supplier.java
│   │   │   │   ├── Promotion.java
│   │   │   │   ├── ImportWarehouse.java
│   │   │   │   └── ImportWarehouseDetail.java
│   │   │   ├── Repository/          # JPA Repositories
│   │   │   │   ├── CategoryRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── CustomerRepository.java
│   │   │   │   ├── InvoiceRepository.java
│   │   │   │   ├── EmployeeRepository.java
│   │   │   │   ├── SupplierRepository.java
│   │   │   │   ├── PromotionRepository.java
│   │   │   │   ├── ImportWarehouseRepository.java
│   │   │   │   └── ImportWarehouseDetailRepository.java
│   │   │   ├── Service/             # Business Logic
│   │   │   │   ├── CategoryService.java
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── CustomerService.java
│   │   │   │   ├── InvoiceService.java
│   │   │   │   ├── EmployeeService.java
│   │   │   │   ├── SupplierService.java
│   │   │   │   ├── PromotionService.java
│   │   │   │   ├── ImportWarehouseService.java
│   │   │   │   ├── InvoiceDetailService.java
│   │   │   │   └── ImportWarehouseDetailService.java
│   │   │   └── BookApplication.java # Main Application
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/example/BookApplication/
│           └── BookApplicationTests.java
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
├── API_TEST.http
└── README.md
```

---

## Phát triển Frontend

### Tạo Frontend Project

Hãy tạo một project frontend mới (React, Vue, Angular, v.v.) trong cùng repository hoặc repository riêng:

```bash
# Ví dụ sử dụng React (trong thư mục cha của BookApplication)
npx create-react-app pos-frontend
cd pos-frontend
```

### Cấu hình API Base URL

Tạo file `.env` trong thư mục frontend:

```
REACT_APP_API_URL=http://localhost:8081/api
```

### Trong code React

```javascript
// api.js
const API_URL = process.env.REACT_APP_API_URL;

export const getCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);
  return response.json();
};

export const createCustomer = async (customerData) => {
  const response = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  return response.json();
};
```

### Các tính năng Frontend cần phát triển

1. **Quản lý Sản phẩm**
   - Danh sách sản phẩm
   - Thêm/sửa/xóa sản phẩm
   - Tìm kiếm theo danh mục
   - Kiểm tra tồn kho

2. **Bán hàng (POS)**
   - Giao diện bán hàng tại quầy
   - Tìm sản phẩm, thêm vào giỏ hàng
   - Tính toán tiền, chiết khấu
   - Chọn khách hàng / tạo khách hàng nhanh
   - Thanh toán (Tiền mặt / Chuyển khoản)
   - Treo đơn / Hủy đơn

3. **Quản lý Khách hàng**
   - Danh sách khách hàng
   - Thêm/sửa thông tin khách hàng
   - Xem lịch sử mua hàng
   - Quản lý hạng thành viên & tích điểm

4. **Quản lý Nhập kho**
   - Tạo phiếu nhập kho
   - Chọn nhà cung cấp
   - Thêm sản phẩm & quy đổi đơn vị
   - Hoàn thành nhập kho

5. **Quản lý Khuyến mãi**
   - Tạo voucher / mã giảm giá
   - Thiết lập điều kiện khuyến mãi
   - Xem mã được sử dụng

6. **Báo cáo & Thống kê**
   - Dashboard doanh thu
   - Sản phẩm bán chạy
   - Danh sách hàng tồn kho
   - Duyệt yêu cầu hủy / hoàn trả

---

## Git Workflow

### Khởi tạo Repository

```bash
git init
git add .
git commit -m "Initial commit: POS System with Spring Boot Backend"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

### Tạo nhánh cho Frontend

```bash
git checkout -b frontend/development
# hoặc tạo repository frontend riêng
```

### Commit Convention

- `feat: Mô tả tính năng mới`
- `fix: Mô tả bug fix`
- `refactor: Mô tả cải tiến code`
- `docs: Cập nhật documentation`
- `test: Thêm test cases`

---

## Hướng dẫn phát triển

### Backend (Spring Boot)

1. **Thêm tính năng mới**:
   - Tạo Entity → Repository → Service → Controller
   - Theo mẫu hiện có

2. **Chạy test**:
   ```bash
   ./gradlew test
   ```

3. **Build project**:
   ```bash
   ./gradlew build
   ```

### Frontend

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Chạy development server**:
   ```bash
   npm start
   ```

3. **Build production**:
   ```bash
   npm run build
   ```

---

## Troubleshooting

### Backend không chạy

#### Lỗi: Port 8081 đã bị sử dụng
```bash
# Windows: Tìm process sử dụng port 8081
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8081
kill -9 <PID>
```

#### Lỗi: Database connection failed
- Kiểm tra MySQL đã chạy chưa: `mysql --version`
- Kiểm tra username/password trong `application.properties`
- Đảm bảo database `book_db` đã được tạo

#### Lỗi: Entity mapping not found
- Xóa folder `build`
- Chạy lại: `./gradlew clean bootRun`

### Frontend không kết nối API

#### Kiểm tra CORS
- Backend đã có `@CrossOrigin(origins = "*")` trong Controller
- Nếu không, thêm vào hoặc cấu hình CORS

#### Kiểm tra Base URL
- Mở DevTools (F12) → Network tab
- Xem request URL có đúng không
- Kiểm tra lại `REACT_APP_API_URL`

---

## Liên hệ & Hỗ trợ

Nếu có vấn đề, vui lòng:
1. Kiểm tra README này
2. Xem lại API_TEST.http để hiểu cách gọi API
3. Tạo issue trong GitHub

---

## Phiên bản

- **v1.0.0** - Backend hoàn thiện, sẵn sàng cho frontend
- Ngày phát hành: 05/06/2026

---

## License

MIT License

---

**Chúc bạn phát triển thành công! 🚀**
