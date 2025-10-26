import { proxyActivities } from '@temporalio/workflow';
import type { OnboardingActivities } from '../activities/onboarding-activities.service';

const { 
  validateOnboardingData, 
  createUserActivity, 
  createCustomerActivity, 
  notifyOnboardingCompleted 
} = proxyActivities<OnboardingActivities>({
  startToCloseTimeout: '5 minutes',
});

export interface ProcessOnboardingWorkflowInput {
  userId: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  customerName: string;
  customerPhone: string;
}

export interface ProcessOnboardingWorkflowResult {
  userId: string;
  customerId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function processOnboardingWorkflow(
  input: ProcessOnboardingWorkflowInput,
): Promise<ProcessOnboardingWorkflowResult> {
  try {
    // Step 1: Validate onboarding data
    await validateOnboardingData({
      name: input.name,
      email: input.email,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    });

    // Step 2: Create user through CQRS command
    const userId = await createUserActivity({
      userId: input.userId,
      name: input.name,
      email: input.email,
      address: input.address,
    });

    // Step 3: Create customer through CQRS command
    const customerId = await createCustomerActivity({
      userId: userId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    });

    // Step 4: Notify onboarding completed
    await notifyOnboardingCompleted({
      userId: userId,
      customerId: customerId,
      name: input.name,
      email: input.email,
      customerPhone: input.customerPhone,
    });

    return {
      userId,
      customerId,
      status: 'completed',
    };
  } catch (error) {
    return {
      userId: input.userId,
      customerId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
