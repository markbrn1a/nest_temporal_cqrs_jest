export class PaymentResponseDto {
  id: string;
  userId: string;
  customerId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(payment: any) {
    this.id = payment.getId().getValue();
    this.userId = payment.getUserId();
    this.customerId = payment.getCustomerId();
    this.amount = payment.getAmount().getValue();
    this.status = payment.getStatus();
    this.createdAt = payment.getCreatedAt();
    this.updatedAt = payment.getUpdatedAt();
  }
}
