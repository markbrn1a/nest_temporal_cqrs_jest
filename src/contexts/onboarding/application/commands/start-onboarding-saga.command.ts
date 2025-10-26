export class StartOnboardingCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    },
    public readonly customerName: string,
    public readonly customerPhone: string,
  ) {}
}
