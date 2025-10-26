# Manual Testing Guide

This guide provides all available endpoints with their required payloads for manual testing of the NestJS + Temporal application.

## Base URL
- **Local Development**: `http://localhost:3000`
- **Docker Production**: `http://localhost:3000`

## Onboarding Endpoints

### 1. Start Onboarding Saga
**Endpoint**: `POST /onboarding/saga`

**Description**: Initiates the onboarding saga using event-driven architecture.

**Payload**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "street": "123 Main Street",
  "city": "New York",
  "zipCode": "10001",
  "country": "USA",
  "customerName": "John Doe",
  "customerPhone": "+1234567890"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/onboarding/saga \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "street": "123 Main Street",
    "city": "New York",
    "zipCode": "10001",
    "country": "USA",
    "customerName": "John Doe",
    "customerPhone": "+1234567890"
  }'
```

**Expected Response**:
```json
{
  "message": "Onboarding saga initiated successfully",
  "status": "success"
}
```

### 2. Start Temporal Onboarding Workflow
**Endpoint**: `POST /onboarding/workflows/onboard-temporal`

**Description**: Initiates the onboarding process using Temporal workflows.

**Payload**:
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "street": "456 Oak Avenue",
  "city": "Los Angeles",
  "zipCode": "90210",
  "country": "USA",
  "customerName": "Jane Smith",
  "customerPhone": "+1987654321"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/onboarding/workflows/onboard-temporal \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "street": "456 Oak Avenue",
    "city": "Los Angeles",
    "zipCode": "90210",
    "country": "USA",
    "customerName": "Jane Smith",
    "customerPhone": "+1987654321"
  }'
```

**Expected Response**:
```json
{
  "message": "Onboarding workflow started successfully",
  "status": "success",
  "workflowId": "onboarding-processing--1761496415590"
}
```

### 3. Create User Workflow
**Endpoint**: `POST /onboarding/workflows/create-user`

**Description**: Creates a user using Temporal workflow.

**Payload**:
```json
{
  "userId": "user-123",
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "address": {
    "street": "789 Pine Street",
    "city": "Chicago",
    "zipCode": "60601",
    "country": "USA"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/onboarding/workflows/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "address": {
      "street": "789 Pine Street",
      "city": "Chicago",
      "zipCode": "60601",
      "country": "USA"
    }
  }'
```

### 4. Create Customer Workflow
**Endpoint**: `POST /onboarding/workflows/create-customer`

**Description**: Creates a customer using Temporal workflow.

**Payload**:
```json
{
  "customerId": "customer-456",
  "userId": "user-123",
  "name": "Bob Wilson",
  "phone": "+1555123456"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/onboarding/workflows/create-customer \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-456",
    "userId": "user-123",
    "name": "Bob Wilson",
    "phone": "+1555123456"
  }'
```

### 5. Composed Onboarding Workflow
**Endpoint**: `POST /onboarding/workflows/composed`

**Description**: Runs a composed onboarding workflow that combines multiple steps.

**Payload**:
```json
{
  "userId": "user-789",
  "name": "Charlie Brown",
  "email": "charlie.brown@example.com",
  "address": {
    "street": "321 Elm Street",
    "city": "Boston",
    "zipCode": "02101",
    "country": "USA"
  },
  "customerName": "Charlie Brown",
  "customerPhone": "+1617123456"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/onboarding/workflows/composed \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-789",
    "name": "Charlie Brown",
    "email": "charlie.brown@example.com",
    "address": {
      "street": "321 Elm Street",
      "city": "Boston",
      "zipCode": "02101",
      "country": "USA"
    },
    "customerName": "Charlie Brown",
    "customerPhone": "+1617123456"
  }'
```

## Payment Endpoints

### 1. Create Payment
**Endpoint**: `POST /payments`

**Description**: Creates a new payment record.

**Payload**:
```json
{
  "userId": "user-123",
  "customerId": "customer-456",
  "amount": 99.99
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "customerId": "customer-456",
    "amount": 99.99
  }'
```

**Expected Response**:
```json
{
  "id": "payment-uuid",
  "userId": "user-123",
  "customerId": "customer-456",
  "amount": 99.99,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Process Payment Workflow
**Endpoint**: `POST /payments/workflows/process`

**Description**: Processes a payment using Temporal workflow.

**Payload**:
```json
{
  "paymentId": "payment-123",
  "userId": "user-123",
  "customerId": "customer-456",
  "amount": 149.99
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/payments/workflows/process \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment-123",
    "userId": "user-123",
    "customerId": "customer-456",
    "amount": 149.99
  }'
```

**Expected Response**:
```json
{
  "workflowId": "payment-processing-workflow-id",
  "message": "Payment workflow started successfully"
}
```

### 3. Get Payment
**Endpoint**: `GET /payments/{id}`

**Description**: Retrieves a payment by ID.

**cURL Example**:
```bash
curl -X GET http://localhost:3000/payments/payment-123
```

**Expected Response**:
```json
{
  "id": "payment-123",
  "userId": "user-123",
  "customerId": "customer-456",
  "amount": 149.99,
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

## Testing Scenarios

### Scenario 1: Complete Onboarding Flow
1. Start with `/onboarding/workflows/onboard-temporal`
2. Wait for workflow completion (check logs)
3. Verify user and customer were created in database

### Scenario 2: Payment Processing Flow
1. Create a payment with `/payments`
2. Process the payment with `/payments/workflows/process`
3. Check payment status with `/payments/{id}`

### Scenario 3: Error Handling
1. Try invalid email format: `invalid-email`
2. Try duplicate email addresses
3. Try negative payment amounts

### Scenario 4: Saga vs Workflow Comparison
1. Test `/onboarding/saga` (event-driven)
2. Test `/onboarding/workflows/onboard-temporal` (Temporal)
3. Compare behavior and performance

## Validation Rules

### Email Validation
- Must be valid email format
- Examples: `user@example.com`, `test.email+tag@domain.co.uk`

### Name Validation
- Minimum 2 characters
- Maximum 100 characters (for OnboardUserDto)
- Must be non-empty string

### Phone Validation
- Must be non-empty string
- Examples: `+1234567890`, `+1-555-123-4567`

### Amount Validation
- Must be positive number
- Examples: `99.99`, `100`, `0.01`

### Address Validation
- All fields must be non-empty strings
- Street: max 200 characters
- City: max 100 characters
- ZipCode: max 20 characters
- Country: max 100 characters

## Monitoring and Debugging

### Check Application Logs
```bash
# Docker logs
docker logs <container-name>

# Local development
npm run start:dev
```

### Check Temporal UI
- **Local**: `http://localhost:8080`
- **Cloud**: Your Temporal Cloud URL

### Database Inspection
- **SQLite**: `src/infrastructure/database/dev.db`
- Use SQLite browser or command line tools

## Common Issues and Solutions

### Issue: Temporal Worker Not Starting
**Solution**: Check if Temporal server is running and accessible

### Issue: Database Connection Errors
**Solution**: Ensure SQLite database file exists and is writable

### Issue: Validation Errors
**Solution**: Check payload format and required fields

### Issue: Workflow Timeouts
**Solution**: Check Temporal server status and network connectivity
