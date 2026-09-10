# 🛡️ Class 8 Live Demo — Role-Based Access Control (ACL)

**Goal:** Show students that authentication (Class 7) and authorization (Class 8) are two separate questions — and that the *same* valid token can be allowed on one route and rejected on another, based on role.

**Time:** 15–20 minutes
**Server:** `http://localhost:3000`

---

## 🧠 The Big Idea

```
AUTHENTICATION          AUTHORIZATION
"Who are you?"    →     "What are you allowed to do?"

   bearerAuth      →         acl('capability')
```

```
Sign in → JWT → Bearer token → bearerAuth → acl('capability') → protected route
```

> 💬 Tell students up front: *"Last class, we proved WHO you are. Today, a valid token isn't the finish line — it's just the ticket to ask 'am I allowed to do THIS?'"*

---

## 🗺️ The Cast of Users

| Username | Role | Capabilities |
|----------|------|---------------|
| `alice`  | `user`   | `read` |
| `bob`    | `editor` | `read`, `create`, `update` |
| `admin`  | `admin`  | `read`, `create`, `update`, `delete` |

> 📢 *"Notice — this isn't about who's a 'real' user vs a 'fake' one. All three log in successfully. The difference shows up later, at the door of each route."*

---

## 🗺️ The Story

```
1. Server health check
2. Sign in as all three roles → compare their tokens
3. No token at all              →  ❌ 401 (Class 7 review)
4. alice (user) reads           →  ✅ 200
5. alice (user) tries to create →  ❌ 403  ← the new part!
6. bob (editor) creates         →  ✅ 200
7. bob (editor) updates         →  ✅ 200
8. bob (editor) tries to delete →  ❌ 403
9. admin deletes                →  ✅ 200
```

> 💬 *"Watch closely: alice and bob both have PERFECTLY VALID tokens the whole time. They're never rejected for being unauthenticated. They're rejected for being unauthorized."*

---

## ✅ Pre-flight Checklist

- [ ] Server running on port 3000
- [ ] `JWT_SECRET` set in `.env`
- [ ] Terminal font size bumped up for the room
- [ ] This file open on a second monitor

---

## TEST 1 — Is the server running?

| | |
|---|---|
| **Purpose** | Sanity check before touching auth |
| **Command** | `curl http://localhost:3000/` |
| **Expect** | `200` |

```json
{ "message": "Access Control Server is running!" }
```

---

## TEST 2 — Sign in as all three roles

Run all three. Copy each token — you'll need them for the rest of the demo.

**Alice (`user`)**
```
curl -X POST http://localhost:3000/signin -H "Content-Type: application/json" -d "{\"username\":\"alice\"}"
```

**Bob (`editor`)**
```
curl -X POST http://localhost:3000/signin -H "Content-Type: application/json" -d "{\"username\":\"bob\"}"
```

**Admin (`admin`)**
```
curl -X POST http://localhost:3000/signin -H "Content-Type: application/json" -d "{\"username\":\"admin\"}"
```

**Expect (all three):** `200` + a token

```json
{
  "message": "Signin successful!",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**What's different is invisible on the outside — but paste any token into [jwt.io](https://jwt.io) and show the payload:**

```json
// alice
{ "id": 1, "username": "alice", "role": "user",   "capabilities": ["read"] }

// bob
{ "id": 2, "username": "bob",   "role": "editor", "capabilities": ["read","create","update"] }

// admin
{ "id": 3, "username": "admin", "role": "admin",  "capabilities": ["read","create","update","delete"] }
```

> 📢 *"The role determines the capabilities, and the capabilities ride along inside the JWT. Everything the ACL middleware needs to make a decision is already sitting in the token — no extra database lookup required."*

⚠️ **Keep all three tokens handy — label them `ALICE_TOKEN`, `BOB_TOKEN`, `ADMIN_TOKEN` in your terminal or notes.**

---

## TEST 3 — No token at all *(quick Class 7 review)*

| | |
|---|---|
| **Purpose** | Confirm bearerAuth still runs first — authentication before authorization |
| **Command** | `curl http://localhost:3000/read` |
| **Expect** | `401` |

```json
{ "error": "Authorization header required." }
```

**Flow:**
```
GET /read → bearerAuth → ❌ no token → 401 → acl() never even runs
```

> 📢 *"Before we can even ask 'what are you allowed to do,' we have to know who you are. bearerAuth still runs first, exactly like last week."*

---

## TEST 4 — Alice (`user`) reads

| | |
|---|---|
| **Purpose** | A `read`-only user CAN read |
| **Command** | `curl http://localhost:3000/read -H "Authorization: Bearer ALICE_TOKEN"` |
| **Expect** | `200` |

```json
{
  "message": "You have READ access.",
  "user": "alice"
}
```

