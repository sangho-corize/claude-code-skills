# BACKEND TECHNICAL SPECIFICATION

## Employee Management System - PoC

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu

- Xây dựng backend API cho hệ thống quản lý nhân viên (Employee Management)
- PoC để luyện kỹ năng sử dụng AI trong phát triển phần mềm

### 1.2 Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Testing**: Jest (E2E Testing)
- **Validation**: class-validator, class-transformer

### 1.3 Phạm vi

- **Chức năng**: CRUD Employee
- **Vai trò người dùng**: Admin only
- **Loại dự án**: PoC (KHÔNG hướng production)

---

## 2. ENTITY DESIGN

### 2.1 Employee Entity

#### 2.1.1 Tên bảng

`employees`

#### 2.1.2 Các trường (Fields)

| Field Name   | Type      | Length | Required | Unique | Default           | Description                   |
| ------------ | --------- | ------ | -------- | ------ | ----------------- | ----------------------------- |
| `id`         | UUID      | -      | Yes      | Yes    | auto-generated    | Primary key                   |
| `name`       | VARCHAR   | 255    | Yes      | No     | -                 | Tên nhân viên                 |
| `email`      | VARCHAR   | 255    | Yes      | Yes    | -                 | Email nhân viên               |
| `phone`      | VARCHAR   | 20     | No       | No     | NULL              | Số điện thoại                 |
| `department` | VARCHAR   | 100    | No       | No     | NULL              | Phòng ban                     |
| `position`   | VARCHAR   | 100    | No       | No     | NULL              | Vị trí công việc              |
| `salary`     | DECIMAL   | (10,2) | No       | No     | NULL              | Mức lương                     |
| `hireDate`   | DATE      | -      | No       | No     | NULL              | Ngày vào làm                  |
| `status`     | ENUM      | -      | Yes      | No     | 'active'          | Trạng thái (active, inactive) |
| `createdAt`  | TIMESTAMP | -      | Yes      | No     | CURRENT_TIMESTAMP | Thời gian tạo                 |
| `updatedAt`  | TIMESTAMP | -      | Yes      | No     | CURRENT_TIMESTAMP | Thời gian cập nhật            |

#### 2.1.3 Constraints

**Primary Key:**

- `id` (UUID)

**Unique Constraints:**

- `email` phải unique

**Check Constraints:**

- `salary` >= 0 (nếu có giá trị)
- `hireDate` <= ngày hiện tại (nếu có giá trị)
- `status` IN ('active', 'inactive')

**Indexes:**

- Primary index trên `id`
- Unique index trên `email`
- Index trên `name` (để tối ưu search)
- Index trên `status`

---

## 3. API ENDPOINTS

### 3.1 Base URL

```
/api/employees
```

### 3.2 Danh sách Endpoints

#### 3.2.1 GET /api/employees

**Mục đích**: Lấy danh sách tất cả nhân viên với khả năng tìm kiếm theo tên

**Method**: `GET`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Tìm kiếm theo tên (partial match, case-insensitive) |
| `page` | number | No | Số trang (default: 1) |
| `limit` | number | No | Số lượng per page (default: 10, max: 100) |

**Response Success (200 OK)**:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "department": "string | null",
      "position": "string | null",
      "salary": "number | null",
      "hireDate": "date | null",
      "status": "active | inactive",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Response Error**:

- `400 Bad Request`: Invalid query parameters

---

#### 3.2.2 GET /api/employees/:id

**Mục đích**: Lấy thông tin chi tiết một nhân viên

**Method**: `GET`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | ID của nhân viên |

**Response Success (200 OK)**:

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "department": "string | null",
  "position": "string | null",
  "salary": "number | null",
  "hireDate": "date | null",
  "status": "active | inactive",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Response Error**:

- `400 Bad Request`: Invalid UUID format
- `404 Not Found`: Employee not found

---

#### 3.2.3 POST /api/employees

**Mục đích**: Tạo mới một nhân viên

**Method**: `POST`

**Request Body**:

