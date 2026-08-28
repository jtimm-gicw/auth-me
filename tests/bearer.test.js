'use strict';

/*
========================================================
CLASS 7 - BEARER AUTHENTICATION TESTS
========================================================

These tests demonstrate the authentication flow.

We are testing:

    1. Server works
    2. Signin returns a token
    3. Protected route rejects no token
    4. Protected route rejects bad token
    5. Protected route accepts valid token

--------------------------------------------------------
POINTER -->

After running these tests, demonstrate the same
requests manually with an HTTP client.
========================================================
*/

const request = require('supertest');

const app = require('../app');


// ======================================================
// TEST 1 - SERVER
// ======================================================

test('server responds', async () => {

  const response = await request(app)
    .get('/');

  expect(response.status).toBe(200);

});


// ======================================================
// TEST 2 - SIGNIN RETURNS TOKEN
// ======================================================

test('signin returns a bearer token', async () => {

  const response = await request(app)
    .post('/signin')
    .send({
      username: 'alice'
    });


  expect(response.status).toBe(200);

  expect(response.body.token).toBeDefined();

});


// ======================================================
// TEST 3 - PROTECTED ROUTE REJECTS NO TOKEN
// ======================================================

test('protected route rejects a request without a token', async () => {

  const response = await request(app)
    .get('/secret');


  expect(response.status).toBe(401);

});


// ======================================================
// TEST 4 - PROTECTED ROUTE REJECTS BAD TOKEN
// ======================================================

test('protected route rejects an invalid token', async () => {

  const response = await request(app)
    .get('/secret')
    .set(
      'Authorization',
      'Bearer this-is-not-a-real-token'
    );


  expect(response.status).toBe(401);

});


// ======================================================
// TEST 5 - PROTECTED ROUTE ACCEPTS VALID TOKEN
// ======================================================

test('protected route accepts a valid token', async () => {

  /*
  ------------------------------------------------------
  First, sign in.
  ------------------------------------------------------
  */

  const signinResponse = await request(app)
    .post('/signin')
    .send({
      username: 'alice'
    });


  const token = signinResponse.body.token;


  /*
  ------------------------------------------------------
  Now use that token to access the protected route.
  ------------------------------------------------------
  */

  const response = await request(app)
    .get('/secret')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(200);

  expect(response.body.user.username)
    .toBe('alice');

});