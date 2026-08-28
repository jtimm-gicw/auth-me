'use strict';

/*
========================================================
CLASS 7 - BEARER AUTHENTICATION MIDDLEWARE
========================================================

This middleware protects routes.

Its job is VERY simple:

    1. Find the Authorization header
    2. Make sure it uses Bearer authentication
    3. Get the token
    4. Ask the users model to validate it
    5. Call next() if valid
    6. Call next(error) if invalid

--------------------------------------------------------

COMPARE THIS TO BASIC AUTH:

Basic Authentication:

    Authorization: Basic <credentials>

Bearer Authentication:

    Authorization: Bearer <token>

--------------------------------------------------------

WHY USE BEARER AUTH?

With Basic Authentication, the client sends the
username/password again.

We don't want to keep sending the password.

Instead:

    SIGN IN
       ↓
    username + password
       ↓
    server verifies password
       ↓
    server creates token
       ↓
    client stores token
       ↓
    future requests send token

--------------------------------------------------------
POINTER -->

Next: app.js

We will use this middleware on a protected route.
========================================================
*/

const Users = require('./models/users');


// ======================================================
// BEARER AUTHENTICATION MIDDLEWARE
// ======================================================

function bearerAuth(req, res, next) {

  /*
  ------------------------------------------------------
  STEP 1: Get the Authorization header
  ------------------------------------------------------
  */

  const authHeader = req.headers.authorization;


  if (!authHeader) {

    const error = new Error(
      'Authorization header required.'
    );

    error.status = 401;

    return next(error);

  }


  /*
  ------------------------------------------------------
  STEP 2: Separate the scheme and token

  Example:

      Authorization: Bearer abc123

  becomes:

      scheme = Bearer
      token  = abc123
  ------------------------------------------------------
  */

  const [scheme, token] = authHeader.split(' ');


  /*
  ------------------------------------------------------
  STEP 3: Make sure the scheme is Bearer
  ------------------------------------------------------
  */

  if (scheme !== 'Bearer' || !token) {

    const error = new Error(
      'Bearer token required.'
    );

    error.status = 401;

    return next(error);

  }


  /*
  ------------------------------------------------------
  STEP 4: Ask the USERS MODEL to validate the token.

  Notice what this middleware DOES NOT know how to do.

  It does not know how JWT works.

  It does not know how the database works.

  It simply asks the model:

      "Is this token valid?"
  ------------------------------------------------------
  */

  Users.authenticateToken(token)

    .then(user => {

      /*
      --------------------------------------------------
      The token was valid.

      Save the decoded user information on req.

      This means the next route can access:

          req.user

      --------------------------------------------------
      */

      req.user = user;


      /*
      --------------------------------------------------
      IMPORTANT:

      next() means:

          "Authentication succeeded.
           Continue to the next middleware/route."
      --------------------------------------------------
      */

      next();

    })

    .catch(error => {

      /*
      --------------------------------------------------
      The token was invalid.

      next(error) sends the error to Express's
      error-handling middleware.
      --------------------------------------------------
      */

      error.status = 401;

      next(error);

    });

}


module.exports = bearerAuth;