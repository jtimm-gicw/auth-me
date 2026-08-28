'use strict';

/*
========================================================
CLASS 7 - USERS MODEL
========================================================

This is our fake/in-memory user model.

IMPORTANT:

We are NOT teaching Sequelize today.

We are teaching:

    "How does a server validate a bearer token?"

In a real application, this model could use:

    PostgreSQL
    Sequelize
    MongoDB
    another database
    another ORM

The authentication concept stays the same.

--------------------------------------------------------

CLASS 6
Basic Authentication
    ↓
username + password
    ↓
bcrypt.compare()
    ↓
authenticated
    ↓
create token

CLASS 7
Bearer Authentication
    ↓
receive token
    ↓
authenticateToken()
    ↓
JWT validates token
    ↓
next()

--------------------------------------------------------
POINTER -->

Next: bearer-auth-middleware.js

The middleware will call this model method.
========================================================
*/

const jwt = require('jsonwebtoken');

require('dotenv').config();


// ======================================================
// DEMO USERS
// ======================================================

/*
These users are only for the classroom demo.

In the real application, users will come from
PostgreSQL.

We are giving our users a token so that we can
demonstrate what happens after signin.
*/

const users = [
  {
    id: 1,
    username: 'alice',
    password: 'not-used-in-this-demo',
    role: 'student'
  },
  {
    id: 2,
    username: 'bob',
    password: 'not-used-in-this-demo',
    role: 'instructor'
  }
];


// ======================================================
// FIND USER
// ======================================================

function findUser(username) {

  return users.find(
    user => user.username === username
  );

}


// ======================================================
// CREATE TOKEN
// ======================================================

function createToken(user) {

  /*
  ------------------------------------------------------
  JWT contains information called a PAYLOAD.

  We are keeping our payload very small.

  We are putting the user's:

      id
      username
      role

  into the token.

  The token will be signed using our secret.
  ------------------------------------------------------
  */

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET
  );

}


// ======================================================
// AUTHENTICATE TOKEN
// ======================================================

function authenticateToken(token) {

  /*
  ------------------------------------------------------
  IMPORTANT:

  This method returns a PROMISE.

  Why?

  Our middleware will use:

      .then()
      .catch()

  A valid token resolves.

  An invalid token rejects.
  ------------------------------------------------------
  */

  try {

    /*
    ----------------------------------------------------
    jwt.verify() checks:

    - Is the token real?
    - Has the token been changed?
    - Was it signed with our secret?
    - Is it otherwise valid?

    If something is wrong, jwt.verify() throws an error.
    ----------------------------------------------------
    */

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return Promise.resolve(user);

  } catch (error) {

    /*
    ----------------------------------------------------
    The token was NOT valid.

    Reject the Promise.

    The middleware will catch this and send the
    request to Express's error handler.
    ----------------------------------------------------
    */

    return Promise.reject(error);

  }

}


module.exports = {
  users,
  findUser,
  createToken,
  authenticateToken
};