```json
{
  "name": "string", // Required, min: 1, max: 255
  "email": "string", // Required, valid email format, max: 255
  "phone": "string", // Optional, max: 20
  "department": "string", // Optional, max: 100
  "position": "string", // Optional, max: 100
  "salary": "number", // Optional, >= 0
  "hireDate": "date", // Optional, <= today
  "status": "active | inactive" // Optional, default: active
}
```

**Response Success (201 Created)**:

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "department": "string | null",
  "position": "string | null",
  "salary": "number | null",
  "hireDate": "date | null",
  "status": "active | inactive",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Response Error**:

- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

#### 3.2.4 PUT /api/employees/:id

**Mục đích**: Cập nhật toàn bộ thông tin nhân viên

**Method**: `PUT`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | ID của nhân viên |

**Request Body**:

```json
{
  "name": "string", // Required, min: 1, max: 255
  "email": "string", // Required, valid email format, max: 255
  "phone": "string", // Optional, max: 20
  "department": "string", // Optional, max: 100
  "position": "string", // Optional, max: 100
  "salary": "number", // Optional, >= 0
  "hireDate": "date", // Optional, <= today
  "status": "active | inactive" // Optional
}
```

**Response Success (200 OK)**:

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "department": "string | null",
  "position": "string | null",
  "salary": "number | null",
  "hireDate": "date | null",
  "status": "active | inactive",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Response Error**:

- `400 Bad Request`: Validation errors or Invalid UUID format
- `404 Not Found`: Employee not found
- `409 Conflict`: Email already exists (nếu thay đổi email)

---

#### 3.2.5 PATCH /api/employees/:id

**Mục đích**: Cập nhật một phần thông tin nhân viên

**Method**: `PATCH`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | ID của nhân viên |

**Request Body** (tất cả các fields đều optional):

```json
{
  "name": "string", // Optional, min: 1, max: 255
  "email": "string", // Optional, valid email format, max: 255
  "phone": "string", // Optional, max: 20
  "department": "string", // Optional, max: 100
  "position": "string", // Optional, max: 100
  "salary": "number", // Optional, >= 0
  "hireDate": "date", // Optional, <= today
  "status": "active | inactive" // Optional
}
```

**Response Success (200 OK)**:

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "department": "string | null",
  "position": "string | null",
  "salary": "number | null",
  "hireDate": "date | null",
  "status": "active | inactive",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Response Error**:

- `400 Bad Request`: Validation errors, Invalid UUID format, or Empty body
- `404 Not Found`: Employee not found
- `409 Conflict`: Email already exists (nếu thay đổi email)

---

#### 3.2.6 DELETE /api/employees/:id

**Mục đích**: Xóa một nhân viên

**Method**: `DELETE`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | ID của nhân viên |

**Response Success (200 OK hoặc 204 No Content)**:

```json
{
  "message": "Employee deleted successfully"
}
```

**Response Error**:

- `400 Bad Request`: Invalid UUID format
- `404 Not Found`: Employee not found

---

## 4. VALIDATION RULES

### 4.1 CreateEmployeeDto

| Field        | Rules                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| `name`       | Required, String, Min length: 1, Max length: 255, Trim whitespace            |
| `email`      | Required, Valid email format, Max length: 255, Lowercase                     |
| `phone`      | Optional, String, Max length: 20, Matches phone pattern: `/^[0-9+\-\s()]+$/` |
| `department` | Optional, String, Max length: 100, Trim whitespace                           |
| `position`   | Optional, String, Max length: 100, Trim whitespace                           |
| `salary`     | Optional, Number, Min: 0, Decimal places: 2                                  |
| `hireDate`   | Optional, Valid date format (ISO 8601), Max date: today                      |
| `status`     | Optional, Enum: ['active', 'inactive'], Default: 'active'                    |

### 4.2 UpdateEmployeeDto (PUT)

Giống hệt `CreateEmployeeDto` (tất cả required fields vẫn required)

### 4.3 PatchEmployeeDto (PATCH)

