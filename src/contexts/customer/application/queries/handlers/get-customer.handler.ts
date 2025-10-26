import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { GetCustomerQuery } from '../get-customer.query';
import { Customer } from '../../../domain/entities/customer.entity';
import { type CustomerRepositoryPort, CUSTOMER_REPOSITORY } from '../../ports/customer-repository.port';

@Injectable()
@QueryHandler(GetCustomerQuery)
export class GetCustomerHandler implements IQueryHandler<GetCustomerQuery> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(query: GetCustomerQuery): Promise<Customer | null> {
    return this.customerRepository.findById(query.id);
  }
}
