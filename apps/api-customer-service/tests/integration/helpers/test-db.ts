import { DataSource } from 'typeorm';

let dataSource: DataSource | null = null;

/**
 * Sets up a test database connection.
 * Creates a new DataSource instance or returns existing one.
 *
 * @returns DataSource instance for test database
 * @throws Error if connection fails
 */
export async function setupTestDatabase(): Promise<DataSource> {
  if (dataSource?.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin',
    database: process.env.POSTGRES_DB || 'chatsuite',
    entities: ['src/**/*.entity.ts'],
    synchronize: true, // Only for tests - auto-sync schema
    dropSchema: false,
    logging: false, // Set to true for debugging
  });

  try {
    await dataSource.initialize();
    console.log('✅ Test database connected');
    return dataSource;
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
  if (!dataSource?.isInitialized) {
    console.warn('⚠️  Database not initialized, skipping cleanup');
    return;
  }

  try {
    const entities = dataSource.entityMetadatas;

    // Disable foreign key checks temporarily
    await dataSource.query('SET session_replication_role = replica');

    // Truncate all tables
    for (const entity of entities) {
      const tableName = entity.tableName;
      await dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    }

    // Re-enable foreign key checks
    await dataSource.query('SET session_replication_role = DEFAULT');

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
  if (dataSource?.isInitialized) {
    try {
      await dataSource.destroy();
      dataSource = null;
      console.log('✅ Test database connection closed');
    } catch (error) {
      console.error('❌ Failed to close test database:', error);
      throw error;
    }
  }
}

/**
 * Gets the current test database connection.
 *
 * @returns DataSource instance
 * @throws Error if database not initialized
 */
export function getTestDatabase(): DataSource {
  if (!dataSource?.isInitialized) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return dataSource;
}

/**
 * Executes a raw SQL query on the test database.
 *
 * @param query - SQL query string
 * @param parameters - Query parameters
 * @returns Query result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeQuery<T = any>(
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: any[]
): Promise<T> {
  const db = getTestDatabase();
  return db.query(query, parameters);
}

/**
 * Creates a test transaction for isolated testing.
 * Automatically rolls back after test completion.
 *
 * @example
 * ```typescript
 * const { queryRunner, rollback } = await createTestTransaction();
 * try {
 *   await queryRunner.query('INSERT INTO users ...');
 *   // Test assertions
 * } finally {
 *   await rollback();
 * }
 * ```
 */
export async function createTestTransaction() {
  const db = getTestDatabase();
  const queryRunner = db.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  return {
    queryRunner,
    commit: async () => {
      await queryRunner.commitTransaction();
      await queryRunner.release();
    },
    rollback: async () => {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    },
  };
}
