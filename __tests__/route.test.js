const { test, expect } = require('@jest/globals');
const request = require('supertest');
const app = require('../app');

test('Base API route send back 200 status', async () => {
    let response = await request(app).get('/api');

    expect(response.statusCode).toBe(200);
});