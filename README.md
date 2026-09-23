# 🛡️ Class 8 — ACL & Role-Based Authorization

## 🎯 Goal

Today we move from:

**Authentication**

to:

**Authorization**

Authentication asks:

> **"Who are you?"**

Authorization asks:

> **"What are you allowed to do?"**

We already know how to authenticate a user using a Bearer token.

Today we will use the authenticated user's **role** and **permissions** to decide what that user is allowed to do.

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

# 📚 Part 1 — Authentication vs. Authorization

These terms sound similar, but they answer different questions.

## Authentication

```text
WHO ARE YOU?
```

For example:

```text
username + password
        ↓
authenticated user
```

or:

```text
Bearer JWT
    ↓
authenticated user
```

---

## Authorization

```text
WHAT ARE YOU ALLOWED TO DO?
```

For example:

```text
Alice
  ↓
role: reader
  ↓
Can read?
  ↓
✅ YES
```

But:

```text
Alice
  ↓
role: reader
  ↓
Can delete?
  ↓
❌ NO
```

---

# 👥 Part 2 — What Is RBAC?

**RBAC** means:

> **Role-Based Access Control**

Instead of manually giving every user a different list of permissions, we give users a **role**.

That role determines what they are allowed to do.

```text
USER
 ↓
ROLE
 ↓
PERMISSIONS
```

For example:

```text
Alice
 ↓
reader
 ↓
read
```

Another user might be:

```text
Bob
 ↓
writer
 ↓
read
create
```

---

# 🔐 Part 3 — Permission Table

This table is the **main reference for today's class**.

Our application has four roles:

* `reader`
* `writer`
* `editor`
* `admin`

And four permissions:

* `read`
* `create`
* `update`
* `delete`

## ⭐ Role Permission Table

| Role       | `read` | `create` | `update` | `delete` |
| ---------- | :----: | :------: | :------: | :------: |
| **Reader** |    ✅   |     ❌    |     ❌    |     ❌    |
| **Writer** |    ✅   |     ✅    |     ❌    |     ❌    |
| **Editor** |    ✅   |     ✅    |     ✅    |     ❌    |
| **Admin**  |    ✅   |     ✅    |     ✅    |     ✅    |

---

# 📊 Permission Progression

Notice how each role receives more permissions.

```text
READER
  │
  └── read


WRITER
  │
  ├── read
  └── create


EDITOR
  │
  ├── read
  ├── create
  └── update


ADMIN
  │
  ├── read
  ├── create
  ├── update
  └── delete
```

---

# 🧠 Easy Way to Remember the Roles

| Role       | Simple Meaning                           |
| ---------- | ---------------------------------------- |
| **Reader** | Can look at information                  |
| **Writer** | Can look at and add information          |
| **Editor** | Can look at, add, and change information |
| **Admin**  | Can do everything, including delete      |

---

# 🚦 Part 4 — Permission Examples

Using our permission table:

### Reader wants to read

```text
reader
   ↓
read
   ↓
✅ ALLOWED
```

### Reader wants to create

```text
reader
   ↓
create
   ↓
❌ DENIED
```

### Writer wants to create

```text
writer
   ↓
create
   ↓
✅ ALLOWED
```

### Writer wants to update

```text
writer
   ↓
update
   ↓
❌ DENIED
```

### Editor wants to update

```text
editor
   ↓
update
   ↓
✅ ALLOWED
```

### Editor wants to delete

```text
editor
   ↓
delete
   ↓
❌ DENIED
```

### Admin wants to delete

```text
admin
   ↓
delete
   ↓
✅ ALLOWED
```

---

# 🔄 Part 5 — Authentication Still Happens First

Authorization does **not** replace authentication.

We still need Bearer Authentication from Class 7.

The server first asks:

```text
WHO ARE YOU?
```

Then it asks:

```text
WHAT ARE YOU ALLOWED TO DO?
```

So our request becomes:

```text
REQUEST
   ↓
Bearer JWT
   ↓
AUTHENTICATION
   ↓
req.user
   ↓
AUTHORIZATION
   ↓
Check Permission
   ↓
Protected Route
```

