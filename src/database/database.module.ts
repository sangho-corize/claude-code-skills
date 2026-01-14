import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('POSTGRES_URI');
        return {
          type: 'postgres' as const,
          url: uri,
          entities: [Employee],
          synchronize: true, // Only for development/testing
        };
      },
    }),
  ],
})
export class DatabaseModule {}
