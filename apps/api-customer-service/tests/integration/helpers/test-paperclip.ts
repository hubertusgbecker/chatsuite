import axios, { type AxiosInstance } from 'axios';

let paperclipClient: AxiosInstance | null = null;

/**
 * Paperclip API connection configuration for integration tests.
 * Uses existing docker-compose Paperclip service (AI Agent Orchestration).
 *
 * Paperclip orchestrates teams of AI agents as a company — with org charts,
 * budgets, governance, goal alignment, and a ticket system.
 *
 * Service details:
 * - Port: 3100
 * - Protocol: HTTP
 * - Health endpoint: /api/health
 * - Companies endpoint: /api/companies
 * - Image: ghcr.io/paperclipai/paperclip:latest
 */
const getPaperclipConfig = () => ({
  baseUrl: process.env.PAPERCLIP_URL || 'http://localhost:3100',
});

/**
 * Initializes Paperclip API client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestPaperclip(): Promise<void> {
  if (paperclipClient) {
    console.log('✅ Paperclip connection already established');
    return;
  }

  try {
    const config = getPaperclipConfig();

    paperclipClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
      timeout: 10000,
    });

    const response = await paperclipClient.get('/api/health');

    if (response.status !== 200) {
      throw new Error(`Paperclip health check failed with status ${response.status}`);
    }

    console.log('✅ Test Paperclip connected');
  } catch (error) {
    console.error('❌ Failed to connect to Paperclip:', error);
    throw error;
  }
}

/**
 * Gets the Paperclip API client instance.
 *
 * @returns Axios instance configured for Paperclip API
 * @throws Error if client not initialized
 */
export function getPaperclipClient(): AxiosInstance {
  if (!paperclipClient) {
    throw new Error('Paperclip client not initialized. Call setupTestPaperclip() first.');
  }
  return paperclipClient;
}

/**
 * Verifies Paperclip service is accessible and healthy.
 *
 * @returns Promise that resolves to true if connected, false otherwise
 */
export async function verifyPaperclipConnection(): Promise<boolean> {
  try {
    const client = getPaperclipClient();
    const response = await client.get('/api/health');
    return response.status === 200;
  } catch (error) {
    console.error('❌ Paperclip connection verification failed:', error);
    return false;
  }
}

/**
 * Lists all companies configured in Paperclip.
 *
 * @returns Promise that resolves with array of companies
 */
export async function listPaperclipCompanies(): Promise<unknown[]> {
  try {
    const client = getPaperclipClient();
    const response = await client.get('/api/companies');

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('❌ Failed to list Paperclip companies:', error);
    return [];
  }
}

/**
 * Cleans up test data in Paperclip.
 * Placeholder for future cleanup operations.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestPaperclip(): Promise<void> {
  try {
    console.log('🧹 Test Paperclip cleaned');
  } catch (error) {
    console.error('❌ Failed to cleanup Paperclip test data:', error);
    throw error;
  }
}

/**
 * Closes Paperclip connection.
 * Resets the client instance.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestPaperclip(): Promise<void> {
  if (!paperclipClient) {
    return;
  }

  try {
    paperclipClient = null;
    console.log('✅ Test Paperclip connection closed');
  } catch (error) {
    console.error('❌ Failed to close Paperclip connection:', error);
    throw error;
  }
}
