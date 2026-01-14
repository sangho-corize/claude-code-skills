# KỀ HOẠCH TRIỂN KHAI BACKEND

## Employee Management System - NestJS + TypeScript + PostgreSQL

---

## 1. THỰC THỂ CƠ SỞ DỮ LIỆU

### 1.1 Entity: Employee

**Tên bảng**: `employees`

**Các trường**:

| Field        | Type          | Key/Constraint              | Mô tả                        |
| ------------ | ------------- | --------------------------- | ---------------------------- |
| `id`         | UUID          | PRIMARY KEY, Auto-generated | Mã nhân viên                 |
| `name`       | VARCHAR(255)  | NOT NULL, INDEX             | Tên nhân viên                |
| `email`      | VARCHAR(255)  | NOT NULL, UNIQUE, INDEX     | Email (unique)               |
| `phone`      | VARCHAR(20)   | NULLABLE                    | Số điện thoại                |
| `department` | VARCHAR(100)  | NULLABLE                    | Phòng ban                    |
| `position`   | VARCHAR(100)  | NULLABLE                    | Vị trí                       |
| `salary`     | DECIMAL(10,2) | NULLABLE, CHECK (>= 0)      | Lương                        |
| `hireDate`   | DATE          | NULLABLE, CHECK (<= today)  | Ngày vào làm                 |
| `status`     | ENUM          | NOT NULL, DEFAULT 'active'  | Trạng thái (active/inactive) |
| `createdAt`  | TIMESTAMP     | NOT NULL, DEFAULT NOW()     | Ngày tạo                     |
| `updatedAt`  | TIMESTAMP     | NOT NULL, DEFAULT NOW()     | Ngày cập nhật                |

**Indexes**:

- PRIMARY: `id`
- UNIQUE: `email`
- INDEX: `name` (cho search)
- INDEX: `status`

---

## 2. DANH SÁCH API ENDPOINTS

### 2.1 Tổng quan

| #   | Method | Endpoint             | Chức năng                            | Auth  |
| --- | ------ | -------------------- | ------------------------------------ | ----- |
| 1   | GET    | `/api/employees`     | Lấy danh sách + Search + Pagination  | Admin |
| 2   | GET    | `/api/employees/:id` | Lấy chi tiết 1 nhân viên             | Admin |
| 3   | POST   | `/api/employees`     | Tạo mới nhân viên                    | Admin |
| 4   | PUT    | `/api/employees/:id` | Update toàn bộ (required all fields) | Admin |
| 5   | PATCH  | `/api/employees/:id` | Update một phần (partial update)     | Admin |
| 6   | DELETE | `/api/employees/:id` | Xóa nhân viên                        | Admin |

### 2.2 Chi tiết Endpoints

#### **1. GET /api/employees**

- **Query params**: `name`, `page`, `limit`
- **Response**: Paginated list + meta
- **Features**: Search (name), Pagination

#### **2. GET /api/employees/:id**

- **Params**: `id` (UUID)
- **Response**: Employee object
- **Errors**: 400 (invalid UUID), 404 (not found)

#### **3. POST /api/employees**

- **Body**: CreateEmployeeDto
- **Required**: `name`, `email`
- **Errors**: 400 (validation), 409 (email exists)

#### **4. PUT /api/employees/:id**

- **Body**: UpdateEmployeeDto (all fields required)
- **Errors**: 400, 404, 409

#### **5. PATCH /api/employees/:id**

- **Body**: PatchEmployeeDto (all fields optional)
- **Errors**: 400 (empty body, validation), 404, 409

#### **6. DELETE /api/employees/:id**

- **Response**: 200/204 + message
- **Errors**: 400, 404

---

## 3. CẤU TRÚC FILE DỰ ÁN

