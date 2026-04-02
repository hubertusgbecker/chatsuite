import { resolve } from 'node:path';
import { config } from 'dotenv';
import { setupTestDatabase } from './helpers/test-db';

/**
 * Global setup for integration tests.
 * Runs once before all test suites.
 *
 * Responsibilities:
 * - Load environment variables from .env files
 * - Verify existing Docker services are running
 * - Initialize database connection
 * - Set up test environment
 */
export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  // Load environment variables from .env files
  const appEnv = process.env.NX_APP_ENV || 'dev';
  const envPath = resolve(__dirname, `../../../../config/env/.env.${appEnv}`);

  console.log(`📁 Loading environment from: .env.${appEnv}`);
  const result = config({ path: envPath });

  if (result.error) {
    console.error('❌ Failed to load environment file:', result.error);
    throw result.error;
  }

  console.log('✅ Environment variables loaded');

  // Override Docker hostnames and ports with localhost for integration tests
  // (tests run on host machine, not in Docker containers)
  if (process.env.POSTGRES_HOST?.includes('postgres')) {
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PORT = '54320'; // Exposed port for tests
  }
  if (process.env.MONGO_HOST?.includes('mongodb')) {
    process.env.MONGO_HOST = 'localhost';
    process.env.MONGO_PORT = '27018'; // Exposed port for tests
  }
  if (process.env.MINIO_ENDPOINT?.includes('minio:')) {
    process.env.MINIO_ENDPOINT = 'http://localhost:9000';
  }
  if (process.env.N8N_BASE_URL?.includes('n8n:')) {
    process.env.N8N_BASE_URL = 'http://localhost:5678';
  }
  if (process.env.NOCODB_URL?.includes('nocodb:')) {
    process.env.NOCODB_URL = 'http://localhost:8080';
  }
  if (process.env.MINDSDB_URL?.includes('mindsdb:')) {
    process.env.MINDSDB_URL = 'http://localhost:47334';
  }
  if (process.env.MCPHUB_URL?.includes('mcphub:')) {
    process.env.MCPHUB_URL = 'http://localhost:3000';
  }
  if (process.env.MCP_EMAIL_URL?.includes('mcp-email-server:')) {
    process.env.MCP_EMAIL_URL = 'http://localhost:9557';
  }

  console.log('🔄 Adjusted service hostnames for local integration testing');
  console.log('ℹ️  Using existing docker-compose services');
  console.log('ℹ️  Make sure services are running: pnpm start\n');

  try {
    // Initialize database connection
    console.log('🗄️  Initializing database connection...');
    const db = await setupTestDatabase();

    // Verify database connection works
    const client = await db.connect();
    client.release();
    console.log('✅ Database connection established');

    console.log('\n✨ Integration test environment ready!\n');
  } catch (error) {
    console.error('\n❌ Failed to setup test environment:', error);
    throw error;
  }
}
