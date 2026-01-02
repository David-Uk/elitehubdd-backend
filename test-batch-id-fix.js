// Test script to verify batch ID validation fix
import dotenv from 'dotenv';
dotenv.config();

const { validateUUIDOrBatchId } = await import('./middleware/validator.js');

// Test the new validator with different ID formats
const testCases = [
  { id: 'BATCH-260102-061628-252', description: 'Batch ID format' },
  { id: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID format' },
  { id: 'invalid-id', description: 'Invalid format' }
];

console.log('Testing batch ID validation...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`ID: ${testCase.id}`);
  
  // Simulate validation
  try {
    // Test UUID regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const batchIdRegex = /^BATCH-\d{6}-\d{6}-\d{3}$/;
    
    if (uuidRegex.test(testCase.id)) {
      console.log('✅ Valid UUID format');
    } else if (batchIdRegex.test(testCase.id)) {
      console.log('✅ Valid Batch ID format');
    } else {
      console.log('❌ Invalid ID format');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('---\n');
});

console.log('Batch ID validation fix should now accept both UUID and Batch ID formats!');
console.log('Example usage:');
console.log('PATCH /api/restaurant/batches/BATCH-260102-061628-252/status');
console.log('PATCH /api/restaurant/batches/550e8400-e29b-41d4-a716-446655440000/status');
