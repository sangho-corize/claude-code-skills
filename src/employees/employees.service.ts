import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PatchEmployeeDto } from './dto/patch-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    await this.validateEmailUniqueness(createEmployeeDto.email);
    this.validateHireDateNotInFuture(createEmployeeDto.hireDate);

    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async findAll(query: QueryEmployeeDto) {
    const { name, page = 1, limit = 10 } = query;

    const where = this.buildSearchConditions(name);
    const skip = this.calculateSkipOffset(page, limit);

    const [data, total] = await this.employeeRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    });

    return this.buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    await this.validateEmailUniquenessForUpdate(
      updateEmployeeDto.email,
      employee.email,
    );
    this.validateHireDateNotInFuture(updateEmployeeDto.hireDate);

    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async patch(
    id: string,
    patchEmployeeDto: PatchEmployeeDto,
  ): Promise<Employee> {
    this.validateNonEmptyUpdate(patchEmployeeDto);

    const employee = await this.findOne(id);

    await this.validateEmailUniquenessForUpdate(
      patchEmployeeDto.email,
      employee.email,
    );
    this.validateHireDateNotInFuture(patchEmployeeDto.hireDate);

    this.applyPartialUpdate(employee, patchEmployeeDto);

    await this.employeeRepository.save(employee);

    // Reload to ensure all fields are populated correctly
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
    return { message: 'Employee deleted successfully' };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Validates that the email is not already taken by another employee
   */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const employeeWithEmail = await this.employeeRepository.findOne({
      where: { email },
    });

    if (employeeWithEmail) {
      throw new ConflictException(
        `Employee with email ${email} already exists`,
      );
    }
  }

  /**
   * Validates email uniqueness when updating, allowing same email for current employee
   */
  private async validateEmailUniquenessForUpdate(
    newEmail: string | undefined,
    currentEmail: string,
  ): Promise<void> {
    // Skip validation if email is not being changed
    if (!newEmail || newEmail === currentEmail) {
      return;
    }

    await this.validateEmailUniqueness(newEmail);
  }

  /**
   * Validates that hire date is not in the future
   */
  private validateHireDateNotInFuture(
    hireDate: string | null | undefined,
  ): void {
    if (!hireDate) {
      return;
    }

    const hireDateObj = new Date(hireDate);
    const today = this.getTodayAtMidnight();

    if (hireDateObj > today) {
      throw new BadRequestException('hireDate cannot be in the future');
    }
  }

  /**
   * Gets today's date at midnight for date comparisons
   */
  private getTodayAtMidnight(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Validates that PATCH request has at least one field to update
   */
  private validateNonEmptyUpdate(dto: Record<string, any>): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }
  }

  /**
   * Applies partial update and forces timestamp refresh
   */
  private applyPartialUpdate(
    employee: Employee,
    updates: PatchEmployeeDto,
  ): void {
    Object.assign(employee, updates);
    employee.updatedAt = new Date(); // Force timestamp update
  }

  /**
   * Builds search conditions for name filtering
   */
  private buildSearchConditions(name?: string) {
    const where: { name?: ReturnType<typeof ILike<string>> } = {};

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    return where;
  }

  /**
   * Calculates skip offset for pagination
   */
  private calculateSkipOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Builds paginated response with data and metadata
   */
  private buildPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
