import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteBucketCommand, ListBucketsCommand, HeadBucketCommand, ListObjectsV2Command, _Object } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

let s3Client: S3Client | null = null;
const testBuckets: Set<string> = new Set();

/**
 * MinIO connection configuration for integration tests.
 * Uses existing docker-compose MinIO service (S3-compatible).
 */
const getMinioConfig = () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  accessKeyId: process.env.MINIO_ROOT_USER || 'admin',
  secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin123',
  region: process.env.MINIO_REGION || 'us-east-1',
  forcePathStyle: true, // Required for MinIO
});

/**
 * Initializes MinIO S3 client for integration tests.
 * Reuses existing connection if already established.
 *
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function setupTestMinIO(): Promise<void> {
  if (s3Client) {
    console.log('✅ MinIO connection already established');
    return;
  }

  try {
    const config = getMinioConfig();

    s3Client = new S3Client({
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      region: config.region,
      forcePathStyle: config.forcePathStyle,
    });

    // Verify connection by listing buckets
    await s3Client.send(new ListBucketsCommand({}));

    console.log('✅ Test MinIO connected');
  } catch (error) {
    console.error('❌ Failed to connect to MinIO:', error);
    throw error;
  }
}

/**
 * Gets the MinIO S3 client instance.
 *
 * @returns S3 client instance
 * @throws Error if client not initialized
 */
export function getMinioClient(): S3Client {
  if (!s3Client) {
    throw new Error('MinIO client not initialized. Call setupTestMinIO() first.');
  }
  return s3Client;
}

/**
 * Creates a test bucket in MinIO.
 *
 * @param bucketName - Name of bucket to create
 * @returns Promise that resolves when bucket is created
 */
export async function createTestBucket(bucketName: string): Promise<void> {
  const client = getMinioClient();
  
  try {
    // Check if bucket already exists
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`ℹ️  Bucket ${bucketName} already exists`);
  } catch (error) {
    // Bucket doesn't exist, create it
    await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Created test bucket: ${bucketName}`);
  }
  
  testBuckets.add(bucketName);
}

/**
 * Uploads a file to MinIO test bucket.
 *
 * @param bucketName - Name of bucket
 * @param key - Object key (file path)
 * @param body - File content
 * @returns Promise that resolves when upload completes
 */
export async function uploadTestFile(
  bucketName: string,
  key: string,
  body: string | Buffer
): Promise<void> {
  const client = getMinioClient();
  
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
    })
  );
}

/**
 * Downloads a file from MinIO test bucket.
 *
 * @param bucketName - Name of bucket
 * @param key - Object key (file path)
 * @returns Promise that resolves with file content as string
 */
export async function downloadTestFile(
  bucketName: string,
  key: string
): Promise<string> {
  const client = getMinioClient();
  
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );

  // Convert stream to string
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Deletes a file from MinIO test bucket.
 *
 * @param bucketName - Name of bucket
 * @param key - Object key (file path)
 * @returns Promise that resolves when deletion completes
 */
export async function deleteTestFile(
  bucketName: string,
  key: string
): Promise<void> {
  const client = getMinioClient();
  
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

/**
 * Cleans up MinIO test data.
 * Deletes all test buckets created during tests.
 *
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupTestMinIO(): Promise<void> {
  if (!s3Client || testBuckets.size === 0) {
    return;
  }

  try {
    for (const bucketName of testBuckets) {
      try {
        // List all objects in bucket
        const listResponse = await s3Client.send(
          new ListObjectsV2Command({ Bucket: bucketName })
        );

        // Delete all objects first
        if (listResponse.Contents && listResponse.Contents.length > 0) {
          for (const object of listResponse.Contents) {
            if (object.Key) {
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: bucketName,
                  Key: object.Key,
                })
              );
            }
          }
        }

        // Now delete the empty bucket
        await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
        console.log(`🗑️  Deleted test bucket: ${bucketName}`);
      } catch (error) {
        // Bucket might not exist
        console.warn(`⚠️  Could not delete bucket ${bucketName}`);
      }
    }

    testBuckets.clear();
    console.log('🧹 Test MinIO cleaned');
  } catch (error) {
    console.error('❌ Failed to clean MinIO:', error);
    throw error;
  }
}

/**
 * Closes MinIO connection.
 * Should be called in global teardown.
 *
 * @returns Promise that resolves when connection is closed
 */
export async function closeTestMinIO(): Promise<void> {
  if (s3Client) {
    try {
      // S3Client doesn't have explicit close method
      // Just clean up test data and null the client
      await cleanupTestMinIO();
      s3Client = null;
      console.log('✅ Test MinIO connection closed');
    } catch (error) {
      console.error('❌ Failed to close MinIO connection:', error);
      throw error;
    }
  }
}

/**
 * Verifies MinIO connectivity by listing buckets.
 *
 * @returns Promise that resolves to true if connection is healthy
 * @throws Error if connection check fails
 */
export async function verifyMinioConnection(): Promise<boolean> {
  try {
    const client = getMinioClient();
    await client.send(new ListBucketsCommand({}));
    return true;
  } catch (error) {
    console.error('❌ MinIO connection check failed:', error);
    return false;
  }
}