> 📢 *"Alice authenticated fine, and 'read' is one of her capabilities. Both checks passed, so the route runs."*

---

## TEST 5 — Alice (`user`) tries to create ⭐ *(the payoff)*

| | |
|---|---|
| **Purpose** | A valid, authenticated user can still be **forbidden** |
| **Command** | `curl -X POST http://localhost:3000/create -H "Authorization: Bearer ALICE_TOKEN"` |
| **Expect** | `403` |

```json
{ "error": "You do not have access to this route." }
```
*(exact wording depends on your `acl-middleware.js` — confirm against your code before the demo)*

### 🖍️ Draw this on the board

```
CLIENT (alice)
  |
  | Authorization: Bearer JWT
  | role: user, capabilities: ['read']
  ↓
bearerAuth
  |
  | Is the token valid?  → YES
  ↓
req.user = decoded token
  ↓
acl('create')
  |
  | Does capabilities include 'create'?
  ↓
  NO
  ↓
403 Forbidden
  ↓
/create route does NOT run
```

> 🎉 *"THIS is the whole lesson. Alice is 100% authenticated — same valid token as Test 4. She's rejected anyway, because authentication and authorization are two different gates."*

**This is your single most important diagram for Class 8.**

---

## TEST 6 — Bob (`editor`) creates

| | |
|---|---|
| **Purpose** | An editor CAN create |
| **Command** | `curl -X POST http://localhost:3000/create -H "Authorization: Bearer BOB_TOKEN"` |
| **Expect** | `200` |

```json
{
  "message": "You have CREATE access.",
  "user": "bob"
}
```

---

## TEST 7 — Bob (`editor`) updates

| | |
|---|---|
| **Purpose** | An editor CAN update |
| **Command** | `curl -X PUT http://localhost:3000/update -H "Authorization: Bearer BOB_TOKEN"` |
| **Expect** | `200` |

```json
{
  "message": "You have UPDATE access.",
  "user": "bob"
}
```

> 💡 *"Same token as Test 6, different route, different capability check — and it still passes, because 'update' is also in bob's list."*

---

## TEST 8 — Bob (`editor`) tries to delete

| | |
|---|---|
| **Purpose** | Even an editor has a ceiling |
| **Command** | `curl -X DELETE http://localhost:3000/delete -H "Authorization: Bearer BOB_TOKEN"` |
| **Expect** | `403` |

```json
{ "error": "You do not have access to this route." }
```

> 📢 *"Bob can read, create, and update — but delete isn't on his list. Every role has a ceiling except admin."*

---

## TEST 9 — Admin deletes 🎉

| | |
|---|---|
| **Purpose** | The payoff — full access |
| **Command** | `curl -X DELETE http://localhost:3000/delete -H "Authorization: Bearer ADMIN_TOKEN"` |
| **Expect** | `200` |

```json
{
  "message": "You have DELETE access.",
  "user": "admin"
}
```

> 🎉 *"Admin has all four capabilities, so admin passes every acl() check we've run today."*

---

## 📋 Full Capability Matrix (cheat sheet for the room)

| Role → | `user` (alice) | `editor` (bob) | `admin` (admin) |
|--------|:---:|:---:|:---:|
| `GET /read`     | ✅ | ✅ | ✅ |
| `POST /create`  | ❌ | ✅ | ✅ |
| `PUT /update`   | ❌ | ✅ | ✅ |
| `DELETE /delete`| ❌ | ❌ | ✅ |

```
             read   create  update  delete
   user       ✅      ❌      ❌      ❌
   editor     ✅      ✅      ✅      ❌
   admin      ✅      ✅      ✅      ✅
```

---

## 📋 Full Run-Sheet

| # | Command | Expected | Teaching Point |
|---|---------|----------|-----------------|
| 1 | `GET /` | 200 | Server works |
| 2 | `POST /signin` × 3 | 200 + JWT each | Role & capabilities baked into the token |
| 3 | `GET /read` (no token) | 401 | Authentication still runs first |
| 4 | `GET /read` as alice | 200 | `read` is in her capabilities |
| 5 | `POST /create` as alice | 403 | Valid token ≠ allowed everywhere |
| 6 | `POST /create` as bob | 200 | Editor can create |
| 7 | `PUT /update` as bob | 200 | Editor can update |
| 8 | `DELETE /delete` as bob | 403 | Even editors have a ceiling |
| 9 | `DELETE /delete` as admin | 200 | Admin passes every capability check |

---

## 🚫 Scope Note

This demo assumes bearer token validation (Class 7) already works — don't re-litigate fake tokens, wrong schemes, or tampered tokens here unless a student asks. Today is entirely about the **second gate**: capability checks *after* authentication succeeds.