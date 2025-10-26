import { PaymentId } from '../../domain/value-objects/payment-id.vo';
import { Amount } from '../../domain/value-objects/amount.vo';

export class CreatePaymentCommand {
  constructor(
    public readonly paymentId: PaymentId,
    public readonly userId: string,
    public readonly customerId: string,
    public readonly amount: Amount,
  ) {}
}
