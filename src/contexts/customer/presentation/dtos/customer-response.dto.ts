export class CustomerResponseDto {
  id: string;
  name: string;
  phone: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    phone: string,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
