import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '../../../../contexts/payment/application/commands/create-payment.command';
import { PaymentId } from '../../../../contexts/payment/domain/value-objects/payment-id.vo';
import { Amount } from '../../../../contexts/payment/domain/value-objects/amount.vo';

export interface ValidatePaymentInput {
  userId: string;
  customerId: string;
  amount: number;
}

export interface ProcessPaymentInput {
  paymentId: string;
  userId: string;
  customerId: string;
  amount: number;
}

export interface NotifyPaymentCompletedInput {
  paymentId: string;
  userId: string;
  customerId: string;
  amount: number;
}

@Injectable()
export class PaymentActivities {
  constructor(private readonly commandBus: CommandBus) {}

  async validatePayment(input: ValidatePaymentInput): Promise<void> {
    // Validate amount
    if (input.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (input.amount > 1000000) {
      throw new Error('Payment amount cannot exceed 1,000,000');
    }

    // Validate user and customer IDs
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    if (!input.customerId || input.customerId.trim().length === 0) {
      throw new Error('Customer ID is required');
    }
  }

  async processPayment(input: ProcessPaymentInput): Promise<string> {
    // Use CommandBus to create payment through proper CQRS flow
    const payment = await this.commandBus.execute(
      new CreatePaymentCommand(
        PaymentId.create(input.paymentId),
        input.userId,
        input.customerId,
        Amount.create(input.amount),
      ),
    );

    return payment.getId().getValue();
  }

  async notifyPaymentCompleted(input: NotifyPaymentCompletedInput): Promise<void> {
    // Simulate notification logic
    console.log(`Payment completed: ${input.paymentId} for user ${input.userId} to customer ${input.customerId} amount ${input.amount}`);
    
    // In a real application, this would:
    // - Send email notifications
    // - Update external systems
    // - Trigger other business processes
  }
}