Giống `CreateEmployeeDto` nhưng **tất cả fields đều optional**, validation rules áp dụng khi field được cung cấp

### 4.4 Query Parameters Validation (GET /api/employees)

| Parameter | Rules                                            |
| --------- | ------------------------------------------------ |
| `name`    | Optional, String, Min length: 1, Max length: 255 |
| `page`    | Optional, Integer, Min: 1, Default: 1            |
| `limit`   | Optional, Integer, Min: 1, Max: 100, Default: 10 |

### 4.5 UUID Path Parameter Validation

| Parameter | Rules                          |
| --------- | ------------------------------ |
| `id`      | Required, Valid UUID v4 format |

---

## 5. E2E TEST SPECIFICATION

### 5.1 Test File Structure

```
test/
  └── employees.e2e-spec.ts
```

### 5.2 Test Setup

#### 5.2.1 Before All

- Khởi tạo NestJS testing module
- Kết nối database test (Supabase test instance hoặc local)
- Tạo app instance

#### 5.2.2 Before Each

- Xóa toàn bộ dữ liệu trong bảng `employees`
- (Optional) Seed dữ liệu mẫu nếu cần

#### 5.2.3 After All

- Đóng kết nối database
- Đóng app instance

---

### 5.3 Test Cases

#### **TEST SUITE: POST /api/employees (Create Employee)**

##### TC-CREATE-001: Tạo employee thành công với đầy đủ thông tin

- **Given**: Request body hợp lệ với tất cả fields
- **When**: POST /api/employees
- **Then**:
  - Status code: 201
  - Response chứa đầy đủ thông tin employee
  - `id` được tạo tự động (UUID)
  - `createdAt` và `updatedAt` được set
  - Verify data trong database

##### TC-CREATE-002: Tạo employee thành công với chỉ required fields

- **Given**: Request body chỉ có `name` và `email`
- **When**: POST /api/employees
- **Then**:
  - Status code: 201
  - Optional fields có giá trị NULL
  - `status` = 'active' (default)

##### TC-CREATE-003: Validation error - thiếu field `name`

- **Given**: Request body không có `name`
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message chứa validation error cho `name`

##### TC-CREATE-004: Validation error - thiếu field `email`

- **Given**: Request body không có `email`
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message chứa validation error cho `email`

##### TC-CREATE-005: Validation error - email format không hợp lệ

- **Given**: `email` = "invalid-email"
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: email must be a valid email

##### TC-CREATE-006: Validation error - name vượt quá max length

- **Given**: `name` có độ dài > 255 ký tự
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message chứa max length constraint

##### TC-CREATE-007: Validation error - phone format không hợp lệ

- **Given**: `phone` = "abc123xyz"
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: phone format invalid

##### TC-CREATE-008: Validation error - salary âm

- **Given**: `salary` = -1000
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: salary must be >= 0

##### TC-CREATE-009: Validation error - hireDate trong tương lai

- **Given**: `hireDate` = ngày mai
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: hireDate cannot be in the future

##### TC-CREATE-010: Validation error - status không hợp lệ

- **Given**: `status` = "pending"
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: status must be either active or inactive

##### TC-CREATE-011: Conflict error - email đã tồn tại

- **Given**: Đã có employee với email "test@example.com"
- **When**: POST /api/employees với cùng email
- **Then**:
  - Status code: 409
  - Error message: Email already exists

##### TC-CREATE-012: Validation error - empty body

- **Given**: Request body = {}
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message chứa tất cả validation errors cho required fields

##### TC-CREATE-013: Validation error - name là empty string

- **Given**: `name` = ""
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: name should not be empty

##### TC-CREATE-014: Validation error - name chỉ chứa whitespace

- **Given**: `name` = " "
- **When**: POST /api/employees
- **Then**:
  - Status code: 400
  - Error message: name should not be empty (sau khi trim)

---

#### **TEST SUITE: GET /api/employees (Get All Employees)**

##### TC-GETALL-001: Lấy danh sách employees thành công (không có filter)

