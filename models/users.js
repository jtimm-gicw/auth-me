'use strict';

/*
========================================================
CLASS 8 - USERS MODEL
========================================================

ACCESS CONTROL / AUTHORIZATION

CLASS 6:
Authentication

    "Who are you?"

CLASS 7:
Bearer Authentication

    "Can you prove who you are?"

CLASS 8:
Authorization / Access Control

    "What are you allowed to do?"

--------------------------------------------------------

Today's BIG IDEA:

A user has a ROLE.

The role determines the user's CAPABILITIES.

Example:

    user
      ↓
    ['read']

    editor
      ↓
    ['read', 'create', 'update']

    admin
      ↓
    ['read', 'create', 'update', 'delete']

The user's capabilities are placed into the JWT.

The bearer middleware validates the token.

The ACL middleware then checks the capabilities.

--------------------------------------------------------
POINTER -->

Next:
acl-middleware.js

The ACL middleware will look at req.user.capabilities
and decide whether the user is allowed to continue.
========================================================
*/

const jwt = require('jsonwebtoken');

require('dotenv').config();


// ======================================================
// ROLES
// ======================================================

/*
This is our simple "roles table."

It is an object instead of a database table because
we are focusing on the authentication/authorization
concept today.

The KEY is the role name.

The VALUE is an array of capabilities.
*/

const roles = {

  user: [
    'read'
  ],

  editor: [
    'read',
    'create',
    'update'
  ],

  admin: [
    'read',
    'create',
    'update',
    'delete'
  ]

};


// ======================================================
// IN-MEMORY USERS
// ======================================================

/*
These users are for the classroom demonstration.

In the student application, these users will eventually
come from PostgreSQL.

Notice that each user now has a ROLE.

--------------------------------------------------------

Alice:

    role = user

Therefore:

    capabilities = ['read']

--------------------------------------------------------

Bob:

    role = editor

Therefore:

    capabilities = ['read', 'create', 'update']
*/

const users = [
  {
    id: 1,
    username: 'alice',
    password: 'not-used-in-demo',
    role: 'user'
  },

  {
    id: 2,
    username: 'bob',
    password: 'not-used-in-demo',
    role: 'editor'
  },

  {
    id: 3,
    username: 'admin',
    password: 'not-used-in-demo',
    role: 'admin'
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
  CLASS 7:

  We put information about the user into the token.

  CLASS 8:

  We ALSO put the user's capabilities into the token.

  This means that after bearer authentication,
  req.user can contain:

      username
      role
      capabilities
  ------------------------------------------------------
  */

  const userData = {

    id: user.id,

    username: user.username,

    role: user.role,

    capabilities: roles[user.role]

  };


  /*
  ------------------------------------------------------
  Create the JWT.

  The token is signed with our secret.

  The client will receive this token after signin.
  ------------------------------------------------------
  */

  return jwt.sign(
    userData,
    process.env.JWT_SECRET
  );

}


// ======================================================
// AUTHENTICATE TOKEN
// ======================================================

function authenticateToken(token) {

  /*
  ------------------------------------------------------
  This is still the Class 7 token validation method.

  We have NOT changed the basic bearer authentication
  process.

  jwt.verify() checks whether the token is valid.
  ------------------------------------------------------
  */

  try {

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    /*
    ----------------------------------------------------
    Valid token:

        Promise.resolve()

    This sends the decoded user information back to
    bearer-auth-middleware.js.
    ----------------------------------------------------
    */

    return Promise.resolve(user);

  } catch (error) {

    /*
    ----------------------------------------------------
    Invalid token:

        Promise.reject()

    The bearer middleware will catch this error.
    ----------------------------------------------------
    */

    return Promise.reject(error);

  }

}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

  users,

  roles,

  findUser,

  createToken,

  authenticateToken

};