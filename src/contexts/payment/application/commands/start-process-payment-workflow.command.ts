export class StartProcessPaymentWorkflowCommand {
  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly customerId: string,
    public readonly amount: number,
  ) {}
}
