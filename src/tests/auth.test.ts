import axios from 'axios';
import { MongoClient } from 'mongodb';

describe("Authorization Tests", () => {
  const BASE_URL = "http://localhost:5000";
  const MONGO_URI = "mongodb://localhost:27017";
  const DATABASE_NAME = "coinflip";
  const DB_COLLECTION_NAME = "users";

  let mongoClient: MongoClient;

  beforeAll(async () => {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    const usersCollection = db.collection(DB_COLLECTION_NAME);

    await usersCollection.deleteOne({ email: "test@example.com" }); //preconditions delete test user
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  it("should register a new user successfully", async () => {
    const response = await axios.post(`${BASE_URL}/register`, {
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.data.message).toBe("User registered, you can Login now!");
  });

  it("should login successfully and return a token", async () => {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  it('should fail login with incorrect password', async () => {
    let errorResponse;
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    } catch (error: any) {
      errorResponse = error.response;
    }
    expect(errorResponse).toBeDefined();
    expect(errorResponse.status).toBe(401);
    expect(errorResponse.data.error).toBe('Wrong email or password.');
  });


  it("should fail login with unavailable email", async () => {
    let errorResponse;
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: "unavailable@example.com",
        password: "password123",
      });
    } catch (error: any) {
      errorResponse = error.response;
    }
    expect(errorResponse).toBeDefined();
    expect(errorResponse.status).toBe(401);
    expect(errorResponse.data.error).toBe("Wrong email or password.");
  });

  it("should fail with empty email field", async () => {
    let errorResponse;
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: "",
        password: "password123",
      });
    } catch (error: any) {
      errorResponse = error.response;
    }
    expect(errorResponse).toBeDefined();
    expect(errorResponse.status).toBe(401);
    expect(errorResponse.data.error).toBe("Wrong email or password.");
  });

  it("should fail with empty password field", async () => {
    try {
      await axios.post(`${BASE_URL}/login`, {
        email: "test@example.com",
        password: "",
      });
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.error).toBe("Wrong email or password.");
    }
  });
});
