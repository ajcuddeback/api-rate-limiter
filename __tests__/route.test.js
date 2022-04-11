const { test, expect } = require('@jest/globals');
const request = require('supertest');
const app = require('../app');

test('Base API route send back 200 status', async () => {
    let response = await request(app).get('/api');

    expect(response.statusCode).toBe(200);
});

test('Rate limiting send back 400 status', async () => {
    let responseArr = [];

    for(let i = 0; i < 3; i++) {
        let response = await request(app).get('/api');

        responseArr.push(response);
    }

    expect(responseArr[responseArr.length - 1].statusCode).toBe(400);
})