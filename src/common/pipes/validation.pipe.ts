import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform to class instance for validation and transformation
    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((err) => {
        return Object.values(err.constraints || {}).join(', ');
      });
      throw new BadRequestException({
        message: messages,
        error: 'Validation failed',
      });
    }

    // Return plain object with transforms applied (not class instance)
    // This prevents class-transformer from re-serializing and breaking responses
    return object;
  }

  private toValidate(metatype: NewableFunction): boolean {
    const types: NewableFunction[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
