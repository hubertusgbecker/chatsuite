import { setupTestDatabase } from './helpers/test-db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Global setup for integration tests.
 * Runs once before all test suites.
 * 
 * Responsibilities:
 * - Start Docker test containers (PostgreSQL, Redis, etc.)
 * - Wait for services to be ready
 * - Initialize database schema
 * - Set up test environment
 */
export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  const useDockerCompose = process.env.USE_DOCKER_COMPOSE !== 'false';

  try {
    if (useDockerCompose) {
      // Start test containers
      console.log('📦 Starting Docker test containers...');
      await execAsync('docker-compose -f docker-compose.test.yaml up -d postgres redis');
      console.log('✅ Docker containers started');

      // Wait for services to be ready
      console.log('⏳ Waiting for services to be ready...');
      await waitForPostgres();
      console.log('✅ PostgreSQL is ready');
    } else {
      console.log('ℹ️  Using existing database (USE_DOCKER_COMPOSE=false)');
    }

    // Initialize database connection
    console.log('🗄️  Initializing test database...');
    const db = await setupTestDatabase();
    
    // Sync schema (creates tables if they don't exist)
    await db.synchronize(true);
    console.log('✅ Test database initialized');

    console.log('\n✨ Integration test environment ready!\n');
  } catch (error) {
    console.error('\n❌ Failed to setup test environment:', error);
    
    // Cleanup on failure
    try {
      if (useDockerCompose) {
        await execAsync('docker-compose -f docker-compose.test.yaml down');
      }
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
    
    throw error;
  }
}

/**
 * Waits for PostgreSQL to be ready to accept connections.
 * Retries with exponential backoff.
 */
async function waitForPostgres(maxAttempts = 30, initialDelay = 1000): Promise<void> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      // Try to connect
      await setupTestDatabase();
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw new Error(`PostgreSQL not ready after ${maxAttempts} attempts`);
      }
      
      console.log(`⏳ Waiting for PostgreSQL... (attempt ${attempt}/${maxAttempts})`);
      await sleep(delay);
      
      // Exponential backoff with max 5 seconds
      delay = Math.min(delay * 1.5, 5000);
    }
  }
}

/**
 * Sleep helper for async waiting.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
