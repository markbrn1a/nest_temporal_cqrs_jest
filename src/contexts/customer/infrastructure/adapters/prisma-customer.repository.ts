import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CustomerRepositoryPort } from '../../application/ports/customer-repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { Phone } from '../../domain/value-objects/phone.vo';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: Customer): Promise<void> {
    const customerData = {
      id: customer.getId().getValue(),
      name: customer.getName(),
      phone: customer.getPhone().getValue(),
      userId: customer.getUserId(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    };

    await this.prisma.customer.upsert({
      where: { id: customerData.id },
      update: {
        name: customerData.name,
        phone: customerData.phone,
        updatedAt: customerData.updatedAt,
      },
      create: customerData,
    });
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: id.getValue() },
    });

    if (!customer) return null;

    return Customer.reconstitute(
      CustomerId.create(customer.id),
      customer.name,
      Phone.create(customer.phone),
      customer.userId,
      customer.createdAt,
      customer.updatedAt,
    );
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) return null;

    return Customer.reconstitute(
      CustomerId.create(customer.id),
      customer.name,
      Phone.create(customer.phone),
      customer.userId,
      customer.createdAt,
      customer.updatedAt,
    );
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((customer) =>
      Customer.reconstitute(
        CustomerId.create(customer.id),
        customer.name,
        Phone.create(customer.phone),
        customer.userId,
        customer.createdAt,
        customer.updatedAt,
      )
    );
  }
}
