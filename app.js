'use strict';

/*
========================================================
CLASS 8 - ACCESS CONTROL SERVER
========================================================

Today's server builds directly on Class 7.

CLASS 7:

    Sign in
       ↓
    JWT
       ↓
    Bearer token
       ↓
    bearerAuth
       ↓
    protected route

CLASS 8:

    Sign in
       ↓
    JWT
       ↓
    Bearer token
       ↓
    bearerAuth
       ↓
    acl('capability')
       ↓
    protected route

--------------------------------------------------------

AUTHENTICATION:

    "Who are you?"

AUTHORIZATION:

    "What are you allowed to do?"
========================================================
*/

const express = require('express');

require('dotenv').config();

const Users = require('./models/users');

const bearerAuth = require('./bearer-auth-middleware');

const acl = require('./acl-middleware');


const app = express();

app.use(express.json());


// ======================================================
// HOME
// ======================================================

app.get('/', (req, res) => {

  res.status(200).json({
    message: 'Access Control Server is running!'
  });

});


// ======================================================
// SIGNIN
// ======================================================

/*
--------------------------------------------------------
This is intentionally simple.

We are focusing on authorization today.

The real Class 6 signin process would:

    username + password
            ↓
      bcrypt.compare()
            ↓
        create JWT

For this demo, the username is enough to demonstrate
the token/capability process.
--------------------------------------------------------
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
  The user's ROLE determines their capabilities.

  Those capabilities are placed into the JWT.
  ------------------------------------------------------
  */

  const token = Users.createToken(user);


  res.status(200).json({

    message: 'Signin successful!',

    token: token

  });

});


// ======================================================
// READ ROUTE
// ======================================================

/*
--------------------------------------------------------
This route requires:

    1. Valid bearer token
    2. 'read' capability

A normal user can access this.

An editor can access this.

An admin can access this.
--------------------------------------------------------
*/

app.get(
  '/read',
  bearerAuth,
  acl('read'),
  (req, res) => {

    res.status(200).json({

      message: 'You have READ access.',

      user: req.user.username

    });

  }
);


// ======================================================
// CREATE ROUTE
// ======================================================

/*
--------------------------------------------------------
This route requires:

    1. Valid bearer token
    2. 'create' capability

User:
    ❌

Editor:
    ✅

Admin:
    ✅
--------------------------------------------------------
*/

app.post(
  '/create',
  bearerAuth,
  acl('create'),
  (req, res) => {

    res.status(200).json({

      message: 'You have CREATE access.',

      user: req.user.username

    });

  }
);


// ======================================================
// UPDATE ROUTE
// ======================================================

app.put(
  '/update',
  bearerAuth,
  acl('update'),
  (req, res) => {

    res.status(200).json({

      message: 'You have UPDATE access.',

      user: req.user.username

    });

  }
);


// ======================================================
// DELETE ROUTE
// ======================================================

/*
--------------------------------------------------------
This route requires:

    'delete'

Only the admin has this capability.
--------------------------------------------------------
*/

app.delete(
  '/delete',
  bearerAuth,
  acl('delete'),
  (req, res) => {

    res.status(200).json({

      message: 'You have DELETE access.',

      user: req.user.username

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
      `Access Control Server running on port ${PORT}`
    );

  });

}


// ======================================================
// EXPORT APP FOR JEST/SUPERTEST
// ======================================================

module.exports = app;