import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../src/employees/entities/employee.entity';
import { Repository } from 'typeorm';

/**
 * Script to clear all employee data from test database
 * Usage: NODE_ENV=test ts-node test/clear-test-data.ts
 */
async function clearTestData() {
  console.log('🗑️  Clearing test database...');

  const app = await NestFactory.create(AppModule);
  const repository = app.get<Repository<Employee>>(
    getRepositoryToken(Employee),
  );

  const countBefore = await repository.count();
  console.log(`📊 Found ${countBefore} employees in database`);

  await repository.clear();

  const countAfter = await repository.count();
  console.log(`✅ Cleared! Remaining: ${countAfter} employees`);

  await app.close();
  console.log('✨ Done!');
}

clearTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
