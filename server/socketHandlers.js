import {
  addStroke,
  beginNextRound,
  canStartGame,
  clearCanvas,
  finishBattle,
  getPlayerSlot,
  getRoom,
  joinRoom,
  redoStroke,
  removePlayer,
  resetForReplay,
  serializeRoom,
  setBattleCake,
  setDefenderPosition,
  startFreshMatch,
  submitGuess,
  undoStroke
} from "./rooms.js";
import { checkCakeHit, createShotFromPower, isCakeOutOfBounds, stepShot } from "../client/cakePhysics.js";

const ROUND_TRANSITIONS = new Map();
const ROUND_TIMERS = new Map();
const BATTLE_TICKS = new Map();
const REMATCH_VOTES = new Map();

function clearTimer(map, roomId) {
  const timer = map.get(roomId);
  if (timer) {
    clearInterval(timer);
    clearTimeout(timer);
    map.delete(roomId);
  }
}

function emitRoomState(io, roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  room.players.forEach((player) => {
    if (player?.socketId) {
      io.to(player.socketId).emit("room-state", serializeRoom(room, player.socketId));
    }
  });
}

function emitFlash(io, roomId, payload) {
  const room = getRoom(roomId);
  if (!room) return;

  room.players.forEach((player) => {
    if (player?.socketId) {
      io.to(player.socketId).emit("flash-message", payload);
    }
  });
}

function scheduleNextRound(io, roomId, delay = 1600) {
  clearTimer(ROUND_TRANSITIONS, roomId);
  ROUND_TRANSITIONS.set(
    roomId,
    setTimeout(() => {
      const room = getRoom(roomId);
      if (!room || room.phase === "winner" || !canStartGame(room)) return;
      beginNextRound(room);
      emitRoomState(io, roomId);
      startDrawingTimer(io, roomId);
    }, delay)
  );
}

function startDrawingTimer(io, roomId) {
  clearTimer(ROUND_TIMERS, roomId);
  const room = getRoom(roomId);
  if (!room || room.phase !== "drawing") return;

  room.timeLeft = 60;
  emitRoomState(io, roomId);

  ROUND_TIMERS.set(
    roomId,
    setInterval(() => {
      const activeRoom = getRoom(roomId);
      if (!activeRoom || activeRoom.phase !== "drawing") {
        clearTimer(ROUND_TIMERS, roomId);
        return;
      }

      activeRoom.timeLeft = Math.max(0, activeRoom.timeLeft - 1);
      emitRoomState(io, roomId);

      if (activeRoom.timeLeft === 0) {
        clearTimer(ROUND_TIMERS, roomId);
        activeRoom.lastResult = {
          type: "timeout",
          text: `Time's up. The word was ${activeRoom.currentWord.en} / ${activeRoom.currentWord.ru}.`
        };
        activeRoom.notice = activeRoom.lastResult.text;
        emitFlash(io, roomId, { type: "timeout", text: activeRoom.lastResult.text });
        emitRoomState(io, roomId);
        scheduleNextRound(io, roomId);
      }
    }, 1000)
  );
}

function startBattleSimulation(io, roomId, power) {
  clearTimer(BATTLE_TICKS, roomId);
  const room = getRoom(roomId);
  if (!room?.battle) return;

  const initialCake = createShotFromPower(room.battle.attackerSlot, power);
  setBattleCake(room, initialCake);
  emitRoomState(io, roomId);

  BATTLE_TICKS.set(
    roomId,
    setInterval(() => {
      const activeRoom = getRoom(roomId);
      if (!activeRoom?.battle) {
        clearTimer(BATTLE_TICKS, roomId);
        return;
      }

      activeRoom.battle.cake = stepShot(activeRoom.battle.cake, 1 / 30);
      io.to(roomId).emit("battle-state", {
        cake: activeRoom.battle.cake,
        defenderX: activeRoom.battle.defenderX
      });

      if (
        checkCakeHit(
          activeRoom.battle.cake,
          activeRoom.battle.defenderSlot,
          activeRoom.battle.defenderX,
          activeRoom.hits[activeRoom.battle.defenderSlot]
        )
      ) {
        clearTimer(BATTLE_TICKS, roomId);
        const result = finishBattle(activeRoom, true);
        emitFlash(io, roomId, {
          type: "impact",
          text: result.impact.text,
          hit: true,
          defenderSlot: result.defenderSlot
        });
        emitRoomState(io, roomId);
        if (result.winnerSlot === null) {
          scheduleNextRound(io, roomId, 1800);
        }
        return;
      }

      if (isCakeOutOfBounds(activeRoom.battle.cake)) {
        clearTimer(BATTLE_TICKS, roomId);
        const result = finishBattle(activeRoom, false);
        emitFlash(io, roomId, {
          type: "impact",
          text: result.impact.text,
          hit: false,
          defenderSlot: result.defenderSlot
        });
        emitRoomState(io, roomId);
        if (result.winnerSlot === null) {
          scheduleNextRound(io, roomId, 1400);
        }
      }
    }, 1000 / 30)
  );
}

