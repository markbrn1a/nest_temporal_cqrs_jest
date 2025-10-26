# Clean Architecture Refactor

A demonstration of Clean Architecture, Hexagonal Architecture (Ports & Adapters), Domain-Driven Design (DDD), and CQRS principles using NestJS.

## Architecture Overview

This project implements a User management system with Address entities following strict architectural principles:

### 🏗️ Layer Structure

```
src_refactor/
├── shared/                    # Shared domain utilities
│   ├── domain/base/          # Base classes (AggregateRoot, Entity, ValueObject)
│   └── application/event-bus/ # Event bus interfaces and adapters
├── contexts/                 # Bounded Contexts (DDD)
│   ├── user/                # User Domain Context
│   │   ├── domain/          # Business logic (entities, value objects, events)
│   │   ├── application/     # Use cases (commands, queries, handlers, ports)
│   │   ├── infrastructure/  # Technical implementations (repositories)
│   │   └── presentation/    # External interface (controllers, DTOs)
│   └── address/             # Address Domain Context
│       ├── domain/          # Business logic
│       ├── application/     # Use cases
│       ├── infrastructure/  # Technical implementations
│       └── presentation/     # External interface
└── infrastructure/           # Shared infrastructure
    └── prisma/              # Database configuration
```

### 🎯 Key Principles

1. **Dependency Inversion**: Dependencies flow inward only
2. **Single Responsibility**: Each class has one reason to change
3. **Domain Events**: Business occurrences are captured as events
4. **Aggregate Boundaries**: User and Address are independent aggregates
5. **CQRS**: Commands and Queries are separated

## Features

### User Management
- ✅ Create user with optional address reference
- ✅ Get user by ID
- ✅ List all users
- ✅ Email validation and uniqueness
- ✅ Domain events (UserCreated)

### Address Management
- ✅ Create address independently
- ✅ Get address by ID
- ✅ List all addresses
- ✅ Address validation (zip code format, required fields)
- ✅ Domain events (AddressCreated)

## API Endpoints

### Users
- `POST /users` - Create a new user
- `GET /users/:id` - Get user by ID
- `GET /users` - List all users

### Addresses
- `POST /addresses` - Create a new address
- `GET /addresses/:id` - Get address by ID
- `GET /addresses` - List all addresses

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd src_refactor
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

3. **Setup database:**
   ```bash
   npm run prisma:push
   ```

4. **Start the application:**
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3000`

### Database Management

- **View database:** `npm run prisma:studio`
- **Reset database:** Delete `infrastructure/prisma/dev.db` and run `npm run prisma:push`

## Example Usage

### Create an Address
```bash
curl -X POST http://localhost:3000/addresses \
  -H "Content-Type: application/json" \
  -d '{
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "country": "USA"
  }'
```

### Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "addressId": "address-id-from-previous-step"
  }'
```

### Get User
```bash
curl http://localhost:3000/users/{user-id}
```

## Architecture Benefits

### 🧪 Testability
- Domain logic can be tested in isolation
- Infrastructure dependencies are easily mocked
- Clear separation of concerns

### 🔄 Maintainability
- Changes to one layer don't affect others
- Business rules are centralized in domain layer
- Easy to add new features

### 📈 Scalability
- Read and write operations can be scaled independently
- Event-driven architecture enables loose coupling
- Clear boundaries between contexts

### 🛡️ Flexibility
- Easy to swap infrastructure implementations
- Domain logic is framework-agnostic
- Clear contracts between layers

## Development Guidelines

### Adding New Features

1. **Start with Domain**: Define entities, value objects, and events
2. **Add Application Layer**: Create commands, queries, and handlers
3. **Implement Infrastructure**: Create repository adapters
4. **Add Presentation**: Create controllers and DTOs
5. **Wire Dependencies**: Configure modules

### Testing Strategy

- **Unit Tests**: Test domain logic in isolation
- **Integration Tests**: Test application layer with real repositories
- **E2E Tests**: Test complete user flows

## Key Files

- `shared/domain/base/` - Base classes for domain modeling
- `contexts/user/domain/` - User business logic
- `contexts/address/domain/` - Address business logic
- `contexts/*/application/` - Use cases and ports
- `contexts/*/infrastructure/` - Repository implementations
- `contexts/*/presentation/` - HTTP controllers and DTOs

## Success Criteria ✅

- ✅ Clear separation of layers with proper dependency flow
- ✅ Domain logic has no infrastructure dependencies
- ✅ User and Address are independent aggregates
- ✅ CQRS pattern properly implemented
- ✅ Repository ports define contracts, adapters implement them
- ✅ Domain events raised and published
- ✅ All operations testable in isolation
- ✅ API endpoints work for create and get operations

This implementation demonstrates how to build maintainable, testable, and scalable applications using Clean Architecture principles.
