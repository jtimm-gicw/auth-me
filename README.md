# 🔐 Class 7 — Bearer Authentication

## 🎯 Goal

Today we are learning what happens **after a user has authenticated**.

In Class 6, we asked:

> **"Who are you?"**

This is **Authentication**.

In Class 7, we learn how the server can remember that a user has already authenticated without requiring the user to repeatedly send their password.

We will use:

**Bearer Authentication + JSON Web Tokens (JWTs)**

---

# 🧭 Module 2 Progression

```text
CLASS 6
Basic Authentication
        ↓
Username + Password
        ↓
"Who are you?"


CLASS 7
Bearer Authentication
        ↓
JWT
        ↓
"Can you prove you already authenticated?"


CLASS 8
Role-Based Authorization
        ↓
Roles + Permissions
        ↓
"What are you allowed to do?"
```

---

# 📚 Part 1 — Review Class 6

In Class 6, authentication looked like:

```text
username + password
        ↓
find user
        ↓
bcrypt.compare()
        ↓
valid?
        ↓
authenticated
```

Basic Authentication uses:

```text
Authorization: Basic <credentials>
```

Class 7 introduces a different approach.

```text
SIGN IN
   ↓
Receive JWT
   ↓
Send JWT with future requests
   ↓
Server verifies JWT
   ↓
Access protected resource
```

---

# 🚀 Part 2 — Start the Server

Run:

```bash
node app.js
```

You should see:

```text
Bearer Authentication Server running on port 3000
```

Our server provides:

```text
GET  /
POST /signin
GET  /secret
GET  /something
```

The routes:

```text
/secret
/something
```

are protected with Bearer Authentication.

---

# 👤 Part 3 — Sign In

Send a request to:

```text
POST /signin
```

with:

```json
{
  "username": "alice"
}
```

For today's demo, signin is intentionally simplified.

We are pretending Alice already passed the password verification from Class 6.

A complete application would look like:

```text
username + password
        ↓
find user
        ↓
bcrypt.compare()
        ↓
valid?
        ↓
create JWT
```

Today we focus on what happens **after authentication succeeds**.

---

# 🎟️ Part 4 — Create the JWT

The server finds the user:

```js
const user = Users.findUser(username);
```

Then creates a token:

```js
const token = Users.createToken(user);
```

The JWT contains a **payload**.

A payload is the information stored inside the token.

Our payload contains:

```js
const payload = {
  id: user.id,
  username: user.username,
  role: user.role
};
```

The token is created with:

```js
jwt.sign(
  payload,
  process.env.JWT_SECRET
);
```

The response looks similar to:

```json
{
  "message": "Signin successful!",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

# 🪪 What Is a JWT?

**JWT** means:

> **JSON Web Token**

A JWT is a token that can carry information about an authenticated user.

```text
User signs in
     ↓
Server verifies user
     ↓
Server creates JWT
     ↓
Client receives JWT
     ↓
Client sends JWT
on future requests
```

---

# 🔑 JWT Secret

The token is signed using:

```text
JWT_SECRET
```

For example, our `.env` file may contain:

```text
JWT_SECRET=your-secret-here
```

The secret is used when creating and verifying tokens.

⚠️ **IMPORTANT**

The JWT secret should **not** be placed directly into public source code or committed to GitHub.

---

# 📨 Part 5 — Bearer Authentication

Bearer Authentication uses the HTTP:

```text
Authorization
```

header.

The format is:

```text
Authorization: Bearer <token>
```

For example:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# 🔄 Class 6 vs. Class 7

### Class 6

```text
Authorization: Basic <credentials>
```

### Class 7

```text
Authorization: Bearer <token>
```

The important difference is:

```text
CLASS 6
username + password
        ↓
Basic Authentication


CLASS 7
JWT
 ↓
Bearer Authentication
```

---

# 🛡️ Part 6 — Protected Routes

Our `/secret` route uses:

```js
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
```

Notice:

```js
bearerAuth
```

comes **before** the route handler.

That means:

```text
REQUEST
   ↓
bearerAuth
   ↓
route handler
```

The middleware gets the first chance to inspect the request.

---

# 🚫 Request Without a Token

If we request:

```text
GET /secret
```

without authentication:

```text
GET /secret
     ↓
bearerAuth
     ↓
No Authorization Header
     ↓
❌ 401 Unauthorized
```

The protected route does **not** run.

---

# 🔍 Part 7 — Bearer Authentication Middleware

The middleware performs several checks.

## Step 1 — Find the Authorization Header

```js
const authHeader = req.headers.authorization;
```

If there is no header:

```text
❌ 401 Unauthorized
```

---

## Step 2 — Separate Bearer and Token

An Authorization header looks like:

```text
Bearer abc123
```

The middleware separates it:

```js
const [scheme, token] = authHeader.split(' ');
```

Now we have:

```text
scheme = Bearer

