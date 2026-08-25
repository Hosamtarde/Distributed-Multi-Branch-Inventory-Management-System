import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './users/enums/role.enum';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const testAccounts = [
    { email: 'admin@test.com', fullName: 'Admin User', role: Role.ADMIN },
    { email: 'manager@test.com', fullName: 'Branch Manager', role: Role.BRANCH_MANAGER },
    { email: 'staff@test.com', fullName: 'Staff User', role: Role.STAFF },
  ];

  for (const account of testAccounts) {
    const existing = await usersRepository.findOne({ where: { email: account.email } });

    if (existing) {
      existing.role = account.role;
      await usersRepository.save(existing);
      console.log(`Updated: ${account.email} → ${account.role}`);
    } else {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const newUser = usersRepository.create({
        email: account.email,
        password: hashedPassword,
        fullName: account.fullName,
        role: account.role,
      });
      await usersRepository.save(newUser);
      console.log(`Created: ${account.email} → ${account.role}`);
    }
  }

  await app.close();
  console.log('Seeding complete!');
}

seed();