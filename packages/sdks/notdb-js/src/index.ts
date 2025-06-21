import { createClient } from "./client.js";

const db = createClient({
  apiKey: "9n26VnQ0rQFQSRofx5LnZ6axM6MQ6URa",
  schema: {
    animals: {
      properties: {
        name: { type: "string" },
        species: { type: "string" },
        age: { type: "number" },
        isEndangered: { type: "boolean" },
      },
    },
  },
});

async function main() {
  const animal = await db.animals.insert({
    name: "Leo",
    species: "Lion",
    age: 5,
    isEndangered: false,
  });

  await db.animals.update(animal._id, {
    age: 6,
  });

  await db.animals.count();

  await db.animals.delete(animal._id);
}

main()
  .then(() => console.log("Done"))
  .catch((err) => console.error("Error:", err))
  .finally(() => process.exit(0));
