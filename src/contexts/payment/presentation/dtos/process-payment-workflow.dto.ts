import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class ProcessPaymentWorkflowDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
