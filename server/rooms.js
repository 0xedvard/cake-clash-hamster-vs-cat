import { LANES, clampDefenderX } from "../client/cakePhysics.js";
import { WORD_BANK, normalizeAnswer } from "../client/words.js";

const ROOM_IDS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_HITS = 10;
const DRAWING_TIME = 60;

const rooms = new Map();

function randomId(length = 5) {
  let id = "";
  for (let index = 0; index < length; index += 1) {
    id += ROOM_IDS[Math.floor(Math.random() * ROOM_IDS.length)];
  }
  return id;
}

function buildPlayer(slot, socketId) {
  return {
    socketId,
    slot,
    character: slot === 0 ? "hamster" : "cat",
    name: slot === 0 ? "Hamster (Edvard)" : "Slim Black Cat (Elina)"
  };
}

function defaultRoomState(id) {
  return {
    id,
    players: [null, null],
    phase: "lobby",
    roundNumber: 0,
    artistSlot: 1,
    currentWord: null,
    hits: [0, 0],
    timeLeft: DRAWING_TIME,
    notice: "Create a room link and invite your favorite rival.",
    canvas: {
      strokes: [],
      redoStack: []
    },
    guessLog: [],
    battle: null,
    winnerSlot: null,
    lastWordEn: null,
    lastResult: null
  };
}

function playerCount(room) {
  return room.players.filter(Boolean).length;
}

function nextArtistSlot(room) {
  return room.artistSlot === 0 ? 1 : 0;
}

function pickWord(lastWordEn) {
  let selection = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  let guard = 0;

  while (selection.en === lastWordEn && guard < 10) {
    selection = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    guard += 1;
  }

  return selection;
}

function clearCanvasState(room) {
  room.canvas.strokes = [];
  room.canvas.redoStack = [];
}

function pushGuess(room, slot, guess, correct) {
  room.guessLog.unshift({
    slot,
    guess,
    correct
  });
  room.guessLog = room.guessLog.slice(0, 8);
}

function fatStage(hitCount) {
  if (hitCount >= MAX_HITS) return 5;
  if (hitCount >= 8) return 4;
  if (hitCount >= 5) return 3;
  if (hitCount >= 3) return 2;
  if (hitCount >= 1) return 1;
  return 0;
}

function playerSummary(room, viewerSlot, slot) {
  return {
    slot,
    connected: Boolean(room.players[slot]),
    name: slot === 0 ? "Hamster (Edvard)" : "Slim Black Cat (Elina)",
    character: slot === 0 ? "hamster" : "cat",
    isSelf: slot === viewerSlot,
    isArtist: room.phase === "drawing" && slot === room.artistSlot,
    isGuesser: room.phase === "drawing" && slot === getOpponentSlot(room.artistSlot),
    isAttacker: room.phase === "cake" && slot === room.battle?.attackerSlot,
    isDefender: room.phase === "cake" && slot === room.battle?.defenderSlot,
    hitCount: room.hits[slot],
    fatStage: fatStage(room.hits[slot]),
    moveSpeed: Math.max(110, 240 - room.hits[slot] * 12),
    lane: LANES[slot]
  };
}

export function generateRoomId() {
  let id = randomId();
  while (rooms.has(id)) {
    id = randomId();
  }
  return id;
}

export function createRoom() {
  const id = generateRoomId();
  const room = defaultRoomState(id);
  rooms.set(id, room);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId) ?? null;
}

export function getOpponentSlot(slot) {
  return slot === 0 ? 1 : 0;
}

export function getPlayerSlot(room, socketId) {
  return room.players.findIndex((player) => player?.socketId === socketId);
}

export function joinRoom(roomId, socketId) {
  const room = getRoom(roomId);
  if (!room) {
    return { error: "That room does not exist yet." };
  }

  const existingSlot = getPlayerSlot(room, socketId);
  if (existingSlot >= 0) {
    return { room, slot: existingSlot };
  }

  const slot = room.players.findIndex((player) => !player);
  if (slot === -1) {
    return { error: "This private room is already full." };
  }

  room.players[slot] = buildPlayer(slot, socketId);
  room.notice = playerCount(room) < 2 ? "Waiting for your partner to join the room..." : "Both players are here. Let the chaos begin.";
  room.lastResult = null;
  return { room, slot };
}

export function removePlayer(roomId, socketId) {
  const room = getRoom(roomId);
  if (!room) return null;

  const slot = getPlayerSlot(room, socketId);
  if (slot >= 0) {
    room.players[slot] = null;
  }

  if (playerCount(room) === 0) {
    rooms.delete(roomId);
    return null;
  }

  room.phase = "lobby";
  room.notice = "One player left. The room is waiting for a reunion.";
  room.currentWord = null;
  room.battle = null;
  room.timeLeft = DRAWING_TIME;
  room.lastResult = null;
  room.winnerSlot = null;
  room.hits = [0, 0];
  room.roundNumber = 0;
  room.artistSlot = 1;
  room.guessLog = [];
  clearCanvasState(room);
  return room;
}

export function canStartGame(room) {
  return playerCount(room) === 2;
}

