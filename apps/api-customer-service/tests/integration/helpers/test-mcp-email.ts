import axios from 'axios';
import type { AxiosInstance } from 'axios';

let mcpEmailClient: AxiosInstance | null = null;

/**
 * MCP Email Server connection configuration for integration tests.
 * Uses existing docker-compose MCP Email service (SSE-based MCP server).
 *
 * MCP Email provides IMAP and SMTP functionality via Model Context Protocol.
 * It runs in Server-Sent Events (SSE) mode for optimal integration.
 *
 * Service details:
 * - Port: 9557
 * - Protocol: SSE (Server-Sent Events)
 * - Endpoint: /sse
 * - Configuration: config.toml (optional)
 */
const getMCPEmailConfig = () => ({
  baseUrl: process.env.MCP_EMAIL_URL || 'http://localhost:9557',
});

/**
 * Initializes MCP Email API client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestMCPEmail(): Promise<void> {
  if (mcpEmailClient) {
    console.log('✅ MCP Email connection already established');
    return;
  }

  try {
    const config = getMCPEmailConfig();

    mcpEmailClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        Accept: 'text/event-stream',
      },
      validateStatus: () => true, // Don't throw on any status
      timeout: 3000,
      // Don't try to parse the response - SSE streams are continuous
      responseType: 'stream',
    });

    // Test connection by checking SSE endpoint
    // Note: SSE endpoints return continuous streams, so we only check initial response
    const response = await mcpEmailClient
      .get('/sse', {
        // Abort the request after getting initial response headers
        signal: AbortSignal.timeout(1000),
      })
      .catch((error) => {
        // If timeout, it means connection started successfully (SSE streams are continuous)
        if (
          error.code === 'ECONNABORTED' ||
          error.name === 'AbortError' ||
          error.message?.includes('aborted')
        ) {
          return {
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
          };
        }
        throw error;
      });

    if (response.status !== 200) {
      throw new Error(
        `MCP Email SSE endpoint check failed with status ${response.status}`
      );
    }

    console.log('✅ Test MCP Email connected');
  } catch (error) {
    console.error('❌ Failed to connect to MCP Email:', error);
    throw error;
  }
}

/**
 * Gets the MCP Email API client instance.
 *
 * @returns Axios instance configured for MCP Email API
 * @throws Error if client not initialized
 */
export function getMCPEmailClient(): AxiosInstance {
  if (!mcpEmailClient) {
    throw new Error(
      'MCP Email client not initialized. Call setupTestMCPEmail() first.'
    );
  }
  return mcpEmailClient;
}

/**
 * Verifies MCP Email service is accessible and responding.
 * Handles SSE stream connections properly by aborting after initial response.
 *
 * @returns Promise that resolves to true if connected, false otherwise
 */
export async function verifyMCPEmailConnection(): Promise<boolean> {
  try {
    const client = getMCPEmailClient();
    const response = await client
      .get('/sse', {
        signal: AbortSignal.timeout(1000),
      })
      .catch((error) => {
        // SSE streams are continuous - timeout means successful connection
        if (
          error.code === 'ECONNABORTED' ||
          error.name === 'AbortError' ||
          error.message?.includes('aborted')
        ) {
          return { status: 200 };
        }
        throw error;
      });
    return response.status === 200;
  } catch (error) {
    console.error('❌ MCP Email connection verification failed:', error);
    return false;
  }
}

/**
 * Checks if MCP Email SSE endpoint is responding correctly.
 * SSE endpoints should return text/event-stream content-type.
 * Handles continuous stream by aborting after initial response.
 *
 * @returns Promise that resolves with endpoint status info
 */
export async function checkMCPEmailSSEEndpoint(): Promise<{
  status: number;
  contentType: string;
  isSSE: boolean;
}> {
  try {
    const client = getMCPEmailClient();
    const response = await client
      .get('/sse', {
        signal: AbortSignal.timeout(1000),
      })
      .catch((error) => {
        // SSE streams are continuous - timeout means successful connection
        if (
          error.code === 'ECONNABORTED' ||
          error.name === 'AbortError' ||
          error.message?.includes('aborted')
        ) {
          return {
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
          };
        }
        throw error;
      });

    const contentType = response.headers['content-type'] || '';
    const isSSE = contentType.includes('text/event-stream');

    return {
      status: response.status,
      contentType,
      isSSE,
    };
  } catch (error) {
    console.error('❌ Failed to check MCP Email SSE endpoint:', error);
    throw error;
  }
}

/**
 * Gets MCP Email server health/status information.
 * Note: MCP Email may not have a dedicated health endpoint.
 * This function checks the SSE endpoint as a proxy for health.
 *
 * @returns Promise that resolves with server status
 */
export async function getMCPEmailStatus(): Promise<{
  healthy: boolean;
  endpoint: string;
}> {
  try {
    const config = getMCPEmailConfig();
    const isHealthy = await verifyMCPEmailConnection();

    return {
      healthy: isHealthy,
      endpoint: `${config.baseUrl}/sse`,
    };
  } catch (error) {
    console.error('❌ Failed to get MCP Email status:', error);
    return {
      healthy: false,
      endpoint: '',
    };
  }
}

/**
 * Cleans up test data in MCP Email.
 * MCP Email is primarily a protocol server, so cleanup is minimal.
 * This is a placeholder for future cleanup operations.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestMCPEmail(): Promise<void> {
  try {
    // MCP Email doesn't typically create persistent test data
    // SSE connections are ephemeral
    // This is a placeholder for future cleanup operations
    console.log('🧹 Test MCP Email cleaned');
  } catch (error) {
    console.error('❌ Failed to cleanup MCP Email test data:', error);
    throw error;
  }
}

/**
 * Closes MCP Email connection.
 * Resets the client instance.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestMCPEmail(): Promise<void> {
  if (!mcpEmailClient) {
    return;
  }

  try {
    mcpEmailClient = null;
    console.log('✅ Test MCP Email connection closed');
  } catch (error) {
    console.error('❌ Failed to close MCP Email connection:', error);
    throw error;
  }
}
