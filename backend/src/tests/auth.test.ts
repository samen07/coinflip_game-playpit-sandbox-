import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import * as testUtils from "../utils";
import config from "../test_config";

const BASE_URL : string = config.BASE_BACKEND_ENDPOINT_URL;
const MONGO_URI : string = config.MONGO_URI;
const DATABASE_NAME: string = config.DATABASE_NAME;
const DB_COLLECTION_NAME : string = config.DB_COLLECTION_NAME;

const authData = testUtils.getAuthData();

test.describe('Authorization Tests', () => {
  let mongoClient: MongoClient;

  test.beforeAll(async () => {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    const usersCollection = db.collection(DB_COLLECTION_NAME);

    await usersCollection.deleteOne({ email: authData.email }); // Preconditions
    await usersCollection.deleteOne({ email: authData.reg_new_test_usr }); // Preconditions
  });

  test.afterAll(async () => {
    await mongoClient.close();
  });

  test('001 Should register a new user successfully',
       async ({ request }) => {
    const response = await request.post(`${BASE_URL}/register`, {
      data: {
        email: authData.email,
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
        email: authData.email,
        password: authData.password,
      },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.token).toBeDefined();
  });

  test('003 Should fail login with incorrect password', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: authData.email,
        password: authData.wrongpassword,
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
        email: authData.email,
        password: '',
      },
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Wrong email or password.');
  });
});
