import { FIELD_HEIGHT, FIELD_WIDTH, GROUND_Y, LANES, clampDefenderX } from "./cakePhysics.js";
import { mountCharacter, stageLabel, syncCharacter } from "./characters.js";
import { createDrawingBoard } from "./drawing.js";
import { formatWordPair } from "./words.js";

const COLORS = [
  "#17171a",
  "#ffffff",
  "#7f8798",
  "#f2526b",
  "#ff9b4a",
  "#ffd74c",
  "#54b86b",
  "#4c8df7",
  "#9a63f0",
  "#ff7ca6",
  "#8c5b36"
];

const refs = {
  landingView: document.querySelector("#landingView"),
  gameView: document.querySelector("#gameView"),
  createRoomButton: document.querySelector("#createRoomButton"),
  joinRoomButton: document.querySelector("#joinRoomButton"),
  joinRoomInput: document.querySelector("#joinRoomInput"),
  roomCodeLabel: document.querySelector("#roomCodeLabel"),
  copyLinkButton: document.querySelector("#copyLinkButton"),
  noticeText: document.querySelector("#noticeText"),
  roundLabel: document.querySelector("#roundLabel"),
  phaseBadge: document.querySelector("#phaseBadge"),
  timerLabel: document.querySelector("#timerLabel"),
  hamsterRole: document.querySelector("#hamsterRole"),
  hamsterHits: document.querySelector("#hamsterHits"),
  hamsterStage: document.querySelector("#hamsterStage"),
  catRole: document.querySelector("#catRole"),
  catHits: document.querySelector("#catHits"),
  catStage: document.querySelector("#catStage"),
  battleCanvas: document.querySelector("#battleCanvas"),
  hamsterSprite: document.querySelector("#hamsterSprite"),
  catSprite: document.querySelector("#catSprite"),
  battleHint: document.querySelector("#battleHint"),
  chargeFill: document.querySelector("#chargeFill"),
  chargeButton: document.querySelector("#chargeButton"),
  impactText: document.querySelector("#impactText"),
  wordPanel: document.querySelector("#wordPanel"),
  drawingCanvas: document.querySelector("#drawingCanvas"),
  toolButtons: [...document.querySelectorAll("#toolButtons [data-tool]")],
  sizeButtons: [...document.querySelectorAll("#sizeButtons [data-size]")],
  colorButtons: document.querySelector("#colorButtons"),
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
  clearButton: document.querySelector("#clearButton"),
  guessForm: document.querySelector("#guessForm"),
  guessInput: document.querySelector("#guessInput"),
  guessLog: document.querySelector("#guessLog"),
  playAgainButton: document.querySelector("#playAgainButton")
};

const battleContext = refs.battleCanvas.getContext("2d");
const roomIdFromPath = (() => {
  const match = window.location.pathname.match(/^\/room\/([A-Za-z0-9]+)$/);
  return match ? match[1].toUpperCase() : null;
})();

let socket = null;
let roomState = null;
let battleLive = {
  cake: null,
  defenderX: null
};
let chargeActive = false;
let chargeStartedAt = 0;
let impactTimer = null;
let moveLoopStarted = false;
let lastMoveSentAt = 0;
const pressedKeys = new Set();
let audioContext = null;

mountCharacter(refs.hamsterSprite, "hamster");
mountCharacter(refs.catSprite, "cat");

const drawingBoard = createDrawingBoard({
  canvas: refs.drawingCanvas,
  onPreviewStart: (payload) => socket?.emit("drawing-preview-start", payload),
  onPreviewPoint: (payload) => socket?.emit("drawing-preview-point", payload),
  onCommit: (stroke) => socket?.emit("drawing-commit", stroke)
});

function setActiveButton(buttons, key, value) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[key] === value);
  });
}

function createColorSwatches() {
  COLORS.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `color-swatch${index === 0 ? " active" : ""}`;
    button.style.background = color;
    button.dataset.color = color;
    button.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach((swatch) => swatch.classList.remove("active"));
      button.classList.add("active");
      drawingBoard.setColor(color);
    });
    refs.colorButtons.appendChild(button);
  });
}

