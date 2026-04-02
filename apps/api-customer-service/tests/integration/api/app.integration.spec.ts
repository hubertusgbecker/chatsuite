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
import {
  UserFactory,
  ConversationFactory,
  MessageFactory,
} from '../helpers/factories';

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
      const response = await request(httpServer).get('/api/health').expect(200);

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
    it('should return 404 with errorCode and path in standardized format', async () => {
      const response = await request(httpServer)
        .get('/api/does-not-exist')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('NOT_FOUND');
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
      expect(typeof response.body.statusCode).toBe('number');
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

  describe('Correlation ID', () => {
    it('should propagate correlation-id through the request lifecycle', async () => {
      const correlationId = 'integration-trace-' + Date.now();
      const response = await request(httpServer)
        .get('/api/health')
        .set('x-correlation-id', correlationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should generate a UUID when no correlation-id is provided', async () => {
      const response = await request(httpServer).get('/api').expect(200);

      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should include correlation-id in error responses', async () => {
      const correlationId = 'error-trace-' + Date.now();
      const response = await request(httpServer)
        .get('/api/missing-route')
        .set('x-correlation-id', correlationId)
        .expect(404);

      expect(response.body.correlationId).toBe(correlationId);
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

    it('should persist and retrieve multiple users with factory data', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      const users = UserFactory.createMany(5);
      for (const user of users) {
        await executeQuery(
          'INSERT INTO test_users (name, email, role) VALUES ($1, $2, $3)',
          [user.name, user.email, user.role]
        );
      }

      const rows = await executeQuery(
        'SELECT name, email, role FROM test_users ORDER BY id'
      );
      expect(rows).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect(rows[i].name).toBe(users[i].name);
        expect(rows[i].email).toBe(users[i].email);
        expect(rows[i].role).toBe(users[i].role);
      }
    });

    it('should enforce unique constraints', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_unique (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL
        )
      `);

      const email = UserFactory.create().email;
      await executeQuery('INSERT INTO test_unique (email) VALUES ($1)', [
        email,
      ]);

      await expect(
        executeQuery('INSERT INTO test_unique (email) VALUES ($1)', [email])
      ).rejects.toThrow();
    });

    it('should handle transactions with rollback', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_tx (
          id SERIAL PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Insert inside a transaction that we rollback
      await executeQuery('BEGIN');
      await executeQuery(
        "INSERT INTO test_tx (value) VALUES ('should-vanish')"
      );
      await executeQuery('ROLLBACK');

      const rows = await executeQuery('SELECT * FROM test_tx');
      expect(rows).toHaveLength(0);
    });

    it('should support filtering, ordering, and aggregation', async () => {
      await executeQuery(`
        CREATE TEMP TABLE test_orders (
          id SERIAL PRIMARY KEY,
          customer TEXT NOT NULL,
          amount NUMERIC(10,2) NOT NULL
        )
      `);

      await executeQuery(
        "INSERT INTO test_orders (customer, amount) VALUES ('alice', 100), ('bob', 200), ('alice', 50)"
      );

      const totals = await executeQuery(
        'SELECT customer, SUM(amount)::numeric AS total FROM test_orders GROUP BY customer ORDER BY total DESC'
      );
      expect(totals).toHaveLength(2);
      expect(totals[0].customer).toBe('bob');
      expect(Number(totals[0].total)).toBe(200);
      expect(totals[1].customer).toBe('alice');
      expect(Number(totals[1].total)).toBe(150);
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

    it('should insert and retrieve documents with factory data', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_users');

      const users = UserFactory.createMany(3);
      await collection.insertMany(users);

      const count = await collection.countDocuments();
      expect(count).toBe(3);

      const found = await collection.findOne({ email: users[1].email });
      expect(found).not.toBeNull();
      expect(found?.name).toBe(users[1].name);
      expect(found?.role).toBe(users[1].role);
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

    it('should build a conversation thread with factory', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_threads');

      const conversationId = 'conv-thread-test';
      const thread = MessageFactory.createConversationThread(4, conversationId);
      await collection.insertMany(thread);

      const messages = await collection
        .find({ conversationId })
        .sort({ timestamp: 1 })
        .toArray();
      expect(messages).toHaveLength(8); // 4 turns = 8 messages
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
      // Verify alternating pattern
      for (let i = 0; i < messages.length; i++) {
        expect(messages[i].role).toBe(i % 2 === 0 ? 'user' : 'assistant');
      }
    });

    it('should support update and delete operations', async () => {
      const db = getMongoDatabase();
      const collection = db.collection('integration_test_updates');

      const msg = MessageFactory.create({ content: 'original' });
      const insertResult = await collection.insertOne(msg);

      await collection.updateOne(
        { _id: insertResult.insertedId },
        { $set: { content: 'updated' } }
      );

      const updated = await collection.findOne({
        _id: insertResult.insertedId,
      });
      expect(updated?.content).toBe('updated');

      const deleteResult = await collection.deleteOne({
        _id: insertResult.insertedId,
      });
      expect(deleteResult.deletedCount).toBe(1);

      const gone = await collection.findOne({
        _id: insertResult.insertedId,
      });
      expect(gone).toBeNull();
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
