import { faker } from '@faker-js/faker';

/**
 * Test data factory for generating realistic test data.
 * Uses faker.js to create varied, realistic data for integration tests.
 */

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id?: string;
  title: string;
  userId: string;
  messages?: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id?: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt?: Date;
}

/**
 * Factory for creating test user data.
 */
export class UserFactory {
  /**
   * Creates a single user with optional overrides.
   *
   * @param overrides - Partial user data to override defaults
   * @returns User object with realistic test data
   *
   * @example
   * ```typescript
   * const user = UserFactory.create({ email: 'specific@test.com' });
   * const adminUser = UserFactory.create({ role: 'admin' });
   * ```
   */
  static create(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: `test-${Date.now()}-${faker.internet.email()}`,
      password: faker.internet.password({ length: 12 }),
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Creates multiple users with optional overrides.
   *
   * @param count - Number of users to create
   * @param overrides - Partial user data to override defaults
   * @returns Array of user objects
   *
   * @example
   * ```typescript
   * const users = UserFactory.createMany(5, { role: 'customer' });
   * ```
   */
  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Creates an admin user.
   */
  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      role: 'admin',
      email: `admin-${Date.now()}@test.com`,
      ...overrides,
    });
  }

  /**
   * Creates a customer user.
   */
  static createCustomer(overrides: Partial<User> = {}): User {
    return this.create({
      role: 'customer',
      ...overrides,
    });
  }
}

/**
 * Factory for creating test conversation data.
 */
export class ConversationFactory {
  /**
   * Creates a single conversation with optional overrides.
   *
   * @param overrides - Partial conversation data to override defaults
   * @returns Conversation object with realistic test data
   */
  static create(overrides: Partial<Conversation> = {}): Conversation {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      userId: faker.string.uuid(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Creates multiple conversations with optional overrides.
   *
   * @param count - Number of conversations to create
   * @param overrides - Partial conversation data to override defaults
   * @returns Array of conversation objects
   */
  static createMany(
    count: number,
    overrides: Partial<Conversation> = {}
  ): Conversation[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Creates a conversation with messages.
   *
   * @param messageCount - Number of messages to include
   * @param overrides - Partial conversation data to override defaults
   * @returns Conversation with messages
   */
  static createWithMessages(
    messageCount: number,
    overrides: Partial<Conversation> = {}
  ): Conversation {
    const conversation = this.create(overrides);
    const conversationId = conversation.id || `conv-${Date.now()}`;
    conversation.messages = MessageFactory.createMany(messageCount, {
      conversationId,
    });
    return conversation;
  }
}

/**
 * Factory for creating test message data.
 */
export class MessageFactory {
  /**
   * Creates a single message with optional overrides.
   *
   * @param overrides - Partial message data to override defaults
   * @returns Message object with realistic test data
   */
  static create(overrides: Partial<Message> = {}): Message {
    return {
      id: faker.string.uuid(),
      conversationId: faker.string.uuid(),
      content: faker.lorem.paragraph(),
      role: 'user',
      createdAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Creates multiple messages with optional overrides.
   *
   * @param count - Number of messages to create
   * @param overrides - Partial message data to override defaults
   * @returns Array of message objects
   */
  static createMany(
    count: number,
    overrides: Partial<Message> = {}
  ): Message[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Creates a user message.
   */
  static createUserMessage(overrides: Partial<Message> = {}): Message {
    return this.create({
      role: 'user',
      content: faker.lorem.paragraph(),
      ...overrides,
    });
  }

  /**
   * Creates an assistant message.
   */
  static createAssistantMessage(overrides: Partial<Message> = {}): Message {
    return this.create({
      role: 'assistant',
      content: faker.lorem.paragraphs(2),
      ...overrides,
    });
  }

  /**
   * Creates a conversation with alternating user/assistant messages.
   *
   * @param turnCount - Number of conversation turns (pairs of messages)
   * @param conversationId - ID of the conversation
   * @returns Array of alternating user/assistant messages
   */
  static createConversationThread(
    turnCount: number,
    conversationId: string
  ): Message[] {
    const messages: Message[] = [];
    for (let i = 0; i < turnCount; i++) {
      messages.push(
        this.createUserMessage({ conversationId }),
        this.createAssistantMessage({ conversationId })
      );
    }
    return messages;
  }
}

/**
 * Utility functions for generating test data.
 */
export class TestDataHelper {
  /**
   * Generates a unique email for testing.
   * Includes timestamp to avoid collisions.
   */
  static uniqueEmail(prefix = 'test'): string {
    return `${prefix}-${Date.now()}-${faker.number.int({
      min: 1000,
      max: 9999,
    })}@test.com`;
  }

  /**
   * Generates a strong password for testing.
   */
  static strongPassword(): string {
    return faker.internet.password({
      length: 16,
      memorable: false,
      pattern: /[A-Za-z0-9!@#$%^&*]/,
    });
  }

  /**
   * Generates a future date for testing expiration.
   */
  static futureDate(daysFromNow = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }

  /**
   * Generates a past date for testing.
   */
  static pastDate(daysAgo = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  /**
   * Waits for a specified time (useful for async operations).
   *
   * @param ms - Milliseconds to wait
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retries an async function until it succeeds or max attempts reached.
   *
   * @param fn - Async function to retry
   * @param maxAttempts - Maximum number of attempts
   * @param delayMs - Delay between attempts in milliseconds
   * @returns Result of the function
   * @throws Error if all attempts fail
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.wait(delayMs);
        }
      }
    }

    throw lastError || new Error('Retry failed with unknown error');
  }
}