function setupToolbar() {
  createColorSwatches();

  refs.toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(refs.toolButtons, "tool", button.dataset.tool);
      drawingBoard.setTool(button.dataset.tool);
    });
  });

  refs.sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(refs.sizeButtons, "size", button.dataset.size);
      drawingBoard.setSize(button.dataset.size);
    });
  });

  refs.undoButton.addEventListener("click", () => socket?.emit("drawing-undo"));
  refs.redoButton.addEventListener("click", () => socket?.emit("drawing-redo"));
  refs.clearButton.addEventListener("click", () => socket?.emit("drawing-clear"));
}

function connectToRoom(roomId) {
  socket = window.io();

  socket.on("connect", () => {
    socket.emit("join-room", { roomId });
  });

  socket.on("join-error", (message) => {
    window.alert(message);
    window.location.href = "/";
  });

  socket.on("room-state", (nextState) => {
    roomState = nextState;
    battleLive.defenderX = nextState.battle?.defenderX ?? null;
    battleLive.cake = nextState.battle?.cake ?? null;
    drawingBoard.clearRemotePreview();
    drawingBoard.setStrokes(nextState.canvas.strokes);
    drawingBoard.setEnabled(canDraw());
    render();
  });

  socket.on("drawing-preview-start", (payload) => {
    drawingBoard.startRemotePreview(payload);
  });

  socket.on("drawing-preview-point", (payload) => {
    drawingBoard.pushRemotePreviewPoint(payload);
  });

  socket.on("battle-state", (payload) => {
    battleLive = {
      cake: payload.cake ?? null,
      defenderX: payload.defenderX ?? battleLive.defenderX
    };
    renderBattlefield();
    renderCharacters();
  });

  socket.on("flash-message", (payload) => {
    if (payload?.text) {
      refs.noticeText.textContent = payload.text;
    }

    if (payload?.type === "impact") {
      showImpact(payload.text);
      playImpactSound();
    }
  });
}

function setupLanding() {
  refs.createRoomButton.addEventListener("click", async () => {
    const response = await fetch("/api/rooms", { method: "POST" });
    const data = await response.json();
    window.location.href = data.roomUrl;
  });

  refs.joinRoomButton.addEventListener("click", () => {
    const code = refs.joinRoomInput.value.trim().toUpperCase();
    if (!code) return;
    window.location.href = `/room/${code}`;
  });
}

function setupGuessing() {
  refs.guessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = refs.guessInput.value.trim();
    if (!guess || !canGuess()) return;
    socket?.emit("submit-guess", { guess });
    refs.guessInput.value = "";
  });

  refs.playAgainButton.addEventListener("click", () => {
    socket?.emit("play-again");
  });

  refs.copyLinkButton.addEventListener("click", async () => {
    if (!roomState) return;
    const roomUrl = `${window.location.origin}/room/${roomState.roomId}`;
    await navigator.clipboard.writeText(roomUrl);
    refs.noticeText.textContent = "Invite link copied to clipboard.";
  });
}

