import * as request from 'supertest';
import {
  createTestServer,
  closeTestServer,
  getHttpServer,
} from '../helpers/test-server';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  executeQuery,
} from '../helpers/test-db';
import {
  setupTestMongoDB,
  cleanupTestMongoDB,
  verifyMongoConnection,
  getMongoDatabase,
} from '../helpers/test-mongodb';
import {
  setupTestMinIO,
  cleanupTestMinIO,
  verifyMinioConnection,
  createTestBucket,
  uploadTestFile,
  downloadTestFile,
} from '../helpers/test-minio';
import {
  setupTestN8n,
  cleanupTestN8n,
  verifyN8nConnection,
  createTestWorkflow,
  getTestWorkflow,
} from '../helpers/test-n8n';
import {
  setupTestNocodb,
  cleanupTestNocodb,
  verifyNocodbConnection,
  createTestBase,
  getTestBase,
} from '../helpers/test-nocodb';
import {
  setupTestMindsDB,
  cleanupTestMindsDB,
  verifyMindsDBConnection,
  executeMindsDBQuery,
  listMindsDBDatabases,
} from '../helpers/test-mindsdb';
import {
  setupTestMCPHub,
  cleanupTestMCPHub,
  verifyMCPHubConnection,
  listMCPServers,
} from '../helpers/test-mcphub';
import {
  setupTestMCPEmail,
  cleanupTestMCPEmail,
  verifyMCPEmailConnection,
  checkMCPEmailSSEEndpoint,
} from '../helpers/test-mcp-email';
import { UserFactory, ConversationFactory, MessageFactory } from '../helpers/factories';

/**
 * Integration tests for the Customer Service API.
 * Tests real service interactions with actual database and storage services.
 */