---

# 🎟️ Part 6 — Getting the Role From the JWT

Remember our JWT payload from Class 7:

```js
{
  id: user.id,
  username: user.username,
  role: user.role
}
```

After Bearer Authentication succeeds:

```js
req.user = user;
```

Now we can access:

```js
req.user.username
```

and:

```js
req.user.role
```

For example:

```js
req.user.role
```

might contain:

```text
editor
```

The authorization system can use that role to determine what the user is allowed to do.

---

# 📋 Part 7 — What Is an ACL?

**ACL** means:

> **Access Control List**

An ACL describes what actions different users or roles are allowed to perform.

For today's class, think of it as:

```text
ROLE
 ↓
LIST OF PERMISSIONS
```

For example:

```text
reader
 ↓
read
```

```text
writer
 ↓
read
create
```

```text
editor
 ↓
read
create
update
```

```text
admin
 ↓
read
create
update
delete
```

---

# 🔑 Part 8 — What Is a Capability?

A **capability** is an action the user has permission to perform.

For our application, the capabilities are:

```text
read
create
update
delete
```

You can think of:

**capability = permission**

For example:

```text
writer
   ↓
Does writer have "create"?
   ↓
YES
   ↓
✅ ALLOWED
```

But:

```text
writer
   ↓
Does writer have "delete"?
   ↓
NO
   ↓
❌ DENIED
```

---

# 🛡️ Part 9 — Authorization Middleware

Authorization middleware asks:

> **"Does this authenticated user have the required permission?"**

Conceptually:

```js
function authorize(capability) {

  return (req, res, next) => {

    // Does req.user have
    // this capability?

  };

}
```

The important idea is:

```text
Required Permission
        +
User's Permissions
        ↓
      Compare
        ↓
     Allowed?
```

---

# 🛣️ Part 10 — Protecting a Route

Imagine we have a DELETE route.

Conceptually, it could look like:

```js
app.delete(
  '/resource',
  bearerAuth,
  authorize('delete'),
  deleteHandler
);
```

Read this from left to right.

```text
REQUEST
   ↓
bearerAuth
   ↓
Who are you?
   ↓
authorize('delete')
   ↓
Can you delete?
   ↓
deleteHandler
```

There are now **two security checks** before the route handler runs.

---

# ✅ Part 11 — Successful Authorization

Suppose a route requires:

```text
create
```

A `writer` has:

```text
read
create
```

So:

```text
Writer
   ↓
Valid JWT
   ↓
Authenticated
   ↓
Needs "create"
   ↓
Writer has "create"
   ↓
✅ YES
   ↓
next()
   ↓
Route runs
```

---

# ❌ Part 12 — Failed Authorization

Now suppose the writer tries something requiring:

```text
delete
```

The writer only has:

```text
read
create
```

So:

```text
Writer
   ↓
Valid JWT
   ↓
Authenticated
   ↓
Needs "delete"
   ↓
Writer has "delete"?
   ↓
❌ NO
   ↓
Access denied
```

---

# ⚠️ Authentication Success Does NOT Mean Authorization Success

This is one of the most important ideas in Class 8.

A user can successfully authenticate:

```text
Valid JWT
   ↓
Authentication
   ↓
✅ PASS
```

but still fail authorization:

```text
Authenticated User
       ↓
Needs "delete"
       ↓
Does not have permission
       ↓
❌ DENIED
```

Therefore:

```text
AUTHENTICATED
```

does **not** automatically mean:

```text
AUTHORIZED FOR EVERYTHING
```

---

# 🧩 Part 13 — Complete Middleware Chain

Our application now has multiple security steps.

```text
CLIENT
  |
  | Authorization: Bearer JWT
  ↓
bearerAuth
  |
  | jwt.verify()
  ↓
req.user
  |
  | role
  ↓
ACL Middleware
  |
  | required permission
  ↓
Does user have permission?
  |
  ├───────────────┐
  ↓               ↓
 YES              NO
  ↓               ↓
next()       ACCESS DENIED
  ↓
Route Handler
  ↓
Response
```

