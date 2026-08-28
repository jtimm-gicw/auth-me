
# UML — Class 6: Basic Authentication

This is the simplest version and establishes the foundation.

```text
┌──────────────┐
│    CLIENT    │
└──────┬───────┘
       │
       │ username + password
       ↓
┌──────────────────┐
│  AUTH SERVER     │
│                  │
│ /signup          │
│ /signin          │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   USERS MODEL    │
│                  │
│ username         │
│ password hash    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│      BCRYPT      │
│                  │
│ hash / compare   │
└────────┬─────────┘
         │
         ↓
   ┌─────────────┐
   │ Authenticated│
   │      ?       │
   └──────┬──────┘
          │
      ┌───┴───┐
      ↓       ↓
     YES      NO
      │       │
      ↓       ↓
    Allow     401
```

```text
Client
  ↓
username + password
  ↓
Server
  ↓
bcrypt
  ↓
"Who are you?"
```
