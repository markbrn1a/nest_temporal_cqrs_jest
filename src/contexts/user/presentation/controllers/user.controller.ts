import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { ListUsersQuery } from '../../application/queries/list-users.query';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserWithAddressCommand } from '../../application/commands/create-user-with-address.command';

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<{ message: string; status: string }> {
    const command = new CreateUserWithAddressCommand(
      dto.name,
      dto.email,
      dto.address,
    );

    return await this.commandBus.execute<CreateUserWithAddressCommand, { message: string; status: string }>(command);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const query = new GetUserQuery(id);
    const user = await this.queryBus.execute<GetUserQuery, User | null>(query);

    if (!user) {
      throw new Error('User not found');
    }

    return this.mapToResponse(user);
  }

  @Get()
  async listUsers(): Promise<UserResponseDto[]> {
    const query = new ListUsersQuery();
    const users = await this.queryBus.execute<ListUsersQuery, User[]>(query);

    return users.map((user) => this.mapToResponse(user));
  }

  private mapToResponse(user: User): UserResponseDto {
    const address = user.getAddress();
    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      address: {
        street: address.getStreet(),
        city: address.getCity(),
        zipCode: address.getZipCode(),
        country: address.getCountry(),
        fullAddress: address.getFullAddress(),
      },
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      accountAge: user.getAccountAge(),
    };
  }
}
