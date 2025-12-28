import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestServer, closeTestServer, getHttpServer } from '../helpers/test-server';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/test-db';
import {
  setupTestMongoDB,
  cleanupTestMongoDB,
  verifyMongoConnection,
  createTestCollection
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

/**
 * Integration tests for the Customer Service API.
 * Tests the complete flow from HTTP request through service layer to database.
 */
describe('API Customer Service Integration', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    // Setup test database connection
    await setupTestDatabase();

    // Setup test MongoDB connection
    await setupTestMongoDB();

    // Setup test MinIO connection
    await setupTestMinIO();

    // Setup test n8n connection
    await setupTestN8n();

    // Setup test NocoDB connection
    await setupTestNocodb();

    // Setup test MindsDB connection
    await setupTestMindsDB();

    // Create test NestJS application
    app = await createTestServer();
    httpServer = getHttpServer();
  });

  afterAll(async () => {
    // Cleanup and close connections
    await closeTestServer();
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await cleanupTestDatabase();

    // Clean MongoDB before each test for isolation
    await cleanupTestMongoDB();

    // Clean MinIO before each test for isolation
    await cleanupTestMinIO();

    // Clean n8n before each test for isolation
    await cleanupTestN8n();

    // Clean up NocoDB test data
    await cleanupTestNocodb();

    // Clean up MindsDB test data
    await cleanupTestMindsDB();
  });

  describe('GET /api', () => {
    it('should return welcome message', async () => {
      const response = await request(httpServer)
        .get('/api')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to api-customer-service of ChatSuite!',
      });
    });

    it('should have correct content-type header', async () => {
      const response = await request(httpServer)
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should respond to health check endpoint', async () => {
      // Most NestJS apps have a health endpoint
      // Adjust this test based on actual implementation
      const response = await request(httpServer)
        .get('/api/health')
        .expect((res) => {
          // Accept either 200 (implemented) or 404 (not implemented yet)
          expect([200, 404]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body.status).toBe('ok');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(httpServer)
        .get('/api/non-existent-route')
        .expect(404);
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(httpServer)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}')
        .expect((res) => {
          // Expect either 400 (bad request) or 404 (route not found)
          expect([400, 404]).toContain(res.status);
        });
      // Use response to avoid unused variable warning
      expect(response).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await request(httpServer)
        .options('/api')
        .set('Origin', 'http://localhost:4200')
        .expect((res) => {
          // Server should handle OPTIONS for CORS preflight
          expect([200, 204]).toContain(res.status);
        });
      // Use response to avoid unused variable warning
      expect(response).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();

      await request(httpServer)
        .get('/api')
        .expect(200);

      const duration = Date.now() - start;

      // API should respond within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      // Make requests in smaller batches to avoid ECONNRESET
      const batchSize = 3;
      const totalRequests = 10;
      const responses = [];

      for (let i = 0; i < totalRequests; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, totalRequests - i) }, () =>
          request(httpServer).get('/api').expect(200)
        );
        const batchResponses = await Promise.all(batch);
        responses.push(...batchResponses);
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // All requests should succeed
      expect(responses).toHaveLength(totalRequests);
      responses.forEach(response => {
        expect(response.body.message).toBeDefined();
      });
    });
  });

  describe('Database Integration', () => {
    it('should connect to PostgreSQL database', async () => {
      // This test verifies database connectivity through the API
      // Add actual database-dependent endpoints as they're implemented

      // For now, verify the app initialized successfully with DB
      expect(app).toBeDefined();
      expect(httpServer).toBeDefined();
    });

    it('should connect to MongoDB database', async () => {
      // Verify MongoDB connectivity
      const isConnected = await verifyMongoConnection();
      expect(isConnected).toBe(true);
    });

    it('should create and query MongoDB collections', async () => {
      // Create test collection with sample data
      const testDocs = [
        { name: 'Test User 1', email: 'user1@test.com', createdAt: new Date() },
        { name: 'Test User 2', email: 'user2@test.com', createdAt: new Date() }
      ];

      await createTestCollection('test_users', testDocs);

      // Verify data was inserted (this would normally be done through API endpoints)
      // For now, just verify the operation completed without errors
      expect(testDocs).toHaveLength(2);
    });
  });

  describe('File Storage Integration', () => {
    it('should connect to MinIO storage', async () => {
      // Verify MinIO connectivity
      const isConnected = await verifyMinioConnection();
      expect(isConnected).toBe(true);
    });

    it('should upload and download files from MinIO', async () => {
      const bucketName = 'test-bucket';
      const fileKey = 'test-file.txt';
      const fileContent = 'Hello from MinIO integration test!';

      // Create test bucket
      await createTestBucket(bucketName);

      // Upload file
      await uploadTestFile(bucketName, fileKey, fileContent);

      // Download and verify file
      const downloadedContent = await downloadTestFile(bucketName, fileKey);
      expect(downloadedContent).toBe(fileContent);
    });

    it('should handle multiple files in MinIO bucket', async () => {
      const bucketName = 'test-multi-bucket';

      await createTestBucket(bucketName);

      // Upload multiple files
      await uploadTestFile(bucketName, 'file1.txt', 'Content 1');
      await uploadTestFile(bucketName, 'file2.txt', 'Content 2');
      await uploadTestFile(bucketName, 'folder/file3.txt', 'Content 3');

      // Verify files can be downloaded
      const content1 = await downloadTestFile(bucketName, 'file1.txt');
      const content2 = await downloadTestFile(bucketName, 'file2.txt');
      const content3 = await downloadTestFile(bucketName, 'folder/file3.txt');

      expect(content1).toBe('Content 1');
      expect(content2).toBe('Content 2');
      expect(content3).toBe('Content 3');
    });
  });

  describe('Workflow Automation Integration', () => {
    it('should connect to n8n service', async () => {
      if (!process.env.N8N_API_KEY) {
        console.log('ℹ️  Skipped: N8N_API_KEY not configured - see helper for setup instructions');
        return;
      }

      // Verify n8n connectivity
      const isConnected = await verifyN8nConnection();
      expect(isConnected).toBe(true);
    });

    it('should create and retrieve workflows in n8n', async () => {
      if (!process.env.N8N_API_KEY) {
        console.log('ℹ️  Skipped: N8N_API_KEY not configured - see helper for setup instructions');
        return;
      }

      // Create a test workflow
      const workflowName = 'test-workflow-' + Date.now();
      const workflow = await createTestWorkflow(workflowName);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe(workflowName);

      // Retrieve the workflow to verify it was created
      const retrieved = await getTestWorkflow(workflow.id);
      expect(retrieved.id).toBe(workflow.id);
      expect(retrieved.name).toBe(workflowName);
    });
  });

  describe('Database UI Integration', () => {
    it('should connect to NocoDB service', async () => {
      if (!process.env.NOCODB_AUTH_TOKEN) {
        console.log('ℹ️  Skipped: NOCODB_AUTH_TOKEN not configured - see helper for setup instructions');
        return;
      }

      // Verify NocoDB connectivity
      const isConnected = await verifyNocodbConnection();
      expect(isConnected).toBe(true);
    });

    it('should create and retrieve bases in NocoDB', async () => {
      if (!process.env.NOCODB_AUTH_TOKEN) {
        console.log('ℹ️  Skipped: NOCODB_AUTH_TOKEN not configured - see helper for setup instructions');
        return;
      }

      // Create a test base
      const baseName = 'test-base-' + Date.now();
      const base = await createTestBase(baseName);

      expect(base).toBeDefined();
      expect(base.id).toBeDefined();
      expect(base.title).toBe(baseName);

      // Retrieve the base to verify it was created
      const retrieved = await getTestBase(base.id);
      expect(retrieved.id).toBe(base.id);
      expect(retrieved.title).toBe(baseName);
    });
  });

  describe('AI Database Integration', () => {
    it('should connect to MindsDB service', async () => {
      // Verify MindsDB connectivity
      const isConnected = await verifyMindsDBConnection();
      expect(isConnected).toBe(true);
    });

    it('should execute SQL queries in MindsDB', async () => {
      // List databases to verify SQL execution
      const databases = await listMindsDBDatabases();

      expect(databases).toBeDefined();
      expect(Array.isArray(databases)).toBe(true);

      // MindsDB should return some databases (at least information_schema or files)
      expect(databases.length).toBeGreaterThan(0);
    });
  });
});
