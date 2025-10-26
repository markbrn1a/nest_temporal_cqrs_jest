import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ListCustomersQuery } from '../list-customers.query';
import { Customer } from '../../../domain/entities/customer.entity';
import { type CustomerRepositoryPort, CUSTOMER_REPOSITORY } from '../../ports/customer-repository.port';

@Injectable()
@QueryHandler(ListCustomersQuery)
export class ListCustomersHandler implements IQueryHandler<ListCustomersQuery> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(query: ListCustomersQuery): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }
}
