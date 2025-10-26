import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { Phone } from '../../domain/value-objects/phone.vo';

export class CreateCustomerCommand {
  constructor(
    public readonly id: CustomerId,
    public readonly name: string,
    public readonly phone: Phone,
    public readonly userId: string,
  ) {}
}
