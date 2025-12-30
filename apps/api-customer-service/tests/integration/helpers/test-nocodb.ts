import axios, { AxiosInstance } from 'axios';

let nocodbClient: AxiosInstance | null = null;

/**
 * NocoDB API connection configuration for integration tests.
 * Uses existing docker-compose NocoDB service.
 *
 * NocoDB uses token-based authentication for API access.
 * First-time setup requires creating an admin user via UI, then generating API token.
 *
 * To generate an API token:
 * 1. Open NocoDB UI at http://localhost:8080
 * 2. Sign up/Login as admin
 * 3. Go to Account Settings (top right) → API Tokens
 * 4. Click "Create API Token"
 * 5. Copy token and set NOCODB_AUTH_TOKEN environment variable
 */
const getNocodbConfig = () => ({
  baseUrl: process.env.NOCODB_URL || 'http://localhost:8080',
  authToken: process.env.NOCODB_AUTH_TOKEN || '',
});

/**
 * Initializes NocoDB API client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestNocodb(): Promise<void> {
  if (nocodbClient) {
    console.log('✅ NocoDB connection already established');
    return;
  }

  try {
    const config = getNocodbConfig();

    // Skip setup if auth token not configured
    if (!config.authToken) {
      console.warn(
        '⚠️  NOCODB_AUTH_TOKEN not configured - NocoDB tests will be skipped'
      );
      console.warn(
        'ℹ️  To enable NocoDB tests, create an API token from NocoDB UI and set NOCODB_AUTH_TOKEN environment variable'
      );
      return;
    }

    nocodbClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'xc-auth': config.authToken, // NocoDB uses xc-auth header
      },
      validateStatus: () => true, // Don't throw on any status
    });

    // Test connection by checking health endpoint
    const response = await nocodbClient.get('/api/v1/health');

    if (response.status !== 200) {
      throw new Error(
        `NocoDB health check failed with status ${response.status}`
      );
    }

    console.log('✅ Test NocoDB connected');
  } catch (error) {
    console.error('❌ Failed to connect to NocoDB:', error);
    throw error;
  }
}

/**
 * Gets the NocoDB API client instance.
 *
 * @returns Axios instance configured for NocoDB API
 * @throws Error if client not initialized
 */
export function getNocodbClient(): AxiosInstance {
  if (!nocodbClient) {
    throw new Error(
      'NocoDB client not initialized. Call setupTestNocodb() first.'
    );
  }
  return nocodbClient;
}

/**
 * Creates a test base (project) in NocoDB.
 *
 * @param baseName - Name of base to create
 * @returns Promise that resolves with base data
 */
export async function createTestBase(baseName: string): Promise<any> {
  const client = getNocodbClient();

  const response = await client.post('/api/v1/db/meta/projects/', {
    title: baseName,
    description: 'Test base created by integration tests',
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      `Failed to create base: ${response.status} ${response.statusText}`
    );
  }

  return response.data;
}

/**
 * Gets a base by ID.
 *
 * @param baseId - ID of base to retrieve
 * @returns Promise that resolves with base data
 */
export async function getTestBase(baseId: string): Promise<any> {
  const client = getNocodbClient();

  const response = await client.get(`/api/v1/db/meta/projects/${baseId}`);

  if (response.status !== 200) {
    throw new Error(`Failed to get base: ${response.status}`);
  }

  return response.data;
}

/**
 * Deletes a base by ID.
 *
 * @param baseId - ID of base to delete
 * @returns Promise that resolves when base is deleted
 */
export async function deleteTestBase(baseId: string): Promise<void> {
  const client = getNocodbClient();

  const response = await client.delete(`/api/v1/db/meta/projects/${baseId}`);

  if (response.status !== 200) {
    throw new Error(`Failed to delete base: ${response.status}`);
  }
}

/**
 * Lists all bases (projects) in NocoDB.
 *
 * @returns Promise that resolves with array of bases
 */
export async function listTestBases(): Promise<any[]> {
  const client = getNocodbClient();

  const response = await client.get('/api/v1/db/meta/projects');

  if (response.status !== 200) {
    throw new Error(`Failed to list bases: ${response.status}`);
  }

  return response.data?.list || [];
}

/**
 * Cleans up NocoDB test data.
 * Deletes all test bases created during tests.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestNocodb(): Promise<void> {
  if (!nocodbClient) {
    return;
  }

  try {
    // List all bases
    const bases = await listTestBases();

    // Delete bases that contain 'test' in name (case-insensitive)
    for (const base of bases) {
      if (base.title?.toLowerCase().includes('test')) {
        try {
          await deleteTestBase(base.id);
          console.log(`🗑️  Deleted test base: ${base.title}`);
        } catch (error) {
          console.error(`❌ Failed to delete base ${base.title}:`, error);
        }
      }
    }

    console.log('🧹 Test NocoDB cleaned');
  } catch (error) {
    console.error('❌ Failed to clean NocoDB:', error);
    // Don't throw - cleanup should be best-effort
  }
}

/**
 * Closes NocoDB connection.
 * Should be called in global teardown.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestNocodb(): Promise<void> {
  if (nocodbClient) {
    try {
      await cleanupTestNocodb();
      nocodbClient = null;
      console.log('✅ Test NocoDB connection closed');
    } catch (error) {
      console.error('❌ Failed to close NocoDB connection:', error);
      throw error;
    }
  }
}

/**
 * Verifies NocoDB connectivity by checking health endpoint.
 *
 * @returns Promise that resolves to true if connection is healthy
 */
export async function verifyNocodbConnection(): Promise<boolean> {
  try {
    const client = getNocodbClient();
    const response = await client.get('/api/v1/health');
    return response.status === 200;
  } catch (error) {
    console.error('❌ NocoDB connection check failed:', error);
    return false;
  }
}
