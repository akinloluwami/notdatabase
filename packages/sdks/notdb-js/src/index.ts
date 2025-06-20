import { createClient } from "./client.js";

const db = createClient({
  apiKey: "ZjtQqbpa4GQS7Zsu1Yy9BZxA4GnhKlCR",
  schema: {
    members: {
      properties: {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
        age: { type: "number" },
        isAdmin: { type: "boolean", required: true },
      },
    },
  },
});

db.members.insert({
  name: "John Doe",
  email: "akinkunmioye42@gmail.com",
  age: 30,
  isAdmin: true,
});
