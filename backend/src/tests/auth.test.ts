import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';

const BASE_URL = 'http://localhost:5000';
const MONGO_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'coinflip_game';
const DB_COLLECTION_NAME = 'users';

const testUserEmail = 'test@test.com';

test.describe('Authorization Tests', () => {
  let mongoClient: MongoClient;

  test.beforeAll(async () => {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    const usersCollection = db.collection(DB_COLLECTION_NAME);

    await usersCollection.deleteOne({ email: testUserEmail }); // Preconditions
  });

  test.afterAll(async () => {
    await mongoClient.close();
  });

  test('001 Should register a new user successfully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        email: testUserEmail,
        password: 'password123',
      },
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('User registered, you can Login now!');
  });

  test('002 Should login successfully and return a token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: testUserEmail,
        password: 'password123',
      },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.token).toBeDefined();
  });

  test('003 Should fail login with incorrect password', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: testUserEmail,
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Wrong email or password.');
  });

  test('004 Should fail login with unavailable email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'unavailable@example.com',
        password: 'password123',
      },
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Wrong email or password.');
  });

  test('005 Should fail with empty email field', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: '',
        password: 'password123',
      },
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Wrong email or password.');
  });

  test('006 Should fail with empty password field', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: testUserEmail,
        password: '',
      },
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Wrong email or password.');
  });
});
