import { proxyActivities } from '@temporalio/workflow';
import type { PaymentActivities } from '../activities/payment-activities.service';

const { 
  validatePayment, 
  processPayment, 
  notifyPaymentCompleted 
} = proxyActivities<PaymentActivities>({
  startToCloseTimeout: '5 minutes',
});

export interface ProcessPaymentWorkflowInput {
  paymentId: string;
  userId: string;
  customerId: string;
  amount: number;
}

export interface ProcessPaymentWorkflowResult {
  paymentId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function processPaymentWorkflow(
  input: ProcessPaymentWorkflowInput,
): Promise<ProcessPaymentWorkflowResult> {
  try {
    // Step 1: Validate payment data
    await validatePayment({
      userId: input.userId,
      customerId: input.customerId,
      amount: input.amount,
    });

    // Step 2: Process payment through CQRS command
    const paymentId = await processPayment({
      paymentId: input.paymentId,
      userId: input.userId,
      customerId: input.customerId,
      amount: input.amount,
    });

    // Step 3: Notify payment completed
    await notifyPaymentCompleted({
      paymentId: paymentId,
      userId: input.userId,
      customerId: input.customerId,
      amount: input.amount,
    });

    return {
      paymentId,
      status: 'completed',
    };
  } catch (error) {
    return {
      paymentId: input.paymentId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