---

# 📊 Permission Decision Examples

Use this table when testing different users.

| User Role | Requested Action | Expected Result | Why?                          |
| --------- | ---------------- | --------------- | ----------------------------- |
| Reader    | `read`           | ✅ Allow         | Reader has `read`             |
| Reader    | `create`         | ❌ Deny          | Reader does not have `create` |
| Writer    | `create`         | ✅ Allow         | Writer has `create`           |
| Writer    | `update`         | ❌ Deny          | Writer does not have `update` |
| Editor    | `update`         | ✅ Allow         | Editor has `update`           |
| Editor    | `delete`         | ❌ Deny          | Editor does not have `delete` |
| Admin     | `delete`         | ✅ Allow         | Admin has `delete`            |

---

# 📖 Important Vocabulary

### Authentication

> **"Who are you?"**

Authentication identifies the user.

---

### Authorization

> **"What are you allowed to do?"**

Authorization determines what an authenticated user may access or change.

---

### RBAC

**Role-Based Access Control**

Users receive roles, and roles determine their permissions.

---

### Role

A category assigned to a user.

Examples:

```text
reader
writer
editor
admin
```

---

### Permission

Something the user is allowed to do.

Examples:

```text
read
create
update
delete
```

---

### Capability

An action the user has permission to perform.

In this class, we can think of:

```text
capability ≈ permission
```

---

### ACL

**Access Control List**

Rules describing what actions different users or roles are allowed to perform.

---

### Middleware

Code that runs before the final route handler.

Our application can now have:

```text
REQUEST
   ↓
Authentication Middleware
   ↓
Authorization Middleware
   ↓
Route Handler
```

---

# 🧠 What Students Should Notice

Class 7 and Class 8 work together.

```text
REQUEST
   ↓
Bearer JWT
   ↓
AUTHENTICATION
"Who are you?"
   ↓
req.user
   ↓
AUTHORIZATION
"What can you do?"
   ↓
Check Permission
   ↓
Allowed?
   |
   ├──── YES ────→ next()
   |                 ↓
   |               Route
   |                 ↓
   |              SUCCESS
   |
   └──── NO ─────→ ACCESS DENIED
```

---

# ⭐ Main Permission Table

Keep this table nearby during the demo.

| Role       | Read | Create | Update | Delete |
| ---------- | :--: | :----: | :----: | :----: |
| **Reader** |   ✅  |    ❌   |    ❌   |    ❌   |
| **Writer** |   ✅  |    ✅   |    ❌   |    ❌   |
| **Editor** |   ✅  |    ✅   |    ✅   |    ❌   |
| **Admin**  |   ✅  |    ✅   |    ✅   |    ✅   |

---

# 🏁 The Big Picture

We have now built three layers:

```text
====================================
CLASS 6
====================================

USERNAME + PASSWORD
        ↓
bcrypt.compare()
        ↓
AUTHENTICATION


====================================
CLASS 7
====================================

JWT
 ↓
Bearer Authentication
 ↓
jwt.verify()
 ↓
AUTHENTICATED USER


====================================
CLASS 8
====================================

AUTHENTICATED USER
        ↓
ROLE
        ↓
PERMISSIONS
        ↓
AUTHORIZATION
```

---

# 🎯 Final Takeaway

Remember these three questions:

```text
CLASS 6

Who are you?
     ↓
AUTHENTICATION


CLASS 7

Can you prove that
you already authenticated?
     ↓
BEARER TOKEN


CLASS 8

Now that we know who you are,
what are you allowed to do?
     ↓
AUTHORIZATION
```

The complete system now looks like:

```text
USERNAME + PASSWORD
        ↓
AUTHENTICATE
        ↓
JWT
        ↓
BEARER AUTH
        ↓
req.user
        ↓
ROLE
        ↓
PERMISSION
        ↓
AUTHORIZE
        ↓
PROTECTED RESOURCE
```
