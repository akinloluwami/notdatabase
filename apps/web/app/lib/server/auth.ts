import { betterAuth } from "better-auth";

import { LibsqlDialect } from "@libsql/kysely-libsql";

const dialect = new LibsqlDialect({
  url: "libsql://notdb-akinloluwami.aws-us-west-2.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTA0MTUxOTgsImlkIjoiNzYzMzBkYjItMGE1My00MzliLWI5ZGYtMDBkNzQ4YjcyZTBjIiwicmlkIjoiNGRiZjM2ZjktNjcyYS00MTRiLTlhNDUtYWM4MjQ4NGZhMTA2In0.oaWxEXp1ZLmcAi94BT4dj04u9dz_3yEYAFfk00Pqgysv4EyRodxQg7fENkGWBWTz1y8rPqTDk9dkAp9aDlb9CA",
});

export const auth = betterAuth({
  database: {
    dialect,
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
  },
});
