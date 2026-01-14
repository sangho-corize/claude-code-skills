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
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmployeeStatus } from '../entities/employee.entity';

// PATCH allows partial update - all fields optional
export class PatchEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim?.(), { toClassOnly: true })
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value?.toLowerCase?.(), { toClassOnly: true })
  email?: string;

  @ValidateIf((o: PatchEmployeeDto) => o.phone !== null)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'phone must contain only numbers, +, -, spaces, and parentheses',
  })
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim?.(), { toClassOnly: true })
  department?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim?.(), { toClassOnly: true })
  position?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary?: number | null;

  @IsOptional()
  @IsDateString()
  hireDate?: string | null;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
