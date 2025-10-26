#!/bin/bash

# Temporal Testing Script
# This script runs the proper Temporal tests that use @temporalio/testing

echo "🧪 Running Temporal Workflow Integration Tests..."
echo "================================================"

# Run the workflow integration tests
npm test -- temporal-workflows.spec.ts

echo ""
echo "🔧 Running Temporal Activity Unit Tests..."
echo "==========================================="

# Run the activity unit tests
npm test -- temporal-activities.spec.ts

echo ""
echo "✅ All Temporal tests completed!"
echo ""
echo "📊 Test Summary:"
echo "- Workflow Integration Tests: Tests complete Temporal workflows"
echo "- Activity Unit Tests: Tests individual activities in isolation"
echo ""
echo "💡 These tests demonstrate proper Temporal testing using @temporalio/testing"
echo "   Unlike the original tests, these actually execute Temporal workflows!"
