import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * Sets up a test database connection.
 * Creates a new Pool instance or returns existing one.
 *
 * @returns Pool instance for test database
 * @throws Error if connection fails
 */
export async function setupTestDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin',
    database: process.env.POSTGRES_DB || 'chatsuite',
  });

  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('✅ Test database connected');
    return pool;
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
}

/**
 * Cleans up all data from test database tables.
 * Preserves schema structure, only truncates data.
 * Uses CASCADE to handle foreign key constraints.
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (!pool) {
    console.warn('⚠️  Database not initialized, skipping cleanup');
    return;
  }

  try {
    // Get all user tables
    const result = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
    );

    if (result.rows.length > 0) {
      // Disable foreign key checks temporarily
      await pool.query('SET session_replication_role = replica');

      // Truncate all tables
      for (const row of result.rows) {
        await pool.query(`TRUNCATE TABLE "${row.tablename}" CASCADE`);
      }

      // Re-enable foreign key checks
      await pool.query('SET session_replication_role = DEFAULT');
    }

    console.log('🧹 Test database cleaned');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    throw error;
  }
}

/**
 * Closes the test database connection.
 * Should be called in global teardown.
 */
export async function closeTestDatabase(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('✅ Test database connection closed');
    } catch (error) {
      console.error('❌ Failed to close test database:', error);
      throw error;
    }
  }
}

/**
 * Gets the current test database pool.
 *
 * @returns Pool instance
 * @throws Error if database not initialized
 */
export function getTestDatabase(): Pool {
  if (!pool) {
    throw new Error(
      'Test database not initialized. Call setupTestDatabase() first.',
    );
  }
  return pool;
}

/**
 * Executes a raw SQL query on the test database.
 *
 * @param query - SQL query string
 * @param parameters - Query parameters
 * @returns Query result rows
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeQuery<T = any>(
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: any[],
): Promise<T[]> {
  const db = getTestDatabase();
  const result = await db.query(query, parameters);
  return result.rows as T[];
}

/**
 * Creates a test transaction for isolated testing.
 * Automatically rolls back after test completion.
 *
 * @example
 * ```typescript
 * const { client, rollback } = await createTestTransaction();
 * try {
 *   await client.query('INSERT INTO users ...');
 *   // Test assertions
 * } finally {
 *   await rollback();
 * }
 * ```
 */
export async function createTestTransaction(): Promise<{
  client: PoolClient;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}> {
  const db = getTestDatabase();
  const client = await db.connect();
  await client.query('BEGIN');

  return {
    client,
    commit: async (): Promise<void> => {
      await client.query('COMMIT');
      client.release();
    },
    rollback: async (): Promise<void> => {
      await client.query('ROLLBACK');
      client.release();
    },
  };
}
