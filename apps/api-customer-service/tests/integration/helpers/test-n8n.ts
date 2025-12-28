import axios, { AxiosInstance } from 'axios';

let n8nClient: AxiosInstance | null = null;

/**
 * n8n API connection configuration for integration tests.
 * Uses existing docker-compose n8n service with API key authentication.
 *
 * To generate an API key:
 * 1. Open n8n UI at http://localhost:5678
 * 2. Login with Basic Auth (admin/admin123)
 * 3. Go to Settings -> API
 * 4. Click "Create API Key"
 * 5. Copy the key and set N8N_API_KEY environment variable
 */
const getN8nConfig = () => ({
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || '',
  username: process.env.N8N_BASIC_AUTH_USER || 'admin',
  password: process.env.N8N_BASIC_AUTH_PASSWORD || 'admin123',
});

/**
 * Initializes n8n API client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestN8n(): Promise<void> {
  if (n8nClient) {
    console.log('✅ n8n connection already established');
    return;
  }

  try {
    const config = getN8nConfig();

    // Skip setup if API key not configured
    if (!config.apiKey) {
      console.warn('⚠️  N8N_API_KEY not configured - n8n tests will be skipped');
      console.warn('ℹ️  To enable n8n tests, create an API key from n8n UI and set N8N_API_KEY environment variable');
      return;
    }

    n8nClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': config.apiKey,
      },
      validateStatus: () => true, // Don't throw on any status
    });

    // Test connection by checking health endpoint
    const response = await n8nClient.get('/healthz');

    if (response.status !== 200) {
      throw new Error(`n8n health check failed with status ${response.status}`);
    }

    console.log('✅ Test n8n connected');
  } catch (error) {
    console.error('❌ Failed to connect to n8n:', error);
    throw error;
  }
}

/**
 * Gets the n8n API client instance.
 *
 * @returns Axios instance configured for n8n API
 * @throws Error if client not initialized
 */
export function getN8nClient(): AxiosInstance {
  if (!n8nClient) {
    throw new Error('n8n client not initialized. Call setupTestN8n() first.');
  }
  return n8nClient;
}

/**
 * Creates a simple test workflow in n8n.
 *
 * @param workflowName - Name of workflow to create
 * @returns Promise that resolves with workflow data
 */
export async function createTestWorkflow(workflowName: string): Promise<any> {
  const client = getN8nClient();

  // Simple workflow with manual trigger and set node
  const workflow = {
    name: workflowName,
    nodes: [
      {
        id: '1',
        name: 'Start',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [250, 300],
        parameters: {},
      },
      {
        id: '2',
        name: 'Set',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'message',
                value: 'Hello from test workflow!',
              },
            ],
          },
        },
      },
    ],
    connections: {
      Start: {
        main: [
          [
            {
              node: 'Set',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
    active: false,
    settings: {},
  };

  const response = await client.post('/api/v1/workflows', workflow);

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Failed to create workflow: ${response.status} ${response.statusText}`);
  }

  return response.data;
}

/**
 * Deletes a workflow from n8n.
 *
 * @param workflowId - ID of workflow to delete
 * @returns Promise that resolves when deletion completes
 */
export async function deleteTestWorkflow(workflowId: string): Promise<void> {
  const client = getN8nClient();

  await client.delete(`/api/v1/workflows/${workflowId}`);
}

/**
 * Gets a workflow by ID from n8n.
 *
 * @param workflowId - ID of workflow to retrieve
 * @returns Promise that resolves with workflow data
 */
export async function getTestWorkflow(workflowId: string): Promise<any> {
  const client = getN8nClient();

  const response = await client.get(`/api/v1/workflows/${workflowId}`);

  if (response.status !== 200) {
    throw new Error(`Failed to get workflow: ${response.status}`);
  }

  return response.data;
}

/**
 * Lists all workflows in n8n.
 *
 * @returns Promise that resolves with array of workflows
 */
export async function listTestWorkflows(): Promise<any[]> {
  const client = getN8nClient();

  const response = await client.get('/api/v1/workflows');

  if (response.status !== 200) {
    throw new Error(`Failed to list workflows: ${response.status}`);
  }

  return response.data?.data || [];
}

/**
 * Cleans up n8n test data.
 * Deletes all test workflows created during tests.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestN8n(): Promise<void> {
  if (!n8nClient) {
    return;
  }

  try {
    // List all workflows
    const workflows = await listTestWorkflows();

    // Delete workflows that start with 'test-' or 'Test '
    for (const workflow of workflows) {
      if (workflow.name?.toLowerCase().includes('test')) {
        try {
          await deleteTestWorkflow(workflow.id);
          console.log(`🗑️  Deleted test workflow: ${workflow.name}`);
        } catch (error) {
          console.warn(`⚠️  Could not delete workflow ${workflow.name}`);
        }
      }
    }

    console.log('🧹 Test n8n cleaned');
  } catch (error) {
    console.error('❌ Failed to clean n8n:', error);
    // Don't throw - cleanup should be best-effort
  }
}

/**
 * Closes n8n connection.
 * Should be called in global teardown.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestN8n(): Promise<void> {
  if (n8nClient) {
    try {
      await cleanupTestN8n();
      n8nClient = null;
      console.log('✅ Test n8n connection closed');
    } catch (error) {
      console.error('❌ Failed to close n8n connection:', error);
      throw error;
    }
  }
}

/**
 * Verifies n8n connectivity by checking health endpoint.
 *
 * @returns Promise that resolves to true if connection is healthy
 */
export async function verifyN8nConnection(): Promise<boolean> {
  try {
    const client = getN8nClient();
    const response = await client.get('/healthz');
    return response.status === 200;
  } catch (error) {
    console.error('❌ n8n connection check failed:', error);
    return false;
  }
}