```
employee/
│
├── src/
│   ├── employees/
│   │   ├── dto/
│   │   │   ├── create-employee.dto.ts       # DTO cho POST
│   │   │   ├── update-employee.dto.ts       # DTO cho PUT
│   │   │   ├── patch-employee.dto.ts        # DTO cho PATCH
│   │   │   └── query-employee.dto.ts        # DTO cho GET query params
│   │   │
│   │   ├── entities/
│   │   │   └── employee.entity.ts           # TypeORM Entity
│   │   │
│   │   ├── employees.controller.ts          # Controller (6 endpoints)
│   │   ├── employees.service.ts             # Business logic
│   │   └── employees.module.ts              # Module
│   │
│   ├── database/
│   │   ├── database.module.ts               # TypeORM config
│   │   └── migrations/                      # (Optional nếu dùng migration)
│   │       └── {timestamp}-CreateEmployeeTable.ts
│   │
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts     # Global exception filter
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts     # Transform response
│   │   └── pipes/
│   │       └── validation.pipe.ts           # Global validation pipe
│   │
│   ├── app.module.ts                        # Root module
│   └── main.ts                              # Bootstrap NestJS app
│
├── test/
│   └── employees.e2e-spec.ts                # E2E tests (60+ test cases)
│
├── .env                                     # Environment variables (dev)
├── .env.test                                # Environment variables (test)
├── package.json                             # Dependencies
├── tsconfig.json                            # TypeScript config
├── nest-cli.json                            # NestJS CLI config
└── README.md                                # Documentation

```

---

## 4. CÁC TRƯỜNG HỢP TEST (E2E)

### 4.1 Tổng quan Test Suites

| Test Suite        | Số lượng Test Cases | Trọng tâm                         |
| ----------------- | ------------------- | --------------------------------- |
| **CREATE (POST)** | 14 cases            | Validation, conflict, success     |
| **GET ALL**       | 12 cases            | Pagination, search, edge cases    |
| **GET ONE**       | 5 cases             | Not found, invalid UUID           |
| **UPDATE (PUT)**  | 14 cases            | Full update, validation, conflict |
| **PATCH**         | 15 cases            | Partial update, empty body        |
| **DELETE**        | 6 cases             | Success, not found, idempotency   |
| **TOTAL**         | **66 test cases**   | Full coverage                     |

### 4.2 Chi tiết Test Cases theo Suite

#### **SUITE 1: POST /api/employees (Create) - 14 cases**

**Happy Paths (2)**:

1. ✅ Tạo thành công với đầy đủ fields
2. ✅ Tạo thành công với chỉ required fields (name, email)

**Validation Errors (10)**: 3. ❌ Thiếu `name` 4. ❌ Thiếu `email` 5. ❌ Email format không hợp lệ 6. ❌ Name quá dài (>255) 7. ❌ Phone format không hợp lệ 8. ❌ Salary âm 9. ❌ HireDate trong tương lai 10. ❌ Status không hợp lệ 11. ❌ Empty body 12. ❌ Name = empty string 13. ❌ Name = whitespace only

**Conflict (1)**: 14. ❌ Email đã tồn tại (409)

---

#### **SUITE 2: GET /api/employees (List) - 12 cases**

**Happy Paths (6)**:

1. ✅ Lấy danh sách không filter
2. ✅ Pagination (page, limit)
3. ✅ Search theo name - tìm thấy
4. ✅ Search - không tìm thấy (empty array)
5. ✅ Search - partial match
6. ✅ Database trống

**Validation Errors (4)**: 7. ❌ page < 1 8. ❌ limit > 100 9. ❌ page không phải số 10. ✅ Default pagination (page=1, limit=10)

**Edge Cases (2)**: 11. ✅ Search với special characters 12. ✅ Kết hợp search + pagination

---

#### **SUITE 3: GET /api/employees/:id (Get One) - 5 cases**

**Happy Path (1)**:

1. ✅ Lấy employee thành công

**Errors (4)**: 2. ❌ Employee không tồn tại (404) 3. ❌ ID không phải UUID (400) 4. ❌ ID = empty string 5. ❌ ID chứa special characters

---

#### **SUITE 4: PUT /api/employees/:id (Full Update) - 14 cases**

**Happy Paths (3)**:

1. ✅ Update thành công với đầy đủ fields
2. ✅ Update với chỉ required fields (optional → NULL)
3. ✅ Update email thành chính email hiện tại (không conflict)

**Not Found (1)**: 4. ❌ Employee không tồn tại (404)

**Validation Errors (7)**: 5. ❌ Thiếu `name` 6. ❌ Thiếu `email` 7. ❌ Email format không hợp lệ 8. ❌ Salary âm 9. ❌ HireDate trong tương lai 10. ❌ Invalid UUID 11. ❌ Empty body

