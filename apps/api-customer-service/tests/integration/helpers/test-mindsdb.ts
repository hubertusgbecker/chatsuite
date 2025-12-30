import axios, { AxiosInstance } from 'axios';

let mindsdbClient: AxiosInstance | null = null;

/**
 * MindsDB API connection configuration for integration tests.
 * Uses existing docker-compose MindsDB service.
 *
 * MindsDB provides AI/ML capabilities with SQL interface.
 * The HTTP API is used for REST operations.
 */
const getMindsdbConfig = () => ({
  baseUrl: process.env.MINDSDB_URL || 'http://localhost:47334',
  httpPort: parseInt(process.env.MINDSDB_HTTP_PORT || '47334', 10),
});

/**
 * Initializes MindsDB API client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestMindsDB(): Promise<void> {
  if (mindsdbClient) {
    console.log('✅ MindsDB connection already established');
    return;
  }

  try {
    const config = getMindsdbConfig();

    mindsdbClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    });

    // Test connection by checking status endpoint
    const response = await mindsdbClient.get('/api/status');

    if (response.status !== 200) {
      throw new Error(
        `MindsDB status check failed with status ${response.status}`
      );
    }

    console.log('✅ Test MindsDB connected');
  } catch (error) {
    console.error('❌ Failed to connect to MindsDB:', error);
    throw error;
  }
}

/**
 * Gets the MindsDB API client instance.
 *
 * @returns Axios instance configured for MindsDB API
 * @throws Error if client not initialized
 */
export function getMindsdbClient(): AxiosInstance {
  if (!mindsdbClient) {
    throw new Error(
      'MindsDB client not initialized. Call setupTestMindsDB() first.'
    );
  }
  return mindsdbClient;
}

/**
 * Executes a SQL query on MindsDB.
 *
 * @param query - SQL query to execute
 * @returns Promise that resolves with query result
 */
export async function executeMindsDBQuery(query: string): Promise<any> {
  const client = getMindsdbClient();

  const response = await client.post('/api/sql/query', {
    query,
  });

  if (response.status !== 200) {
    throw new Error(
      `Failed to execute query: ${response.status} ${response.statusText}`
    );
  }

  return response.data;
}

/**
 * Lists all databases in MindsDB.
 *
 * @returns Promise that resolves with array of databases
 */
export async function listMindsDBDatabases(): Promise<any[]> {
  const result = await executeMindsDBQuery('SHOW DATABASES');
  return result.data || [];
}

/**
 * Creates a test database in MindsDB.
 *
 * @param dbName - Name of database to create
 * @returns Promise that resolves when database is created
 */
export async function createTestDatabase(dbName: string): Promise<void> {
  await executeMindsDBQuery(`CREATE DATABASE ${dbName}`);
}

/**
 * Drops a test database in MindsDB.
 *
 * @param dbName - Name of database to drop
 * @returns Promise that resolves when database is dropped
 */
export async function dropTestDatabase(dbName: string): Promise<void> {
  await executeMindsDBQuery(`DROP DATABASE IF EXISTS ${dbName}`);
}

/**
 * Lists all models in MindsDB.
 *
 * @returns Promise that resolves with array of models
 */
export async function listMindsDBModels(): Promise<any[]> {
  const result = await executeMindsDBQuery('SHOW MODELS');
  return result.data || [];
}

/**
 * Cleans up MindsDB test data.
 * Drops all test databases and models created during tests.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestMindsDB(): Promise<void> {
  if (!mindsdbClient) {
    return;
  }

  try {
    // List all databases
    const databases = await listMindsDBDatabases();

    // Drop databases that contain 'test' in name (case-insensitive)
    for (const db of databases) {
      const dbName = db.Database || db.name || db.database_name;
      if (dbName && dbName.toLowerCase().includes('test')) {
        try {
          await dropTestDatabase(dbName);
          console.log(`🗑️  Dropped test database: ${dbName}`);
        } catch (error) {
          console.error(`❌ Failed to drop database ${dbName}:`, error);
        }
      }
    }

    console.log('🧹 Test MindsDB cleaned');
  } catch (error) {
    console.error('❌ Failed to clean MindsDB:', error);
    // Don't throw - cleanup should be best-effort
  }
}

/**
 * Closes MindsDB connection.
 * Should be called in global teardown.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestMindsDB(): Promise<void> {
  if (mindsdbClient) {
    try {
      await cleanupTestMindsDB();
      mindsdbClient = null;
      console.log('✅ Test MindsDB connection closed');
    } catch (error) {
      console.error('❌ Failed to close MindsDB connection:', error);
      throw error;
    }
  }
}

/**
 * Verifies MindsDB connectivity by checking status endpoint.
 *
 * @returns Promise that resolves to true if connection is healthy
 */
export async function verifyMindsDBConnection(): Promise<boolean> {
  try {
    const client = getMindsdbClient();
    const response = await client.get('/api/status');
    return response.status === 200;
  } catch (error) {
    console.error('❌ MindsDB connection check failed:', error);
    return false;
  }
}
