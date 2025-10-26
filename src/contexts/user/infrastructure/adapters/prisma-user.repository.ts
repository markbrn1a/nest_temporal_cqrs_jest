import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UserRepositoryPort } from '../../application/ports/user-repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { Address } from '../../domain/value-objects/address.vo';
import { Prisma } from '@prisma/client';


@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}
  async save(user: User): Promise<void> {
    const address = user.getAddress();
    const addressData = {
      id: user.getAddressId(),
      street: address.getStreet(),
      city: address.getCity(),
      zipCode: address.getZipCode(),
      country: address.getCountry(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    const userData = {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      addressId: user.getAddressId(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    // First, create/update the address
    await this.prisma.address.upsert({
      where: { id: addressData.id },
      update: {
        street: addressData.street,
        city: addressData.city,
        zipCode: addressData.zipCode,
        country: addressData.country,
        updatedAt: addressData.updatedAt,
      },
      create: addressData,
    });

    // Then, create/update the user
    await this.prisma.user.upsert({
      where: { id: userData.id },
      update: {
        name: userData.name,
        email: userData.email,
        addressId: userData.addressId,
        updatedAt: userData.updatedAt,
      },
      create: userData,
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
      include: { address: true },
    });

    if (!user) return null;

    // Create User with Address value object
    const address = Address.create(
      user.address.street,
      user.address.city,
      user.address.zipCode,
      user.address.country,
    );

    const userEntity = new User(
      new UserId(user.id),
      user.name,
      new Email(user.email),
      address,
      user.addressId,
      user.createdAt,
      user.updatedAt,
    );

    return userEntity;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
      include: { address: true },
    });

    if (!user) return null;

    // Create User with Address value object
    const address = Address.create(
      user.address.street,
      user.address.city,
      user.address.zipCode,
      user.address.country,
    );

    const userEntity = new User(
      new UserId(user.id),
      user.name,
      new Email(user.email),
      address,
      user.addressId,
      user.createdAt,
      user.updatedAt,
    );

    return userEntity;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { address: true },
    });

    return users.map((user) => {
      const address = Address.create(
        user.address.street,
        user.address.city,
        user.address.zipCode,
        user.address.country,
      );

      return new User(
        new UserId(user.id),
        user.name,
        new Email(user.email),
        address,
        user.addressId,
        user.createdAt,
        user.updatedAt,
      );
    });
  }
}