**Conflict (1)**: 12. ❌ Email đã tồn tại (employee khác) (409)

**Business Logic (2)**: 13. ✅ Update status active → inactive 14. ❌ Status không hợp lệ

---

#### **SUITE 5: PATCH /api/employees/:id (Partial Update) - 15 cases**

**Happy Paths (4)**:

1. ✅ Update 1 field thành công
2. ✅ Update nhiều fields
3. ✅ Update tất cả optional fields
4. ✅ Update email thành chính email hiện tại

**Not Found (1)**: 5. ❌ Employee không tồn tại (404)

**Validation Errors (6)**: 6. ❌ Empty body (400) 7. ❌ Email format không hợp lệ 8. ❌ Salary âm 9. ❌ HireDate trong tương lai 10. ❌ Invalid UUID 11. ❌ Name = empty string

**Conflict (1)**: 12. ❌ Email đã tồn tại (409)

**Edge Cases (3)**: 13. ✅ Set optional field về NULL 14. ❌ Status không hợp lệ 15. ✅ Update cùng giá trị (chỉ updatedAt thay đổi)

---

#### **SUITE 6: DELETE /api/employees/:id - 6 cases**

**Happy Paths (2)**:

1. ✅ Xóa thành công
2. ✅ Xóa không ảnh hưởng employees khác

**Errors (3)**: 3. ❌ Employee không tồn tại (404) 4. ❌ Invalid UUID (400) 5. ❌ Empty ID

**Idempotency (1)**: 6. ❌ Xóa employee đã xóa (404)

---

### 4.3 Test Data Fixtures

```typescript
// Valid employee
validEmployee = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+84123456789",
  department: "Engineering",
  position: "Senior Developer",
  salary: 50000.0,
  hireDate: "2024-01-15",
  status: "active",
};

// Minimal employee
minimalEmployee = {
  name: "Jane Smith",
  email: "jane.smith@example.com",
};

// Invalid data
invalidEmail = { ...validEmployee, email: "not-an-email" };
negativeSalary = { ...validEmployee, salary: -1000 };
futureDate = { ...validEmployee, hireDate: "2030-01-01" };
invalidStatus = { ...validEmployee, status: "pending" };
```

### 4.4 Test Coverage Target

- **Line Coverage**: ≥ 90%
- **Branch Coverage**: ≥ 85%
- **Function Coverage**: ≥ 90%

---

## 5. CÁC TRƯỜNG HỢP KHÓ KHĂN & RỦI RO

### 5.1 Rủi ro Kỹ thuật ⚠️

| #   | Rủi ro                                        | Mức độ        | Giải pháp                                                                                      |
| --- | --------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| 1   | **Kết nối Supabase không ổn định**            | 🔴 Cao        | - Test kỹ connection string<br>- Implement retry logic<br>- Handle connection timeout          |
| 2   | **TypeORM synchronize: true gây mất dữ liệu** | 🔴 Cao        | - ⚠️ CHỈ dùng trong dev/test<br>- Document rõ ràng<br>- Cân nhắc dùng migration cho production |
| 3   | **Validation regex cho phone phức tạp**       | 🟡 Trung bình | - Dùng pattern đơn giản: `/^[0-9+\-\s()]+$/`<br>- Document format rõ ràng                      |
| 4   | **UUID validation performance**               | 🟢 Thấp       | - Dùng class-validator built-in `@IsUUID()`                                                    |
| 5   | **Timezone cho hireDate**                     | 🟡 Trung bình | - Store as DATE (no time)<br>- Validate <= today (server timezone)                             |

---

### 5.2 Trường hợp Khó ⚙️

#### **5.2.1 Search Name - Partial Match + Case Insensitive**

**Vấn đề**:

- Cần implement ILIKE query trong TypeORM
- Performance với database lớn

**Giải pháp**:

```typescript
// TypeORM Repository
findByName(name: string) {
  return this.employeeRepository
    .createQueryBuilder('employee')
    .where('LOWER(employee.name) LIKE LOWER(:name)', {
      name: `%${name}%`
    })
    .getMany();
}
```

