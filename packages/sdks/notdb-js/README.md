# notdb-js

A simple JavaScript/TypeScript SDK for interacting with the NotDatabase API. Define your schema and perform CRUD operations with ease.

## Installation

```bash
npm install notdb
```

or with pnpm:

```bash
pnpm add notdb
```

## Quick Start

```ts
import { createClient } from "notdb";

// Initialize client and define your schema
const db = createClient({
  apiKey: "YOUR_API_KEY",
  {
  users: {
    properties: {
      name: { type: "string", required: true },
      email: { type: "string", required: true, unique: true },
      age: { type: "number" },
    },
  },
}
});

// Insert a user
await db.users.insert({
  name: "Alice",
  email: "alice@example.com",
  age: 30,
});

// Find users
const users = await db.users.find({ filter: { age: 30 } });

// Get a user by ID
const user = await db.users.get("user_id");

// Update a user
await db.users.update("user_id", { age: 31 });

// Delete a user
await db.users.delete("user_id");
```

---

For more details, check out the [documentation](https://docs.notdatabase.com).
