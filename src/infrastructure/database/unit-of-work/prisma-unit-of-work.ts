import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UnitOfWork, UnitOfWorkContext } from './unit-of-work.interface';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(operation: (uow: UnitOfWorkContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const context: UnitOfWorkContext = {
        transaction: tx,
      };

      return operation(context);
    });
  }
}
