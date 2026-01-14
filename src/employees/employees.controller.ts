import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiEmailConflictResponse,
  ApiCommonErrorsWithId,
  ApiCommonUpdateErrors,
  ApiEmptyBodyResponse,
} from '../common/decorators/api-responses.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PatchEmployeeDto } from './dto/patch-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

@ApiTags('Employees')
@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new employee',
    description:
      'Creates a new employee with the provided information. Email must be unique.',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    description: 'Employee data to create',
    examples: {
      'Full employee': {
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+84123456789',
          department: 'Engineering',
          position: 'Senior Developer',
          salary: 50000.0,
          hireDate: '2024-01-15',
          status: 'active',
        },
      },
      'Minimal employee': {
        value: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Employee successfully created',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+84123456789',
        department: 'Engineering',
        position: 'Senior Developer',
        salary: 50000.0,
        hireDate: '2024-01-15',
        status: 'active',
        createdAt: '2024-01-09T10:00:00.000Z',
        updatedAt: '2024-01-09T10:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse()
  @ApiEmailConflictResponse()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all employees',
    description:
      'Retrieves a paginated list of employees with optional name search filter',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by employee name (case-insensitive, partial match)',
    example: 'John',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved employees list',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+84123456789',
            department: 'Engineering',
            position: 'Senior Developer',
            salary: 50000.0,
            hireDate: '2024-01-15',
            status: 'active',
            createdAt: '2024-01-09T10:00:00.000Z',
            updatedAt: '2024-01-09T10:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
        },
      },
    },
  })
  @ApiBadRequestResponse('Bad Request - Invalid query parameters')
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get employee by ID',
    description: 'Retrieves a single employee by their unique UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee found',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+84123456789',
        department: 'Engineering',
        position: 'Senior Developer',
        salary: 50000.0,
        hireDate: '2024-01-15',
        status: 'active',
        createdAt: '2024-01-09T10:00:00.000Z',
        updatedAt: '2024-01-09T10:00:00.000Z',
      },
    },
  })
  @ApiCommonErrorsWithId()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update employee (full)',
    description:
      'Performs a full update of employee data. All required fields must be provided.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateEmployeeDto,
    description: 'Complete employee data for update',
    examples: {
      'Update full': {
        value: {
          name: 'John Doe Updated',
          email: 'john.updated@example.com',
          phone: '+84987654321',
          department: 'Marketing',
          position: 'Manager',
          salary: 60000.0,
          hireDate: '2024-02-01',
          status: 'active',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully updated',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe Updated',
        email: 'john.updated@example.com',
        phone: '+84987654321',
        department: 'Marketing',
        position: 'Manager',
        salary: 60000.0,
        hireDate: '2024-02-01',
        status: 'active',
        createdAt: '2024-01-09T10:00:00.000Z',
        updatedAt: '2024-01-09T11:00:00.000Z',
      },
    },
  })
  @ApiCommonUpdateErrors()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update employee (partial)',
    description:
      'Performs a partial update. Only the provided fields will be updated. At least one field required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: PatchEmployeeDto,
    description: 'Fields to update (at least one required)',
    examples: {
      'Update single field': {
        value: {
          name: 'New Name',
        },
      },
      'Update multiple fields': {
        value: {
          name: 'New Name',
          department: 'IT',
          salary: 55000,
        },
      },
      'Update status': {
        value: {
          status: 'inactive',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully updated',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Name',
        email: 'john.doe@example.com',
        phone: '+84123456789',
        department: 'IT',
        position: 'Senior Developer',
        salary: 55000.0,
        hireDate: '2024-01-15',
        status: 'active',
        createdAt: '2024-01-09T10:00:00.000Z',
        updatedAt: '2024-01-09T11:30:00.000Z',
      },
    },
  })
  @ApiEmptyBodyResponse()
  @ApiCommonUpdateErrors()
  patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() patchEmployeeDto: PatchEmployeeDto,
  ) {
    // Validate at least one field is provided with a defined value
    const hasAtLeastOneField = Object.values(patchEmployeeDto).some(
      (value) => value !== undefined,
    );
    if (!hasAtLeastOneField) {
      throw new BadRequestException('At least one field must be provided');
    }
    return this.employeesService.patch(id, patchEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete employee',
    description: 'Permanently deletes an employee from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully deleted',
    schema: {
      example: {
        message: 'Employee deleted successfully',
      },
    },
  })
  @ApiCommonErrorsWithId()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.remove(id);
  }
}
