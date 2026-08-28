'use strict';

/*
========================================================
CLASS 7 - BEARER AUTHENTICATION SERVER
========================================================

Today's server demonstrates what happens AFTER a user
has signed in.

The important idea is:

    We don't send the username/password
    with every request.

Instead:

    SIGN IN
       ↓
    receive JWT
       ↓
    send JWT with future requests
       ↓
    Bearer middleware validates JWT
       ↓
    protected route runs

--------------------------------------------------------

CLASS 6:
Basic Authentication

CLASS 7:
Bearer Authentication

CLASS 8:
Role-Based Authorization

--------------------------------------------------------
POINTER -->

Next: tests/bearer.test.js

We will prove that our authentication actually works.
========================================================
*/

const express = require('express');

require('dotenv').config();

const Users = require('./models/users');

const bearerAuth = require('./bearer-auth-middleware');


const app = express();

app.use(express.json());


// ======================================================
// HOME / TEST ROUTE
// ======================================================

app.get('/', (req, res) => {

  res.status(200).json({
    message: 'Bearer Authentication Server is running!'
  });

});


// ======================================================
// SIGNIN
// ======================================================

/*
IMPORTANT:

This is intentionally simplified.

We are pretending that the user has already passed
the password verification from Class 6.

In the real application:

    username + password
            ↓
      bcrypt.compare()
            ↓
          valid?
            ↓
        create token

For today's demo, our focus is what happens AFTER
the token is created.
*/

app.post('/signin', (req, res) => {

  const { username } = req.body;


  const user = Users.findUser(username);


  if (!user) {

    return res.status(401).json({
      error: 'Invalid username.'
    });

  }


  /*
  ------------------------------------------------------
  Create a JWT.

  This represents the token the user would receive
  after successfully signing in.
  ------------------------------------------------------
  */

  const token = Users.createToken(user);


  res.status(200).json({
    message: 'Signin successful!',
    token: token
  });

});


// ======================================================
// PROTECTED ROUTE
// ======================================================

/*
--------------------------------------------------------
THIS IS THE IMPORTANT ROUTE.

The middleware runs BEFORE the route handler.

Request:

    GET /secret
          ↓
    bearerAuth
          ↓
    route handler

If bearerAuth calls:

    next()

the request continues.

If bearerAuth calls:

    next(error)

the route does NOT run.
--------------------------------------------------------
*/

app.get(
  '/secret',
  bearerAuth,
  (req, res) => {

    res.status(200).json({
      message: 'You made it to the secret route!',
      user: req.user
    });

  }
);


// ======================================================
// ANOTHER PROTECTED ROUTE
// ======================================================

app.get(
  '/something',
  bearerAuth,
  (req, res) => {

    res.status(200).json({
      message: 'You are authorized to see this data.',
      username: req.user.username
    });

  }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {

  console.error(error.message);

  res.status(error.status || 500).json({
    error: error.message
  });

});


// ======================================================
// START SERVER
// ======================================================

if (require.main === module) {

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {

    console.log(
      `Bearer Authentication Server running on port ${PORT}`
    );

  });

}


// ======================================================
// EXPORT APP FOR TESTING
// ======================================================

module.exports = app;