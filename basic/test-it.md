# 401 Class 6 — Basic Authentication Testing Guide

## 🎯 Goal

Use the terminal to test the Class 6 Basic Authentication server.

For each test, we will show:

1. **Command** — what to type in the terminal
2. **What we are testing** — what behavior we want to see
3. **Server code** — the part of `basic/server.js` that handles the request
4. **Expected result** — what should happen
5. **Why?** — a short explanation

---

# STEP 0 — Start the Server

Open a terminal in the project.

### 👉 Command

```bash
node basic/server.js
```

### Expected result

```text
Basic Authentication Server running on port 3001
```

Keep this terminal running.

Open a **second terminal** for the tests.

---

# TEST 1 — Is the Server Running?

## Command

```bash
curl http://localhost:3001/
```

## What we are testing

We are checking that the Express server is running and can respond to a request.

## Server code

```js
app.get('/', (req, res) => {
  res.json({
    message: 'Basic Authentication Server is running!'
  });
});
```

## Expected result

```json
{
  "message": "Basic Authentication Server is running!"
}
```

## Why?

The request is:

```text
GET /
```

Express finds the `/` route and sends back a response.

**Key idea:** The server is working.

---

# TEST 2 — Create a User

## Command

```bash
curl -X POST http://localhost:3001/signup \
-H "Content-Type: application/json" \
-d "{\"username\":\"alice\",\"password\":\"secret123\"}"
```

## What we are testing

We are testing whether the server can create a new user.

## Server code

```js
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required.'
    });
  }

  const existingUser = users.find(user => user.username === username);

  if (existingUser) {
    return res.status(400).json({
      error: 'Username already exists.'
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    username,
    password: hashedPassword
  });

  res.status(201).json({
    message: 'User created successfully!',
    username
  });
});
```

## Expected result

```json
{
  "message": "User created successfully!",
  "username": "alice"
}
```

## Why?

The server:

1. Gets the username and password.
2. Checks that both were provided.
3. Checks whether Alice already exists.
4. Hashes the password with `bcrypt`.
5. Stores the user in the `users` array.

The actual password is **not stored directly**.

**Key idea:** We can store a user without storing their plain-text password.

---

# TEST 3 — Sign In with the Correct Password

## Command

```bash
curl -X POST http://localhost:3001/signin \
-H "Content-Type: application/json" \
-d "{\"username\":\"alice\",\"password\":\"secret123\"}"
```

## What we are testing

We are testing whether a registered user can sign in with the correct password.

## Server code

```js
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid username or password.'
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    return res.status(401).json({
      error: 'Invalid username or password.'
    });
  }

  res.status(200).json({
    message: 'Signin successful!',
    username
  });
});
```

## Expected result

```json
{
  "message": "Signin successful!",
  "username": "alice"
}
```

## Why?

The server:

1. Finds Alice.
2. Gets the password she entered.
3. Uses `bcrypt.compare()` to compare it with the stored password hash.
4. The passwords match.
5. The server allows the sign-in.

**Key idea:** `bcrypt.compare()` checks the password without needing to store the original password.

---

# TEST 4 — Sign In with the Wrong Password

## Command

```bash
curl -X POST http://localhost:3001/signin \
-H "Content-Type: application/json" \
-d "{\"username\":\"alice\",\"password\":\"wrongpassword\"}"
```

## What we are testing

We are checking that the server rejects an incorrect password.

## Server code

The same `/signin` code handles this request:

```js
const passwordMatches = await bcrypt.compare(
  password,
  user.password
);

if (!passwordMatches) {
  return res.status(401).json({
    error: 'Invalid username or password.'
  });
}
```

## Expected result

```json
{
  "error": "Invalid username or password."
}
```

HTTP status:

```text
401 Unauthorized
```

## Why?

Alice exists, but the password does not match.

The server refuses to authenticate her.

**Key idea:**

```text
Correct password → 200
Wrong password   → 401
```

---

# TEST 5 — Access the Protected Route Without Authentication

## Command

```bash
curl http://localhost:3001/protected
```

## What we are testing

We are checking that the protected route refuses a request that does not provide authentication information.

## Server code

```js
app.get('/protected', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header required.'
    });
  }

  // authentication continues...
});
```

## Expected result

```json
{
  "error": "Authorization header required."
}
```

HTTP status:

```text
401 Unauthorized
```

## Why?

The request did not include an `Authorization` header.

The server does not know who is making the request.

**Key idea:**

> No credentials = not authenticated.

---

# TEST 6 — Access the Protected Route with Correct Basic Authentication

## Command

```bash
curl -u alice:secret123 http://localhost:3001/protected
```

## What we are testing

We are testing whether a valid username and password can access the protected route.

## Server code

