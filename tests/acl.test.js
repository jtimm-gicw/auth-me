'use strict';

/*
========================================================
CLASS 8 - ACCESS CONTROL TESTS
========================================================

These tests prove the difference between:

    AUTHENTICATION
    and
    AUTHORIZATION

--------------------------------------------------------

Authentication:

    Do we have a valid token?

Authorization:

    Does the authenticated user have the required
    capability?

--------------------------------------------------------

We will test:

    1. Signin creates a token
    2. No token → 401
    3. Invalid token → 401
    4. User can READ
    5. User cannot CREATE
    6. Editor can CREATE
    7. Editor can UPDATE
    8. Editor cannot DELETE
    9. Admin can DELETE
========================================================
*/

const request = require('supertest');

const app = require('../app');


// ======================================================
// HELPER FUNCTION
// ======================================================

/*
Instead of repeating the signin request in every test,
we can make a small helper.

This function signs in a user and gives us their token.
*/

async function getToken(username) {

  const response = await request(app)
    .post('/signin')
    .send({
      username
    });

  return response.body.token;

}


// ======================================================
// TEST 1
// ======================================================

test('signin returns a token', async () => {

  const response = await request(app)
    .post('/signin')
    .send({
      username: 'alice'
    });


  expect(response.status).toBe(200);

  expect(response.body.token).toBeDefined();

});


// ======================================================
// TEST 2
// ======================================================

test('protected route rejects a request without a token', async () => {

  const response = await request(app)
    .get('/read');


  expect(response.status).toBe(401);

});


// ======================================================
// TEST 3
// ======================================================

test('protected route rejects an invalid token', async () => {

  const response = await request(app)
    .get('/read')
    .set(
      'Authorization',
      'Bearer fake-token'
    );


  expect(response.status).toBe(401);

});


// ======================================================
// TEST 4 - USER CAN READ
// ======================================================

test('user can READ', async () => {

  const token = await getToken('alice');


  const response = await request(app)
    .get('/read')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(200);

});


// ======================================================
// TEST 5 - USER CANNOT CREATE
// ======================================================

test('user cannot CREATE', async () => {

  const token = await getToken('alice');


  const response = await request(app)
    .post('/create')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(403);

});


// ======================================================
// TEST 6 - EDITOR CAN CREATE
// ======================================================

test('editor can CREATE', async () => {

  const token = await getToken('bob');


  const response = await request(app)
    .post('/create')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(200);

});


// ======================================================
// TEST 7 - EDITOR CAN UPDATE
// ======================================================

test('editor can UPDATE', async () => {

  const token = await getToken('bob');


  const response = await request(app)
    .put('/update')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(200);

});


// ======================================================
// TEST 8 - EDITOR CANNOT DELETE
// ======================================================

test('editor cannot DELETE', async () => {

  const token = await getToken('bob');


  const response = await request(app)
    .delete('/delete')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(403);

});


// ======================================================
// TEST 9 - ADMIN CAN DELETE
// ======================================================

test('admin can DELETE', async () => {

  const token = await getToken('admin');


  const response = await request(app)
    .delete('/delete')
    .set(
      'Authorization',
      `Bearer ${token}`
    );


  expect(response.status).toBe(200);

});