import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentRepositoryPort } from '../../application/ports/payment-repository.port';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentId } from '../../domain/value-objects/payment-id.vo';
import { Amount } from '../../domain/value-objects/amount.vo';
import { PaymentStatus } from '../../domain/entities/payment.entity';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(payment: Payment): Promise<void> {
    const paymentData = {
      id: payment.getId().getValue(),
      userId: payment.getUserId(),
      customerId: payment.getCustomerId(),
      amount: payment.getAmount().getValue(),
      status: payment.getStatus(),
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };

    await this.prisma.payment.upsert({
      where: { id: paymentData.id },
      update: {
        amount: paymentData.amount,
        status: paymentData.status,
        updatedAt: paymentData.updatedAt,
      },
      create: paymentData,
    });
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: id.getValue() },
    });

    if (!payment) return null;

    return Payment.fromPersistence(
      PaymentId.create(payment.id),
      payment.userId,
      payment.customerId,
      Amount.create(payment.amount),
      payment.status as PaymentStatus,
      payment.createdAt,
      payment.updatedAt,
    );
  }

  async findAll(): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => Payment.fromPersistence(
      PaymentId.create(payment.id),
      payment.userId,
      payment.customerId,
      Amount.create(payment.amount),
      payment.status as PaymentStatus,
      payment.createdAt,
      payment.updatedAt,
    ));
  }
}