- **Given**: Database có 5 employees
- **When**: GET /api/employees
- **Then**:
  - Status code: 200
  - Response chứa array với 5 employees
  - Meta pagination đúng

##### TC-GETALL-002: Lấy danh sách employees với pagination

- **Given**: Database có 25 employees
- **When**: GET /api/employees?page=2&limit=10
- **Then**:
  - Status code: 200
  - Response chứa 10 employees (từ 11-20)
  - Meta: page=2, limit=10, total=25, totalPages=3

##### TC-GETALL-003: Search theo name - tìm thấy kết quả

- **Given**: Database có employees với name "John Doe", "Jane Doe", "Bob Smith"
- **When**: GET /api/employees?name=doe
- **Then**:
  - Status code: 200
  - Response chứa 2 employees (John Doe, Jane Doe)
  - Case-insensitive matching

##### TC-GETALL-004: Search theo name - không tìm thấy kết quả

- **Given**: Database có employees
- **When**: GET /api/employees?name=nonexistent
- **Then**:
  - Status code: 200
  - Response: data = [], total = 0

##### TC-GETALL-005: Search theo name - partial match

- **Given**: Database có employee "John Doe"
- **When**: GET /api/employees?name=Joh
- **Then**:
  - Status code: 200
  - Response chứa "John Doe"

##### TC-GETALL-006: Database trống

- **Given**: Database không có employees
- **When**: GET /api/employees
- **Then**:
  - Status code: 200
  - Response: data = [], total = 0

##### TC-GETALL-007: Validation error - page < 1

- **Given**: page = 0
- **When**: GET /api/employees?page=0
- **Then**:
  - Status code: 400
  - Error message: page must be >= 1

##### TC-GETALL-008: Validation error - limit > max

- **Given**: limit = 101
- **When**: GET /api/employees?limit=101
- **Then**:
  - Status code: 400
  - Error message: limit must be <= 100

##### TC-GETALL-009: Validation error - page không phải số

- **Given**: page = "abc"
- **When**: GET /api/employees?page=abc
- **Then**:
  - Status code: 400
  - Error message: page must be a number

##### TC-GETALL-010: Default pagination values

- **Given**: Database có 15 employees
- **When**: GET /api/employees (không truyền page, limit)
- **Then**:
  - Status code: 200
  - Response chứa 10 employees
  - Meta: page=1, limit=10

##### TC-GETALL-011: Search với special characters

- **Given**: Database có employee "O'Brien"
- **When**: GET /api/employees?name=O'Brien
- **Then**:
  - Status code: 200
  - Response chứa "O'Brien"

##### TC-GETALL-012: Kết hợp search và pagination

- **Given**: Database có 15 employees với "Doe" trong tên
- **When**: GET /api/employees?name=Doe&page=2&limit=10
- **Then**:
  - Status code: 200
  - Response chứa 5 employees (11-15)
  - Meta phản ánh đúng filtered results

---

#### **TEST SUITE: GET /api/employees/:id (Get Employee By ID)**

##### TC-GETONE-001: Lấy employee thành công

- **Given**: Database có employee với id hợp lệ
- **When**: GET /api/employees/{id}
- **Then**:
  - Status code: 200
  - Response chứa đầy đủ thông tin employee

##### TC-GETONE-002: Employee không tồn tại

- **Given**: ID không tồn tại trong database
- **When**: GET /api/employees/{nonexistent-uuid}
- **Then**:
  - Status code: 404
  - Error message: Employee not found

##### TC-GETONE-003: Validation error - ID không phải UUID

- **Given**: ID = "123"
- **When**: GET /api/employees/123
- **Then**:
  - Status code: 400
  - Error message: Invalid UUID format

##### TC-GETONE-004: Validation error - ID là empty string

- **Given**: ID = ""
- **When**: GET /api/employees/
- **Then**:
  - Status code: 404 (route not found) hoặc 400

##### TC-GETONE-005: Validation error - ID chứa special characters

- **Given**: ID = "abc-xyz-123!@#"
- **When**: GET /api/employees/abc-xyz-123!@#
- **Then**:
  - Status code: 400
  - Error message: Invalid UUID format