**Lưu ý**:

- Tránh SQL injection (dùng parameterized query)
- Có index trên `name` column
- Limit kết quả với pagination

---

#### **5.2.2 Email Unique Constraint - Update Conflict**

**Vấn đề**:

- PUT/PATCH với email mới có thể conflict với employee khác
- Cần allow update cùng email hiện tại

**Giải pháp**:

```typescript
// Service logic
async update(id: string, dto: UpdateEmployeeDto) {
  const existing = await this.findOne(id);

  // Check email conflict chỉ khi email thay đổi
  if (dto.email !== existing.email) {
    const duplicate = await this.findByEmail(dto.email);
    if (duplicate) {
      throw new ConflictException('Email already exists');
    }
  }

  return this.employeeRepository.save({ ...existing, ...dto });
}
```

---

#### **5.2.3 PATCH Empty Body Validation**

**Vấn đề**:

- PATCH cho phép partial update
- Cần reject empty body {}
- Nhưng allow update 1 field bất kỳ

**Giải pháp**:

```typescript
// PatchEmployeeDto
@ValidateIf(() => false) // Skip if not provided
@IsString()
name?: string;

// Controller
@Patch(':id')
async patch(@Body() dto: PatchEmployeeDto) {
  if (Object.keys(dto).length === 0) {
    throw new BadRequestException('At least one field must be provided');
  }
  return this.employeesService.patch(id, dto);
}
```

---

#### **5.2.4 HireDate Validation - Không được tương lai**

**Vấn đề**:

- Validate `hireDate <= today`
- Server timezone khác client timezone

**Giải pháp**:

```typescript
// DTO validator
@IsDate()
@MaxDate(() => new Date(), {
  message: 'hireDate cannot be in the future'
})
@Type(() => Date)
hireDate?: Date;

// Custom validator nếu cần
@Validate(NotFutureDateConstraint)
hireDate?: Date;
```

---

#### **5.2.5 Pagination - Query Performance**

**Vấn đề**:

- Pagination với `OFFSET` chậm với dataset lớn
- Count(\*) query tốn performance

**Giải pháp**:

```typescript
// Dùng take/skip của TypeORM
async findAll(query: QueryEmployeeDto) {
  const [data, total] = await this.employeeRepository.findAndCount({
    where: query.name ? {
      name: ILike(`%${query.name}%`)
    } : {},
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    order: { createdAt: 'DESC' }
  });

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}
```

**Tối ưu**:

- Add index trên `createdAt` nếu sort theo đó
- Cache `total` count (nếu data ít thay đổi)
- Limit max `limit` = 100

---

#### **5.2.6 E2E Tests - Database Cleanup**

**Vấn đề**:

- Test pollution: test này ảnh hưởng test kia
- Cần clean database giữa các tests

**Giải pháp**:

