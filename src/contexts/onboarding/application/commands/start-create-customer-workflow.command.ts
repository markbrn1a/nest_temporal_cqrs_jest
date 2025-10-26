export class StartCreateCustomerWorkflowCommand {
  constructor(
    public readonly customerId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly phone: string,
  ) {}
}