```js
app.get('/protected', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header required.'
    });
  }

  const [scheme, encodedCredentials] = authHeader.split(' ');

  if (scheme !== 'Basic') {
    return res.status(401).json({
      error: 'Basic authentication required.'
    });
  }

  const credentials = Buffer
    .from(encodedCredentials, 'base64')
    .toString();

  const [username, password] = credentials.split(':');

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid username or password.'
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    return res.status(401).json({
      error: 'Invalid username or password.'
    });
  }

  res.status(200).json({
    message: 'You are authenticated!',
    username
  });
});
```

## Expected result

```json
{
  "message": "You are authenticated!",
  "username": "alice"
}
```

HTTP status:

```text
200 OK
```

## Why?

The `-u` option sends Basic Authentication credentials.

The server:

```text
Authorization header
        ↓
Base64 decode
        ↓
username + password
        ↓
Find user
        ↓
bcrypt.compare()
        ↓
Password matches
        ↓
200 OK
```

**Key idea:** Alice has proven that she knows the correct password.

---

# TEST 7 — Access the Protected Route with the Wrong Password

## Command

```bash
curl -u alice:wrongpassword http://localhost:3001/protected
```

## What we are testing

We are checking that the protected route rejects incorrect credentials.

## Server code

```js
const passwordMatches = await bcrypt.compare(
  password,
  user.password
);

if (!passwordMatches) {
  return res.status(401).json({
    error: 'Invalid username or password.'
  });
}
```

## Expected result

```json
{
  "error": "Invalid username or password."
}
```

HTTP status:

```text
401 Unauthorized
```

## Why?

The username exists, but the password is wrong.

The server does not allow access.

**Key idea:**

> Authentication only succeeds when the credentials are correct.

---

# TEST 8 — Use a Username That Does Not Exist

## Command

```bash
curl -u bob:secret123 http://localhost:3001/protected
```

## What we are testing

We are checking that an unknown user cannot access the protected route.

## Server code

```js
const user = users.find(user => user.username === username);

if (!user) {
  return res.status(401).json({
    error: 'Invalid username or password.'
  });
}
```

## Expected result

```json
{
  "error": "Invalid username or password."
}
```

HTTP status:

```text
401 Unauthorized
```

## Why?

There is no user named `bob` in the `users` array.

The server cannot authenticate a user who does not exist.

---

# TEST 9 — See the Authorization Header

This test is optional, but it is useful for teaching what Basic Authentication actually sends.

## Command

```bash
curl -v -u alice:secret123 http://localhost:3001/protected
```

## What we are testing

We are looking at the actual HTTP request sent by `curl`.

## Look for

```text
Authorization: Basic ...
```

The exact value will be different.

## Server code

```js
const authHeader = req.headers.authorization;
```

Then:

```js
const [scheme, encodedCredentials] = authHeader.split(' ');
```

## Why?

Basic Authentication sends credentials in an HTTP header:

```text
Authorization: Basic <encoded credentials>
```

The credentials are Base64 encoded.

### Important

**Base64 is encoding, not encryption.**

That means it can be decoded.

For real applications, Basic Authentication should be used over **HTTPS** so the credentials are protected while traveling across the network.

---

# Quick Test Summary

| Test | Command | Expected |
|---|---|---|
| Server running | `curl http://localhost:3001/` | `200` |
| Create user | `curl -X POST .../signup` | `201` |
| Correct sign in | `curl -X POST .../signin` | `200` |
| Wrong password | `curl -X POST .../signin` | `401` |
| Protected, no auth | `curl .../protected` | `401` |
| Protected, correct auth | `curl -u alice:secret123 .../protected` | `200` |
| Protected, wrong password | `curl -u alice:wrongpassword .../protected` | `401` |
| Unknown user | `curl -u bob:secret123 .../protected` | `401` |

---

# 🎯 The Main Class 6 Demonstration

If you are short on time, focus on these **three tests**:

## 1. No Authentication

```bash
curl http://localhost:3001/protected
```

**Result:**

```text
401 Unauthorized
```

> "You cannot access the protected route because you have not proven who you are."

---

## 2. Correct Authentication

```bash
curl -u alice:secret123 http://localhost:3001/protected
```

**Result:**

```text
200 OK
```

> "The server found Alice and verified her password."

---

## 3. Wrong Authentication

```bash
curl -u alice:wrongpassword http://localhost:3001/protected
```

**Result:**

```text
401 Unauthorized
```

> "Alice exists, but she did not provide the correct password."

---

# 🔑 Class 6 Takeaway

Authentication answers one basic question:

> **Who are you?**

Our Class 6 server answers that question using:

```text
Username
    +
Password
    ↓
Basic Authentication
    ↓
Find User
    ↓
bcrypt.compare()
    ↓
Authenticated?
    ↓
YES → 200 OK
NO  → 401 Unauthorized
```

### Remember

- **Authentication** = Who are you?
- **Basic Authentication** = Send username + password using the `Authorization` header.
- **Base64** = Encoding, not encryption.
- **bcrypt** = Helps safely store passwords.
- **401** = The user is not authenticated.
- **200** = The request was successful.
