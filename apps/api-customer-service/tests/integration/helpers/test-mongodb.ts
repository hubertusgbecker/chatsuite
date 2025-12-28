import { MongoClient, Db } from 'mongodb';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

/**
 * MongoDB connection configuration for integration tests.
 * Uses existing docker-compose MongoDB service.
 */
const getMongoConfig = () => ({
  host: process.env.MONGO_HOST || 'localhost',
  port: parseInt(process.env.MONGO_PORT || '27017', 10),
  database: process.env.MONGO_DATABASE || 'LibreChat',
  authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
  username: process.env.MONGO_USERNAME,
  password: process.env.MONGO_PASSWORD,
});

/**
 * Constructs MongoDB connection URI from configuration.
 *
 * @returns MongoDB connection URI string
 */
function getMongoUri(): string {
  const config = getMongoConfig();
  
  // If MongoDB is running with --noauth (no username/password configured)
  // connect without authentication
  if (!config.username || !config.password) {
    return `mongodb://${config.host}:${config.port}/${config.database}`;
  }
  
  return `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=${config.authSource}`;
}

/**
 * Initializes MongoDB connection for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestMongoDB(): Promise<void> {
  if (mongoClient && mongoDb) {
    console.log('✅ MongoDB connection already established');
    return;
  }

  try {
    const uri = getMongoUri();
    const config = getMongoConfig();

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    mongoDb = mongoClient.db(config.database);

    console.log('✅ Test MongoDB connected');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Gets the MongoDB database instance.
 *
 * @returns MongoDB database instance
 * @throws Error if database not initialized
 */
export function getMongoDatabase(): Db {
  if (!mongoDb) {
    throw new Error('MongoDB not initialized. Call setupTestMongoDB() first.');
  }
  return mongoDb;
}

/**
 * Gets the MongoDB client instance.
 *
 * @returns MongoDB client instance
 * @throws Error if client not initialized
 */
export function getMongoClient(): MongoClient {
  if (!mongoClient) {
    throw new Error('MongoDB client not initialized. Call setupTestMongoDB() first.');
  }
  return mongoClient;
}

/**
 * Cleans up MongoDB test data.
 * Drops all collections to ensure test isolation.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestMongoDB(): Promise<void> {
  if (!mongoDb) {
    return;
  }

  try {
    const collections = await mongoDb.collections();
    
    // Drop all collections except system collections
    for (const collection of collections) {
      if (!collection.collectionName.startsWith('system.')) {
        await collection.drop();
      }
    }

    console.log('🧹 Test MongoDB cleaned');
  } catch (error) {
    console.error('❌ Failed to clean MongoDB:', error);
    throw error;
  }
}

/**
 * Closes MongoDB connection.
 * Should be called in global teardown.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestMongoDB(): Promise<void> {
  if (mongoClient) {
    try {
      await mongoClient.close();
      mongoClient = null;
      mongoDb = null;
      console.log('✅ Test MongoDB connection closed');
    } catch (error) {
      console.error('❌ Failed to close MongoDB connection:', error);
      throw error;
    }
  }
}

/**
 * Creates a test collection with sample data.
 * Useful for testing MongoDB operations.
 *
 * @param collectionName - Name of collection to create
 * @param documents - Array of documents to insert
 * @returns Promise that resolves with insert result
 */
export async function createTestCollection(
  collectionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: any[]
): Promise<void> {
  const db = getMongoDatabase();
  const collection = db.collection(collectionName);
  
  if (documents.length > 0) {
    await collection.insertMany(documents);
  }
}

/**
 * Verifies MongoDB connectivity by performing a ping operation.
 *
 * @returns Promise that resolves to true if connection is healthy
 * @throws Error if connection check fails
 */
export async function verifyMongoConnection(): Promise<boolean> {
  try {
    const client = getMongoClient();
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection check failed:', error);
    return false;
  }
}
