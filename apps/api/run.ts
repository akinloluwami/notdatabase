import { createClient } from "notdb";

const db = createClient({
  apiKey: "OpPEvgitS3ZoblvwmICv4JyBkE3bjZTh",
  schema: {
    products: {
      properties: {
        name: { type: "string", required: true },
        price: { type: "number", required: true },
        category: { type: "string", required: true },
        inStock: { type: "boolean", required: true },
      },
    },
  },
});

const data = [
  {
    name: "Wireless Mouse",
    price: 29.99,
    category: "Accessories",
    inStock: true,
  },
  {
    name: "Mechanical Keyboard",
    price: 89.99,
    category: "Accessories",
    inStock: false,
  },
  {
    name: "HD Monitor",
    price: 199.99,
    category: "Electronics",
    inStock: true,
  },
  {
    name: "USB-C Hub",
    price: 45.0,
    category: "Accessories",
    inStock: true,
  },
  {
    name: "Gaming Chair",
    price: 149.99,
    category: "Furniture",
    inStock: false,
  },
];

(async () => {
  try {
    const response = await db.products.insertBulk(data);
    console.log("Data inserted successfully:", response);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
})();
