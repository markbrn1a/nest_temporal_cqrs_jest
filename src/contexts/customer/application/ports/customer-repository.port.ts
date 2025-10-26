import { Customer } from '../../domain/entities/customer.entity';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
}