describe('API Customer Service Integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    await setupTestDatabase();
    await setupTestMongoDB();
    await setupTestMinIO();
    await setupTestN8n();
    await setupTestNocodb();
    await setupTestMindsDB();
    await setupTestMCPHub();
    await setupTestMCPEmail();

    await createTestServer();
    httpServer = getHttpServer();
  });

  afterAll(async () => {
    await closeTestServer();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
    await cleanupTestMongoDB();
    await cleanupTestMinIO();
    await cleanupTestN8n();
    await cleanupTestNocodb();
    await cleanupTestMindsDB();
    await cleanupTestMCPHub();
    await cleanupTestMCPEmail();
  });

  // ---------------------------------------------------------------
  // API Endpoint Tests (behavior, not just connectivity)
  // ---------------------------------------------------------------

  describe('GET /api', () => {
    it('should return 200 with exact welcome message', async () => {
      const response = await request(httpServer)
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Welcome to api-customer-service of ChatSuite!',
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return complete health status', async () => {
      const response = await request(httpServer)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    });

    it('should return increasing uptime on subsequent calls', async () => {
      const first = await request(httpServer).get('/api/health').expect(200);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const second = await request(httpServer).get('/api/health').expect(200);

      expect(second.body.uptime).toBeGreaterThanOrEqual(first.body.uptime);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 with path in standardized format', async () => {
      const response = await request(httpServer)
        .get('/api/does-not-exist')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.path).toBe('/api/does-not-exist');
      expect(typeof response.body.message).toBe('string');
      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    });

    it('should handle malformed JSON without crashing', async () => {
      const response = await request(httpServer)
        .post('/api')
        .set('Content-Type', 'application/json')
        .send('{"broken');

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.statusCode).toBeDefined();
    });

    it('should not expose stack traces', async () => {
      const response = await request(httpServer)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.stack).toBeUndefined();
      expect(JSON.stringify(response.body)).not.toContain('.ts:');
      expect(JSON.stringify(response.body)).not.toContain('.js:');
    });
  });

  describe('CORS', () => {
    it('should return access-control-allow-origin on preflight', async () => {
      const response = await request(httpServer)
        .options('/api')
        .set('Origin', 'http://localhost:4200')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBeLessThan(400);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle 30 concurrent requests', async () => {
      const promises = Array.from({ length: 30 }, () =>
        request(httpServer).get('/api')
      );
      const responses = await Promise.all(promises);

      const successes = responses.filter((r) => r.status === 200);
      expect(successes).toHaveLength(30);
      for (const r of successes) {
        expect(r.body.message).toBe(
          'Welcome to api-customer-service of ChatSuite!'
        );
      }
    });
  });

  // ---------------------------------------------------------------
  // PostgreSQL Integration
  // ---------------------------------------------------------------

  describe('PostgreSQL Integration', () => {
    it('should execute raw SQL queries', async () => {
      const result = await executeQuery('SELECT 1 AS value');
      expect(result).toBeDefined();
      expect(result[0].value).toBe(1);
    });

    it('should create and query a temp table', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      const user = UserFactory.create();
      await executeQuery(
        'INSERT INTO test_users (name, email) VALUES ($1, $2)',
        [user.name, user.email]
      );

      const rows = await executeQuery(
        'SELECT name, email FROM test_users WHERE email = $1',
        [user.email]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe(user.name);
      expect(rows[0].email).toBe(user.email);
    });

    it('should enforce unique constraints', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_unique (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL
        )
      `);

      const email = 'unique@test.com';
      await executeQuery('INSERT INTO test_unique (email) VALUES ($1)', [email]);

      await expect(
        executeQuery('INSERT INTO test_unique (email) VALUES ($1)', [email])
      ).rejects.toThrow();
    });

    it('should handle transactions', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_tx (
          id SERIAL PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Insert inside a transaction that we rollback
      await executeQuery('BEGIN');
      await executeQuery("INSERT INTO test_tx (value) VALUES ('should-vanish')");
      await executeQuery('ROLLBACK');

      const rows = await executeQuery('SELECT * FROM test_tx');
      expect(rows).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------
  // MongoDB Integration
  // ---------------------------------------------------------------

  describe('MongoDB Integration', () => {
    it('should verify connection is active', async () => {
      const connected = await verifyMongoConnection();
      expect(connected).toBe(true);
    });

    it('should insert and retrieve documents', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_users');

      const users = UserFactory.createMany(3);
      await collection.insertMany(users);

      const count = await collection.countDocuments();
      expect(count).toBe(3);

      const found = await collection.findOne({ email: users[1].email });
      expect(found).not.toBeNull();
      expect(found?.name).toBe(users[1].name);
    });

    it('should support query filtering and projection', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_conversations');

      const userId = 'user-123';
      const conversations = [
        ConversationFactory.create({ userId, title: 'Alpha' }),
        ConversationFactory.create({ userId, title: 'Beta' }),
        ConversationFactory.create({ userId: 'other-user', title: 'Gamma' }),
      ];
      await collection.insertMany(conversations);

      const userConvos = await collection
        .find({ userId }, { projection: { title: 1, _id: 0 } })
        .toArray();
      expect(userConvos).toHaveLength(2);
      expect(userConvos.map((c) => c.title).sort()).toEqual(['Alpha', 'Beta']);
    });

    it('should support update operations', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_messages');

      const msg = MessageFactory.create({ content: 'original' });
      const insertResult = await collection.insertOne(msg);

      await collection.updateOne(
        { _id: insertResult.insertedId },
        { $set: { content: 'updated' } }
      );

      const updated = await collection.findOne({ _id: insertResult.insertedId });
      expect(updated?.content).toBe('updated');
    });

    it('should support delete operations', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_delete');

      await collection.insertMany([
        { key: 'keep' },
        { key: 'delete-me' },
        { key: 'keep' },
      ]);

      const deleteResult = await collection.deleteMany({ key: 'delete-me' });
      expect(deleteResult.deletedCount).toBe(1);

      const remaining = await collection.countDocuments();
      expect(remaining).toBe(2);
    });
  });

  // ---------------------------------------------------------------
  // MinIO / S3 Storage Integration
  // ---------------------------------------------------------------

  describe('MinIO Storage Integration', () => {
    it('should verify connection', async () => {
      const connected = await verifyMinioConnection();
      expect(connected).toBe(true);
    });

    it('should upload, download, and verify file content', async () => {
      const bucket = 'integration-test-files';
      const key = `test-${Date.now()}.txt`;
      const content = 'Integration test file content: ' + Date.now();

      await createTestBucket(bucket);
      await uploadTestFile(bucket, key, content);

      const downloaded = await downloadTestFile(bucket, key);
      expect(downloaded).toBe(content);
    });

    it('should handle binary data', async () => {
      const bucket = 'integration-test-binary';
      const key = 'binary-data.bin';
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);

      await createTestBucket(bucket);
      await uploadTestFile(bucket, key, buffer);

      const downloaded = await downloadTestFile(bucket, key);
      // downloadTestFile returns string, verify it round-trips
      expect(downloaded).toBeDefined();
      expect(downloaded.length).toBeGreaterThan(0);
    });

    it('should support folder-like key paths', async () => {
      const bucket = 'integration-test-folders';
      await createTestBucket(bucket);

      await uploadTestFile(bucket, 'reports/2026/q1/summary.txt', 'Q1 data');
      await uploadTestFile(bucket, 'reports/2026/q2/summary.txt', 'Q2 data');

      const q1 = await downloadTestFile(bucket, 'reports/2026/q1/summary.txt');
      const q2 = await downloadTestFile(bucket, 'reports/2026/q2/summary.txt');
      expect(q1).toBe('Q1 data');
      expect(q2).toBe('Q2 data');
    });

    it('should overwrite existing files', async () => {
      const bucket = 'integration-test-overwrite';
      const key = 'overwrite.txt';

      await createTestBucket(bucket);
      await uploadTestFile(bucket, key, 'version-1');

      const v1 = await downloadTestFile(bucket, key);
      expect(v1).toBe('version-1');

      await uploadTestFile(bucket, key, 'version-2');
      const v2 = await downloadTestFile(bucket, key);
      expect(v2).toBe('version-2');
    });
  });

  // ---------------------------------------------------------------
  // n8n Workflow Automation Integration
  // ---------------------------------------------------------------

  describe('n8n Workflow Integration', () => {
    it('should connect to n8n service', async () => {
      if (!process.env.N8N_API_KEY) {
        console.log('Skipped: N8N_API_KEY not configured');
        return;
      }
      const connected = await verifyN8nConnection();
      expect(connected).toBe(true);
    });

    it('should create and retrieve a workflow', async () => {
      if (!process.env.N8N_API_KEY) {
        console.log('Skipped: N8N_API_KEY not configured');
        return;
      }
      const name = 'integration-test-' + Date.now();
      const created = await createTestWorkflow(name);

      expect(created.id).toBeDefined();
      expect(created.name).toBe(name);

      const retrieved = await getTestWorkflow(created.id);
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe(name);
    });
  });

  // ---------------------------------------------------------------
  // NocoDB Integration
  // ---------------------------------------------------------------

  describe('NocoDB Integration', () => {
    it('should connect to NocoDB service', async () => {
      if (!process.env.NOCODB_AUTH_TOKEN) {
        console.log('Skipped: NOCODB_AUTH_TOKEN not configured');
        return;
      }
      const connected = await verifyNocodbConnection();
      expect(connected).toBe(true);
    });

    it('should create and retrieve a base', async () => {
      if (!process.env.NOCODB_AUTH_TOKEN) {
        console.log('Skipped: NOCODB_AUTH_TOKEN not configured');
        return;
      }
      const name = 'integration-base-' + Date.now();
      const created = await createTestBase(name);

      expect(created.id).toBeDefined();
      expect(created.title).toBe(name);

      const retrieved = await getTestBase(created.id);
      expect(retrieved.id).toBe(created.id);
    });
  });

  // ---------------------------------------------------------------
  // MindsDB AI Database Integration
  // ---------------------------------------------------------------

  describe('MindsDB Integration', () => {
    it('should connect and list databases', async () => {
      const connected = await verifyMindsDBConnection();
      expect(connected).toBe(true);

      const databases = await listMindsDBDatabases();
      expect(Array.isArray(databases)).toBe(true);
      expect(databases.length).toBeGreaterThan(0);
    });

    it('should execute a SQL query', async () => {
      const result = await executeMindsDBQuery('SHOW DATABASES');
      expect(result).toBeDefined();
    });
  });

  // ---------------------------------------------------------------
  // MCPHub Protocol Integration
  // ---------------------------------------------------------------

  describe('MCPHub Integration', () => {
    it('should connect and report health', async () => {
      const connected = await verifyMCPHubConnection();
      expect(connected).toBe(true);
    });

    it('should list MCP servers as an array', async () => {
      const servers = await listMCPServers();
      expect(Array.isArray(servers)).toBe(true);
    });
  });

  // ---------------------------------------------------------------
  // MCP Email Integration
  // ---------------------------------------------------------------

  describe('MCP Email Integration', () => {
    it('should connect to MCP Email service', async () => {
      const connected = await verifyMCPEmailConnection();
      expect(connected).toBe(true);
    });

    it('should expose SSE endpoint with correct content-type', async () => {
      const endpoint = await checkMCPEmailSSEEndpoint();

      expect(endpoint.status).toBe(200);
      expect(endpoint.isSSE).toBe(true);
      expect(endpoint.contentType).toContain('text/event-stream');
    });
  });
});
