# 🧹 Test Data Management Guide

## Overview

Dự án có hệ thống quản lý test data tự động và manual để đảm bảo database test luôn clean.

---

## 🔄 Automatic Cleanup (Recommended)

### 1. **Before Each Test** (`beforeEach`)

```typescript
beforeEach(async () => {
  await repository.clear();
});
```

- Chạy trước **mỗi test case**
- Đảm bảo mỗi test bắt đầu với database rỗng
- Tránh test phụ thuộc lẫn nhau

### 2. **After All Tests** (`afterAll`)

```typescript
afterAll(async () => {
  // Clean up all test data
  await repository.clear();
  await app.close();
});
```

- Chạy sau khi **tất cả tests hoàn thành**
- Xóa toàn bộ data còn lại trong test database
- Đảm bảo database clean sau test suite

---

## 🛠️ Manual Cleanup

### Khi Nào Cần?

- Test bị interrupted (Ctrl+C giữa chừng)
- Muốn reset database trước khi re-run tests
- Debug và cần database clean state

### Cách Sử Dụng

```bash
# Xóa toàn bộ data trong test database
NODE_ENV=test npx ts-node test/clear-test-data.ts
```

### Output Mẫu

```
🗑️  Clearing test database...
📊 Found 15 employees in database
✅ Cleared! Remaining: 0 employees
✨ Done!
```

---

## 📋 Best Practices

### ✅ Do

1. **Luôn dùng separate test database**

   ```env
   # .env.test
   POSTGRES_URI=postgresql://user:pass@host:5432/test_db
   ```

2. **Run tests với NODE_ENV=test**

   ```bash
   NODE_ENV=test npm run test:e2e
   ```

3. **Verify database config trước khi test**
   - Check `.env.test` có đúng test database
   - Không bao giờ point đến production DB

### ❌ Don't

1. **Không dùng production database cho test**
   - Nguy hiểm: Tests sẽ xóa production data!
2. **Không skip cleanup hooks**
   - Có thể gây flaky tests
   - Database pollution

3. **Không hardcode data**
   - Dùng fixtures (`validEmployee`, `minimalEmployee`)
   - Dễ maintain và consistent

---

## 🔍 Troubleshooting

### Test Fails với "duplicate key error"

**Nguyên nhân**: Data từ test trước chưa được clear

**Giải pháp**:

```bash
# Manual clear
NODE_ENV=test npx ts-node test/clear-test-data.ts

# Re-run tests
NODE_ENV=test npm run test:e2e
```

### Database không clear sau tests

**Nguyên nhân**: Test bị interrupted hoặc error trong `afterAll`

**Giải pháp**:

```bash
# Force clear
NODE_ENV=test npx ts-node test/clear-test-data.ts
```

### Tests chạy chậm

**Nguyên nhân**: Quá nhiều clear operations

**Optimization**:

- Database đã clear đủ với `beforeEach` và `afterAll`
- Không cần thêm clear operations trong tests

---

## 📊 Data Lifecycle trong Tests

```
┌─────────────────────────────────────┐
│  beforeAll                          │
│  ├─ Setup NestJS App                │
│  └─ Get Repository                  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  beforeEach                         │
│  └─ clear() ← Clear all data        │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Test Case #1                       │
│  ├─ Create test data                │
│  ├─ Run test                        │
│  └─ Assertions                      │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  beforeEach                         │
│  └─ clear() ← Clear previous data   │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Test Case #2                       │
│  └─ ...                             │
└─────────────────────────────────────┘
           │
          ...
           │
           ▼
┌─────────────────────────────────────┐
│  afterAll                           │
│  ├─ clear() ← Final cleanup         │
│  └─ close() ← Close connections     │
└─────────────────────────────────────┘
```

---

## 🎯 Summary

| Method               | When             | Purpose       | Auto/Manual |
| -------------------- | ---------------- | ------------- | ----------- |
| `beforeEach`         | Before each test | Isolation     | ✅ Auto     |
| `afterAll`           | After all tests  | Final cleanup | ✅ Auto     |
| `clear-test-data.ts` | On demand        | Manual reset  | 🛠️ Manual   |

**Recommendation**: Rely on automatic cleanup. Only use manual script when needed for debugging or recovery.

---

**Last Updated**: January 9, 2026  
**Status**: ✅ Fully Automated
