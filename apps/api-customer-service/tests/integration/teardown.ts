import { closeTestDatabase } from './helpers/test-db';
import { closeTestServer } from './helpers/test-server';
import { closeTestMongoDB } from './helpers/test-mongodb';
import { closeTestMinIO } from './helpers/test-minio';
import { closeTestN8n } from './helpers/test-n8n';
import { closeTestNocodb } from './helpers/test-nocodb';
import { closeTestMindsDB } from './helpers/test-mindsdb';
import { closeTestMCPHub } from './helpers/test-mcphub';

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
    await closeTestMongoDB();
    await closeTestMinIO();
    await closeTestN8n();
    await closeTestNocodb();
    await closeTestMindsDB();
    await closeTestMCPHub();
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
