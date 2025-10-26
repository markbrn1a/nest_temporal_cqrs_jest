import { CustomerId } from '../../domain/value-objects/customer-id.vo';

export class GetCustomerQuery {
  constructor(public readonly id: CustomerId) {}
}
