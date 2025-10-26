import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CreateUserCommand } from '../../../contexts/user/application/commands/create-user.command';
import { CreateCustomerCommand } from '../../../contexts/customer/application/commands/create-customer.command';
import { CustomerId } from '../../../contexts/customer/domain/value-objects/customer-id.vo';
import { Phone } from '../../../contexts/customer/domain/value-objects/phone.vo';
import { UserId } from '../../../contexts/user/domain/value-objects/user-id.vo';
import { Email } from '../../../contexts/user/domain/value-objects/email.vo';
import { Address } from '../../../contexts/user/domain/value-objects/address.vo';
import { OnboardingInitiatedEvent } from '../../../contexts/onboarding/domain/events/onboarding-initiated.event';

@Injectable()
export class OnboardingSaga {
  constructor(private readonly commandBus: CommandBus) {}

  // Proper saga - event-driven and reactive
  @Saga()
  onboardingInitiated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(OnboardingInitiatedEvent),
      switchMap(async (event: OnboardingInitiatedEvent) => {
        console.log(`Saga: Onboarding initiated for ${event.email}`);

        const { userId, name, email, address, customerName, customerPhone } = event;
        
        try {
          // Step 1: Create the user first
          const address = Address.create(
            event.address.street,
            event.address.city,
            event.address.zipCode,
            event.address.country,
          );
          
          const createUserCommand = new CreateUserCommand(
            UserId.create(event.userId),
            event.name,
            Email.create(event.email),
            address,
          );
          const user = await this.commandBus.execute(createUserCommand);
          const userId = user.getId().getValue();

          // Step 2: Create the customer
          const createCustomerCommand = new CreateCustomerCommand(
            CustomerId.create(),
            customerName,
            Phone.create(customerPhone),
            userId,
          );

          return createCustomerCommand;
        } catch (error) {
          console.error(`Saga: Failed to create user for ${event.email}:`, error);
          return null; // Return null to indicate failure
        }
      }),
    );
  }

/*   @Saga()
  userCreated = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      switchMap(async (event: UserCreatedEvent) => {
        console.log(`Saga: User created for ${event.email}, now creating customer`);
        
        try {
          // Step 2: Create the customer
          const createCustomerCommand = new CreateCustomerCommand(
            CustomerId.create(),
            event.name, // Use user name as customer name
            Phone.create('+1234567890'), // Default phone - in real app, this would come from the original event
            event.userId,
          );

          console.log(`Saga: Creating customer for user ${event.userId}`);
          return createCustomerCommand;
        } catch (error) {
          console.error(`Saga: Failed to create customer for user ${event.userId}:`, error);
          return null; // Return null to indicate failure
        }
      }),
    );
  } */
}
