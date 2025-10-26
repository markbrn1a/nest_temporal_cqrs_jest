import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPaymentQuery } from '../get-payment.query';
import { Payment } from '../../../domain/entities/payment.entity';
import { PAYMENT_REPOSITORY } from '../../ports/payment-repository.port';
import { Inject } from '@nestjs/common';

@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: any,
  ) {}

  async execute(query: GetPaymentQuery): Promise<Payment | null> {
    return this.paymentRepository.findById(query.paymentId);
  }
}
