import axios from 'axios';

describe('Authorization Tests', () => {
    const BASE_URL = 'http://localhost:5000';

    it('should register a new user successfully', async () => {
        const response = await axios.post(${BASE_URL}/register, {
        email: 'test@example.com',
            password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.data.message).toBe('User registered, you can Login now!');

});

it('should login successfully and return a token', async () => {
    const response = await axios.post(${BASE_URL}/login, {
    email: 'test@example.com',
        password: 'password123',
});

expect(response.status).toBe(200);
expect(response.data.token).toBeDefined();

});

it('should fail login with incorrect password', async () => {
    try {
        await axios.post(${BASE_URL}/login, {
        email: 'test@example.com',
            password: 'wrongpassword',
    });
} catch (error: any) {
    expect(error.response.status).toBe(401);
    expect(error.response.data.error).toBe('Wrong email or password.');
}
});
});