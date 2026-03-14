import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { createRoom, getRoom } from "./rooms.js";
import { registerSocketHandlers } from "./socketHandlers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientDir = path.join(rootDir, "client");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(clientDir));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/rooms", (_request, response) => {
  const room = createRoom();
  response.json({
    roomId: room.id,
    roomUrl: `/room/${room.id}`
  });
});

app.get("/api/rooms/:roomId", (request, response) => {
  const room = getRoom(String(request.params.roomId ?? "").toUpperCase());
  if (!room) {
    response.status(404).json({ error: "Room not found." });
    return;
  }

  response.json({
    roomId: room.id,
    players: room.players.filter(Boolean).length
  });
});

app.get("/", (_request, response) => {
  response.sendFile(path.join(clientDir, "index.html"));
});

app.get("/room/:roomId", (_request, response) => {
  response.sendFile(path.join(clientDir, "index.html"));
});

registerSocketHandlers(io);

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => {
  console.log(`Cake Clash server running on port ${port}`);
});