function setupBattleControls() {
  const startCharge = () => {
    if (!canAttack()) return;
    chargeActive = true;
    chargeStartedAt = performance.now();
    updateChargeMeter();
  };

  const releaseCharge = () => {
    if (!chargeActive || !canAttack()) return;
    const elapsed = performance.now() - chargeStartedAt;
    const power = Math.max(0.15, Math.min(1, elapsed / 1600));
    chargeActive = false;
    refs.chargeFill.style.width = "0%";
    socket?.emit("battle-launch", { power });
  };

  refs.chargeButton.addEventListener("pointerdown", startCharge);
  window.addEventListener("pointerup", releaseCharge);
  window.addEventListener("pointercancel", releaseCharge);

  window.addEventListener("keydown", (event) => {
    const selfSlot = roomState?.selfSlot;
    if (selfSlot === undefined || !canDefend()) return;

    if ((selfSlot === 0 && (event.code === "KeyA" || event.code === "KeyD")) ||
      (selfSlot === 1 && (event.code === "ArrowLeft" || event.code === "ArrowRight"))) {
      event.preventDefault();
      pressedKeys.add(event.code);
    }
  });

  window.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.code);
  });

  if (!moveLoopStarted) {
    moveLoopStarted = true;
    let lastFrame = performance.now();

    const loop = (now) => {
      const deltaSeconds = (now - lastFrame) / 1000;
      lastFrame = now;

      if (chargeActive) {
        updateChargeMeter();
      }

      if (canDefend() && roomState?.battle) {
        const selfSlot = roomState.selfSlot;
        const moveLeft = selfSlot === 0 ? pressedKeys.has("KeyA") : pressedKeys.has("ArrowLeft");
        const moveRight = selfSlot === 0 ? pressedKeys.has("KeyD") : pressedKeys.has("ArrowRight");
        const direction = Number(moveRight) - Number(moveLeft);
        if (direction !== 0) {
          const selfPlayer = roomState.players[selfSlot];
          const nextX = clampDefenderX(
            selfSlot,
            (battleLive.defenderX ?? roomState.battle.defenderX ?? LANES[selfSlot].base) + direction * selfPlayer.moveSpeed * deltaSeconds
          );
          battleLive.defenderX = nextX;
          renderBattlefield();
          renderCharacters();

          if (now - lastMoveSentAt > 35) {
            lastMoveSentAt = now;
            socket?.emit("battle-defender-move", { x: nextX });
          }
        }
      }

      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
  }
}

function canDraw() {
  return Boolean(roomState?.phase === "drawing" && roomState.word);
}

function canGuess() {
  if (!roomState || roomState.phase !== "drawing") return false;
  return roomState.players[roomState.selfSlot]?.isGuesser;
}

function canAttack() {
  if (!roomState || roomState.phase !== "cake" || !roomState.battle) return false;
  return roomState.players[roomState.selfSlot]?.isAttacker && !roomState.battle.launched;
}

function canDefend() {
  if (!roomState || roomState.phase !== "cake" || !roomState.battle) return false;
  return roomState.players[roomState.selfSlot]?.isDefender;
}

function phaseLabel(phase) {
  if (phase === "drawing") return "Drawing";
  if (phase === "cake") return "Cake Throw";
  if (phase === "winner") return "Game Over";
  return "Lobby";
}

function playerRoleText(player) {
  if (!player.connected) return "Waiting for player...";
  if (roomState.phase === "drawing" && player.isArtist) return "Drawing the secret word";
  if (roomState.phase === "drawing" && player.isGuesser) return "Guessing the sketch";
  if (roomState.phase === "cake" && player.isAttacker) return "Charging the cake throw";
  if (roomState.phase === "cake" && player.isDefender) {
    return player.slot === 0 ? "Dodging with A / D" : "Dodging with ← / →";
  }
  if (roomState.phase === "winner" && roomState.winnerSlot === player.slot) return "Winner of the pastry war";
  if (roomState.phase === "winner") return "Reached maximum cake";
  return "Waiting for the next round";
}

function renderGuessLog() {
  refs.guessLog.innerHTML = "";
  const entries = roomState?.guessLog ?? [];
  if (!entries.length) {
    const item = document.createElement("li");
    item.innerHTML = "<span>No guesses yet.</span>";
    refs.guessLog.appendChild(item);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("li");
    if (entry.correct) item.classList.add("correct");
    item.innerHTML = `<span>${roomState.players[entry.slot]?.name ?? "Player"}</span><strong>${entry.guess}</strong>`;
    refs.guessLog.appendChild(item);
  });
}

