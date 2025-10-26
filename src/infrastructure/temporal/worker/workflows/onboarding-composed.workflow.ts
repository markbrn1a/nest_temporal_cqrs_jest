import { executeChild } from '@temporalio/workflow';
import { createUserWorkflow } from './create-user.workflow';
import { createCustomerWorkflow } from './create-customer.workflow';

export interface OnboardingComposedWorkflowInput {
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

export interface OnboardingComposedWorkflowResult {
  userId: string;
  customerId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function onboardingComposedWorkflow(
  input: OnboardingComposedWorkflowInput,
): Promise<OnboardingComposedWorkflowResult> {
  try {
    // Step 1: Create User using child workflow
    const userResult = await executeChild(createUserWorkflow, {
      args: [{
        userId: input.userId,
        name: input.name,
        email: input.email,
        address: input.address,
      }],
      workflowId: `create-user-${input.userId}`,
    });

    if (userResult.status === 'failed') {
      return {
        userId: input.userId,
        customerId: '',
        status: 'failed',
        error: `User creation failed: ${userResult.error}`,
      };
    }

    // Step 2: Create Customer using child workflow
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerResult = await executeChild(createCustomerWorkflow, {
      args: [{
        customerId,
        userId: userResult.userId,
        name: input.customerName,
        phone: input.customerPhone,
      }],
      workflowId: `create-customer-${customerId}`,
    });

    if (customerResult.status === 'failed') {
      return {
        userId: userResult.userId,
        customerId: '',
        status: 'failed',
        error: `Customer creation failed: ${customerResult.error}`,
      };
    }

    return {
      userId: userResult.userId,
      customerId: customerResult.customerId,
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
