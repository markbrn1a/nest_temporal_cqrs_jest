import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StartOnboardingDto } from '../dtos/start-onboarding.dto';
import { StartOnboardingCommand } from '../../application/commands/start-onboarding-saga.command';
import { StartOnboardingTemporalCommand } from '../../application/commands/start-onboarding-temporal.command';
import { StartCreateUserWorkflowCommand } from '../../application/commands/start-create-user-workflow.command';
import { StartCreateCustomerWorkflowCommand } from '../../application/commands/start-create-customer-workflow.command';
import { StartOnboardingComposedWorkflowCommand } from '../../application/commands/start-onboarding-composed-workflow.command';
import { CreateUserWorkflowDto, CreateCustomerWorkflowDto, OnboardingComposedWorkflowDto } from '../dtos/workflow-dtos';
import { randomUUID } from 'crypto';
import { OnboardUserDto } from '../dtos/onboard-user.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('saga')
  async startOnboardingSaga(@Body(ValidationPipe) dto: StartOnboardingDto): Promise<{ message: string; status: string }> {
    const userId = randomUUID();
    
    const command = new StartOnboardingCommand(
      userId,
      dto.name,
      dto.email,
      {
        street: dto.street,
        city: dto.city,
        zipCode: dto.zipCode,
        country: dto.country,
      },
      dto.customerName,
      dto.customerPhone,
    );

    await this.commandBus.execute(command);

    return {
      message: 'Onboarding saga initiated successfully',
      status: 'success',
    };
  }

  @Post('workflows/create-user')
  async startCreateUserWorkflow(@Body(ValidationPipe) dto: CreateUserWorkflowDto): Promise<{ workflowId: string; message: string }> {
    const command = new StartCreateUserWorkflowCommand(
      dto.userId,
      dto.name,
      dto.email,
      dto.address,
    );

    return await this.commandBus.execute(command);
  }

  @Post('workflows/create-customer')
  async startCreateCustomerWorkflow(@Body(ValidationPipe) dto: CreateCustomerWorkflowDto): Promise<{ workflowId: string; message: string }> {
    const command = new StartCreateCustomerWorkflowCommand(
      dto.customerId,
      dto.userId,
      dto.name,
      dto.phone,
    );

    return await this.commandBus.execute(command);
  }

  @Post('workflows/composed')
  async startOnboardingComposedWorkflow(@Body(ValidationPipe) dto: OnboardingComposedWorkflowDto): Promise<{ workflowId: string; message: string }> {
    const command = new StartOnboardingComposedWorkflowCommand(
      dto.userId,
      dto.name,
      dto.email,
      dto.address,
      dto.customerName,
      dto.customerPhone,
    );

    return await this.commandBus.execute(command);
  }


  @Post('workflows/onboard-temporal')
  async onboardUserWithTemporal(@Body(ValidationPipe) dto: OnboardUserDto): Promise<{ message: string; status: string; workflowId: string }> {
    const address = {
      street: dto.street,
      city: dto.city,
      zipCode: dto.zipCode,
      country: dto.country,
    };

    const command = new StartOnboardingTemporalCommand(
      '', // userId will be generated
      dto.name,
      dto.email,
      address,
      dto.customerName,
      dto.customerPhone,
    );

    const result = await this.commandBus.execute(command);

    return {
      message: 'Onboarding workflow started successfully',
      status: 'success',
      workflowId: result.workflowId,
    };
  }
}
