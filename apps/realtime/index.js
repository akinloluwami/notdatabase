const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const Redis = require("ioredis");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const server = createServer();
const wss = new WebSocketServer({ server });
const redis = new Redis(process.env.REDIS_URL);

/** @type {Map<import('ws'), string[]>} */
const clients = new Map();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    ws.close(1008, "Missing token");
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SOCKET_SECRET);
  } catch (err) {
    ws.close(1008, "Invalid token");
    return;
  }

  console.log("🔑 Token decoded:", decoded);

  const { dbId, collections } = decoded;

  if (!dbId || !collections || !Array.isArray(collections)) {
    ws.close(1008, "Invalid token payload");
    return;
  }

  // Initial subscriptions
  let initialSubs = [];

  if (collections.includes("*")) {
    // Can subscribe to anything later, so initial subs are empty
    initialSubs = [];
  } else {
    initialSubs = collections.map((c) => `notdb:${dbId}:${c}`);
  }

  clients.set(ws, initialSubs);

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.action === "subscribe" && Array.isArray(data.channels)) {
        const current = clients.get(ws) || [];

        const allowed = data.channels.filter((ch) => {
          if (typeof ch !== "string" || !ch.startsWith(`notdb:${dbId}:`)) {
            return false;
          }

          if (collections.includes("*")) {
            return true;
          }

          const [, , collection] = ch.split(":");
          return collections.includes(collection);
        });

        clients.set(ws, [...new Set([...current, ...allowed])]);
      }
    } catch (err) {
      console.error("Failed to parse message:", err);
    }
  });
});

redis.psubscribe("notdb:*", (err, count) => {
  if (err) {
    console.error("Failed to psubscribe:", err);
  } else {
    console.log(`Subscribed to ${count} channels.`);
  }
});

redis.on("pmessage", (_, channel, message) => {
  console.log(`📨 Received event on channel: ${channel}`);

  for (const [client, subs] of clients.entries()) {
    if (subs.includes(channel) && client.readyState === 1) {
      client.send(message);
      console.log(`📤 Sent event to client on channel: ${channel}`);
    }
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Realtime server running on ws://localhost:${PORT}`);
});
