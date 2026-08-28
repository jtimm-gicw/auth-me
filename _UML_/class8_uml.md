# Class 8: Authorization / Access Control

**Class 8 adds roles, capabilities, and ACL middleware.**

```text
──────────────┐
│    CLIENT    │
└──────┬───────┘
       │
       │ username + password
       ↓
┌──────────────────┐
│      SIGNIN      │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   USERS MODEL    │
│                  │
│ username         │
│ role             │
└────────┬─────────┘
         │
         ↓
┌────────────────────────┐
│         ROLES          │
│                        │
│ user → read            │
│ editor → read/create/  │
│          update        │
│ admin → read/create/   │
│         update/delete  │
└───────────┬────────────┘
            │
            │ capabilities
            ↓
┌──────────────────┐
│       JWT        │
│                  │
│ username         │
│ role             │
│ capabilities     │
└────────┬─────────┘
         │
         │ Bearer Token
         ↓
┌──────────────────────┐
│ bearerAuth Middleware│
└──────────┬───────────┘
           │
           │ Valid token
           ↓
       ┌─────────┐
       │ req.user│
       └────┬────┘
            │
            ↓
┌──────────────────────┐
│    ACL Middleware    │
│                      │
│ acl('capability')    │
└──────────┬───────────┘
           │
           │ Check:
           │ capabilities.includes()
           ↓
      ┌────────────┐
      │  Allowed?  │
      └─────┬──────┘
            │
        ┌───┴────┐
        ↓        ↓
       YES       NO
        │        │
        ↓        ↓
     next()     403
        │
        ↓
┌──────────────────┐
│ PROTECTED ROUTE  │
└──────────────────┘
```
