# 🔐 Class 7 Live Demo — Bearer Authentication

**Goal:** Show students the full lifecycle of a JWT — from signin, through rejection paths, to successful protected access.

**Time:** 15–20 minutes
**Server:** `http://localhost:3000`

---

## 🗺️ The Story

```
1. Sign in                     →  get a JWT
2. Hit protected route (none)  →  ❌ 401
3. Wrong auth scheme (Basic)   →  ❌ 401
4. Fake Bearer token           →  ❌ 401
5. Real Bearer token           →  ✅ 200
6. Same token, other route     →  ✅ 200
7. Tampered token              →  ❌ 401
```

> 💬 Tell students up front: *"We're going to break this eight different ways before we make it work — that's how you actually learn what the middleware is doing."*

---

## ✅ Pre-flight Checklist

- [ ] Server running on port 3000
- [ ] Terminal font size bumped up for the room
- [ ] `JWT_SECRET` set in `.env`
- [ ] This file open on a second monitor

---

## TEST 1 — Is the server running?

| | |
|---|---|
| **Purpose** | Sanity check before touching auth |
| **Command** | `curl http://localhost:3000/` |
| **Expect** | `200` |

```json
{ "message": "Bearer Authentication Server is running!" }
```

> 📢 *"Before we test authentication, let's make sure our server is actually running."*

---

## TEST 2 — Sign in as Alice

| | |
|---|---|
| **Purpose** | Get a JWT — the most important starting point |
| **Command** | `curl -X POST http://localhost:3000/signin -H "Content-Type: application/json" -d "{\"username\":\"alice\"}"` |
| **Expect** | `200` + token |

```json
{
  "message": "Signin successful!",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Flow:**
```
username → find user → create JWT → return token
```

> 📢 *"This token is what the client will use for future requests. We don't want to keep sending the username and password."*

⚠️ **Copy this token now — you'll reuse it in Tests 6, 7, and 8.**

---

## TEST 3 — Protected route, no token

| | |
|---|---|
| **Purpose** | Show why the middleware exists |
| **Command** | `curl http://localhost:3000/secret` |
| **Expect** | `401` |

```json
{ "error": "Authorization header required." }
```

**Flow:**
```
GET /secret → bearerAuth → ❌ no token → 401 → route does NOT run
```

> 📢 *"The route is protected. We didn't provide a token, so the middleware stops us before the route handler runs."*

---

## TEST 4 — Wrong auth scheme (Basic instead of Bearer)

| | |
|---|---|
| **Purpose** | Bearer auth specifically requires the word **Bearer** |
| **Command** | `curl http://localhost:3000/secret -H "Authorization: Basic abc123"` |
| **Expect** | `401` |

```json
{ "error": "Bearer token required." }
```

**Compare to Class 6:**
```
Class 6 → Authorization: Basic ...
Class 7 → Authorization: Bearer ...
```

> 📢 *"We have an Authorization header, but we're using the wrong authentication scheme. This route expects Bearer."*

---

## TEST 5 — Fake Bearer token

| | |
|---|---|
| **Purpose** | Correct format, invalid content |
| **Command** | `curl http://localhost:3000/secret -H "Authorization: Bearer abc123"` |
| **Expect** | `401` |

```json
{ "error": "invalid signature" }
```

**Flow:**
```
Authorization header → Bearer → abc123 → authenticateToken()
   → jwt.verify() → ❌ invalid token → 401
```

> 💡 *"Having a token isn't enough. It has to be a valid token."*

---

## TEST 6 — Real Bearer token 🎉

| | |
|---|---|
| **Purpose** | The payoff — authentication succeeds |
| **Command** | `curl http://localhost:3000/secret -H "Authorization: Bearer YOUR_TOKEN_HERE"` |
| **Expect** | `200` |

```json
{
  "message": "You made it to the secret route!",
  "user": {
    "id": 1,
    "username": "alice",
    "role": "student",
    "iat": 1234567890
  }
}
```

### 🖍️ Draw this on the board

```
CLIENT
  |
  | Authorization: Bearer JWT
  ↓
bearerAuth
  |
  | Is there a header?      → YES
  | Is it Bearer?           → YES
  | Is the JWT valid?       → YES
  ↓
req.user = decoded user
  ↓
next()
  ↓
/secret
  ↓
200 OK
```

> 🎉 *"This time the middleware accepted our token, so it called `next()`. That allowed the request to continue to `/secret`."*

**This is your single most important diagram for Class 7.**

---

## TEST 7 — Same token, different route

| | |
|---|---|
| **Purpose** | The token isn't tied to one route |
| **Command** | `curl http://localhost:3000/something -H "Authorization: Bearer YOUR_TOKEN_HERE"` |
| **Expect** | `200` |

```json
{
  "message": "You are authorized to see this data.",
  "username": "alice"
}
```

```
                  JWT
                   |
          ┌────────┴────────┐
          ↓                 ↓
       /secret         /something
          ↓                 ↓
        ALLOW             ALLOW
```

> 💡 *"The same authenticated token can be used to access multiple protected resources."*

---

## ⭐ TEST 8 — Tamper with the token

| | |
|---|---|
| **Purpose** | Show *why* token validation matters |
| **Setup** | Take the valid token and change one character near the end |
| **Command** | `curl http://localhost:3000/secret -H "Authorization: Bearer YOUR_CHANGED_TOKEN"` |
| **Expect** | `401` |

**Why:** JWTs are signed. Changing the token breaks signature verification, and `jwt.verify()` rejects it.

> 📢 *"Notice something important: I didn't remove the token. I didn't change Bearer. I only changed the token. The server still rejects it because the token is no longer valid."*

---

## 📋 Full Run-Sheet (cheat sheet for the room)

| # | Command | Expected | Teaching Point |
|---|---------|----------|-----------------|
| 1 | `curl /` | 200 | Server works |
| 2 | `POST /signin` | 200 + JWT | Get a token |
| 3 | `GET /secret` (no header) | 401 | No token = denied |
| 4 | `Authorization: Basic ...` | 401 | Must use Bearer |
| 5 | `Authorization: Bearer abc123` | 401 | Token must be valid |
| 6 | `Authorization: Bearer <real token>` | 200 | Authentication succeeds |
| 7 | Same token → `/something` | 200 | Token protects multiple routes |
| 8 | Tampered token | 401 | Tampering invalidates the token |

---

## 🚫 Scope Note

This demo covers **Bearer Authentication only**. Do **not** test roles or permissions here — that's Class 8 (Role-Based Authorization).