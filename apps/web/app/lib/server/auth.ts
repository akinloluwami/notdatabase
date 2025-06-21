import { betterAuth } from "better-auth";
import { polar, checkout, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { turso } from "@/app/lib/server/turso";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

const dialect = new LibsqlDialect({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const auth = betterAuth({
  database: {
    dialect,
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID!,
              slug: "Starter",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET as string,
          onSubscriptionCreated: async (payload) => {
            await turso.execute({
              sql: `
                INSERT INTO subscription (user_id, polar_customer_id, status, current_period_end)
                VALUES (?, ?, ?, ?)
              `,
              args: [
                payload.data.customer.externalId!,
                payload.data.customerId,
                "active",
                payload.data.currentPeriodEnd!,
              ],
            });
          },
          onSubscriptionCanceled: async (payload) => {
            const polarCustomerId = payload.data.customerId!;
            await turso.execute({
              sql: `
                UPDATE subscription
                SET status = ?
                WHERE polar_customer_id = ?
              `,
              args: ["inactive", polarCustomerId],
            });
          },
          onSubscriptionUncanceled: async (payload) => {
            const polarCustomerId = payload.data.customerId!;
            await turso.execute({
              sql: `
                UPDATE subscription
                SET status = ?
                WHERE polar_customer_id = ?
              `,
              args: ["active", polarCustomerId],
            });
          },
          onSubscriptionUpdated: async (payload) => {
            const polarCustomerId = payload.data.customerId!;
            await turso.execute({
              sql: `
                UPDATE subscription
                SET current_period_end = ?
                WHERE polar_customer_id = ?
              `,
              args: [payload.data.currentPeriodEnd!, polarCustomerId],
            });
          },
        }),
      ],
    }),
  ],
});
