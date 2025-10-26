import { Controller, Get, Post, Body, Param, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { CustomerResponseDto } from '../dtos/customer-response.dto';
import { CreateCustomerCommand } from '../../application/commands/create-customer.command';
import { GetCustomerQuery } from '../../application/queries/get-customer.query';
import { ListCustomersQuery } from '../../application/queries/list-customers.query';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { Phone } from '../../domain/value-objects/phone.vo';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customerId = CustomerId.create();
    const phone = Phone.create(createCustomerDto.phone);
    
    const command = new CreateCustomerCommand(
      customerId,
      createCustomerDto.name,
      phone,
      '', // userId will be set by the saga
    );

    const customer = await this.commandBus.execute(command);

    return new CustomerResponseDto(
      customer.getId().getValue(),
      customer.getName(),
      customer.getPhone().getValue(),
      customer.getUserId(),
      customer.getCreatedAt(),
      customer.getUpdatedAt(),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CustomerResponseDto | null> {
    const query = new GetCustomerQuery(CustomerId.create(id));
    const customer = await this.queryBus.execute(query);

    if (!customer) return null;

    return new CustomerResponseDto(
      customer.getId().getValue(),
      customer.getName(),
      customer.getPhone().getValue(),
      customer.getUserId(),
      customer.getCreatedAt(),
      customer.getUpdatedAt(),
    );
  }

  @Get()
  async findAll(): Promise<CustomerResponseDto[]> {
    const query = new ListCustomersQuery();
    const customers = await this.queryBus.execute(query);

    return customers.map((customer) =>
      new CustomerResponseDto(
        customer.getId().getValue(),
        customer.getName(),
        customer.getPhone().getValue(),
        customer.getUserId(),
        customer.getCreatedAt(),
        customer.getUpdatedAt(),
      )
    );
  }
}
