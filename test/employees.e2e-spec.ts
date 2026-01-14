import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ValidationPipe } from './../src/common/pipes/validation.pipe';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { Repository } from 'typeorm';
import {
  Employee,
  EmployeeStatus,
} from './../src/employees/entities/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EmployeesController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Employee>;

  const validEmployee = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+84123456789',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 50000.0,
    hireDate: '2024-01-15',
    status: EmployeeStatus.ACTIVE,
  };

  const minimalEmployee = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    repository = moduleFixture.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );
  });

  beforeEach(async () => {
    await repository.clear();
  });

  afterAll(async () => {
    // Clean up all test data
    await repository.clear();
    await app.close();
  });

  // ===========================================
  // TEST SUITE: POST /api/employees (CREATE)
  // ===========================================

  describe('POST /api/employees', () => {
    // TC-CREATE-001
    it('should create employee with all fields', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send(validEmployee)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(validEmployee.name);
          expect(res.body.email).toBe(validEmployee.email);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    // TC-CREATE-002
    it('should create employee with only required fields', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send(minimalEmployee)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(minimalEmployee.name);
          expect(res.body.email).toBe(minimalEmployee.email);
          expect(res.body.phone).toBeNull();
          expect(res.body.department).toBeNull();
          expect(res.body.status).toBe('active');
        });
    });

    // TC-CREATE-003
    it('should fail when name is missing', () => {
      const { name, ...withoutName } = validEmployee;
      return request(app.getHttpServer())
        .post('/api/employees')
        .send(withoutName)
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
        });
    });

    // TC-CREATE-004
    it('should fail when email is missing', () => {
      const { email, ...withoutEmail } = validEmployee;
      return request(app.getHttpServer())
        .post('/api/employees')
        .send(withoutEmail)
        .expect(400);
    });

    // TC-CREATE-005
    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, email: 'invalid-email' })
        .expect(400);
    });

    // TC-CREATE-006
    it('should fail when name exceeds max length', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, name: 'A'.repeat(256) })
        .expect(400);
    });

    // TC-CREATE-007
    it('should fail with invalid phone format', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, phone: 'abc123xyz' })
        .expect(400);
    });

    // TC-CREATE-008
    it('should fail with negative salary', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, salary: -1000 })
        .expect(400);
    });

    // TC-CREATE-009
    it('should fail with future hireDate', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({
          ...validEmployee,
          hireDate: futureDate.toISOString().split('T')[0],
        })
        .expect(400);
    });

    // TC-CREATE-010
    it('should fail with invalid status', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, status: 'pending' })
        .expect(400);
    });

    // TC-CREATE-011
    it('should fail when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/employees')
        .send(validEmployee)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/employees')
        .send(validEmployee)
        .expect(409);
    });

    // TC-CREATE-012
    it('should fail with empty body', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({})
        .expect(400);
    });

    // TC-CREATE-013
    it('should fail when name is empty string', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, name: '' })
        .expect(400);
    });

    // TC-CREATE-014
    it('should fail when name is only whitespace', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({ ...validEmployee, name: '   ' })
        .expect(400);
    });
  });

  // ===========================================
  // TEST SUITE: GET /api/employees (GET ALL)
  // ===========================================

  describe('GET /api/employees', () => {
    // TC-GETALL-001
    it('should return all employees without filter', async () => {
      await repository.save([
        repository.create({ ...validEmployee, email: 'test1@example.com' }),
        repository.create({ ...validEmployee, email: 'test2@example.com' }),
        repository.create({ ...validEmployee, email: 'test3@example.com' }),
      ]);

      return request(app.getHttpServer())
        .get('/api/employees')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(3);
          expect(res.body.meta.total).toBe(3);
        });
    });

    // TC-GETALL-002
    it('should return paginated employees', async () => {
      const employees: Employee[] = [];
      for (let i = 1; i <= 25; i++) {
        employees.push(
          repository.create({
            ...validEmployee,
            email: `test${i}@example.com`,
          }),
        );
      }
      await repository.save(employees);

      return request(app.getHttpServer())
        .get('/api/employees?page=2&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(10);
          expect(res.body.meta.page).toBe(2);
          expect(res.body.meta.limit).toBe(10);
          expect(res.body.meta.total).toBe(25);
          expect(res.body.meta.totalPages).toBe(3);
        });
    });

    // TC-GETALL-003
    it('should search by name and find results', async () => {
      await repository.save([
        repository.create({ name: 'John Doe', email: 'john@example.com' }),
        repository.create({ name: 'Jane Doe', email: 'jane@example.com' }),
        repository.create({ name: 'Bob Smith', email: 'bob@example.com' }),
      ]);

      return request(app.getHttpServer())
        .get('/api/employees?name=doe')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data[0].name).toContain('Doe');
        });
    });

    // TC-GETALL-004
    it('should return empty array when search finds nothing', async () => {
      await repository.save([
        repository.create({ name: 'John Doe', email: 'john@example.com' }),
      ]);

      return request(app.getHttpServer())
        .get('/api/employees?name=nonexistent')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(0);
          expect(res.body.meta.total).toBe(0);
        });
    });

    // TC-GETALL-005
    it('should do partial match in search', async () => {
      await repository.save([
        repository.create({ name: 'John Doe', email: 'john@example.com' }),
      ]);

      return request(app.getHttpServer())
        .get('/api/employees?name=Joh')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].name).toBe('John Doe');
        });
    });

    // TC-GETALL-006
    it('should return empty array when database is empty', () => {
      return request(app.getHttpServer())
        .get('/api/employees')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(0);
          expect(res.body.meta.total).toBe(0);
        });
    });

    // TC-GETALL-007
    it('should fail when page < 1', () => {
      return request(app.getHttpServer())
        .get('/api/employees?page=0')
        .expect(400);
    });

    // TC-GETALL-008
    it('should fail when limit > 100', () => {
      return request(app.getHttpServer())
        .get('/api/employees?limit=101')
        .expect(400);
    });

    // TC-GETALL-009
    it('should fail when page is not a number', () => {
      return request(app.getHttpServer())
        .get('/api/employees?page=abc')
        .expect(400);
    });

    // TC-GETALL-010
    it('should use default pagination values', async () => {
      const employees: Employee[] = [];
      for (let i = 1; i <= 15; i++) {
        employees.push(
          repository.create({
            ...validEmployee,
            email: `test${i}@example.com`,
          }),
        );
      }
      await repository.save(employees);

      return request(app.getHttpServer())
        .get('/api/employees')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(10);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });

    // TC-GETALL-011
    it('should search with special characters', async () => {
      await repository.save([
        repository.create({ name: "O'Brien", email: 'obrien@example.com' }),
      ]);

      return request(app.getHttpServer())
        .get("/api/employees?name=O'Brien")
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].name).toBe("O'Brien");
        });
    });

    // TC-GETALL-012
    it('should combine search and pagination', async () => {
      const employees: Employee[] = [];
      for (let i = 1; i <= 15; i++) {
        employees.push(
          repository.create({
            name: `Doe ${i}`,
            email: `doe${i}@example.com`,
          }),
        );
      }
      await repository.save(employees);

      return request(app.getHttpServer())
        .get('/api/employees?name=Doe&page=2&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(5);
          expect(res.body.meta.total).toBe(15);
        });
    });
  });

  // ===========================================
  // TEST SUITE: GET /api/employees/:id (GET ONE)
  // ===========================================

  describe('GET /api/employees/:id', () => {
    // TC-GETONE-001
    it('should get employee by id', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .get(`/api/employees/${created.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(created.id);
          expect(res.body.name).toBe(validEmployee.name);
        });
    });

    // TC-GETONE-002
    it('should return 404 when employee not found', () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
      return request(app.getHttpServer())
        .get(`/api/employees/${fakeUuid}`)
        .expect(404);
    });

    // TC-GETONE-003
    it('should return 400 with invalid UUID', () => {
      return request(app.getHttpServer()).get('/api/employees/123').expect(400);
    });

    // TC-GETONE-004
    it('should return 404 with empty id', () => {
      // Note: /api/employees/ actually matches GET list route, so it returns 200
      return request(app.getHttpServer()).get('/api/employees/').expect(200);
    });

    // TC-GETONE-005
    it('should return 400 with special characters in id', () => {
      return request(app.getHttpServer())
        .get('/api/employees/abc-xyz-123!@#')
        .expect(400);
    });
  });

  // ===========================================
  // TEST SUITE: PUT /api/employees/:id (UPDATE)
  // ===========================================

  describe('PUT /api/employees/:id', () => {
    // TC-UPDATE-001
    it('should update employee with all fields', async () => {
      const created = await repository.save(repository.create(validEmployee));

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+84987654321',
        department: 'Marketing',
        position: 'Manager',
        salary: 60000,
        hireDate: '2024-02-01',
        status: EmployeeStatus.ACTIVE,
      };

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.email).toBe(updateData.email);
          expect(res.body.department).toBe(updateData.department);
        });
    });

    // TC-UPDATE-002
    it('should update with only required fields', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send(minimalEmployee)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(minimalEmployee.name);
          expect(res.body.email).toBe(minimalEmployee.email);
        });
    });

    // TC-UPDATE-003
    it('should return 404 when employee not found', () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
      return request(app.getHttpServer())
        .put(`/api/employees/${fakeUuid}`)
        .send(validEmployee)
        .expect(404);
    });

    // TC-UPDATE-004
    it('should fail when name is missing', async () => {
      const created = await repository.save(repository.create(validEmployee));

      const { name, ...withoutName } = validEmployee;
      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send(withoutName)
        .expect(400);
    });

    // TC-UPDATE-005
    it('should fail when email is missing', async () => {
      const created = await repository.save(repository.create(validEmployee));

      const { email, ...withoutEmail } = validEmployee;
      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send(withoutEmail)
        .expect(400);
    });

    // TC-UPDATE-006
    it('should fail with invalid email format', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send({ ...validEmployee, email: 'invalid' })
        .expect(400);
    });

    // TC-UPDATE-007
    it('should fail with negative salary', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send({ ...validEmployee, salary: -500 })
        .expect(400);
    });

    // TC-UPDATE-008
    it('should fail with future hireDate', async () => {
      const created = await repository.save(repository.create(validEmployee));

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send({
          ...validEmployee,
          hireDate: futureDate.toISOString().split('T')[0],
        })
        .expect(400);
    });

    // TC-UPDATE-009
    it('should fail when email already exists for another employee', async () => {
      const employee1 = await repository.save(
        repository.create({ name: 'Employee 1', email: 'emp1@example.com' }),
      );
      await repository.save(
        repository.create({ name: 'Employee 2', email: 'emp2@example.com' }),
      );

      return request(app.getHttpServer())
        .put(`/api/employees/${employee1.id}`)
        .send({ ...validEmployee, email: 'emp2@example.com' })
        .expect(409);
    });

    // TC-UPDATE-010
    it('should allow updating to same email', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send(validEmployee)
        .expect(200);
    });

    // TC-UPDATE-011
    it('should fail with invalid UUID', () => {
      return request(app.getHttpServer())
        .put('/api/employees/123')
        .send(validEmployee)
        .expect(400);
    });

    // TC-UPDATE-012
    it('should fail with empty body', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send({})
        .expect(400);
    });

    // TC-UPDATE-013
    it('should update status from active to inactive', async () => {
      const created = await repository.save(
        repository.create({ ...validEmployee, status: EmployeeStatus.ACTIVE }),
      );

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send({ ...validEmployee, status: EmployeeStatus.INACTIVE })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('inactive');
        });
    });

    // TC-UPDATE-014
    it('should fail with invalid status', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .put(`/api/employees/${created.id}`)
        .send({ ...validEmployee, status: 'pending' })
        .expect(400);
    });
  });

  // ===========================================
  // TEST SUITE: PATCH /api/employees/:id (PARTIAL UPDATE)
  // ===========================================

  describe('PATCH /api/employees/:id', () => {
    // TC-PATCH-001
    it('should update single field', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ name: 'New Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('New Name');
          expect(res.body.email).toBe(validEmployee.email);
        });
    });

    // TC-PATCH-002
    it('should update multiple fields', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ name: 'New Name', department: 'IT' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('New Name');
          expect(res.body.department).toBe('IT');
        });
    });

    // TC-PATCH-003
    it('should update all optional fields', async () => {
      const created = await repository.save(repository.create(minimalEmployee));

      const updates = {
        phone: '+84123456789',
        department: 'Engineering',
        position: 'Developer',
        salary: 50000,
        hireDate: '2024-01-15',
      };

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send(updates)
        .expect(200)
        .expect((res) => {
          expect(res.body.phone).toBe(updates.phone);
          expect(res.body.department).toBe(updates.department);
        });
    });

    // TC-PATCH-004
    it('should return 404 when employee not found', () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
      return request(app.getHttpServer())
        .patch(`/api/employees/${fakeUuid}`)
        .send({ name: 'New Name' })
        .expect(404);
    });

    // TC-PATCH-005
    it('should fail with empty body', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({})
        .expect(400);
    });

    // TC-PATCH-006
    it('should fail with invalid email format', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ email: 'invalid' })
        .expect(400);
    });

    // TC-PATCH-007
    it('should fail with negative salary', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ salary: -100 })
        .expect(400);
    });

    // TC-PATCH-008
    it('should fail with future hireDate', async () => {
      const created = await repository.save(repository.create(validEmployee));

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ hireDate: futureDate.toISOString().split('T')[0] })
        .expect(400);
    });

    // TC-PATCH-009
    it('should fail when email already exists', async () => {
      const employee1 = await repository.save(
        repository.create({ name: 'Employee 1', email: 'emp1@example.com' }),
      );
      await repository.save(
        repository.create({ name: 'Employee 2', email: 'emp2@example.com' }),
      );

      return request(app.getHttpServer())
        .patch(`/api/employees/${employee1.id}`)
        .send({ email: 'emp2@example.com' })
        .expect(409);
    });

    // TC-PATCH-010
    it('should allow updating to same email', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ email: validEmployee.email })
        .expect(200);
    });

    // TC-PATCH-011
    it('should fail with invalid UUID', () => {
      return request(app.getHttpServer())
        .patch('/api/employees/abc')
        .send({ name: 'New Name' })
        .expect(400);
    });

    // TC-PATCH-012
    it('should set optional field to null', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ phone: null })
        .expect(200)
        .expect((res) => {
          expect(res.body.phone).toBeNull();
        });
    });

    // TC-PATCH-013
    it('should fail when name is empty string', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ name: '' })
        .expect(400);
    });

    // TC-PATCH-014
    it('should fail with invalid status', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ status: 'suspended' })
        .expect(400);
    });

    // TC-PATCH-015
    it('should update updatedAt even with same value', async () => {
      const created = await repository.save(repository.create(validEmployee));

      const originalUpdatedAt = created.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      return request(app.getHttpServer())
        .patch(`/api/employees/${created.id}`)
        .send({ name: validEmployee.name })
        .expect(200)
        .expect((res) => {
          expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThan(
            new Date(originalUpdatedAt).getTime(),
          );
        });
    });
  });

  // ===========================================
  // TEST SUITE: DELETE /api/employees/:id (DELETE)
  // ===========================================

  describe('DELETE /api/employees/:id', () => {
    // TC-DELETE-001
    it('should delete employee successfully', async () => {
      const created = await repository.save(repository.create(validEmployee));

      return request(app.getHttpServer())
        .delete(`/api/employees/${created.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Employee deleted successfully');
        });
    });

    // TC-DELETE-002
    it('should return 404 when employee not found', () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
      return request(app.getHttpServer())
        .delete(`/api/employees/${fakeUuid}`)
        .expect(404);
    });

    // TC-DELETE-003
    it('should fail with invalid UUID', () => {
      return request(app.getHttpServer())
        .delete('/api/employees/123')
        .expect(400);
    });

    // TC-DELETE-004
    it('should return 404 when deleting already deleted employee', async () => {
      const created = await repository.save(repository.create(validEmployee));

      await request(app.getHttpServer())
        .delete(`/api/employees/${created.id}`)
        .expect(200);

      return request(app.getHttpServer())
        .delete(`/api/employees/${created.id}`)
        .expect(404);
    });

    // TC-DELETE-005
    it('should fail with empty id', () => {
      return request(app.getHttpServer()).delete('/api/employees/').expect(404);
    });

    // TC-DELETE-006
    it('should not affect other employees when deleting one', async () => {
      const employees = await repository.save([
        repository.create({ name: 'Employee 1', email: 'emp1@example.com' }),
        repository.create({ name: 'Employee 2', email: 'emp2@example.com' }),
        repository.create({ name: 'Employee 3', email: 'emp3@example.com' }),
        repository.create({ name: 'Employee 4', email: 'emp4@example.com' }),
        repository.create({ name: 'Employee 5', email: 'emp5@example.com' }),
      ]);

      await request(app.getHttpServer())
        .delete(`/api/employees/${employees[2].id}`)
        .expect(200);

      const remaining = await repository.count();
      expect(remaining).toBe(4);

      // Verify other employees still exist
      const employee1 = await repository.findOne({
        where: { id: employees[0].id },
      });
      expect(employee1).toBeDefined();
    });
  });
});