---

#### **TEST SUITE: PUT /api/employees/:id (Full Update Employee)**

##### TC-UPDATE-001: Cập nhật employee thành công với đầy đủ fields

- **Given**: Employee tồn tại trong database
- **When**: PUT /api/employees/{id} với tất cả fields hợp lệ
- **Then**:
  - Status code: 200
  - Response chứa dữ liệu đã cập nhật
  - `updatedAt` được cập nhật
  - Verify data trong database

##### TC-UPDATE-002: Cập nhật employee với required fields only

- **Given**: Employee tồn tại
- **When**: PUT /api/employees/{id} với chỉ name và email
- **Then**:
  - Status code: 200
  - Optional fields trước đó bị set về NULL

##### TC-UPDATE-003: Employee không tồn tại

- **Given**: ID không tồn tại
- **When**: PUT /api/employees/{nonexistent-uuid}
- **Then**:
  - Status code: 404
  - Error message: Employee not found

##### TC-UPDATE-004: Validation error - thiếu required field `name`

- **Given**: Employee tồn tại
- **When**: PUT /api/employees/{id} không có `name`
- **Then**:
  - Status code: 400
  - Error message chứa validation error

##### TC-UPDATE-005: Validation error - thiếu required field `email`

- **Given**: Employee tồn tại
- **When**: PUT /api/employees/{id} không có `email`
- **Then**:
  - Status code: 400
  - Error message chứa validation error

##### TC-UPDATE-006: Validation error - email format không hợp lệ

- **Given**: Employee tồn tại
- **When**: PUT với email = "invalid"
- **Then**:
  - Status code: 400
  - Error message: email must be a valid email

##### TC-UPDATE-007: Validation error - salary âm

- **Given**: Employee tồn tại
- **When**: PUT với salary = -500
- **Then**:
  - Status code: 400
  - Error message: salary must be >= 0

##### TC-UPDATE-008: Validation error - hireDate trong tương lai

- **Given**: Employee tồn tại
- **When**: PUT với hireDate = ngày mai
- **Then**:
  - Status code: 400
  - Error message: hireDate cannot be in the future

##### TC-UPDATE-009: Conflict error - email đã tồn tại (employee khác)

- **Given**:
  - Employee A với email "a@example.com"
  - Employee B với email "b@example.com"
- **When**: PUT /api/employees/{id-A} với email = "b@example.com"
- **Then**:
  - Status code: 409
  - Error message: Email already exists

##### TC-UPDATE-010: Cập nhật email thành chính email hiện tại (không conflict)

- **Given**: Employee với email "test@example.com"
- **When**: PUT với email = "test@example.com" (không đổi)
- **Then**:
  - Status code: 200
  - Cập nhật thành công

##### TC-UPDATE-011: Validation error - invalid UUID

- **Given**: ID = "123"
- **When**: PUT /api/employees/123
- **Then**:
  - Status code: 400
  - Error message: Invalid UUID format

##### TC-UPDATE-012: Validation error - empty body

- **Given**: Employee tồn tại
- **When**: PUT /api/employees/{id} với body = {}
- **Then**:
  - Status code: 400
  - Error message chứa validation errors cho required fields

##### TC-UPDATE-013: Cập nhật status từ active sang inactive

- **Given**: Employee với status = 'active'
- **When**: PUT với status = 'inactive'
- **Then**:
  - Status code: 200
  - Employee status = 'inactive'

##### TC-UPDATE-014: Validation error - status không hợp lệ

- **Given**: Employee tồn tại
- **When**: PUT với status = 'pending'
- **Then**:
  - Status code: 400
  - Error message: status must be either active or inactive

---

#### **TEST SUITE: PATCH /api/employees/:id (Partial Update Employee)**

##### TC-PATCH-001: Cập nhật một field thành công

- **Given**: Employee tồn tại
- **When**: PATCH /api/employees/{id} với { "name": "New Name" }
- **Then**:
  - Status code: 200
  - Chỉ `name` và `updatedAt` thay đổi
  - Các fields khác giữ nguyên
  - Verify data trong database

