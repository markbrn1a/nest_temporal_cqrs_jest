import { proxyActivities } from '@temporalio/workflow';
import type { OnboardingActivities } from '../activities/onboarding-activities.service';

const { 
  validateOnboardingData, 
  createCustomerActivity 
} = proxyActivities<OnboardingActivities>({
  startToCloseTimeout: '5 minutes',
});

export interface CreateCustomerWorkflowInput {
  customerId: string;
  userId: string;
  name: string;
  phone: string;
}

export interface CreateCustomerWorkflowResult {
  customerId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function createCustomerWorkflow(
  input: CreateCustomerWorkflowInput,
): Promise<CreateCustomerWorkflowResult> {
  try {
    // Step 1: Validate customer data
    await validateOnboardingData({
      name: input.name,
      email: 'customer@example.com', // Default email for validation
      customerName: input.name,
      customerPhone: input.phone,
    });

    // Step 2: Create customer
    const customerId = await createCustomerActivity({
      userId: input.userId,
      customerName: input.name,
      customerPhone: input.phone,
    });

    return {
      customerId,
      status: 'completed',
    };
  } catch (error) {
    return {
      customerId: input.customerId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