```typescript
// employees.e2e-spec.ts
describe("EmployeesController (e2e)", () => {
  let app: INestApplication;
  let repository: Repository<Employee>;

  beforeAll(async () => {
    // Setup app & database connection
  });

  beforeEach(async () => {
    // Clean database
    await repository.query("TRUNCATE TABLE employees CASCADE");
    // hoặc
    await repository.clear();
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Lựa chọn**:

- **Option 1**: TRUNCATE mỗi test (chậm nhưng clean)
- **Option 2**: Transaction rollback (nhanh hơn)
- **Option 3**: Separate test database

---

### 5.3 Checklist Triển khai 📋

#### **Phase 1: Setup Project**

- [ ] Init NestJS project
- [ ] Install dependencies
- [ ] Setup TypeORM + PostgreSQL (Supabase)
- [ ] Configure environment variables
- [ ] Test database connection

#### **Phase 2: Implement Entity & DTOs**

- [ ] Create Employee entity với TypeORM decorators
- [ ] Create CreateEmployeeDto với validation
- [ ] Create UpdateEmployeeDto (PUT)
- [ ] Create PatchEmployeeDto (PATCH)
- [ ] Create QueryEmployeeDto (GET query params)

#### **Phase 3: Implement Service Layer**

- [ ] CREATE: create(dto) → handle email conflict
- [ ] READ ALL: findAll(query) → search + pagination
- [ ] READ ONE: findOne(id) → handle not found
- [ ] UPDATE: update(id, dto) → handle email conflict
- [ ] PATCH: patch(id, dto) → handle empty body
- [ ] DELETE: remove(id) → handle not found

#### **Phase 4: Implement Controller**

- [ ] POST /api/employees
- [ ] GET /api/employees (with query params)
- [ ] GET /api/employees/:id
- [ ] PUT /api/employees/:id
- [ ] PATCH /api/employees/:id
- [ ] DELETE /api/employees/:id
- [ ] Add validation pipes
- [ ] Add exception filters

#### **Phase 5: Write E2E Tests**

- [ ] Setup test module & test database
- [ ] Test Suite 1: CREATE (14 cases)
- [ ] Test Suite 2: GET ALL (12 cases)
- [ ] Test Suite 3: GET ONE (5 cases)
- [ ] Test Suite 4: PUT (14 cases)
- [ ] Test Suite 5: PATCH (15 cases)
- [ ] Test Suite 6: DELETE (6 cases)
- [ ] Verify coverage >= 90%

#### **Phase 6: Polish & Documentation**

- [ ] Add global exception filter
- [ ] Add response transform interceptor
- [ ] Write README.md
- [ ] Document API (Swagger - optional)
- [ ] Clean up code

---

### 5.4 Thời gian Ước tính ⏱️

| Phase     | Công việc                | Thời gian     | Độ ưu tiên |
| --------- | ------------------------ | ------------- | ---------- |
| 1         | Setup Project + Database | 1-2 giờ       | 🔴 High    |
| 2         | Entity + DTOs            | 1-2 giờ       | 🔴 High    |
| 3         | Service Layer            | 3-4 giờ       | 🔴 High    |
| 4         | Controller               | 2-3 giờ       | 🔴 High    |
| 5         | E2E Tests (66 cases)     | 4-6 giờ       | 🔴 High    |
| 6         | Polish & Docs            | 1-2 giờ       | 🟡 Medium  |
| **TOTAL** |                          | **12-19 giờ** |            |

**Lưu ý**: Thời gian này cho developer có kinh nghiệm NestJS + TypeORM

---

## 6. DEPENDENCIES CẦN THIẾT

### 6.1 Core Dependencies

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "dotenv": "^16.0.3",
  "reflect-metadata": "^0.1.13",
  "rxjs": "^7.8.1"
}
```

### 6.2 Dev Dependencies

```json
{
  "@nestjs/cli": "^10.0.0",
  "@nestjs/testing": "^10.0.0",
  "@types/jest": "^29.5.0",
  "@types/node": "^20.0.0",
  "@types/supertest": "^2.0.12",
  "jest": "^29.5.0",
  "supertest": "^6.3.0",
  "ts-jest": "^29.1.0",
  "ts-node": "^10.9.0",
  "typescript": "^5.0.0",
  "prettier": "^3.0.0",
  "eslint": "^8.42.0"
}
```

---

## 7. LỆNH QUAN TRỌNG

```bash
# Install dependencies
npm install

# Chạy development server
npm run start:dev

# Chạy E2E tests
npm run test:e2e

# Chạy tests với coverage
npm run test:e2e -- --coverage

# Build production
npm run build

# Generate migration (nếu dùng)
npm run typeorm migration:generate -- -n CreateEmployeeTable

# Run migration
npm run typeorm migration:run
```

---

## 8. KẾT LUẬN

### ✅ Điểm mạnh của kế hoạch:

- Rõ ràng, chi tiết từng bước
- Test coverage cao (66 test cases)
- Handle đầy đủ edge cases
- Database design đơn giản, dễ implement

### ⚠️ Lưu ý quan trọng:

- **synchronize: true** - CHỈ dùng dev/test, KHÔNG dùng production
- **Email unique** - Phải handle conflict khi update
- **Search performance** - Cần index trên `name`
- **Test database** - Phải clean data giữa các tests

### 🎯 Mục tiêu thành công:

- ✅ Tất cả 6 endpoints hoạt động
- ✅ 66/66 test cases pass
- ✅ Coverage >= 90%
- ✅ Validation đầy đủ, chính xác
- ✅ Error handling consistent

---

**Ready to implement! 🚀**
