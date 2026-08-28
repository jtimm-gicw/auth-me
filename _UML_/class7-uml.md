# UML — Class 7: Bearer Authentication

**Class 7 adds JWT and middleware.**

```text
┌──────────────┐
│    CLIENT    │
└──────┬───────┘
       │
       │ username + password
       ↓
┌──────────────────┐
│     SIGNIN       │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   USERS MODEL    │
└────────┬─────────┘
         │
         │ createToken()
         ↓
┌──────────────────┐
│       JWT        │
│                  │
│ header           │
│ payload          │
│ signature        │
└────────┬─────────┘
         │
         │ token
         ↓
┌──────────────┐
│    CLIENT    │
└──────┬───────┘
       │
       │ Authorization:
       │ Bearer TOKEN
       ↓
┌──────────────────────┐
│ bearerAuth Middleware │
└──────────┬───────────┘
           │
           │ authenticateToken()
           ↓
┌──────────────────┐
│   USERS MODEL    │
│                  │
│ jwt.verify()     │
└────────┬─────────┘
         │
     ┌───┴────┐
     ↓        ↓
   Valid    Invalid
     │        │
     ↓        ↓
 next()      401
     │
     ↓
┌──────────────────┐
│ PROTECTED ROUTE  │
└──────────────────┘
```

```text
Sign in
   ↓
Get JWT
   ↓
Send Bearer Token
   ↓
bearerAuth
   ↓
Validate token
   ↓
next()
   ↓
Protected route
```