##### TC-PATCH-002: Cập nhật nhiều fields thành công

- **Given**: Employee tồn tại
- **When**: PATCH với { "name": "New Name", "department": "IT" }
- **Then**:
  - Status code: 200
  - `name` và `department` được cập nhật
  - Các fields khác giữ nguyên

##### TC-PATCH-003: Cập nhật tất cả optional fields

- **Given**: Employee tồn tại
- **When**: PATCH với tất cả optional fields
- **Then**:
  - Status code: 200
  - Tất cả fields được cập nhật

##### TC-PATCH-004: Employee không tồn tại

- **Given**: ID không tồn tại
- **When**: PATCH /api/employees/{nonexistent-uuid}
- **Then**:
  - Status code: 404
  - Error message: Employee not found

##### TC-PATCH-005: Validation error - empty body

- **Given**: Employee tồn tại
- **When**: PATCH /api/employees/{id} với body = {}
- **Then**:
  - Status code: 400
  - Error message: At least one field must be provided

##### TC-PATCH-006: Validation error - email format không hợp lệ

- **Given**: Employee tồn tại
- **When**: PATCH với { "email": "invalid" }
- **Then**:
  - Status code: 400
  - Error message: email must be a valid email

##### TC-PATCH-007: Validation error - salary âm

- **Given**: Employee tồn tại
- **When**: PATCH với { "salary": -100 }
- **Then**:
  - Status code: 400
  - Error message: salary must be >= 0

##### TC-PATCH-008: Validation error - hireDate trong tương lai

- **Given**: Employee tồn tại
- **When**: PATCH với { "hireDate": ngày mai }
- **Then**:
  - Status code: 400
  - Error message: hireDate cannot be in the future

##### TC-PATCH-009: Conflict error - email đã tồn tại

- **Given**:
  - Employee A với email "a@example.com"
  - Employee B với email "b@example.com"
- **When**: PATCH /api/employees/{id-A} với { "email": "b@example.com" }
- **Then**:
  - Status code: 409
  - Error message: Email already exists

##### TC-PATCH-010: Cập nhật email thành chính email hiện tại

- **Given**: Employee với email "test@example.com"
- **When**: PATCH với { "email": "test@example.com" }
- **Then**:
  - Status code: 200
  - Cập nhật thành công

##### TC-PATCH-011: Validation error - invalid UUID

- **Given**: ID = "abc"
- **When**: PATCH /api/employees/abc
- **Then**:
  - Status code: 400
  - Error message: Invalid UUID format

##### TC-PATCH-012: Set optional field về NULL

- **Given**: Employee có `phone` = "123456"
- **When**: PATCH với { "phone": null }
- **Then**:
  - Status code: 200
  - `phone` = NULL trong database

##### TC-PATCH-013: Validation error - name là empty string

- **Given**: Employee tồn tại
- **When**: PATCH với { "name": "" }
- **Then**:
  - Status code: 400
  - Error message: name should not be empty

##### TC-PATCH-014: Validation error - status không hợp lệ

- **Given**: Employee tồn tại
- **When**: PATCH với { "status": "suspended" }
- **Then**:
  - Status code: 400
  - Error message: status must be either active or inactive

##### TC-PATCH-015: Cập nhật chỉ updatedAt (không có field nào thay đổi về giá trị)

- **Given**: Employee với name = "John"
- **When**: PATCH với { "name": "John" } (cùng giá trị)
- **Then**:
  - Status code: 200
  - `updatedAt` vẫn được cập nhật

---

#### **TEST SUITE: DELETE /api/employees/:id (Delete Employee)**

##### TC-DELETE-001: Xóa employee thành công

- **Given**: Employee tồn tại trong database
- **When**: DELETE /api/employees/{id}
- **Then**:
  - Status code: 200 hoặc 204
  - Response message: "Employee deleted successfully"
  - Employee không còn tồn tại trong database

##### TC-DELETE-002: Employee không tồn tại

