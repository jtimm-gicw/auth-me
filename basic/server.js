'use strict';

/*
node basic/server.js
========================================================
CLASS 6 - BASIC AUTHENTICATION SERVER
========================================================

This server exists ONLY to demonstrate authentication.

It is intentionally written as one file.

Why?

Because today's LAB will ask students to take this
working example and modularize it.

--------------------------------------------------------

TODAY'S CONCEPTS:

Authentication
Basic Authentication
Signup
Signin
Password hashing
Authorization headers
Base64
Bcrypt

--------------------------------------------------------

IMPORTANT:

The users are stored IN MEMORY for this demo.

This means:

- Restart the server = users disappear
- No PostgreSQL is required for this demo
- We are focusing on AUTHENTICATION, not data modeling

Students will connect these ideas to PostgreSQL
during the lab.

--------------------------------------------------------
POINTER -->

Next: Students will modularize this server during LAB.

Later classes will build on this:

Class 7 --> Bearer Authentication / Tokens
Class 8 --> Role-Based Authorization
========================================================
*/

const express = require('express');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());


// ======================================================
// IN-MEMORY USERS MODEL
// ======================================================

/*
This array is our temporary "database."

Each user will look something like this:

{
  username: 'alice',
  password: '$2b$10$...'
}

IMPORTANT:

We NEVER store the plain-text password.

We store the bcrypt hash instead.
*/

const users = [];


// ======================================================
// TEST ROUTE
// ======================================================

app.get('/', (req, res) => {

  res.status(200).json({
    message: 'Basic Authentication Server is running!'
  });

});


// ======================================================
// SIGNUP
// ======================================================

app.post('/signup', async (req, res, next) => {

  try {

    /*
    ----------------------------------------------------
    STEP 1: Get the username and password
    ----------------------------------------------------
    */

    const { username, password } = req.body;


    /*
    ----------------------------------------------------
    STEP 2: Make sure we received both values
    ----------------------------------------------------
    */

    if (!username || !password) {

      return res.status(400).json({
        error: 'Username and password are required.'
      });

    }


    /*
    ----------------------------------------------------
    STEP 3: Check whether the user already exists
    ----------------------------------------------------
    */

    const existingUser = users.find(
      user => user.username === username
    );

    if (existingUser) {

      return res.status(400).json({
        error: 'User already exists.'
      });

    }


    /*
    ----------------------------------------------------
    STEP 4: Hash the password
    ----------------------------------------------------

    NEVER store the original password.

    bcrypt.hash() creates a one-way password hash.
    */

    const hashedPassword = await bcrypt.hash(password, 10);


    /*
    ----------------------------------------------------
    STEP 5: Create the user
    ----------------------------------------------------
    */

    const user = {
      username: username,
      password: hashedPassword
    };


    /*
    ----------------------------------------------------
    STEP 6: Store the user
    ----------------------------------------------------
    */

    users.push(user);


    /*
    ----------------------------------------------------
    STEP 7: Send a response
    ----------------------------------------------------

    Notice that we do NOT send the password/hash back
    to the client.
    */

    res.status(201).json({
      message: 'User created successfully.',
      username: user.username
    });

  } catch (error) {

    next(error);

  }

});


// ======================================================
// SIGNIN
// ======================================================

app.post('/signin', async (req, res, next) => {

  try {

    /*
    ----------------------------------------------------
    STEP 1: Get username and password
    ----------------------------------------------------
    */

    const { username, password } = req.body;


    /*
    ----------------------------------------------------
    STEP 2: Find the user
    ----------------------------------------------------
    */

    const user = users.find(
      user => user.username === username
    );


    /*
    ----------------------------------------------------
    STEP 3: Make sure the user exists
    ----------------------------------------------------
    */

    if (!user) {

      return res.status(401).json({
        error: 'Invalid username or password.'
      });

    }


    /*
    ----------------------------------------------------
    STEP 4: Compare the password
    ----------------------------------------------------

    We do NOT decode the stored bcrypt hash.

    bcrypt.compare() checks whether:

        plain-text password

    matches:

        stored bcrypt hash
    */

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );


    /*
    ----------------------------------------------------
    STEP 5: Reject an incorrect password
    ----------------------------------------------------
    */

    if (!passwordIsValid) {

      return res.status(401).json({
        error: 'Invalid username or password.'
      });

    }


    /*
    ----------------------------------------------------
    STEP 6: Authentication succeeded
    ----------------------------------------------------
    */

    res.status(200).json({
      message: 'Signin successful!',
      username: user.username
    });

  } catch (error) {

    next(error);

  }

});


// ======================================================
// BASIC AUTHENTICATION TEST ROUTE
// ======================================================

app.get('/protected', (req, res) => {

  /*
  ----------------------------------------------------
  STEP 1: Look for the Authorization header
  ----------------------------------------------------

  The client sends something like:

  Authorization: Basic YWxpY2U6c2VjcmV0MTIz

  "Basic" tells us which authentication scheme
  is being used.

  The rest is Base64 encoded:

  username:password
  ----------------------------------------------------
  */

  const authHeader = req.headers.authorization;


  if (!authHeader) {

    return res.status(401).json({
      error: 'Authorization header required.'
    });

  }


  /*
  ----------------------------------------------------
  STEP 2: Check that this is Basic Authentication
  ----------------------------------------------------
  */

  const [scheme, encodedCredentials] =
    authHeader.split(' ');


  if (scheme !== 'Basic') {

    return res.status(401).json({
      error: 'Basic authentication required.'
    });

  }


  /*
  ----------------------------------------------------
  STEP 3: Decode the Base64 credentials
  ----------------------------------------------------

  Base64 is NOT protecting the password.

  It is simply encoding:

      username:password
  ----------------------------------------------------
  */

  const credentials = Buffer
    .from(encodedCredentials, 'base64')
    .toString();


  /*
  ----------------------------------------------------
  STEP 4: Separate username and password
  ----------------------------------------------------
  */

  const [username, password] =
    credentials.split(':');


  /*
  ----------------------------------------------------
  STEP 5: Find the user
  ----------------------------------------------------
  */

  const user = users.find(
    user => user.username === username
  );


  if (!user) {

    return res.status(401).json({
      error: 'Invalid username or password.'
    });

  }


  /*
  ----------------------------------------------------
  STEP 6: Compare the password with bcrypt
  ----------------------------------------------------
  */

  bcrypt.compare(password, user.password)
    .then(passwordIsValid => {

      if (!passwordIsValid) {

        return res.status(401).json({
          error: 'Invalid username or password.'
        });

      }


      /*
      ------------------------------------------------
      Authentication succeeded!
      ------------------------------------------------
      */

      res.status(200).json({
        message: 'You are authenticated!',
        username: user.username
      });

    })
    .catch(error => {

      res.status(500).json({
        error: 'Authentication error.'
      });

    });

});


// ======================================================
// ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {

  console.error(error);

  res.status(500).json({
    error: 'Something went wrong.'
  });

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

  console.log(
    `Basic Authentication Server running on port ${PORT}`
  );

});