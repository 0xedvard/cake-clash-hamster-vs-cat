import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = Number.parseInt(process.env.PORT ?? "3001", 10) || 3001;
const FRONTEND_URL = normalizeOrigin(process.env.FRONTEND_URL);
const LOCAL_DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);
const SHRINE_IDS = [
  "shrine_station_west",
  "shrine_station_east",
  "shrine_village_west",
  "shrine_village_east",
  "shrine_church_west",
  "shrine_corridor_west",
  "shrine_corridor_east",
  "shrine_lake_left",
  "shrine_lake_right",
  "shrine_lake_back"
];
const VALID_MAP_IDS = new Set(["map1"]);
const rooms = new Map();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true
  }
});

app.get("/health", (_request, response) => {
  response.json({ ok: true, rooms: rooms.size });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("create_room", (payload = {}) => {
    const mapId = normalizeMapId(payload?.mapId);
    const roomCode = generateUniqueRoomCode();
    const room = createRoom(roomCode, mapId);
    const player = addPlayerToRoom(room, socket, "edvard");

    console.log(`Room created: ${roomCode}`);

    socket.emit("room_created", {
      roomCode,
      mapId: room.mapId,
      player,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
    socket.emit("room_state", {
      roomCode,
      mapId: room.mapId,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
  });

  socket.on("join_room", ({ roomCode }) => {
    const normalizedRoomCode = normalizeRoomCode(roomCode);
    const room = rooms.get(normalizedRoomCode);

    if (!room) {
      socket.emit("room_not_found", { roomCode: normalizedRoomCode });
      return;
    }

    if (room.players.size >= 2) {
      socket.emit("room_full", { roomCode: normalizedRoomCode });
      return;
    }

    const player = addPlayerToRoom(room, socket, "elina");

    console.log(`Socket ${socket.id} joined room ${normalizedRoomCode} as ${player.characterId}`);

    socket.emit("joined_room", {
      roomCode: normalizedRoomCode,
      mapId: room.mapId,
      player,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
    socket.emit("room_state", {
      roomCode: normalizedRoomCode,
      mapId: room.mapId,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
    socket.to(normalizedRoomCode).emit("player_joined", player);
    socket.to(normalizedRoomCode).emit("room_state", {
      roomCode: normalizedRoomCode,
      mapId: room.mapId,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
  });

  socket.on("light_shrine", ({ shrineId } = {}) => {
    const roomCode = socket.data.roomCode;

    if (!roomCode || !SHRINE_IDS.includes(shrineId)) {
      return;
    }

    const room = rooms.get(roomCode);

    if (!room || !room.players.has(socket.id) || room.shrines[shrineId]?.lit) {
      return;
    }

    room.shrines = {
      ...room.shrines,
      [shrineId]: {
        lit: true,
        litBySocketId: socket.id,
        litAt: Date.now()
      }
    };

    io.to(roomCode).emit("shrine_state", room.shrines);
    io.to(roomCode).emit("room_state", {
      roomCode,
      mapId: room.mapId,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
  });

  socket.on("restart_run", () => {
    const roomCode = socket.data.roomCode;

    if (!roomCode) {
      return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
      return;
    }

    room.shrines = createShrineState();

    for (const [socketId, player] of room.players.entries()) {
      room.players.set(socketId, {
        ...player,
        position: getSpawnPosition(player.characterId, room.mapId),
        rotationY: getSpawnRotation(player.characterId),
        animation: "idle",
        isJumping: false,
        vigilStage: 0,
        isCollapsed: false,
        carryTargetSocketId: null,
        carriedBySocketId: null,
        healTargetSocketId: null,
        activeDangerZoneId: null
      });
    }

    const payload = {
      roomCode,
      mapId: room.mapId,
      players: getRoomPlayers(room),
      shrines: room.shrines
    };

    io.to(roomCode).emit("run_reset", payload);
    io.to(roomCode).emit("shrine_state", room.shrines);
    io.to(roomCode).emit("room_state", payload);
  });

  socket.on("player_state", (incomingState) => {
    const roomCode = socket.data.roomCode;

    if (!roomCode) {
      return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
      return;
    }

    const existingPlayer = room.players.get(socket.id);

    if (!existingPlayer) {
      return;
    }

    const nextPlayerState = {
      ...existingPlayer,
      position: normalizePosition(incomingState?.position ?? existingPlayer.position),
      rotationY: normalizeNumber(incomingState?.rotationY, existingPlayer.rotationY),
      animation: typeof incomingState?.animation === "string"
        ? incomingState.animation
        : existingPlayer.animation,
      isJumping: Boolean(incomingState?.isJumping),
      vigilStage: normalizeStage(incomingState?.vigilStage, existingPlayer.vigilStage),
      isCollapsed: Boolean(incomingState?.isCollapsed),
      carryTargetSocketId: normalizeOptionalString(incomingState?.carryTargetSocketId),
      carriedBySocketId: normalizeOptionalString(incomingState?.carriedBySocketId),
      healTargetSocketId: normalizeOptionalString(incomingState?.healTargetSocketId),
      activeDangerZoneId: normalizeOptionalString(incomingState?.activeDangerZoneId)
    };

    room.players.set(socket.id, nextPlayerState);
    socket.to(roomCode).emit("player_state", nextPlayerState);
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;

    console.log("Socket disconnected:", socket.id);

    if (!roomCode) {
      return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
      return;
    }

    const player = room.players.get(socket.id);
    room.players.delete(socket.id);

    socket.to(roomCode).emit("player_left", {
      socketId: socket.id,
      characterId: player?.characterId ?? null
    });

    if (room.players.size === 0) {
      rooms.delete(roomCode);
      console.log(`Room removed: ${roomCode}`);
      return;
    }

    io.to(roomCode).emit("room_state", {
      roomCode,
      mapId: room.mapId,
      players: getRoomPlayers(room),
      shrines: room.shrines
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Sweet Dreams server listening on port ${PORT}`);
  if (FRONTEND_URL) {
    console.log(`Allowed frontend origin: ${FRONTEND_URL}`);
  }
});

function createRoom(roomCode, mapId = "map1") {
  const room = {
    roomCode,
    players: new Map(),
    shrines: createShrineState(),
    mapId: normalizeMapId(mapId)
  };

  rooms.set(roomCode, room);
  return room;
}

function addPlayerToRoom(room, socket, characterId) {
  const player = {
    socketId: socket.id,
    roomCode: room.roomCode,
    characterId,
    position: getSpawnPosition(characterId, room.mapId),
    rotationY: getSpawnRotation(characterId),
    animation: "idle",
    isJumping: false,
    vigilStage: 0,
    isCollapsed: false,
    carryTargetSocketId: null,
    carriedBySocketId: null,
    healTargetSocketId: null,
    activeDangerZoneId: null
  };

  room.players.set(socket.id, player);
  socket.join(room.roomCode);
  socket.data.roomCode = room.roomCode;
  socket.data.characterId = characterId;

  return player;
}

function getRoomPlayers(room) {
  return [...room.players.values()];
}

function getSpawnPosition(characterId, mapId = "map1") {
  if (characterId === "elina") {
    return { x: 1.6, y: 0, z: -0.4 };
  }

  return { x: -0.8, y: 0, z: 0.2 };
}

function getSpawnRotation(characterId) {
  if (characterId === "elina") {
    return -0.35;
  }

  return 0;
}

function normalizePosition(position) {
  return {
    x: normalizeNumber(position?.x, 0),
    y: normalizeNumber(position?.y, 0),
    z: normalizeNumber(position?.z, 0)
  };
}

function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeStage(value, fallback = 0) {
  const normalized = normalizeNumber(value, fallback);
  return Math.max(0, Math.min(3, Math.round(normalized)));
}

function normalizeOptionalString(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeMapId(value) {
  return VALID_MAP_IDS.has(value) ? value : "map1";
}

function normalizeOrigin(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim().replace(/\/+$/, "");
}

function isAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return false;
  }

  return LOCAL_DEV_ORIGINS.has(normalizedOrigin) || normalizedOrigin === FRONTEND_URL;
}

function createShrineState() {
  return Object.fromEntries(
    SHRINE_IDS.map((shrineId) => [
      shrineId,
      {
        lit: false,
        litBySocketId: null,
        litAt: null
      }
    ])
  );
}

function createChurchRitualState() {
  return {
    progress: [],
    solved: false,
    graveyardUnlocked: false,
    lastEventType: null,
    lastElementId: null,
    lastEventNonce: 0
  };
}

function applyChurchRitualAction(currentState, elementId) {
  if (!CHURCH_RITUAL_SEQUENCE.includes(elementId)) {
    return null;
  }

  const state = currentState ?? createChurchRitualState();

  if (state.solved) {
    return state;
  }

  const expectedElementId = CHURCH_RITUAL_SEQUENCE[state.progress.length];

  if (elementId === expectedElementId) {
    const progress = [...state.progress, elementId];
    const solved = progress.length === CHURCH_RITUAL_SEQUENCE.length;

    return {
      progress,
      solved,
      graveyardUnlocked: solved,
      lastEventType: solved ? "success" : "advance",
      lastElementId: elementId,
      lastEventNonce: (state.lastEventNonce ?? 0) + 1
    };
  }

  return {
    progress: [],
    solved: false,
    graveyardUnlocked: false,
    lastEventType: "reset",
    lastElementId: elementId,
    lastEventNonce: (state.lastEventNonce ?? 0) + 1
  };
}

function createGraveyardOfferingState() {
  return {
    unlocked: false,
    revealed: false,
    items: {
      mourning_ribbon: { holderSocketId: null, placedAtGraveId: null },
      brass_token: { holderSocketId: null, placedAtGraveId: null },
      lake_icon: { holderSocketId: null, placedAtGraveId: null }
    },
    graves: {
      thread_grave: { requiredItemId: "mourning_ribbon", placedItemId: null, complete: false },
      bell_grave: { requiredItemId: "brass_token", placedItemId: null, complete: false },
      lake_grave: { requiredItemId: "lake_icon", placedItemId: null, complete: false }
    },
    lastEventType: null,
    lastItemId: null,
    lastGraveId: null,
    lastEventNonce: 0
  };
}

function unlockGraveyardOfferingState(currentState) {
  const state = cloneGraveyardOfferingState(currentState ?? createGraveyardOfferingState());
  state.unlocked = true;
  state.lastEventType = "unlock";
  state.lastItemId = null;
  state.lastGraveId = null;
  state.lastEventNonce += 1;
  return state;
}

function cloneGraveyardOfferingState(currentState) {
  const baseState = currentState ?? createGraveyardOfferingState();
  return {
    unlocked: Boolean(baseState.unlocked),
    revealed: Boolean(baseState.revealed),
    items: {
      mourning_ribbon: { ...baseState.items.mourning_ribbon },
      brass_token: { ...baseState.items.brass_token },
      lake_icon: { ...baseState.items.lake_icon }
    },
    graves: {
      thread_grave: { ...baseState.graves.thread_grave },
      bell_grave: { ...baseState.graves.bell_grave },
      lake_grave: { ...baseState.graves.lake_grave }
    },
    lastEventType: baseState.lastEventType ?? null,
    lastItemId: baseState.lastItemId ?? null,
    lastGraveId: baseState.lastGraveId ?? null,
    lastEventNonce: Number.isFinite(baseState.lastEventNonce) ? baseState.lastEventNonce : 0
  };
}

function applyGraveyardOfferingAction(currentState, action, socketId, payload = {}) {
  const state = cloneGraveyardOfferingState(currentState);

  if (!state.unlocked) {
    return null;
  }

  if (action === "pickup") {
    const itemId = payload.itemId;

    if (!VALID_GRAVEYARD_ITEM_IDS.has(itemId)) {
      return null;
    }

    if (getHeldItemIdBySocket(state, socketId)) {
      return null;
    }

    const itemState = state.items[itemId];

    if (itemState.holderSocketId || itemState.placedAtGraveId) {
      return null;
    }

    itemState.holderSocketId = socketId;
    state.lastEventType = "pickup";
    state.lastItemId = itemId;
    state.lastGraveId = null;
    state.lastEventNonce += 1;
    return state;
  }

  if (action === "place") {
    const graveId = payload.graveId;

    if (!VALID_GRAVEYARD_GRAVE_IDS.has(graveId)) {
      return null;
    }

    const heldItemId = getHeldItemIdBySocket(state, socketId);

    if (!heldItemId) {
      return null;
    }

    const graveState = state.graves[graveId];

    if (graveState.complete) {
      return null;
    }

    if (graveState.requiredItemId !== heldItemId) {
      state.lastEventType = "wrong";
      state.lastItemId = heldItemId;
      state.lastGraveId = graveId;
      state.lastEventNonce += 1;
      return state;
    }

    graveState.complete = true;
    graveState.placedItemId = heldItemId;
    state.items[heldItemId].holderSocketId = null;
    state.items[heldItemId].placedAtGraveId = graveId;
    state.revealed = Object.values(state.graves).every((grave) => grave.complete);
    state.lastEventType = state.revealed ? "reveal" : "place";
    state.lastItemId = heldItemId;
    state.lastGraveId = graveId;
    state.lastEventNonce += 1;
    return state;
  }

  return null;
}

function getHeldItemIdBySocket(state, socketId) {
  return Object.entries(state.items).find(([, itemState]) => itemState.holderSocketId === socketId)?.[0] ?? null;
}

function releaseHeldOfferings(currentState, socketId) {
  const state = cloneGraveyardOfferingState(currentState);
  let releasedItemId = null;

  for (const [itemId, itemState] of Object.entries(state.items)) {
    if (itemState.holderSocketId === socketId) {
      itemState.holderSocketId = null;
      releasedItemId = itemId;
    }
  }

  if (releasedItemId) {
    state.lastEventType = "drop";
    state.lastItemId = releasedItemId;
    state.lastGraveId = null;
    state.lastEventNonce += 1;
  }

  return state;
}

function createLakeFinaleState() {
  return {
    unlocked: false,
    rewardHolderSocketId: null,
    rewardCollected: false,
    completed: false,
    lastEventType: null,
    lastEventNonce: 0
  };
}

function cloneLakeFinaleState(currentState) {
  const baseState = currentState ?? createLakeFinaleState();
  return {
    unlocked: Boolean(baseState.unlocked),
    rewardHolderSocketId: baseState.rewardHolderSocketId ?? null,
    rewardCollected: Boolean(baseState.rewardCollected),
    completed: Boolean(baseState.completed),
    lastEventType: baseState.lastEventType ?? null,
    lastEventNonce: Number.isFinite(baseState.lastEventNonce) ? baseState.lastEventNonce : 0
  };
}

function unlockLakeFinaleState(currentState) {
  const state = cloneLakeFinaleState(currentState);
  state.unlocked = true;
  state.lastEventType = "unlock";
  state.lastEventNonce += 1;
  return state;
}

function applyLakeFinaleAction(currentState, action, socketId, payload = {}) {
  const state = cloneLakeFinaleState(currentState);

  if (!state.unlocked || state.completed) {
    return null;
  }

  if (action === "pickup_reward") {
    if (payload.targetId !== LAKE_FINALE_TARGET_IDS.reward) {
      return null;
    }

    if (state.rewardCollected || state.rewardHolderSocketId) {
      return null;
    }

    state.rewardHolderSocketId = socketId;
    state.rewardCollected = true;
    state.lastEventType = "pickup_reward";
    state.lastEventNonce += 1;
    return state;
  }

  if (action === "complete") {
    if (payload.targetId !== LAKE_FINALE_TARGET_IDS.shrine) {
      return null;
    }

    if (state.rewardHolderSocketId !== socketId) {
      return null;
    }

    state.rewardHolderSocketId = null;
    state.completed = true;
    state.lastEventType = "complete";
    state.lastEventNonce += 1;
    return state;
  }

  return null;
}

function releaseLakeFinaleHold(currentState, socketId) {
  const state = cloneLakeFinaleState(currentState);

  if (state.rewardHolderSocketId !== socketId || state.completed) {
    return state;
  }

  state.rewardHolderSocketId = null;
  state.rewardCollected = false;
  state.lastEventType = "drop_reward";
  state.lastEventNonce += 1;
  return state;
}

function normalizeRoomCode(roomCode = "") {
  return String(roomCode).trim().toUpperCase();
}

function generateUniqueRoomCode() {
  let roomCode = "";

  do {
    roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (rooms.has(roomCode));

  return roomCode;
}
