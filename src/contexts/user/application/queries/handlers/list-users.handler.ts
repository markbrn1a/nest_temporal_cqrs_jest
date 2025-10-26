import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ListUsersQuery } from '../list-users.query';
import { User } from '../../../domain/entities/user.entity';
import { type UserRepositoryPort, USER_REPOSITORY } from '../../ports/user-repository.port';

@Injectable()
@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(query: ListUsersQuery): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
