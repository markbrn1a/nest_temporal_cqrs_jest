import { ValueObject } from '../../../../shared/domain/base/value-object';

interface AddressData {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export class Address extends ValueObject<AddressData> {
  constructor(
    street: string,
    city: string,
    zipCode: string,
    country: string,
  ) {
    const addressData = {
      street: street.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
    };
    
    super(addressData);
    
    if (!street || street.trim().length < 2) {
      throw new Error('Street must be at least 2 characters long');
    }
    
    if (!city || city.trim().length < 2) {
      throw new Error('City must be at least 2 characters long');
    }
    
    if (!zipCode || zipCode.trim().length === 0) {
      throw new Error('Zip code is required');
    }
    
    if (!country || country.trim().length < 2) {
      throw new Error('Country must be at least 2 characters long');
    }
  }

  static create(
    street: string,
    city: string,
    zipCode: string,
    country: string,
  ): Address {
    return new Address(street, city, zipCode, country);
  }

  getStreet(): string {
    return this._value.street;
  }

  getCity(): string {
    return this._value.city;
  }

  getZipCode(): string {
    return this._value.zipCode;
  }

  getCountry(): string {
    return this._value.country;
  }

  getFullAddress(): string {
    return `${this._value.street}, ${this._value.city}, ${this._value.zipCode}, ${this._value.country}`;
  }

  equals(other: Address): boolean {
    return (
      this._value.street === other._value.street &&
      this._value.city === other._value.city &&
      this._value.zipCode === other._value.zipCode &&
      this._value.country === other._value.country
    );
  }
}
