import { proxyActivities } from '@temporalio/workflow';
import type { OnboardingActivities } from '../activities/onboarding-activities.service';

const { 
  validateOnboardingData, 
  createUserActivity 
} = proxyActivities<OnboardingActivities>({
  startToCloseTimeout: '5 minutes',
});

export interface CreateUserWorkflowInput {
  userId: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateUserWorkflowResult {
  userId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function createUserWorkflow(
  input: CreateUserWorkflowInput,
): Promise<CreateUserWorkflowResult> {
  try {
    // Step 1: Validate user data
    await validateOnboardingData({
      name: input.name,
      email: input.email,
      customerName: input.name, // Use same name for validation
      customerPhone: '+1234567890', // Default phone for validation
    });

    // Step 2: Create user
    const userId = await createUserActivity({
      userId: input.userId,
      name: input.name,
      email: input.email,
      address: input.address,
    });

    return {
      userId,
      status: 'completed',
    };
  } catch (error) {
    return {
      userId: input.userId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