export function startFreshMatch(room) {
  room.phase = "drawing";
  room.roundNumber = 0;
  room.artistSlot = 1;
  room.hits = [0, 0];
  room.battle = null;
  room.winnerSlot = null;
  room.notice = "Round 1 is ready.";
  room.lastResult = null;
  room.guessLog = [];
  clearCanvasState(room);
  return beginNextRound(room);
}

export function beginNextRound(room) {
  room.phase = "drawing";
  room.roundNumber += 1;
  room.artistSlot = nextArtistSlot(room);
  room.currentWord = pickWord(room.lastWordEn);
  room.lastWordEn = room.currentWord.en;
  room.timeLeft = DRAWING_TIME;
  room.notice = `${room.players[room.artistSlot]?.name ?? "Artist"} is drawing. Guess fast to earn cake.`;
  room.lastResult = null;
  room.guessLog = [];
  room.battle = null;
  clearCanvasState(room);
  return room;
}

export function submitGuess(room, socketId, guess) {
  const slot = getPlayerSlot(room, socketId);
  if (slot === -1 || room.phase !== "drawing") {
    return { accepted: false };
  }

  const expectedGuesser = getOpponentSlot(room.artistSlot);
  if (slot !== expectedGuesser) {
    return { accepted: false };
  }

  const normalized = normalizeAnswer(guess);
  if (!normalized) {
    return { accepted: false };
  }

  const correct =
    normalized === normalizeAnswer(room.currentWord.en) ||
    normalized === normalizeAnswer(room.currentWord.ru);

  pushGuess(room, slot, guess, correct);

  if (!correct) {
    return { accepted: true, correct: false, guesserSlot: slot };
  }

  room.phase = "cake";
  room.lastResult = {
    type: "correct",
    text: `${room.players[slot]?.name ?? "Guesser"} guessed it and earned a cake.`
  };
  room.notice = room.lastResult.text;
  room.battle = {
    attackerSlot: slot,
    defenderSlot: getOpponentSlot(slot),
    defenderX: LANES[getOpponentSlot(slot)].base,
    launched: false,
    cake: null,
    resultText: null,
    lastImpact: null
  };

  return { accepted: true, correct: true, guesserSlot: slot, defenderSlot: room.battle.defenderSlot };
}

export function setDefenderPosition(room, x) {
  if (!room.battle) return null;
  room.battle.defenderX = clampDefenderX(room.battle.defenderSlot, x);
  return room.battle.defenderX;
}

export function setBattleCake(room, cake) {
  if (!room.battle) return;
  room.battle.cake = cake;
  room.battle.launched = true;
}

export function finishBattle(room, wasHit) {
  if (!room.battle) {
    return { winnerSlot: null, defenderSlot: null, impact: null };
  }

  const defenderSlot = room.battle.defenderSlot;
  const resultText = wasHit
    ? ["SPLAT!", "CAKED!", "BONK!"][Math.floor(Math.random() * 3)]
    : "WHOOSH!";

  room.battle.resultText = resultText;
  room.battle.lastImpact = {
    hit: wasHit,
    text: resultText,
    defenderSlot
  };

  if (wasHit) {
    room.hits[defenderSlot] += 1;
  }

  if (room.hits[defenderSlot] >= MAX_HITS) {
    room.phase = "winner";
    room.winnerSlot = getOpponentSlot(defenderSlot);
    room.notice = "TOO MUCH CAKE";
  }

  return {
    winnerSlot: room.winnerSlot,
    defenderSlot,
    impact: room.battle.lastImpact
  };
}

export function addStroke(room, stroke) {
  room.canvas.strokes.push(stroke);
  room.canvas.redoStack = [];
}

export function undoStroke(room) {
  const stroke = room.canvas.strokes.pop();
  if (stroke) {
    room.canvas.redoStack.push(stroke);
  }
}

export function redoStroke(room) {
  const stroke = room.canvas.redoStack.pop();
  if (stroke) {
    room.canvas.strokes.push(stroke);
  }
}

export function clearCanvas(room) {
  if (room.canvas.strokes.length) {
    room.canvas.redoStack.push(...room.canvas.strokes);
  }
  room.canvas.strokes = [];
}

export function resetForReplay(room) {
  room.notice = "Both players wanted another round.";
  return startFreshMatch(room);
}

export function serializeRoom(room, socketId) {
  const viewerSlot = getPlayerSlot(room, socketId);
  const wordVisible = viewerSlot === room.artistSlot && room.phase === "drawing";

  return {
    roomId: room.id,
    phase: room.phase,
    roundNumber: room.roundNumber,
    timeLeft: room.timeLeft,
    notice: room.notice,
    selfSlot: viewerSlot,
    players: [0, 1].map((slot) => playerSummary(room, viewerSlot, slot)),
    word: wordVisible ? room.currentWord : null,
    canvas: {
      strokes: room.canvas.strokes
    },
    guessLog: room.guessLog,
    battle: room.battle
      ? {
          attackerSlot: room.battle.attackerSlot,
          defenderSlot: room.battle.defenderSlot,
          defenderX: room.battle.defenderX,
          launched: room.battle.launched,
          cake: room.battle.cake,
          resultText: room.battle.resultText,
          lastImpact: room.battle.lastImpact
        }
      : null,
    winnerSlot: room.winnerSlot,
    lastResult: room.lastResult,
    maxHits: MAX_HITS
  };
}