- **Given**: ID không tồn tại
- **When**: DELETE /api/employees/{nonexistent-uuid}
- **Then**:
  - Status code: 404
  - Error message: Employee not found

##### TC-DELETE-003: Validation error - invalid UUID

- **Given**: ID = "123"
- **When**: DELETE /api/employees/123
- **Then**:
  - Status code: 400
  - Error message: Invalid UUID format

##### TC-DELETE-004: Xóa employee đã xóa trước đó (idempotency)

- **Given**: Employee đã bị xóa
- **When**: DELETE /api/employees/{id} lần 2
- **Then**:
  - Status code: 404
  - Error message: Employee not found

##### TC-DELETE-005: Validation error - empty ID

- **Given**: ID = ""
- **When**: DELETE /api/employees/
- **Then**:
  - Status code: 404 (route not found) hoặc 400

##### TC-DELETE-006: Xóa employee và verify không ảnh hưởng employees khác

- **Given**: Database có 5 employees
- **When**: DELETE /api/employees/{id-of-employee-3}
- **Then**:
  - Status code: 200/204
  - Database còn 4 employees
  - 4 employees còn lại không bị ảnh hưởng

---

### 5.4 Test Data Fixtures

#### 5.4.1 Valid Employee Data

```typescript
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
```

#### 5.4.2 Minimal Valid Employee Data

```typescript
minimalEmployee = {
  name: "Jane Smith",
  email: "jane.smith@example.com",
};
```

#### 5.4.3 Invalid Data Examples

```typescript
// Invalid email
invalidEmail = { ...validEmployee, email: "not-an-email" };

// Negative salary
negativeSalary = { ...validEmployee, salary: -1000 };

// Future hire date
futureDate = { ...validEmployee, hireDate: "2030-01-01" };

// Invalid status
invalidStatus = { ...validEmployee, status: "pending" };

// Invalid phone
invalidPhone = { ...validEmployee, phone: "abc123" };

// Name too long
longName = { ...validEmployee, name: "A".repeat(256) };

// Empty name
emptyName = { ...validEmployee, name: "" };
```

---

### 5.5 Test Coverage Requirements

#### Minimum Coverage Targets:

- **Line Coverage**: >= 90%
- **Branch Coverage**: >= 85%
- **Function Coverage**: >= 90%

#### Areas Must Be Covered:

1. All API endpoints (6 endpoints)
2. All validation rules
3. All error scenarios (4xx, 5xx)
4. Database interactions (CRUD operations)
5. Edge cases (empty strings, null values, boundary values)
6. Conflict scenarios (unique constraint violations)

---

### 5.6 Test Execution

#### Run All Tests

```bash
npm run test:e2e
```

#### Run Specific Test Suite

```bash
npm run test:e2e -- employees.e2e-spec.ts
```

#### Run With Coverage

```bash
npm run test:e2e -- --coverage
```

---

## 6. ERROR HANDLING SPECIFICATION

### 6.1 Error Response Format

All errors should follow this consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    }
  ]
}
```

### 6.2 HTTP Status Codes

| Status Code | Meaning               | Use Case                                   |
| ----------- | --------------------- | ------------------------------------------ |
| 200         | OK                    | Successful GET, PUT, PATCH, DELETE         |
| 201         | Created               | Successful POST (create)                   |
| 204         | No Content            | Successful DELETE (alternative)            |
| 400         | Bad Request           | Validation errors, invalid input           |
| 404         | Not Found             | Resource not found                         |
| 409         | Conflict              | Unique constraint violation (email exists) |
| 500         | Internal Server Error | Unexpected server errors                   |

### 6.3 Error Messages

#### Validation Errors

- `name should not be empty`
- `name must be shorter than or equal to 255 characters`
- `email must be a valid email address`
- `email must be shorter than or equal to 255 characters`
- `phone must match the pattern /^[0-9+\-\s()]+$/`
- `phone must be shorter than or equal to 20 characters`
- `department must be shorter than or equal to 100 characters`
- `position must be shorter than or equal to 100 characters`
- `salary must be a positive number`
- `salary must be greater than or equal to 0`
- `hireDate must be a valid date`
- `hireDate cannot be in the future`
- `status must be one of the following values: active, inactive`
- `id must be a valid UUID`
- `page must be a positive integer`
- `limit must be a positive integer`
- `limit must not be greater than 100`

#### Not Found Errors

- `Employee with id {id} not found`

#### Conflict Errors

- `Employee with email {email} already exists`

---

## 7. DATABASE CONFIGURATION

### 7.1 Supabase Connection

**Environment Variables (.env)**:

```
POSTGRES_URI=postgresql://[user]:[password]@[host]:[port]/[database]
```

### 7.2 TypeORM Configuration

**Module**: `TypeOrmModule.forRoot()`

**Config**:

```typescript
{
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
}
```

### 7.3 Migrations

**Migration File Naming Convention**:

```
{timestamp}-CreateEmployeeTable.ts
```

**Migration Script Commands**:

```bash
# Generate migration
npm run migration:generate -- -n CreateEmployeeTable

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