token = abc123
```

---

## Step 3 — Check the Scheme

The middleware expects:

```text
Bearer
```

If someone sends:

```text
Authorization: Basic abc123
```

the request is rejected.

```text
Basic
  ↓
❌ 401
```

---

## Step 4 — Verify the JWT

The middleware calls:

```js
Users.authenticateToken(token);
```

The users model uses:

```js
jwt.verify(
  token,
  process.env.JWT_SECRET
);
```

This verifies the token.

---

# ✅ Part 8 — Valid Token

If the token is valid:

```js
req.user = user;

next();
```

`req.user` now contains information about the authenticated user.

For example:

```js
{
  id: 1,
  username: 'alice',
  role: 'student'
}
```

Then:

```js
next();
```

means:

> **"Authentication succeeded. Continue."**

---

# 🔄 Successful Request Flow

```text
CLIENT
   |
   | Authorization: Bearer JWT
   ↓
bearerAuth
   |
   ↓
Check Authorization header
   |
   ↓
Check Bearer scheme
   |
   ↓
jwt.verify()
   |
   ↓
VALID
   |
   ↓
req.user = user
   |
   ↓
next()
   |
   ↓
Protected Route
   |
   ↓
✅ 200 OK
```

---

# ❌ Part 9 — Invalid Token

If the token is fake, changed, or otherwise invalid:

```text
REQUEST
   ↓
Bearer token
   ↓
jwt.verify()
   ↓
INVALID
   ↓
next(error)
   ↓
❌ 401 Unauthorized
```

The protected route does not run.

---

# ♻️ Part 10 — Reusing the Token

The same valid token can be sent to:

```text
GET /something
```

Both routes use:

```js
bearerAuth
```

So one authenticated token can be used with multiple protected routes.

```text
                 JWT
                  |
          ┌───────┴───────┐
          ↓               ↓
       /secret        /something
          ↓               ↓
     bearerAuth       bearerAuth
          ↓               ↓
       ✅ 200           ✅ 200
```

---

# 📖 Important Vocabulary

### Authentication

> **"Who are you?"**

---

### Bearer Authentication

Authentication where the client sends a token:

```text
Authorization: Bearer <token>
```

---

### Token

A value given to a client after successful authentication.

---

### JWT

**JSON Web Token**

A commonly used format for authentication tokens.

---

### Payload

Information stored inside a JWT.

Example:

```js
{
  id: 1,
  username: 'alice',
  role: 'student'
}
```

---

### JWT Secret

A secret value used when signing and verifying JWTs.

---

### Middleware

Code that runs between the request and the route handler.

```text
REQUEST
   ↓
MIDDLEWARE
   ↓
ROUTE
   ↓
RESPONSE
```

---

### `next()`

Tells Express:

> **"Continue to the next step."**

```text
Valid token
    ↓
next()
    ↓
Protected Route
```

---

### `next(error)`

Tells Express:

> **"Something went wrong. Send this to the error handler."**

```text
Invalid token
     ↓
next(error)
     ↓
Error Handler
     ↓
401
```

---

# 🧠 What Students Should Notice

Bearer Authentication is really a series of steps:

```text
SIGN IN
   ↓
Create JWT
   ↓
Return JWT
   ↓
Client receives JWT
   ↓
Client requests protected resource
   ↓
Authorization: Bearer <JWT>
   ↓
bearerAuth
   ↓
jwt.verify()
   ↓
Valid?
   |
   ├──── YES ────→ req.user
   |                  ↓
   |                next()
   |                  ↓
   |             Protected Route
   |                  ↓
   |               ✅ 200
   |
   └──── NO ─────→ ❌ 401
```

---

# 🔗 Lab Pointer

Pay special attention to:

```js
jwt.sign()
```

Creates a JWT.

```js
jwt.verify()
```

Verifies a JWT.

```js
req.headers.authorization
```

Gets the Authorization header.

```js
req.user
```

Stores information about the authenticated user.

```js
next()
```

Allows the request to continue.

---

# 🏁 Class 7 Takeaway

```text
USER AUTHENTICATES
        ↓
SERVER CREATES JWT
        ↓
CLIENT RECEIVES JWT
        ↓
CLIENT SENDS JWT
        ↓
BEARER MIDDLEWARE
        ↓
JWT VERIFIED
        ↓
req.user
        ↓
PROTECTED ROUTE
```

### ➡️ Next: Class 8

Now that the server knows:

> **"Who are you?"**

Class 8 will ask:

> **"What are you allowed to do?"**

That introduces:

**Role-Based Authorization + ACL**
