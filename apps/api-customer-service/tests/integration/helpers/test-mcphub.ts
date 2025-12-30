import axios, { AxiosInstance } from 'axios';

let mcphubClient: AxiosInstance | null = null;

/**
 * MCPHub API connection configuration for integration tests.
 * Uses existing docker-compose MCPHub service (Model Context Protocol Hub).
 *
 * MCPHub is a unified hub for managing multiple MCP servers.
 * It provides a central interface for MCP server orchestration.
 *
 * Service details:
 * - Port: 3000
 * - Protocol: HTTP
 * - Health endpoint: /health
 * - Configuration: mcp_settings.json
 */
const getMCPHubConfig = () => ({
  baseUrl: process.env.MCPHUB_URL || 'http://localhost:3000',
});

/**
 * Initializes MCPHub API client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestMCPHub(): Promise<void> {
  if (mcphubClient) {
    console.log('✅ MCPHub connection already established');
    return;
  }

  try {
    const config = getMCPHubConfig();

    mcphubClient = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
      timeout: 5000,
    });

    // Test connection by checking health endpoint
    // Note: MCPHub may return 503 if MCP servers aren't configured/ready
    // We accept both 200 (healthy) and 503 (service running but servers not ready)
    const response = await mcphubClient.get('/health');

    if (response.status !== 200 && response.status !== 503) {
      throw new Error(
        `MCPHub health check failed with unexpected status ${response.status}`
      );
    }

    if (response.status === 503) {
      console.log('⚠️  MCPHub is running but MCP servers are not all ready');
      console.log(
        'ℹ️  This is normal if MCP servers are not configured in mcp_settings.json'
      );
    }

    console.log('✅ Test MCPHub connected');
  } catch (error) {
    console.error('❌ Failed to connect to MCPHub:', error);
    throw error;
  }
}

/**
 * Gets the MCPHub API client instance.
 *
 * @returns Axios instance configured for MCPHub API
 * @throws Error if client not initialized
 */
export function getMCPHubClient(): AxiosInstance {
  if (!mcphubClient) {
    throw new Error(
      'MCPHub client not initialized. Call setupTestMCPHub() first.'
    );
  }
  return mcphubClient;
}

/**
 * Verifies MCPHub service is accessible and healthy.
 * Accepts both 200 (all servers ready) and 503 (service running, servers not ready).
 *
 * @returns Promise that resolves to true if connected, false otherwise
 */
export async function verifyMCPHubConnection(): Promise<boolean> {
  try {
    const client = getMCPHubClient();
    const response = await client.get('/health');
    // Accept both 200 (healthy) and 503 (running but servers not ready)
    return response.status === 200 || response.status === 503;
  } catch (error) {
    console.error('❌ MCPHub connection verification failed:', error);
    return false;
  }
}

/**
 * Lists all configured MCP servers.
 *
 * @returns Promise that resolves with array of MCP server configurations
 */
export async function listMCPServers(): Promise<any[]> {
  try {
    const client = getMCPHubClient();
    const response = await client.get('/api/servers');

    if (response.status === 200 && response.data) {
      return response.data;
    }

    // If endpoint not available, return empty array
    return [];
  } catch (error) {
    console.error('❌ Failed to list MCP servers:', error);
    return [];
  }
}

/**
 * Gets status of a specific MCP server.
 *
 * @param serverId - ID of the MCP server
 * @returns Promise that resolves with server status
 */
export async function getMCPServerStatus(serverId: string): Promise<any> {
  try {
    const client = getMCPHubClient();
    const response = await client.get(`/api/servers/${serverId}/status`);

    if (response.status === 200) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error(`❌ Failed to get MCP server status for ${serverId}:`, error);
    return null;
  }
}

/**
 * Tests connectivity to a specific MCP server through MCPHub.
 *
 * @param serverId - ID of the MCP server to test
 * @returns Promise that resolves to true if server is reachable
 */
export async function testMCPServerConnection(
  serverId: string
): Promise<boolean> {
  try {
    const client = getMCPHubClient();
    const response = await client.post(`/api/servers/${serverId}/test`);

    return response.status === 200;
  } catch (error) {
    console.error(
      `❌ Failed to test MCP server connection for ${serverId}:`,
      error
    );
    return false;
  }
}

/**
 * Cleans up test data in MCPHub.
 * MCPHub is primarily a proxy/orchestrator, so cleanup is minimal.
 * This is a placeholder for future cleanup operations.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestMCPHub(): Promise<void> {
  try {
    // MCPHub doesn't typically create persistent test data
    // This is a placeholder for future cleanup operations
    console.log('🧹 Test MCPHub cleaned');
  } catch (error) {
    console.error('❌ Failed to cleanup MCPHub test data:', error);
    throw error;
  }
}

/**
 * Closes MCPHub connection.
 * Resets the client instance.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestMCPHub(): Promise<void> {
  if (!mcphubClient) {
    return;
  }

  try {
    mcphubClient = null;
    console.log('✅ Test MCPHub connection closed');
  } catch (error) {
    console.error('❌ Failed to close MCPHub connection:', error);
    throw error;
  }
}