---

## 8. PROJECT STRUCTURE

```
src/
├── employees/
│   ├── dto/
│   │   ├── create-employee.dto.ts
│   │   ├── update-employee.dto.ts
│   │   ├── patch-employee.dto.ts
│   │   └── query-employee.dto.ts
│   ├── entities/
│   │   └── employee.entity.ts
│   ├── employees.controller.ts
│   ├── employees.service.ts
│   └── employees.module.ts
├── database/
│   ├── migrations/
│   │   └── {timestamp}-CreateEmployeeTable.ts
│   └── database.module.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
├── app.module.ts
└── main.ts

test/
└── employees.e2e-spec.ts

.env
.env.test
package.json
tsconfig.json
```

---

## 9. DEPENDENCIES

### 9.1 Core Dependencies

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
  "dotenv": "^16.0.3"
}
```

### 9.2 Dev Dependencies

```json
{
  "@nestjs/testing": "^10.0.0",
  "@types/jest": "^29.5.0",
  "@types/node": "^20.0.0",
  "jest": "^29.5.0",
  "supertest": "^6.3.0",
  "ts-jest": "^29.1.0",
  "ts-node": "^10.9.0",
  "typescript": "^5.0.0"
}
```

---

## 10. NOTES & CONSTRAINTS

### 10.1 Business Rules

- Không có soft delete (hard delete only)
- Không có authentication/authorization (Admin role giả định có full access)
- Không có audit log
- Không có file upload
- Không có relationship với entities khác

### 10.2 Technical Constraints

- PoC project - KHÔNG tối ưu cho production
- Không cần implement caching
- Không cần implement rate limiting
- Không cần implement logging (optional)
- Synchronize: false để dùng migrations

### 10.3 Out of Scope

- Frontend
- Authentication/Authorization
- Role-based access control
- Email notifications
- Batch operations
- Import/Export CSV
- Soft delete
- Audit trails
- File uploads
- Advanced search (full-text search)

---

## 11. SUCCESS CRITERIA

### 11.1 Functional Requirements ✅

- [x] Tất cả 6 API endpoints hoạt động đúng
- [x] Validation hoạt động cho tất cả trường
- [x] Search theo name hoạt động (case-insensitive, partial match)
- [x] Pagination hoạt động đúng
- [x] Error handling đầy đủ

### 11.2 Testing Requirements ✅

- [x] Tất cả test cases được implement (60+ test cases)
- [x] Test coverage >= 90%
- [x] Tất cả tests pass
- [x] E2E tests cover all happy paths và error scenarios

### 11.3 Code Quality ✅

- [x] TypeScript strict mode
- [x] Consistent code style
- [x] DTOs có validation decorators đầy đủ
- [x] Entity có indexes phù hợp
- [x] Service layer có error handling

---

**END OF SPECIFICATION**

---

**Document Version**: 1.0  
**Created Date**: 2026-01-08  
**Author**: Senior Backend Developer  
**Status**: Ready for Implementation