function renderBattlefield() {
  battleContext.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  const sky = battleContext.createLinearGradient(0, 0, 0, FIELD_HEIGHT);
  sky.addColorStop(0, "#bdefff");
  sky.addColorStop(0.7, "#fff1d8");
  sky.addColorStop(1, "#ffc8bd");
  battleContext.fillStyle = sky;
  battleContext.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  battleContext.fillStyle = "rgba(255,255,255,0.34)";
  battleContext.beginPath();
  battleContext.arc(130, 68, 40, 0, Math.PI * 2);
  battleContext.arc(162, 68, 32, 0, Math.PI * 2);
  battleContext.arc(148, 50, 34, 0, Math.PI * 2);
  battleContext.fill();

  battleContext.fillStyle = "rgba(255,255,255,0.28)";
  battleContext.beginPath();
  battleContext.arc(640, 52, 28, 0, Math.PI * 2);
  battleContext.arc(664, 52, 24, 0, Math.PI * 2);
  battleContext.arc(652, 36, 22, 0, Math.PI * 2);
  battleContext.fill();

  battleContext.fillStyle = "rgba(255, 241, 198, 0.65)";
  battleContext.fillRect(0, GROUND_Y - 8, FIELD_WIDTH, FIELD_HEIGHT - GROUND_Y + 8);
  battleContext.fillStyle = "rgba(255, 170, 129, 0.28)";
  battleContext.fillRect(0, GROUND_Y + 24, FIELD_WIDTH, FIELD_HEIGHT - GROUND_Y);

  Object.values(LANES).forEach((lane) => {
    battleContext.fillStyle = "rgba(255,255,255,0.18)";
    battleContext.fillRect(lane.min, 36, lane.max - lane.min, GROUND_Y - 50);
  });

  if (battleLive.cake) {
    const cake = battleLive.cake;
    battleContext.save();
    battleContext.fillStyle = "rgba(83, 55, 40, 0.14)";
    battleContext.beginPath();
    battleContext.ellipse(cake.x, GROUND_Y + 10, 16, 6, 0, 0, Math.PI * 2);
    battleContext.fill();
    battleContext.fillStyle = "#ffe8cf";
    battleContext.beginPath();
    battleContext.arc(cake.x, cake.y, 18, 0, Math.PI * 2);
    battleContext.fill();
    battleContext.fillStyle = "#ff7ca6";
    battleContext.beginPath();
    battleContext.arc(cake.x + 4, cake.y - 4, 10, Math.PI, Math.PI * 2);
    battleContext.fill();
    battleContext.fillStyle = "#fff";
    battleContext.beginPath();
    battleContext.arc(cake.x - 5, cake.y - 7, 6, 0, Math.PI * 2);
    battleContext.fill();
    battleContext.restore();
  }
}

function renderCharacters() {
  if (!roomState) return;

  const hamster = roomState.players[0];
  const cat = roomState.players[1];
  const hamsterX = roomState.battle?.defenderSlot === 0 ? battleLive.defenderX ?? roomState.battle.defenderX : LANES[0].base;
  const catX = roomState.battle?.defenderSlot === 1 ? battleLive.defenderX ?? roomState.battle.defenderX : LANES[1].base;

  refs.hamsterSprite.style.left = `${hamsterX - 95}px`;
  refs.hamsterSprite.style.right = "auto";
  refs.catSprite.style.left = `${catX - 95}px`;
  refs.catSprite.style.right = "auto";

  syncCharacter(refs.hamsterSprite, hamster, {
    x: 0,
    isArtist: hamster.isArtist,
    isGuesser: hamster.isGuesser,
    isAttacker: hamster.isAttacker,
    isDefender: hamster.isDefender,
    isWinner: roomState.winnerSlot === 0,
    isLoser: roomState.phase === "winner" && roomState.winnerSlot !== 0
  });

  syncCharacter(refs.catSprite, cat, {
    x: 0,
    isArtist: cat.isArtist,
    isGuesser: cat.isGuesser,
    isAttacker: cat.isAttacker,
    isDefender: cat.isDefender,
    isWinner: roomState.winnerSlot === 1,
    isLoser: roomState.phase === "winner" && roomState.winnerSlot !== 1
  });
}

