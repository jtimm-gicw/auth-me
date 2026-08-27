# Class 6 - Basic Authentication Demo

## Goal

Today we are learning how a server can determine:

> "Who are you?"

This is called:

**Authentication**

We are NOT learning authorization yet.

Authorization will come later.

---

# Demo Order

## Part 1 - Passwords

Start with:

```bash
node demo/passwords/passwords.js
```

**We will compare:**

- Base64 encoding

- Bcrypt hashing

***Base64***

```text
secret123
     ↓
Base64
     ↓
c2VjcmV0MTIz
```

> Base64 can be decoded.
> It is **NOT** password protection.

***Bcrypt***

```text
secret123
     ↓
bcrypt
     ↓
$2b$10$...
```

> Bcrypt creates a hash.
> The same password can produce different hashes.
> We use bcrypt.compare() to check a password.

## Part 2 - Authentication Server

**Run:**

```bash
node demo/basic/server.js
```

The server provides:

```bash
GET  /
POST /signup
POST /signin
GET  /protected
Signup
```

**Send:**

```bash
POST /signup
```

with:

```json
{
  "username": "alice",
  "password": "secret123"
}
```

**The server:**

```text
username + password
        ↓
bcrypt.hash()
        ↓
store username + hash
```

The plain-text password is **NOT** stored.

```bash
Signin
```

**Send:**

```bash
POST /signin
```

*with:*

```json
{
  "username": "alice",
  "password": "secret123"
}
```

**The server:**

```text
username + password
        ↓
find user
        ↓
bcrypt.compare()
        ↓
valid / invalid
```

### Basic Authentication

**Basic Authentication uses an HTTP header:**

*Authorization:* Basic <Base64 credentials>

The credentials contain:

```js
username:password
```

*For example:*

```js
alice:secret123
```

is *Base64* encoded before being sent.

#### IMPORTANT:

**Base64 is encoding.**

It is **NOT** encryption.

HTTPS is *required to protect* Basic Authentication while it travels over the network.

**Protected Route**

Try:

```bash
GET /protected
```

***without* authentication.**

The server should respond with:

> 401 Unauthorized

Then provide valid Basic Authentication credentials.

**The server:**

1. Reads the Authorization header
2. Decodes the Base64 credentials
3. Finds the user
4. Uses bcrypt to verify the password
5. Allows the request

## Important Vocabulary

**Authentication**

*"Who are you?"*

Example:

```text
username + password
```

**Authorization**

*"What are you allowed to do?"*

> We will learn this later.

**Encoding**

*Changes the representation of information.*

Example:

```text
Base64
```

> It can be reversed.

**Hashing**

*Creates a one-way representation.*

Example:

```text
bcrypt
```

> We do not decode a bcrypt password.
> We verify it.

#### What Students Should Notice

The authentication process is really a series of steps:

```text
REQUEST
   ↓
Get credentials
   ↓
Find user
   ↓
Verify password
   ↓
Authenticated?
   ↓
YES → allow request
NO  → 401 Unauthorized
```

### Lab Pointer

The demo intentionally puts most of the logic in one file.

Students will now take this working server and:

```text
create middleware
move logic into separate files
clean up the server
prepare the authentication system for future classes
Module 2 Progression
```

*Class 6*
→ Basic Authentication

*Class 7*
→ Bearer Authentication / Tokens

*Class 8*
→ Role-Based Authorization