function sanitizeStroke(stroke) {
  if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) {
    return null;
  }

  return {
    tool: String(stroke.tool ?? "pencil"),
    color: String(stroke.color ?? "#2d2a32"),
    size: String(stroke.size ?? "medium"),
    width: Number(stroke.width ?? 8),
    alpha: Number(stroke.alpha ?? 1),
    composite: stroke.composite === "destination-out" ? "destination-out" : "source-over",
    points: stroke.points.slice(0, 600).map((point) => ({
      x: Number(point.x ?? 0),
      y: Number(point.y ?? 0)
    }))
  };
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId }) => {
      const result = joinRoom(String(roomId ?? "").toUpperCase(), socket.id);
      if (result.error) {
        socket.emit("join-error", result.error);
        return;
      }

      socket.data.roomId = result.room.id;
      socket.join(result.room.id);
      REMATCH_VOTES.delete(result.room.id);
      emitRoomState(io, result.room.id);

      if (canStartGame(result.room) && result.room.phase === "lobby") {
        startFreshMatch(result.room);
        emitFlash(io, result.room.id, { type: "start", text: "Both players joined. Round one starts now." });
        emitRoomState(io, result.room.id);
        startDrawingTimer(io, result.room.id);
      }
    });

    socket.on("drawing-preview-start", (payload) => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "drawing" || getPlayerSlot(room, socket.id) !== room.artistSlot) return;
      socket.to(room.id).emit("drawing-preview-start", payload);
    });

    socket.on("drawing-preview-point", (payload) => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "drawing" || getPlayerSlot(room, socket.id) !== room.artistSlot) return;
      socket.to(room.id).emit("drawing-preview-point", payload);
    });

    socket.on("drawing-commit", (stroke) => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "drawing" || getPlayerSlot(room, socket.id) !== room.artistSlot) return;
      const safeStroke = sanitizeStroke(stroke);
      if (!safeStroke) return;
      addStroke(room, safeStroke);
      emitRoomState(io, room.id);
    });

    socket.on("drawing-undo", () => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "drawing" || getPlayerSlot(room, socket.id) !== room.artistSlot) return;
      undoStroke(room);
      emitRoomState(io, room.id);
    });

    socket.on("drawing-redo", () => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "drawing" || getPlayerSlot(room, socket.id) !== room.artistSlot) return;
      redoStroke(room);
      emitRoomState(io, room.id);
    });

    socket.on("drawing-clear", () => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "drawing" || getPlayerSlot(room, socket.id) !== room.artistSlot) return;
      clearCanvas(room);
      emitRoomState(io, room.id);
    });

    socket.on("submit-guess", ({ guess }) => {
      const room = getRoom(socket.data.roomId);
      if (!room) return;

      const result = submitGuess(room, socket.id, String(guess ?? ""));
      if (!result.accepted) {
        return;
      }

      emitRoomState(io, room.id);

      if (!result.correct) {
        return;
      }

      clearTimer(ROUND_TIMERS, room.id);
      emitFlash(io, room.id, {
        type: "correct",
        text: `${room.players[result.guesserSlot]?.name ?? "Guesser"} nailed it and gets to throw the cake.`
      });
      emitRoomState(io, room.id);
    });

    socket.on("battle-defender-move", ({ x }) => {
      const room = getRoom(socket.data.roomId);
      if (!room?.battle || room.phase !== "cake") return;
      const slot = getPlayerSlot(room, socket.id);
      if (slot !== room.battle.defenderSlot) return;

      setDefenderPosition(room, Number(x ?? room.battle.defenderX));
      io.to(room.id).emit("battle-state", {
        cake: room.battle.cake,
        defenderX: room.battle.defenderX
      });
    });

    socket.on("battle-launch", ({ power }) => {
      const room = getRoom(socket.data.roomId);
      if (!room?.battle || room.phase !== "cake" || room.battle.launched) return;
      const slot = getPlayerSlot(room, socket.id);
      if (slot !== room.battle.attackerSlot) return;

      const safePower = Math.max(0.15, Math.min(1, Number(power ?? 0.55)));
      startBattleSimulation(io, room.id, safePower);
    });

    socket.on("play-again", () => {
      const room = getRoom(socket.data.roomId);
      if (!room || room.phase !== "winner") return;

      const slot = getPlayerSlot(room, socket.id);
      if (slot === -1) return;

      const votes = REMATCH_VOTES.get(room.id) ?? new Set();
      votes.add(slot);
      REMATCH_VOTES.set(room.id, votes);

      if (votes.size === 2) {
        REMATCH_VOTES.delete(room.id);
        resetForReplay(room);
        emitFlash(io, room.id, { type: "start", text: "Rematch served fresh." });
        emitRoomState(io, room.id);
        startDrawingTimer(io, room.id);
      } else {
        room.notice = "One player wants a rematch. Waiting for the second button press.";
        emitRoomState(io, room.id);
      }
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      clearTimer(ROUND_TIMERS, roomId);
      clearTimer(ROUND_TRANSITIONS, roomId);
      clearTimer(BATTLE_TICKS, roomId);
      REMATCH_VOTES.delete(roomId);
      const room = removePlayer(roomId, socket.id);
      if (room) {
        emitFlash(io, roomId, { type: "system", text: "A player disconnected. The room has been reset." });
        emitRoomState(io, roomId);
      }
    });
  });
}
