import { closeTestDatabase } from './helpers/test-db';
import { closeTestServer } from './helpers/test-server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Global teardown for integration tests.
 * Runs once after all test suites complete.
 *
 * Responsibilities:
 * - Close database connections
 * - Close test server
 * - Clean up test resources (but leave Docker services running)
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

    console.log('ℹ️  Leaving existing docker-compose services running');

    console.log('\n✨ Integration test environment cleaned up!\n');
  } catch (error) {
    console.error('\n❌ Failed to teardown test environment:', error);

    // Don't throw - allow tests to complete even if cleanup fails
    console.warn('⚠️  Some cleanup operations failed, but tests completed');
  }
}
