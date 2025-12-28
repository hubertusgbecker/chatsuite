import { closeTestDatabase } from './helpers/test-db';
import { closeTestServer } from './helpers/test-server';

/**
 * Global teardown for integration tests.
 * Runs once after all test suites complete.
 *
 * Responsibilities:
 * - Close database connections
 * - Close test server
 * - Clean up test resources (Docker services remain running)
 */
export default async function globalTeardown() {
  console.log('\n🧹 Tearing down integration test environment...\n');

  try {
    // Close database connection
    console.log('🗄️  Closing database connections...');
    await closeTestDatabase();
    console.log('✅ Database connections closed');

    // Close test server
    console.log('🖥️  Closing test server...');
    await closeTestServer();
    console.log('✅ Test server closed');

    console.log('ℹ️  Leaving docker-compose services running for reuse');
    console.log('\n✅ Integration test environment cleaned up!\n');
  } catch (error) {
    console.error('\n❌ Failed to teardown test environment:', error);
    // Don't throw - teardown errors shouldn't fail tests
  }
}
