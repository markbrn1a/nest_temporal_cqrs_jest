export class AddressResponseDto {
  street: string;
  city: string;
  zipCode: string;
  country: string;
  fullAddress: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  address: AddressResponseDto;
  createdAt: Date;
  updatedAt: Date;
  accountAge: number;
}