function showImpact(text) {
  clearTimeout(impactTimer);
  refs.impactText.textContent = text;
  refs.impactText.classList.remove("hidden");
  impactTimer = setTimeout(() => {
    refs.impactText.classList.add("hidden");
  }, 1200);
}

function updateChargeMeter() {
  if (!chargeActive) {
    refs.chargeFill.style.width = "0%";
    return;
  }

  const elapsed = performance.now() - chargeStartedAt;
  const power = Math.max(0.15, Math.min(1, elapsed / 1600));
  refs.chargeFill.style.width = `${power * 100}%`;
}

function toggleToolbar(enabled) {
  [...refs.toolButtons, ...refs.sizeButtons, refs.undoButton, refs.redoButton, refs.clearButton, ...document.querySelectorAll(".color-swatch")].forEach((button) => {
    button.disabled = !enabled;
  });
}

function render() {
  if (!roomState) return;

  refs.landingView.classList.add("hidden");
  refs.gameView.classList.remove("hidden");

  refs.roomCodeLabel.textContent = roomState.roomId;
  refs.noticeText.textContent = roomState.notice;
  refs.roundLabel.textContent = `Round ${roomState.roundNumber}`;
  refs.phaseBadge.textContent = phaseLabel(roomState.phase);
  refs.timerLabel.textContent = roomState.phase === "drawing" ? `${roomState.timeLeft}s` : roomState.phase === "winner" ? "Match End" : "Cake!";

  const hamster = roomState.players[0];
  const cat = roomState.players[1];
  refs.hamsterRole.textContent = playerRoleText(hamster);
  refs.hamsterHits.textContent = `${hamster.hitCount} / ${roomState.maxHits}`;
  refs.hamsterStage.textContent = stageLabel(hamster.hitCount);
  refs.catRole.textContent = playerRoleText(cat);
  refs.catHits.textContent = `${cat.hitCount} / ${roomState.maxHits}`;
  refs.catStage.textContent = stageLabel(cat.hitCount);

  if (roomState.phase === "drawing") {
    refs.wordPanel.textContent = roomState.word
      ? `Draw this: ${formatWordPair(roomState.word)}`
      : "Guess the drawing. English and Russian answers both work.";
  } else if (roomState.phase === "cake") {
    refs.wordPanel.textContent = "Cake phase is live. Attacker charges with the mouse, defender dodges sideways.";
  } else if (roomState.phase === "winner") {
    refs.wordPanel.textContent = roomState.winnerSlot === 0
      ? "TOO MUCH CAKE. Hamster wins the pastry war."
      : "TOO MUCH CAKE. Cat wins the pastry war.";
  } else {
    refs.wordPanel.textContent = "Waiting for both players to join the room...";
  }

  refs.battleHint.textContent = canAttack()
    ? "Hold the button to charge power, then release to throw."
    : canDefend()
      ? roomState.selfSlot === 0 ? "Dodge with A and D." : "Dodge with the arrow keys."
      : roomState.phase === "cake"
        ? "Watch the cake fly."
        : "Waiting for a correct guess...";

  refs.chargeButton.disabled = !canAttack();
  refs.guessInput.disabled = !canGuess();
  refs.guessInput.placeholder = canGuess() ? "Type your guess..." : "Only the guesser can answer now";
  refs.playAgainButton.classList.toggle("hidden", roomState.phase !== "winner");
  toggleToolbar(canDraw());
  renderGuessLog();
  renderBattlefield();
  renderCharacters();
}

function playImpactSound() {
  try {
    audioContext = audioContext ?? new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(70, audioContext.currentTime + 0.18);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.22);
  } catch {
    // Browser audio can fail before user interaction; the game still works without sound.
  }
}

setupLanding();
setupToolbar();
setupGuessing();
setupBattleControls();
renderBattlefield();

if (roomIdFromPath) {
  refs.landingView.classList.add("hidden");
  refs.gameView.classList.remove("hidden");
  connectToRoom(roomIdFromPath);
} else {
  refs.gameView.classList.add("hidden");
  refs.landingView.classList.remove("hidden");
}
