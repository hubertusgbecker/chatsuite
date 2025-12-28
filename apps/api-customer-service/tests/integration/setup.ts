import { setupTestDatabase } from './helpers/test-db';

/**
 * Global setup for integration tests.
 * Runs once before all test suites.
 *
 * Responsibilities:
 * - Verify existing Docker services are running
 * - Initialize database connection
 * - Set up test environment
 */
export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  console.log('ℹ️  Using existing docker-compose services');
  console.log('ℹ️  Make sure services are running: pnpm start\n');

  try {
    // Initialize database connection
    console.log('🗄️  Initializing database connection...');
    const db = await setupTestDatabase();

    // Sync schema (creates tables if they don't exist)
    await db.synchronize(true);
    console.log('✅ Database connection established');

    console.log('\n✨ Integration test environment ready!\n');
  } catch (error) {
    console.error('\n❌ Failed to setup test environment:', error);
    throw error;
  }
}
