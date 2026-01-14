# Employee Management API

Backend API cho hệ thống quản lý nhân viên sử dụng NestJS + TypeScript + PostgreSQL (Supabase).

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **Testing**: Jest + Supertest (E2E)

## Cấu trúc Dự án

```
employee-api/
├── src/
│   ├── employees/
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── entities/               # TypeORM Entities
│   │   ├── employees.controller.ts # REST API Controller
│   │   ├── employees.service.ts    # Business Logic
│   │   └── employees.module.ts     # Module
│   ├── database/
│   │   └── database.module.ts      # TypeORM Configuration
│   ├── common/
│   │   ├── filters/                # Exception Filters
│   │   ├── interceptors/           # Response Interceptors
│   │   └── pipes/                  # Validation Pipes
│   ├── app.module.ts               # Root Module
│   └── main.ts                     # Bootstrap
├── test/
│   └── employees.e2e-spec.ts       # E2E Tests (66 test cases)
├── .env                            # Environment Variables (Dev)
├── .env.test                       # Environment Variables (Test)
└── package.json

```

## Cài đặt

### 1. Clone & Install

```bash
cd employee-api
npm install
```

### 2. Cấu hình Database

Tạo file `.env`:

```env
POSTGRES_URI=postgresql://user:password@host:port/database
```

Tạo file `.env.test`:

```env
POSTGRES_URI=postgresql://user:password@host:port/test_database
```

### 3. Chạy ứng dụng

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server sẽ chạy tại: `http://localhost:3000`  
**API Documentation (Swagger)**: `http://localhost:3000/api/docs`

## 📚 API Documentation

### Interactive Swagger UI

Sau khi start server, truy cập Swagger UI để:

- Xem chi tiết tất cả endpoints
- Test API trực tiếp từ browser
- Xem request/response examples
- Download OpenAPI schema

**URL**: http://localhost:3000/api/docs

### Features:

- ✅ Interactive API testing
- ✅ Request/Response examples
- ✅ Schema validation
- ✅ Error response examples
- ✅ Query parameters documentation

## API Endpoints

### Base URL: `/api/employees`

| Method | Endpoint             | Mô tả                                  |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/api/employees`     | Lấy danh sách (có search & pagination) |
| GET    | `/api/employees/:id` | Lấy chi tiết 1 nhân viên               |
| POST   | `/api/employees`     | Tạo mới nhân viên                      |
| PUT    | `/api/employees/:id` | Cập nhật toàn bộ                       |
| PATCH  | `/api/employees/:id` | Cập nhật một phần                      |
| DELETE | `/api/employees/:id` | Xóa nhân viên                          |

### Ví dụ Request/Response

#### POST /api/employees

**Request:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+84123456789",
  "department": "Engineering",
  "position": "Senior Developer",
  "salary": 50000.0,
  "hireDate": "2024-01-15",
  "status": "active"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+84123456789",
  "department": "Engineering",
  "position": "Senior Developer",
  "salary": 50000.0,
  "hireDate": "2024-01-15",
  "status": "active",
  "createdAt": "2024-01-08T10:00:00Z",
  "updatedAt": "2024-01-08T10:00:00Z"
}
```

#### GET /api/employees?name=john&page=1&limit=10

**Response (200):**

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Testing

### E2E Tests

Dự án có **66 test cases** bao phủ đầy đủ:

- CREATE: 14 tests
- GET ALL: 12 tests
- GET ONE: 5 tests
- PUT: 14 tests
- PATCH: 15 tests
- DELETE: 6 tests

```bash
# Chạy E2E tests
npm run test:e2e

# Chạy với coverage
npm run test:e2e -- --coverage
```

### Clearing Test Data

Tests tự động xóa data sau khi chạy xong (trong `afterAll` hook). Nếu cần xóa data manually:

```bash
# Xóa toàn bộ data trong test database
NODE_ENV=test npx ts-node test/clear-test-data.ts
```

**Lưu ý**:

- Data được tự động clear sau mỗi test suite
- `beforeEach` hook cũng clear data trước mỗi test case
- Script `clear-test-data.ts` dùng để manual cleanup khi cần

## Validation Rules

### Required Fields

- `name` (1-255 chars)
- `email` (valid email format, unique)

### Optional Fields

- `phone` (max 20 chars, format: numbers, +, -, spaces, parentheses)
- `department` (max 100 chars)
- `position` (max 100 chars)
- `salary` (>= 0, decimal 10,2)
- `hireDate` (date, <= today)
- `status` (enum: 'active' | 'inactive', default: 'active')

## Lưu ý

- **PoC Project**: Đây là project PoC để luyện tập, KHÔNG dành cho production
- **synchronize: true**: TypeORM auto-sync schema, CHỈ dùng dev/test
- **No Authentication**: API không có authentication/authorization
- **Hard Delete**: Xóa thật, không có soft delete

## License

MIT

---

note:

- tạo cấu trúc thư mục docs cho từng service riêng
- tạo prompt cho từng service riêng
