# Temporal Testing Guide

This guide explains how to properly test Temporal workflows and activities using the `@temporalio/testing` framework.

## Test Files Overview

### 1. `temporal-workflows.spec.ts` - Integration Tests
**Purpose**: Tests complete Temporal workflows end-to-end using the Temporal testing framework.

**What it tests**:
- Complete workflow execution with real activities
- Workflow error handling and failure scenarios
- Database state changes after workflow completion
- Composed workflows with child workflows
- Payment processing workflows

**Key Features**:
- Uses `TestWorkflowEnvironment` for in-memory Temporal server
- Tests actual workflow execution (not just HTTP endpoints)
- Verifies database state changes
- Tests error scenarios and validation failures

### 2. `temporal-activities.spec.ts` - Unit Tests
**Purpose**: Tests individual Temporal activities in isolation.

**What it tests**:
- Activity validation logic
- Activity error handling
- Mocked CommandBus and EventBus interactions
- Individual activity success/failure scenarios

**Key Features**:
- Unit tests for each activity method
- Mocked dependencies for isolated testing
- Comprehensive validation testing
- Error scenario coverage

## Running the Tests

### Prerequisites
Make sure you have the required dependencies installed:
```bash
npm install
```

### Run Temporal Workflow Tests
```bash
# Run the integration tests
npm test -- temporal-workflows.spec.ts

# Run with coverage
npm run test:cov -- temporal-workflows.spec.ts
```

### Run Temporal Activity Tests
```bash
# Run the unit tests
npm test -- temporal-activities.spec.ts

# Run with coverage
npm run test:cov -- temporal-activities.spec.ts
```

### Run All Temporal Tests
```bash
# Run both test files
npm test -- temporal-workflows.spec.ts temporal-activities.spec.ts
```

## What These Tests Demonstrate

### 1. Proper Temporal Testing
- **Before**: Tests only verified HTTP responses and database state
- **After**: Tests actually execute Temporal workflows and verify workflow behavior

### 2. Workflow Testing Patterns
- **Integration Testing**: Complete workflow execution with real activities
- **Unit Testing**: Individual activity testing with mocked dependencies
- **Error Testing**: Validation failures and business rule violations
- **State Verification**: Database state changes after workflow completion

### 3. Temporal Testing Framework Usage
- **TestWorkflowEnvironment**: In-memory Temporal server for testing
- **Workflow Execution**: Direct workflow execution without HTTP layer
- **Activity Mocking**: Ability to mock activities for isolated testing
- **Error Scenarios**: Testing workflow failure and retry behavior

## Test Scenarios Covered

### Onboarding Workflow Tests
- ✅ Successful onboarding with user and customer creation
- ✅ Validation error handling (invalid email, short name, invalid phone)
- ✅ Duplicate email handling
- ✅ Database state verification

### Payment Workflow Tests
- ✅ Successful payment processing
- ✅ Invalid payment amount handling
- ✅ Payment validation errors

### Composed Workflow Tests
- ✅ Child workflow execution
- ✅ Workflow composition patterns
- ✅ Error propagation from child workflows

### Activity Unit Tests
- ✅ Individual activity validation
- ✅ Activity error handling
- ✅ CommandBus and EventBus interactions
- ✅ Mocked dependency testing

## Key Differences from Original Tests

| Aspect | Original Tests | New Tests |
|--------|---------------|-----------|
| **Temporal Testing** | ❌ No actual workflow execution | ✅ Real workflow execution |
| **Testing Framework** | ❌ HTTP endpoint testing only | ✅ `@temporalio/testing` framework |
| **Workflow Validation** | ❌ Only HTTP responses | ✅ Workflow behavior and state |
| **Error Scenarios** | ❌ Limited error testing | ✅ Comprehensive error testing |
| **Activity Testing** | ❌ No activity testing | ✅ Unit tests for activities |
| **Integration Testing** | ❌ No Temporal integration | ✅ Full Temporal integration |

## Benefits of This Approach

1. **Real Workflow Testing**: Tests actually execute Temporal workflows
2. **Isolated Testing**: Activities can be tested independently
3. **Error Coverage**: Comprehensive error scenario testing
4. **State Verification**: Database state changes are verified
5. **Performance**: In-memory Temporal server for fast tests
6. **Reliability**: Tests don't depend on external Temporal server

## Running Tests in CI/CD

These tests are designed to run in CI/CD environments without requiring external dependencies:

```bash
# In CI/CD pipeline
npm test -- temporal-workflows.spec.ts temporal-activities.spec.ts
```

The tests use `TestWorkflowEnvironment` which creates an in-memory Temporal server, making them suitable for automated testing environments.
