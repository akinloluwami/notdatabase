import { redis } from "./redis";

type EventType = "insert" | "update" | "delete";

export async function publishDbEvent({
  dbId,
  collection,
  type,
  doc,
}: {
  dbId: string;
  collection: string;
  type: EventType;
  doc: any;
}) {
  const channel = `notdb:${dbId}:${collection}`;

  const payload = {
    type,
    collection,
    data: doc,
  };

  await redis
    .publish(channel, JSON.stringify(payload))
    .then(() => {
      console.log(`Published ${type} event to channel ${channel}`, payload);
    })
    .catch((err) => {
      console.error(
        `Failed to publish ${type} event to channel ${channel}`,
        err
      );
    });
}
