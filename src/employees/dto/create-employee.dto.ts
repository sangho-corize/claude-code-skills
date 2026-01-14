import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmployeeStatus } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim?.(), { toClassOnly: true })
  name: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value?.toLowerCase?.(), { toClassOnly: true })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'phone must contain only numbers, +, -, spaces, and parentheses',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim?.(), { toClassOnly: true })
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim?.(), { toClassOnly: true })
  position?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary?: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
