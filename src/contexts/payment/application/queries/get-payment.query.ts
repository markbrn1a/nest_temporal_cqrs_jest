import { PaymentId } from '../../domain/value-objects/payment-id.vo';

export class GetPaymentQuery {
  constructor(public readonly paymentId: PaymentId) {}
}
