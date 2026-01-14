# Employee Service Documentation

## Overview

Employee Service là module quản lý thông tin nhân viên trong hệ thống. Service này cung cấp các API để thực hiện các thao tác CRUD (Create, Read, Update, Delete) và các chức năng nâng cao khác liên quan đến quản lý nhân viên.

## Tài liệu

### 📋 [Specification](./spec.md)

Đặc tả kỹ thuật chi tiết của Employee Service, bao gồm:

- API endpoints và parameters
- Data models và entities
- Business logic và validation rules
- Error handling
- Dependencies

### 📝 [Implementation Plan](./plan.md)

Kế hoạch triển khai chi tiết, bao gồm:

- Roadmap theo từng phase
- Checklist các tính năng cần implement
- Testing strategy
- Timeline ước tính

## Quick Start

### Entity Location

```
src/employees/entities/employee.entity.ts
```

### Service Location

```
src/employees/employees.service.ts
```

### Controller Location

```
src/employees/employees.controller.ts
```

### Main Features

- ✅ Employee CRUD operations
- ✅ Pagination và filtering
- ✅ Input validation
- ✅ Swagger API documentation

## API Endpoints Summary

- `GET /employees` - Lấy danh sách nhân viên
- `GET /employees/:id` - Lấy thông tin một nhân viên
- `POST /employees` - Tạo nhân viên mới
- `PUT /employees/:id` - Cập nhật thông tin nhân viên
- `DELETE /employees/:id` - Xóa nhân viên

## Contributing

Khi thực hiện thay đổi cho service này:

1. Cập nhật đặc tả trong `spec.md` nếu có thay đổi API hoặc model
2. Cập nhật checklist trong `plan.md` để theo dõi tiến độ
3. Thêm tests cho các tính năng mới
4. Cập nhật Swagger documentation

## Related Documentation

- [Test Data Management](../../TEST_DATA_MANAGEMENT.md)
- [Implementation Plan (Legacy)](../IMPLEMENTATION_PLAN.md)

---

Last updated: 2026-01-14
