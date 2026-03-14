import * as THREE from "three";
import { sanitizeJumpClip } from "./animation/clipUtils.js";
import { CharacterEntity } from "./entities/CharacterEntity.js";
import { NetworkClient } from "./net/NetworkClient.js";
import { RoomOverlay } from "./ui/RoomOverlay.js";
import { loadFBXAnimation } from "./utils/loaders.js";
import {
  BELARUS_GROUND_Y,
  PORTAL_POINT,
  createBelarusVillageWorld
} from "./world/BelarusVillageWorld.js";

const ANIMATION_PATHS = {
  idle: "/assets/animations/idle.fbx",
  walk: "/assets/animations/walk.fbx",
  run: "/assets/animations/run.fbx",
  walking_backwards: "/assets/animations/walking_backwards.fbx",
  left_strafe_walking: "/assets/animations/left_strafe_walking.fbx",
  right_strafe_walking: "/assets/animations/right_strafe_walking.fbx",
  jump: "/assets/animations/jump.fbx",
  falling_dying: "/assets/animations/falling_dying.fbx",
  pickup: "/assets/animations/pickup.fbx",
  carry: "/assets/animations/carry.fbx",
  carry_walk: "/assets/animations/carry_walk.fbx",
  carry_run: "/assets/animations/carry_run.fbx",
  being_carried: "/assets/animations/being_carried.fbx"
};
const CHARACTER_CONFIGS = {
  edvard: {
    modelPath: "/assets/models/edvard_rigged.fbx",
    label: "Edvard",
    visualOffsetY: 0
  },
  elina: {
    modelPath: "/assets/models/elina_rigged.fbx",
    label: "Elina",
    visualOffsetY: 0.12
  }
};
const SERVER_URL = resolveServerUrl();
const SHARED_CHARACTER_SCALE = 0.01;
const CHARACTER_FACING_OFFSET_Y = Math.PI;
const NETWORK_TICK_MS = 100;
const WALK_SPEED = 1.8;
const RUN_SPEED = 3.4;
const TURN_LERP_SPEED = 10;
const JUMP_HEIGHT = 0.56;
const JUMP_TAKEOFF_THRESHOLD = 0.14;
const JUMP_LANDING_THRESHOLD = 0.9;
const AIR_MOMENTUM_FACTOR = 0.55;
const AIR_MOMENTUM_DAMPING = 3.2;
const PLAYER_GROUND_Y = BELARUS_GROUND_Y;
const FOLLOW_CAMERA_OFFSET = new THREE.Vector3(0, 2.3, 5.4);
const FOLLOW_LOOK_OFFSET = new THREE.Vector3(0, 1.4, 0);
const CAMERA_LERP_SPEED = 5;
const AMBIENT_AUDIO_PATH = "/assets/audio/forest_night.mp3";
const AMBIENT_AUDIO_VOLUME = 0.28;
const AMBIENT_STINGER_MIN_DELAY = 12;
const AMBIENT_STINGER_MAX_DELAY = 24;
const DANGER_AUDIO_PATH = "/assets/audio/horror_ghost_breathing.mp3";
const DANGER_AUDIO_MAX_VOLUME = 0.26;
const VIGIL_STAGE_1_DELAY = 0;
const VIGIL_STAGE_2_DELAY = 1.2;
const VIGIL_COLLAPSE_DELAY = 2.6;
const VIGIL_SLOW_MULTIPLIER = 0.42;
const VIGIL_WARNING_SLOW_MULTIPLIER = 0.58;
const CARRY_SPEED_MULTIPLIER = 0.58;
const CARRY_INTERACT_DISTANCE = 2.4;
const CARRY_PICKUP_LOCK_SECONDS = 0.9;
const CHURCH_SAFE_RADIUS = 11.5;
const FOREST_PARTNER_SAFE_DISTANCE = 100;
const FOREST_DANGER_DECAY_RATE = 2.4;
const HEAL_EFFECT_DURATION = 1.6;
const RED_ORB_DETECTION_RADIUS = 9.5;
const RED_ORB_CAPTURE_RADIUS = 1.2;
const RED_ORB_IDLE_SPEED = 0.45;
const RED_ORB_CHASE_SPEED = 3.2;
const RED_ORB_RETURN_SPEED = 1.8;
const ENABLE_GRADIENT_BACKGROUND = true;
const NIGHT_SKY_TOP_COLOR = "#0a1020";
const NIGHT_SKY_HORIZON_COLOR = "#31465d";
const CHURCH_RITUAL_SEQUENCE = ["bell", "thread", "lake"];
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const GAME_SHELL_STATES = {
  title: "title",
  ingame: "ingame",
  paused: "paused",
  gameover: "gameover",
  complete: "complete"
};
const PORTAL_COMPLETE_RADIUS = 3.2;
const INPUT_KEYS = new Set([
  "w",
  "W",
  "a",
  "A",
  "s",
  "S",
  "d",
  "D",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Shift",
  " ",
  "Spacebar",
  "e",
  "E"
]);
const CHURCH_SAFE_CENTER = new THREE.Vector3(-20, PLAYER_GROUND_Y, 156);
let churchHealCenter = new THREE.Vector3(-20, PLAYER_GROUND_Y, 156);
let churchHealRecoveryPosition = new THREE.Vector3(-20, PLAYER_GROUND_Y, 156);
let churchHealFacingY = Math.PI;
let churchHealInteractRadius = 2.4;
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

function normalizeRoomMapId(mapId) {
  return "map1";
}

function resolveServerUrl() {
  const configuredUrl = import.meta.env.VITE_SERVER_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3001";
    }
  }

  return "http://localhost:3001";
}

const CARRIED_PLAYER_OFFSET = new THREE.Vector3(0, 0.58, -0.42);
const VIGIL_ORB_OFFSET = new THREE.Vector3(0.55, 1.35, 0);
const DANGER_ZONES = [
  { id: "corridor_west", center: new THREE.Vector3(-39, PLAYER_GROUND_Y, 158), radius: 15 },
  { id: "corridor_east", center: new THREE.Vector3(42, PLAYER_GROUND_Y, 164), radius: 15 },
  { id: "lake_approach_west", center: new THREE.Vector3(-30, PLAYER_GROUND_Y, 224), radius: 18 },
  { id: "lake_approach_east", center: new THREE.Vector3(35, PLAYER_GROUND_Y, 222), radius: 18 },
  { id: "deep_lake_west", center: new THREE.Vector3(-58, PLAYER_GROUND_Y, 250), radius: 15 },
  { id: "deep_lake_east", center: new THREE.Vector3(60, PLAYER_GROUND_Y, 252), radius: 15 }
];
function createDefaultShrineState() {
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

function createDefaultChurchRitualState() {
  return {
    progress: [],
    solved: false,
    graveyardUnlocked: false,
    lastEventType: null,
    lastElementId: null,
    lastEventNonce: 0
  };
}

function createDefaultGraveyardOfferingState() {
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

function createDefaultLakeFinaleState() {
  return {
    unlocked: false,
    rewardHolderSocketId: null,
    rewardCollected: false,
    completed: false,
    lastEventType: null,
    lastEventNonce: 0
  };
}

function createNightSkyGradientTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Color(0x31465d);
  }

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, NIGHT_SKY_TOP_COLOR);
  gradient.addColorStop(0.5, "#152238");
  gradient.addColorStop(1, NIGHT_SKY_HORIZON_COLOR);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

export class GameApp {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    if (ENABLE_GRADIENT_BACKGROUND) {
      console.log("gradient enabled");
      this.scene.background = createNightSkyGradientTexture();
      this.scene.fog = new THREE.Fog(0x31465d, 78, 242);
    } else {
      console.log("gradient disabled for isolation");
      this.scene.background = new THREE.Color(0x566a7b);
      this.scene.fog = new THREE.Fog(0x566a7b, 78, 242);
    }
    this.camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.audioListener = new THREE.AudioListener();
    this.camera.add(this.audioListener);
    this.ambientSound = new THREE.Audio(this.audioListener);
    this.dangerSound = new THREE.Audio(this.audioListener);
    this.audioLoader = new THREE.AudioLoader();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;

    this.clock = new THREE.Clock();
    this.sharedAnimations = {};
    this.playerEntities = new Map();
    this.remotePlayers = new Map();
    this.pendingPlayerStates = new Map();
    this.playerLoadPromises = new Map();
    this.remoteStateLogged = new Set();
    this.localPlayer = null;
    this.localSocketId = null;
    this.localCharacterId = null;
    this.roomCode = null;
    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false
    };
    this.playerState = {
      isJumping: false,
      jumpTime: 0,
      jumpDuration: 0,
      baseY: PLAYER_GROUND_Y,
      movementActive: false,
      movementAnimation: "idle",
      vigilStage: 0,
      dangerZoneId: null,
      dangerZoneTime: 0,
      isCollapsed: false,
      carryTargetSocketId: null,
      carriedBySocketId: null,
      healTargetSocketId: null,
      carryIntroTimeRemaining: 0,
      lastDangerZoneId: null
    };
    this.followCameraPosition = new THREE.Vector3(0, 1.8, 5.5);
    this.followCameraTarget = new THREE.Vector3(0, 1.2, 0);
    this.cameraForward = new THREE.Vector3();
    this.cameraRight = new THREE.Vector3();
    this.desiredMove = new THREE.Vector3();
    this.playerPosition = new THREE.Vector3();
    this.desiredCameraPosition = new THREE.Vector3();
    this.desiredLookTarget = new THREE.Vector3();
    this.jumpMomentum = new THREE.Vector3();
    this.debugCameraBasisLogged = false;
    this.lastSentPlayerState = "";
    this.networkTickHandle = null;
    this.networkHandlersInitialized = false;
    this.hasUserInteracted = false;
    this.ambientAudioLoaded = false;
    this.ambientAudioFailed = false;
    this.ambientPlaybackStarted = false;
    this.nextAmbientStingerTime = 10 + Math.random() * 8;
    this.cachedNoiseBuffer = null;
    this.dangerAudioLoaded = false;
    this.dangerAudioFailed = false;
    this.dangerAudioStarted = false;
    this.dangerAudioTargetVolume = 0;
    this.remotePlayerStates = new Map();
    this.vigilOrbMap = new Map();
    this.redOrbHazards = [];
    this.redOrbMap = new Map();
    this.shrineHooks = [];
    this.shrineOrbAnchors = [];
    this.activeShrineHook = null;
    this.shrineState = createDefaultShrineState();
    this.sharedVigilWarningActive = false;
    this.sharedVigilVictimSocketId = null;
    this.gameOverActive = false;
    this.healEffect = null;
    this.healEffectTimeRemaining = 0;
    this.healZoneMarker = null;
    this.interactionPrompt = this.createInteractionPrompt();
    this.shrineProgressHud = this.createShrineProgressHud();
    this.statusBanner = this.createStatusBanner();
    this.guidanceBanner = this.createGuidanceBanner();
    this.titleMenuOverlay = this.createTitleMenuOverlay();
    this.pauseMenuOverlay = this.createPauseMenuOverlay();
    this.resultScreenOverlay = this.createResultScreenOverlay();
    this.creditsOverlay = this.createCreditsOverlay();
    this.vigilPresenceOverlay = this.createVigilPresenceOverlay();
    this.rescueImmunityActive = false;
    this.statusBannerHideHandle = null;
    this.portalReadyAnnounced = false;
    this.gameStarted = false;
    this.shellState = GAME_SHELL_STATES.title;
    this.initializePromise = null;
    this.portalArea = {
      position: new THREE.Vector3(PORTAL_POINT.x, PORTAL_POINT.y, PORTAL_POINT.z),
      radius: PORTAL_COMPLETE_RADIUS
    };
    this.currentMapId = "map1";
    this.tempVectorA = new THREE.Vector3();
    this.tempVectorB = new THREE.Vector3();
    this.cachedLitShrineCount = -1;

    this.networkClient = new NetworkClient({ serverUrl: SERVER_URL });
    this.roomOverlay = new RoomOverlay(document.body);
    this.roomOverlay.hide();

    this.container.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.setupScene();
    this.setupAmbientAudio();
    this.setupDangerAudio();
    this.handleResize = this.handleResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleFirstInteraction = this.handleFirstInteraction.bind(this);
    this.animate = this.animate.bind(this);
    this.updateShellVisibility();
  }

  start() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("contextmenu", this.handleContextMenu);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("pointerdown", this.handleFirstInteraction, { passive: true });
    window.addEventListener("touchstart", this.handleFirstInteraction, { passive: true });

    console.log("renderer started");
    this.animate();
  }

  async initialize() {
    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.roomOverlay.setStatus("Loading shared animations...");
    this.roomOverlay.show();

    this.initializePromise = (async () => {
      try {
        this.sharedAnimations = await this.loadSharedAnimations();
        this.setupNetworkHandlers();
        await this.initializeRoomFlow();
      } catch (error) {
        console.error("Failed to initialize game.", error);
        this.roomOverlay.setStatus("Failed to initialize game.", { error: true });
      }
    })();

    return this.initializePromise;
  }

  async initializeRoomFlow() {
    const roomCode = this.getRoomCodeFromUrl();
    this.roomOverlay.show();

    if (roomCode) {
      this.roomCode = roomCode;
      this.roomOverlay.hideCreateButton();
      this.roomOverlay.setStatus(`Joining room ${roomCode}...`);
      await this.networkClient.connect();
      this.networkClient.joinRoom(roomCode);
      return;
    }

    this.roomOverlay.setStatus("Create a room to invite a second player.");
    this.roomOverlay.showCreateButton(() => this.handleCreateRoom());
  }

  setupNetworkHandlers() {
    if (this.networkHandlersInitialized) {
      return;
    }

    this.networkHandlersInitialized = true;

    this.networkClient.on("connect", () => {
      console.log("Connected to multiplayer server.");
    });

    this.networkClient.on("disconnect", () => {
      console.log("Disconnected from multiplayer server.");
      this.roomOverlay.setStatus("Disconnected from server.", { error: true });
    });

    this.networkClient.on("connect_error", (error) => {
      console.error("Failed to connect to multiplayer server.", error);
      this.roomOverlay.setStatus("Could not connect to server.", { error: true });
    });

    this.networkClient.on("room_created", (payload) => {
      console.log("Room created:", payload.roomCode);
      this.handleRoomJoined(payload, { isHost: true });
    });

    this.networkClient.on("joined_room", (payload) => {
      console.log("Joined room:", payload.roomCode);
      this.handleRoomJoined(payload, { isHost: false });
    });

    this.networkClient.on("room_state", (payload) => {
      console.log("Room state received.", payload.players?.map((player) => player.characterId));
      this.applyRoomMap(payload.mapId);
      this.applyRoomState(payload.players ?? []);
      this.applyShrineState(payload.shrines, { silent: true });
    });

    this.networkClient.on("player_joined", (playerState) => {
      console.log("Remote player joined:", playerState.characterId);
      this.syncRemotePlayerState(playerState);
      this.refreshRoomStatus();
    });

    this.networkClient.on("player_left", ({ socketId, characterId }) => {
      console.log("Remote player left:", characterId ?? socketId);
      this.removeRemotePlayer(socketId);
      this.refreshRoomStatus();
    });

    this.networkClient.on("player_state", (playerState) => {
      this.syncRemotePlayerState(playerState);
    });

    this.networkClient.on("shrine_state", (shrineState) => {
      this.applyShrineState(shrineState);
    });

    this.networkClient.on("run_reset", (payload) => {
      this.handleRunReset(payload);
    });

    this.networkClient.on("room_full", ({ roomCode }) => {
      console.warn(`Room ${roomCode} is full.`);
      this.roomOverlay.setStatus(`Room ${roomCode} is full.`, { error: true });
      this.roomOverlay.showCreateButton(() => this.handleCreateRoom());
    });

    this.networkClient.on("room_not_found", ({ roomCode }) => {
      console.warn(`Room ${roomCode} was not found.`);
      this.roomOverlay.setStatus(`Room ${roomCode} was not found.`, { error: true });
      this.roomOverlay.showCreateButton(() => this.handleCreateRoom());
    });
  }

  async handleCreateRoom() {
    const selectedMapId = normalizeRoomMapId(this.roomOverlay.getSelectedMapId());
    this.roomOverlay.hideCreateButton();
    this.roomOverlay.setStatus("Connecting to server...");

    try {
      await this.networkClient.connect();
      this.networkClient.createRoom(selectedMapId);
    } catch (error) {
      console.error("Failed to create room.", error);
      this.roomOverlay.setStatus("Failed to create room.", { error: true });
      this.roomOverlay.showCreateButton(() => this.handleCreateRoom());
    }
  }

  async handleRoomJoined(payload, { isHost }) {
    try {
      const { roomCode, mapId, player, players = [] } = payload;

      this.roomCode = roomCode;
      this.localSocketId = player.socketId;
      this.localCharacterId = player.characterId;
      this.lastSentPlayerState = "";

      this.applyRoomMap(normalizeRoomMapId(mapId));
      this.setRoomCodeInUrl(roomCode);
      this.roomOverlay.hideCreateButton();
      this.roomOverlay.setRole(`Assigned character: ${this.getCharacterLabel(player.characterId)}`);
      this.roomOverlay.setInviteLink(this.getInviteLink(roomCode));

      await this.spawnLocalPlayer(player);
      this.applyRoomState(players);
      this.applyShrineState(payload.shrines, { silent: true });

      if (isHost) {
        this.roomOverlay.setStatus(`Room ${roomCode} created. Waiting for second player...`);
      } else {
        this.roomOverlay.setStatus(
          `Joined room ${roomCode} as ${this.getCharacterLabel(player.characterId)}.`
        );
      }

      this.refreshRoomStatus();
    } catch (error) {
      console.error("Failed to finish room join flow.", error);
      this.roomOverlay.setStatus("Failed to start the selected map.", { error: true });
      if (!this.getRoomCodeFromUrl()) {
        this.roomOverlay.showCreateButton(() => this.handleCreateRoom());
      }
    }
  }

  applyRoomState(players) {
    for (const playerState of players) {
      if (playerState.socketId === this.localSocketId) {
        continue;
      }

      this.syncRemotePlayerState(playerState);
    }
  }

  async spawnLocalPlayer(playerState) {
    if (this.localPlayer) {
      return this.localPlayer;
    }

    const character = this.createCharacterEntity(playerState, {
      name: `${this.getCharacterLabel(playerState.characterId)} (Local)`,
      onAnimationFinished: (animationName) =>
        this.handleLocalPlayerAnimationFinished(animationName)
    });

    this.localPlayer = character;
    this.playerEntities.set(playerState.socketId, character);

    await character.load();
    this.applyIncomingStateToLocalPlayer(playerState);
    this.applyPlayerStateToEntity(character, this.buildLocalPlayerStatePayload());
    this.playerState.jumpDuration = this.sharedAnimations.jump?.duration ?? 0.9;
    this.playerState.baseY = this.getGroundHeightAt(
      character.model.position.x,
      character.model.position.z
    );
    this.snapLocalPlayerToGround();
    this.syncPlayerAnimation();
    this.updateFollowCamera(1);
    this.logCameraBasis();

    console.log("Assigned character:", playerState.characterId);
    console.log("Local player initialized:", this.getCharacterLabel(playerState.characterId));

    return character;
  }

  syncRemotePlayerState(playerState) {
    if (!playerState?.socketId || playerState.socketId === this.localSocketId) {
      return;
    }

    this.remotePlayerStates.set(playerState.socketId, { ...playerState });
    this.syncCarryRelationFromRemoteState(playerState);

    const existingPlayer = this.remotePlayers.get(playerState.socketId);

    if (existingPlayer) {
      this.applyPlayerStateToEntity(existingPlayer, playerState);
      this.applyRemoteCarryPresentation(existingPlayer, playerState);

      if (!this.remoteStateLogged.has(playerState.socketId)) {
        console.log("Remote player state received:", playerState.characterId);
        this.remoteStateLogged.add(playerState.socketId);
      }

      return;
    }

    if (this.playerLoadPromises.has(playerState.socketId)) {
      this.pendingPlayerStates.set(playerState.socketId, playerState);
      return;
    }

    const remotePlayer = this.createCharacterEntity(playerState, {
      name: `${this.getCharacterLabel(playerState.characterId)} (Remote)`
    });

    this.remotePlayers.set(playerState.socketId, remotePlayer);
    this.playerEntities.set(playerState.socketId, remotePlayer);
    this.pendingPlayerStates.set(playerState.socketId, playerState);

    const loadPromise = remotePlayer.load().then(() => {
      const pendingState = this.pendingPlayerStates.get(playerState.socketId) ?? playerState;
      this.pendingPlayerStates.delete(playerState.socketId);
      this.applyPlayerStateToEntity(remotePlayer, pendingState);
      this.applyRemoteCarryPresentation(remotePlayer, pendingState);
      console.log("Remote player spawned:", pendingState.characterId);
      this.refreshRoomStatus();
    }).finally(() => {
      this.playerLoadPromises.delete(playerState.socketId);
    });

    this.playerLoadPromises.set(playerState.socketId, loadPromise);
  }

  removeRemotePlayer(socketId) {
    const remotePlayer = this.remotePlayers.get(socketId);

    if (remotePlayer) {
      remotePlayer.destroy();
    }

    if (this.playerState.carriedBySocketId === socketId) {
      this.playerState.carriedBySocketId = null;
    }

    if (this.playerState.carryTargetSocketId === socketId) {
      this.playerState.carryTargetSocketId = null;
    }

    this.removeVigilOrb(socketId);
    this.remotePlayers.delete(socketId);
    this.remotePlayerStates.delete(socketId);
    this.playerEntities.delete(socketId);
    this.playerLoadPromises.delete(socketId);
    this.pendingPlayerStates.delete(socketId);
    this.remoteStateLogged.delete(socketId);
  }

  createCharacterEntity(playerState, { name, onAnimationFinished = null } = {}) {
    const config = this.getCharacterConfig(playerState.characterId);
    const position = this.getAlignedPlayerPosition(playerState.position);

    return new CharacterEntity({
      scene: this.scene,
      modelPath: config.modelPath,
      animations: this.sharedAnimations,
      scale: SHARED_CHARACTER_SCALE,
      position,
      rotationY: playerState.rotationY ?? 0,
      facingOffsetY: CHARACTER_FACING_OFFSET_Y,
      visualOffsetY: config.visualOffsetY ?? 0,
      name,
      onAnimationFinished
    });
  }

  applyPlayerStateToEntity(entity, playerState) {
    if (!entity?.model || !playerState) {
      return;
    }

    const { position, rotationY = 0, animation = "idle" } = playerState;

    if (position) {
      const alignedPosition = this.getAlignedPlayerPosition(position);
      entity.setPosition(alignedPosition.x, alignedPosition.y, alignedPosition.z);
    }

    entity.setRotationY(rotationY);
    entity.play(animation);
  }

  refreshRoomStatus() {
    if (!this.roomCode || !this.localPlayer || this.shellState === GAME_SHELL_STATES.title) {
      return;
    }

    if (this.remotePlayers.size === 0) {
      this.roomOverlay.show();
      this.roomOverlay.setStatus(`Room ${this.roomCode} ready. Waiting for second player...`);
      return;
    }

    this.roomOverlay.setStatus(
      `Connected in room ${this.roomCode} as ${this.getCharacterLabel(this.localCharacterId)}.`
    );
    if (this.shellState === GAME_SHELL_STATES.ingame) {
      this.roomOverlay.hide();
    }
  }

  getCharacterConfig(characterId) {
    const config = CHARACTER_CONFIGS[characterId];

    if (!config) {
      throw new Error(`Unknown character id: ${characterId}`);
    }

    return config;
  }

  getCharacterLabel(characterId) {
    return this.getCharacterConfig(characterId).label;
  }

  async loadSharedAnimations() {
    const animationEntries = await Promise.all(
      Object.entries(ANIMATION_PATHS).map(async ([name, path]) => {
        console.log(`Loading ${name} animation:`, path);
        const clip = await loadFBXAnimation(path);
        const finalClip = name === "jump" ? sanitizeJumpClip(clip) : clip;
        console.log(`${name} clip loaded:`, finalClip.name || "Unnamed clip");
        return [name, finalClip];
      })
    );

    return Object.fromEntries(animationEntries);
  }

  setupAmbientAudio() {
    this.audioLoader.load(
      AMBIENT_AUDIO_PATH,
      (buffer) => {
        this.ambientSound.setBuffer(buffer);
        this.ambientSound.setLoop(true);
        this.ambientSound.setVolume(AMBIENT_AUDIO_VOLUME);
        this.ambientAudioLoaded = true;
        console.log("Ambient forest sound loaded.");
        this.tryStartAmbientAudio();
      },
      undefined,
      (error) => {
        this.ambientAudioFailed = true;
        console.warn("Ambient forest sound failed to load.", error);
      }
    );
  }

  setupDangerAudio() {
    this.audioLoader.load(
      DANGER_AUDIO_PATH,
      (buffer) => {
        this.dangerSound.setBuffer(buffer);
        this.dangerSound.setLoop(true);
        this.dangerSound.setVolume(0);
        this.dangerAudioLoaded = true;
        console.log("Ghost breathing sound loaded.");
        this.tryStartDangerAudio();
      },
      undefined,
      (error) => {
        this.dangerAudioFailed = true;
        console.warn("Ghost breathing sound failed to load.", error);
      }
    );
  }

  handleFirstInteraction() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
    }

    this.tryStartAmbientAudio();
    this.tryStartDangerAudio();
  }

  async tryStartAmbientAudio() {
    if (
      !this.hasUserInteracted ||
      !this.ambientAudioLoaded ||
      this.ambientAudioFailed ||
      this.ambientPlaybackStarted ||
      this.ambientSound.isPlaying
    ) {
      return;
    }

    try {
      if (this.audioListener.context.state === "suspended") {
        await this.audioListener.context.resume();
      }

      if (!this.ambientSound.isPlaying) {
        this.ambientSound.play();
        this.ambientPlaybackStarted = true;
        console.log("Ambient forest sound playback started.");
      }
    } catch (error) {
      console.warn("Ambient forest sound could not start yet.", error);
    }
  }

  async tryStartDangerAudio() {
    if (
      !this.hasUserInteracted ||
      !this.dangerAudioLoaded ||
      this.dangerAudioFailed ||
      this.dangerSound.isPlaying ||
      this.dangerAudioTargetVolume <= 0
    ) {
      return;
    }

    try {
      if (this.audioListener.context.state === "suspended") {
        await this.audioListener.context.resume();
      }

      this.dangerSound.play();
      this.dangerAudioStarted = true;
      console.log("Ghost breathing playback started.");
    } catch (error) {
      console.warn("Ghost breathing could not start yet.", error);
    }
  }

  updateAmbientStingers(time) {
    if (
      !this.hasUserInteracted ||
      !this.ambientPlaybackStarted ||
      !this.audioListener?.context ||
      this.audioListener.context.state !== "running" ||
      this.gameOverActive
    ) {
      return;
    }

    if (time < this.nextAmbientStingerTime) {
      return;
    }

    const roll = Math.random();
    if (roll < 0.42) {
      this.playAmbientWindStinger();
    } else if (roll < 0.74) {
      this.playAmbientRustleStinger();
    } else {
      this.playAmbientOwlStinger();
    }

    this.nextAmbientStingerTime =
      time + THREE.MathUtils.randFloat(AMBIENT_STINGER_MIN_DELAY, AMBIENT_STINGER_MAX_DELAY);
  }

  getSharedNoiseBuffer() {
    if (this.cachedNoiseBuffer || !this.audioListener?.context) {
      return this.cachedNoiseBuffer;
    }

    const context = this.audioListener.context;
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    this.cachedNoiseBuffer = buffer;
    return buffer;
  }

  playAmbientNoiseStinger({
    gain = 0.018,
    duration = 2.8,
    lowpass = 1200,
    highpass = 120,
    playbackRate = 0.55,
    pan = 0
  }) {
    const context = this.audioListener?.context;
    const noiseBuffer = this.getSharedNoiseBuffer();

    if (!context || !noiseBuffer) {
      return;
    }

    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    source.playbackRate.value = playbackRate;

    const highpassFilter = context.createBiquadFilter();
    highpassFilter.type = "highpass";
    highpassFilter.frequency.value = highpass;

    const lowpassFilter = context.createBiquadFilter();
    lowpassFilter.type = "lowpass";
    lowpassFilter.frequency.value = lowpass;

    const gainNode = context.createGain();
    gainNode.gain.value = 0;

    const panner = context.createStereoPanner();
    panner.pan.value = pan;

    source.connect(highpassFilter);
    highpassFilter.connect(lowpassFilter);
    lowpassFilter.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(context.destination);

    const now = context.currentTime;
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.35);
    gainNode.gain.linearRampToValueAtTime(gain * 0.72, now + Math.max(0.55, duration - 0.5));
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    source.start(now);
    source.stop(now + duration + 0.05);
  }

  playAmbientWindStinger() {
    this.playAmbientNoiseStinger({
      gain: 0.014,
      duration: 4.6,
      lowpass: 780,
      highpass: 90,
      playbackRate: 0.42,
      pan: THREE.MathUtils.randFloat(-0.55, 0.55)
    });
  }

  playAmbientRustleStinger() {
    this.playAmbientNoiseStinger({
      gain: 0.011,
      duration: 1.6,
      lowpass: 2200,
      highpass: 420,
      playbackRate: 0.88,
      pan: THREE.MathUtils.randFloat(-0.8, 0.8)
    });
  }

  playAmbientOwlStinger() {
    const context = this.audioListener?.context;

    if (!context) {
      return;
    }

    const gainNode = context.createGain();
    gainNode.gain.value = 0;
    const panner = context.createStereoPanner();
    panner.pan.value = THREE.MathUtils.randFloat(-0.7, 0.7);
    gainNode.connect(panner);
    panner.connect(context.destination);

    const now = context.currentTime;
    const baseFrequency = THREE.MathUtils.randFloat(460, 540);

    [0, 0.42].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const oscillatorGain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(baseFrequency - index * 70, now + offset);
      oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * (0.82 - index * 0.06), now + offset + 0.38);
      oscillatorGain.gain.value = 0;
      oscillatorGain.gain.linearRampToValueAtTime(0.012 - index * 0.003, now + offset + 0.08);
      oscillatorGain.gain.linearRampToValueAtTime(0.0001, now + offset + 0.6);
      oscillator.connect(oscillatorGain);
      oscillatorGain.connect(gainNode);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.65);
    });
  }

  setupCamera() {
    this.camera.position.copy(this.followCameraPosition);
    this.camera.lookAt(this.followCameraTarget);
  }

  setupScene() {
    this.healEffect = this.createHealEffect();
    this.scene.add(this.healEffect);
    this.healZoneMarker = this.createHealZoneMarker();
    this.scene.add(this.healZoneMarker);
    this.loadMapOne();
    console.log("world mounted");
    console.log("world visible recovery mode");
    const directionalLight = new THREE.DirectionalLight(0x97b3d1, 1.05);
    directionalLight.position.set(-48, 60, 32);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 180;
    directionalLight.shadow.camera.left = -90;
    directionalLight.shadow.camera.right = 90;
    directionalLight.shadow.camera.top = 90;
    directionalLight.shadow.camera.bottom = -90;
    this.scene.add(directionalLight);

    const fillLight = new THREE.HemisphereLight(0x86a2bf, 0x263241, 1.35);
    this.scene.add(fillLight);
  }

  loadMapOne() {
    this.currentMapId = "map1";
    const world = createBelarusVillageWorld();
    this.mountWorld(world, { applyShrineState: true });
  }

  applyRoomMap(mapId) {
    if (this.currentMapId === "map1") {
      return;
    }

    this.loadMapOne();
  }

  mountWorld(world, { applyShrineState = false } = {}) {
    if (this.world) {
      this.scene.remove(this.world);
    }

    this.world = world;
    this.scene.add(this.world);
    this.applyChurchHealingAnchor(this.world.userData?.churchHealing);
    this.applyPortalArea(this.world.userData?.portal);
    this.shrineHooks = this.world.userData?.shrines?.hooks ?? [];
    this.shrineOrbAnchors = this.world.userData?.shrines?.orbAnchors ?? [];
    this.initializeShrineOrbHazards();

    if (applyShrineState) {
      this.applyShrineState(
        this.world.userData?.shrines?.getState?.() ?? createDefaultShrineState(),
        { silent: true }
      );
    }

    if (this.healZoneMarker) {
      this.healZoneMarker.visible = Boolean(this.world.userData?.churchHealing);
      this.healZoneMarker.position.copy(churchHealCenter);
    }
  }

  movePlayersToMapSpawn(spawnPosition) {
    const localSpawn = spawnPosition.clone();

    if (this.localPlayer?.model) {
      this.localPlayer.setPosition(localSpawn.x, localSpawn.y, localSpawn.z);
      this.localPlayer.setRotationY(0);
      this.playerState.baseY = localSpawn.y;
      this.playerState.isJumping = false;
      this.playerState.jumpTime = 0;
      this.jumpMomentum.set(0, 0, 0);
      this.syncPlayerAnimation();
      this.updateFollowCamera(1);
    }

    let offsetDirection = -1;
    for (const remotePlayer of this.remotePlayers.values()) {
      if (!remotePlayer?.model) {
        continue;
      }

      remotePlayer.setPosition(
        localSpawn.x + offsetDirection * 1.2,
        localSpawn.y,
        localSpawn.z + 0.9
      );
      remotePlayer.setRotationY(0);
      offsetDirection *= -1;
    }
  }

  handleLocalPlayerAnimationFinished(animationName) {
    if (animationName === "jump") {
      this.playerState.isJumping = false;
      this.playerState.jumpTime = 0;
      this.jumpMomentum.set(0, 0, 0);
      this.snapLocalPlayerToGround();

      console.log("Jump end");
      this.syncPlayerAnimation();
      return;
    }

    if (animationName === "falling_dying") {
      console.log("Collapse animation completed.");
    }
  }

  handleKeyDown(event) {
    this.handleFirstInteraction();

    if (event.key === "Escape") {
      event.preventDefault();
      this.handleEscapeKey();
      return;
    }

    if (INPUT_KEYS.has(event.key) || event.code === "Space") {
      event.preventDefault();
    }

    if (this.isGameplayInputBlocked()) {
      return;
    }

    if ((event.key === "e" || event.key === "E") && !event.repeat) {
      if (this.canTriggerChurchHeal()) {
        this.requestChurchHeal();
      } else if (this.canTriggerShrineInteraction()) {
        this.triggerShrineInteraction();
      } else {
        this.tryStartCarry();
      }
      return;
    }

    if (!this.setInputState(event, true)) {
      return;
    }

    this.syncPlayerAnimation();
  }

  handleKeyUp(event) {
    if (INPUT_KEYS.has(event.key) || event.code === "Space") {
      event.preventDefault();
    }

    if (this.isGameplayInputBlocked()) {
      return;
    }

    if (!this.setInputState(event, false)) {
      return;
    }

    this.syncPlayerAnimation();
  }

  handleContextMenu(event) {
    event.preventDefault();
    this.clearGameplayInputState();
  }

  handleWindowBlur() {
    this.clearGameplayInputState();
  }

  setInputState(event, isPressed) {
    switch (event.key) {
      case "w":
      case "W":
      case "ArrowUp":
        this.inputState.forward = isPressed;
        return true;
      case "s":
      case "S":
      case "ArrowDown":
        this.inputState.backward = isPressed;
        return true;
      case "a":
      case "A":
      case "ArrowLeft":
        this.inputState.left = isPressed;
        return true;
      case "d":
      case "D":
      case "ArrowRight":
        this.inputState.right = isPressed;
        return true;
      case "Shift":
        this.inputState.run = isPressed;
        return true;
      default:
        if (event.code === "Space" && isPressed) {
          this.startJump();
          return true;
        }

        if ((event.key === " " || event.key === "Spacebar") && isPressed) {
          this.startJump();
          return true;
        }

        return false;
    }
  }

  startJump() {
    if (
      !this.localPlayer?.model ||
      this.playerState.isJumping ||
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId
    ) {
      return;
    }

    const movementInput = this.getMovementInput();
    const desiredMove = this.getDesiredMoveDirection(movementInput);
    const groundedSpeed = this.getGroundMoveSpeed(movementInput);

    this.playerState.isJumping = true;
    this.playerState.jumpTime = 0;
    this.playerState.baseY = this.getGroundHeightAt(
      this.localPlayer.model.position.x,
      this.localPlayer.model.position.z
    );
    this.snapLocalPlayerToGround();
    this.jumpMomentum
      .copy(desiredMove)
      .multiplyScalar(groundedSpeed * AIR_MOMENTUM_FACTOR);

    console.log("Jump start");
    this.localPlayer.play("jump");
  }

  updateLocalPlayer(delta) {
    if (!this.localPlayer?.model) {
      return;
    }

    this.updateVigilState(delta);

    if (this.playerState.carriedBySocketId) {
      this.updateCarriedLocalPlayer();
      this.updateInteractionPrompt();
      this.syncPlayerAnimation();
      return;
    }

    if (this.playerState.isCollapsed) {
      this.snapLocalPlayerToGround();
      this.updateInteractionPrompt();
      this.syncPlayerAnimation();
      return;
    }

    const movementInput = this.getMovementInput();
    const desiredMove = this.getDesiredMoveDirection(movementInput);

    if (this.playerState.carryIntroTimeRemaining > 0) {
      this.playerState.carryIntroTimeRemaining = Math.max(
        0,
        this.playerState.carryIntroTimeRemaining - delta
      );
      this.updateMovementState({ inputX: 0, inputZ: 0 }, new THREE.Vector3());
      this.updateLocalCarryState();
      this.updateInteractionPrompt();
      this.syncPlayerAnimation();
      return;
    }

    this.updateMovementState(movementInput, desiredMove);

    if (this.playerState.isJumping) {
      this.updateAirborneMovement(delta);
    } else {
      this.updateGroundedMovement(movementInput, desiredMove, delta);
      this.updatePlayerFacing(movementInput, desiredMove, delta);
    }

    this.updateJumpArc();
    this.updateLocalCarryState();
    this.updateActiveShrineHook();
    this.updateInteractionPrompt();
    this.syncPlayerAnimation();
  }

  getMovementInput() {
    return {
      inputX: Number(this.inputState.right) - Number(this.inputState.left),
      inputZ: Number(this.inputState.forward) - Number(this.inputState.backward)
    };
  }

  getDesiredMoveDirection({ inputX, inputZ }) {
    this.desiredMove.set(0, 0, 0);

    if (inputX === 0 && inputZ === 0) {
      return this.desiredMove;
    }

    this.camera.getWorldDirection(this.cameraForward);
    this.cameraForward.y = 0;

    if (this.cameraForward.lengthSq() === 0) {
      this.cameraForward.set(0, 0, -1);
    }

    this.cameraForward.normalize();
    this.cameraRight.crossVectors(this.cameraForward, UP_AXIS).normalize();

    this.desiredMove
      .addScaledVector(this.cameraForward, inputZ)
      .addScaledVector(this.cameraRight, inputX);

    if (this.desiredMove.lengthSq() > 0) {
      this.desiredMove.normalize();
    }

    return this.desiredMove;
  }

  updateMovementState(movementInput, desiredMove) {
    const movementMagnitude = desiredMove.length();
    const movementActive = movementMagnitude > 0;
    const movementAnimation = this.selectMovementAnimation(
      movementInput,
      movementMagnitude
    );

    if (
      movementActive !== this.playerState.movementActive ||
      movementAnimation !== this.playerState.movementAnimation
    ) {
      console.log(
        movementActive
          ? `Movement input active: ${movementAnimation}`
          : "Movement input active: none"
      );
    }

    this.playerState.movementActive = movementActive;
    this.playerState.movementAnimation = movementAnimation;
  }

  selectMovementAnimation({ inputX, inputZ }, movementMagnitude) {
    if (this.playerState.isJumping) {
      return "jump";
    }

    if (movementMagnitude === 0) {
      return "idle";
    }

    if (this.isMostlyBackwardInput({ inputX, inputZ })) {
      return "walking_backwards";
    }

    if (this.inputState.run) {
      return "run";
    }

    if (inputX < 0 && Math.abs(inputX) > Math.abs(inputZ)) {
      return "left_strafe_walking";
    }

    if (inputX > 0 && Math.abs(inputX) > Math.abs(inputZ)) {
      return "right_strafe_walking";
    }

    return "walk";
  }

  isMostlyBackwardInput({ inputX, inputZ }) {
    return inputZ < -0.35 && Math.abs(inputZ) >= Math.abs(inputX);
  }

  getGroundMoveSpeed(movementInput) {
    const hasMovementInput = movementInput.inputX !== 0 || movementInput.inputZ !== 0;

    if (!hasMovementInput) {
      return 0;
    }

    let speed = WALK_SPEED;

    if (this.inputState.run && !this.isMostlyBackwardInput(movementInput)) {
      speed = RUN_SPEED;
    }

    if (this.playerState.carryTargetSocketId) {
      speed *= CARRY_SPEED_MULTIPLIER;
    }

    if (this.isSharedVigilWarningActive() && !this.playerState.isCollapsed) {
      speed *= VIGIL_WARNING_SLOW_MULTIPLIER;
    }

    if (this.playerState.vigilStage >= 2 && !this.playerState.isCollapsed) {
      speed *= VIGIL_SLOW_MULTIPLIER;
    }

    return speed;
  }

  updateGroundedMovement(movementInput, desiredMove, delta) {
    if (!this.localPlayer?.model) {
      return;
    }

    if (desiredMove.lengthSq() === 0) {
      return;
    }

    const moveSpeed = this.getGroundMoveSpeed(movementInput);
    const movement = desiredMove.clone().multiplyScalar(moveSpeed * delta);
    const nextPosition = this.localPlayer.model.position.clone().add(movement);
    const nextGroundY = this.getGroundHeightAt(nextPosition.x, nextPosition.z);

    this.playerState.baseY = nextGroundY;
    this.localPlayer.setPosition(nextPosition.x, nextGroundY, nextPosition.z);
  }

  updateAirborneMovement(delta) {
    if (!this.localPlayer?.model || this.jumpMomentum.lengthSq() === 0) {
      return;
    }

    const horizontalStep = this.jumpMomentum.clone().multiplyScalar(delta);
    const nextPosition = this.localPlayer.model.position.clone().add(horizontalStep);

    this.localPlayer.setPosition(
      nextPosition.x,
      this.localPlayer.model.position.y,
      nextPosition.z
    );

    const dampingAlpha = Math.min(1, delta * AIR_MOMENTUM_DAMPING);
    this.jumpMomentum.multiplyScalar(1 - dampingAlpha);
  }

  updatePlayerFacing(movementInput, desiredMove, delta) {
    if (!this.localPlayer?.model || desiredMove.lengthSq() === 0) {
      return;
    }

    const turnStrength = this.getTurnStrength(movementInput);

    if (turnStrength <= 0) {
      return;
    }

    const targetRotationY = this.getYawFromDirection(desiredMove);
    const lerpAlpha = Math.min(1, delta * TURN_LERP_SPEED * turnStrength);
    const nextRotationY = this.lerpAngle(
      this.localPlayer.model.rotation.y,
      targetRotationY,
      lerpAlpha
    );

    this.localPlayer.setRotationY(nextRotationY);
  }

  getTurnStrength(movementInput) {
    if (this.isMostlyBackwardInput(movementInput)) {
      return 0;
    }

    if (movementInput.inputZ < 0) {
      return 0.2;
    }

    return 1;
  }

  getYawFromDirection(direction) {
    return Math.atan2(-direction.x, -direction.z);
  }

  lerpAngle(start, end, alpha) {
    const shortestAngle = Math.atan2(Math.sin(end - start), Math.cos(end - start));
    return start + shortestAngle * alpha;
  }

  updateJumpArc() {
    if (!this.localPlayer?.model || !this.playerState.isJumping) {
      return;
    }

    const duration = Math.max(this.playerState.jumpDuration, 0.0001);
    const progress = THREE.MathUtils.clamp(this.playerState.jumpTime / duration, 0, 1);
    const jumpOffset = this.getJumpHeightForProgress(progress);

    this.localPlayer.setPosition(
      this.localPlayer.model.position.x,
      this.playerState.baseY + jumpOffset,
      this.localPlayer.model.position.z
    );
  }

  getJumpHeightForProgress(progress) {
    if (progress <= JUMP_TAKEOFF_THRESHOLD) {
      return 0;
    }

    if (progress >= JUMP_LANDING_THRESHOLD) {
      return 0;
    }

    const airborneProgress = THREE.MathUtils.inverseLerp(
      JUMP_TAKEOFF_THRESHOLD,
      JUMP_LANDING_THRESHOLD,
      progress
    );

    return 4 * JUMP_HEIGHT * airborneProgress * (1 - airborneProgress);
  }

  snapLocalPlayerToGround() {
    if (!this.localPlayer?.model) {
      return;
    }

    const groundY = this.getGroundHeightAt(
      this.localPlayer.model.position.x,
      this.localPlayer.model.position.z
    );

    this.playerState.baseY = groundY;
    this.localPlayer.setPosition(
      this.localPlayer.model.position.x,
      groundY,
      this.localPlayer.model.position.z
    );
  }

  syncPlayerAnimation() {
    if (!this.localPlayer) {
      return;
    }

    if (this.playerState.carriedBySocketId) {
      this.localPlayer.play("being_carried");
      return;
    }

    if (this.playerState.isCollapsed) {
      this.localPlayer.play("falling_dying");
      return;
    }

    if (this.playerState.carryTargetSocketId) {
      if (this.playerState.carryIntroTimeRemaining > 0 && this.sharedAnimations.pickup) {
        this.localPlayer.play("pickup");
        return;
      }

      let carryAnimation = "carry";

      if (this.playerState.movementActive) {
        carryAnimation = this.inputState.run && this.sharedAnimations.carry_run
          ? "carry_run"
          : "carry_walk";
      }

      this.localPlayer.play(carryAnimation);
      return;
    }

    if (this.playerState.isJumping) {
      return;
    }

    this.localPlayer.play(this.playerState.movementAnimation);
  }

  updateFollowCamera(delta) {
    if (!this.localPlayer?.model) {
      return;
    }

    this.playerPosition.copy(this.localPlayer.model.position);
    this.desiredCameraPosition
      .copy(FOLLOW_CAMERA_OFFSET)
      .applyAxisAngle(UP_AXIS, this.localPlayer.model.rotation.y)
      .add(this.playerPosition);
    this.desiredLookTarget.copy(this.playerPosition).add(FOLLOW_LOOK_OFFSET);

    const lerpAlpha = Math.min(1, delta * CAMERA_LERP_SPEED);

    this.followCameraPosition.lerp(this.desiredCameraPosition, lerpAlpha);
    this.followCameraTarget.lerp(this.desiredLookTarget, lerpAlpha);

    this.camera.position.copy(this.followCameraPosition);
    this.camera.lookAt(this.followCameraTarget);
  }

  logCameraBasis() {
    if (this.debugCameraBasisLogged) {
      return;
    }

    const desiredMove = this.getDesiredMoveDirection({ inputX: 0, inputZ: 1 });

    console.log("Camera-relative forward basis:", desiredMove.toArray());
    this.debugCameraBasisLogged = true;
  }

  handleResize() {
    const { clientWidth, clientHeight } = this.container;

    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    this.camera.lookAt(this.followCameraTarget);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    if (this.shouldUpdateGameplay()) {
      if (this.playerState.isJumping) {
        this.playerState.jumpTime = Math.min(
          this.playerState.jumpTime + delta,
          this.playerState.jumpDuration
        );
      }

      this.updateLocalPlayer(delta);
      this.updateDangerAudio(delta);
      this.updateAmbientStingers(this.clock.elapsedTime);
      this.updateVigilOrbs(this.clock.elapsedTime);
      this.updateRedOrbHazards(this.clock.elapsedTime, delta);
      this.updateHealEffect(delta);
      this.updateGuidanceBanner();
      this.updateVigilPresenceOverlay(delta);
      this.updateGameOverState();
      this.updateLevelCompleteState();
    } else {
      this.updateGuidanceBanner();
      this.updateVigilPresenceOverlay(delta);
      this.dangerAudioTargetVolume = 0;
      this.updateDangerAudio(delta);
      this.hideInteractionPrompt();
    }

    this.world?.userData?.update?.(this.clock.elapsedTime, {
      localPosition: this.localPlayer?.model ? this.localPlayer.getPosition() : null,
      warningActive: this.isSharedVigilWarningActive(),
      shrineState: this.shrineState
    });

    for (const player of this.playerEntities.values()) {
      player.update(delta);
    }

    if (this.localPlayer?.model) {
      this.updateFollowCamera(delta);
    }
    this.renderer.render(this.scene, this.camera);
  }

  startNetworkTick() {
    this.networkTickHandle = window.setInterval(() => {
      this.sendLocalPlayerState();
    }, NETWORK_TICK_MS);
  }

  sendLocalPlayerState() {
    if (!this.networkClient.isConnected() || !this.localPlayer || !this.localSocketId) {
      return;
    }

    const payload = this.buildLocalPlayerStatePayload();
    const serializedPayload = JSON.stringify(payload);

    if (serializedPayload === this.lastSentPlayerState) {
      return;
    }

    this.lastSentPlayerState = serializedPayload;
    this.networkClient.sendPlayerState(payload);

    if (payload.healTargetSocketId) {
      this.playerState.healTargetSocketId = null;
      this.lastSentPlayerState = "";
    }
  }

  getRoomCodeFromUrl() {
    const roomCode = new URLSearchParams(window.location.search).get("room");
    return roomCode ? roomCode.toUpperCase() : "";
  }

  setRoomCodeInUrl(roomCode) {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    window.history.replaceState({}, "", url);
  }

  getInviteLink(roomCode) {
    const inviteUrl = new URL(window.location.href);
    inviteUrl.searchParams.set("room", roomCode);
    return inviteUrl.toString();
  }

  getGroundHeightAt(x = 0, z = 0) {
    return PLAYER_GROUND_Y;
  }

  getAlignedPlayerPosition(position = {}) {
    const x = position.x ?? 0;
    const z = position.z ?? 0;
    const groundY = this.getGroundHeightAt(x, z);

    return {
      x,
      y: Math.max(position.y ?? groundY, groundY),
      z
    };
  }

  buildLocalPlayerStatePayload() {
    const position = this.localPlayer.getPosition();

    return {
      characterId: this.localCharacterId,
      position: {
        x: roundValue(position.x),
        y: roundValue(position.y),
        z: roundValue(position.z)
      },
      rotationY: roundValue(this.localPlayer.getRotationY()),
      animation: this.getLocalNetworkAnimationName(),
      isJumping: this.playerState.isJumping,
      vigilStage: this.playerState.vigilStage,
      isCollapsed: this.playerState.isCollapsed,
      carryTargetSocketId: this.playerState.carryTargetSocketId,
      carriedBySocketId: this.playerState.carriedBySocketId,
      healTargetSocketId: this.playerState.healTargetSocketId,
      activeDangerZoneId: this.playerState.dangerZoneId
    };
  }

  getLocalNetworkAnimationName() {
    if (this.playerState.carriedBySocketId) {
      return "being_carried";
    }

    if (this.playerState.isCollapsed) {
      return "falling_dying";
    }

    if (this.playerState.carryTargetSocketId) {
      return this.playerState.movementActive ? "carry_walk" : "carry";
    }

    if (this.playerState.isJumping) {
      return "jump";
    }

    return this.playerState.movementAnimation;
  }

  applyIncomingStateToLocalPlayer(playerState) {
    if (!playerState) {
      return;
    }

    const alignedPosition = this.getAlignedPlayerPosition(playerState.position);

    this.playerState.vigilStage = clampStage(playerState.vigilStage);
    this.playerState.dangerZoneId = playerState.activeDangerZoneId ?? null;
    this.playerState.dangerZoneTime = 0;
    this.playerState.isCollapsed = Boolean(playerState.isCollapsed);
    this.playerState.carryTargetSocketId = playerState.carryTargetSocketId ?? null;
    this.playerState.carriedBySocketId = playerState.carriedBySocketId ?? null;
    this.playerState.healTargetSocketId = playerState.healTargetSocketId ?? null;
    this.playerState.movementAnimation = playerState.animation ?? "idle";
    this.playerState.movementActive = this.playerState.movementAnimation !== "idle";
    this.playerState.isJumping = Boolean(playerState.isJumping);
    this.playerState.baseY = alignedPosition.y;

    this.localPlayer.setPosition(alignedPosition.x, alignedPosition.y, alignedPosition.z);
    this.localPlayer.setRotationY(playerState.rotationY ?? 0);
  }

  handleRunReset(payload = {}) {
    console.log("Run reset received.");
    this.portalReadyAnnounced = false;
    this.gameOverActive = false;
    this.clearGameplayInputState();
    this.clearLocalVigilPressure();
    this.resetRedOrbAggro();
    this.removeVigilOrb(this.localSocketId);

    for (const socketId of this.remotePlayers.keys()) {
      this.removeVigilOrb(socketId);
    }

    this.applyRoomMap(payload.mapId);

    if (payload.shrines) {
      this.applyShrineState(payload.shrines, { silent: true });
    }

    const players = Array.isArray(payload.players) ? payload.players : [];
    const localState = players.find((player) => player.socketId === this.localSocketId);

    if (localState && this.localPlayer) {
      this.applyIncomingStateToLocalPlayer(localState);
      this.playerState.jumpTime = 0;
      this.playerState.jumpDuration = this.sharedAnimations.jump?.duration ?? 0.9;
      this.jumpMomentum.set(0, 0, 0);
      this.localPlayer.play(localState.animation ?? "idle");
      this.syncPlayerAnimation();
      this.updateFollowCamera(1);
    }

    this.applyRoomState(players);
    this.hideInteractionPrompt();
    this.setShellState(GAME_SHELL_STATES.ingame);
    this.showStatusBanner("Run restarted.");
  }

  updateLevelCompleteState() {
    if (
      this.currentMapId !== "map1" ||
      this.levelCompleteActive ||
      this.getLitShrineCount() < SHRINE_IDS.length ||
      !this.localPlayer?.model
    ) {
      return;
    }

    if (!this.isPlayerInsidePortalArea(this.localPlayer.getPosition())) {
      return;
    }

    const bothPlayersAtPortal = [...this.remotePlayers.values()].some((remotePlayer) =>
      remotePlayer?.model && this.isPlayerInsidePortalArea(remotePlayer.getPosition())
    );

    if (!bothPlayersAtPortal) {
      return;
    }

    this.levelCompleteActive = true;
    this.clearGameplayInputState();
    this.startEndingSequence();
  }

  startEndingSequence() {
    this.showStatusBanner("The night yields to morning.");
    this.setShellState(GAME_SHELL_STATES.complete);
  }

  isPlayerInsidePortalArea(position) {
    return (
      Math.hypot(
        position.x - this.portalArea.position.x,
        position.z - this.portalArea.position.z
      ) <= this.portalArea.radius
    );
  }

  syncCarryRelationFromRemoteState(playerState) {
    if (!playerState?.socketId) {
      return;
    }

    if (playerState.healTargetSocketId === this.localSocketId) {
      this.healLocalPlayer();
      return;
    }

    if (
      playerState.carryTargetSocketId === this.localSocketId &&
      this.playerState.carriedBySocketId !== playerState.socketId
    ) {
      this.playerState.carriedBySocketId = playerState.socketId;
      this.playerState.isCollapsed = true;
    } else if (
      playerState.carryTargetSocketId !== this.localSocketId &&
      this.playerState.carriedBySocketId === playerState.socketId
    ) {
      this.playerState.carriedBySocketId = null;
    }

    if (
      this.playerState.carryTargetSocketId === playerState.socketId &&
      !playerState.isCollapsed
    ) {
      this.playerState.carryTargetSocketId = null;
    }
  }

  applyRemoteCarryPresentation(entity, playerState) {
    if (!entity?.model || !playerState) {
      return;
    }

    const carriedByLocal = this.playerState.carryTargetSocketId === playerState.socketId;

    if (carriedByLocal && this.localPlayer?.model) {
      const carryPosition = this.getCarriedWorldPosition(
        this.localPlayer.getPosition(),
        this.localPlayer.getRotationY()
      );
      entity.setPosition(carryPosition.x, carryPosition.y, carryPosition.z);
      entity.setRotationY(this.localPlayer.getRotationY());
      entity.play("being_carried");
      console.log("being_carried state entered");
      return;
    }

    if (playerState.carriedBySocketId) {
      entity.play("being_carried");
      return;
    }

    if (playerState.isCollapsed) {
      entity.play("falling_dying");
    }
  }

  getDangerZoneAtPosition(position) {
    if (!position) {
      return null;
    }

    if (this.isInsideRoadSafeCorridor(position)) {
      return null;
    }

    for (const zone of DANGER_ZONES) {
      const distance = Math.hypot(position.x - zone.center.x, position.z - zone.center.z);

      if (distance <= zone.radius) {
        return zone;
      }
    }

    return null;
  }

  getNearestPartnerDistanceTo(position) {
    let nearestDistance = null;

    for (const [socketId, remotePlayer] of this.remotePlayers.entries()) {
      if (!remotePlayer?.model) {
        continue;
      }

      const remoteState = this.remotePlayerStates.get(socketId);

      if (remoteState?.isCollapsed) {
        continue;
      }

      const distance = Math.hypot(
        remotePlayer.model.position.x - position.x,
        remotePlayer.model.position.z - position.z
      );

      nearestDistance = nearestDistance === null ? distance : Math.min(nearestDistance, distance);
    }

    return nearestDistance;
  }

  hasRemoteCollapsedVictim() {
    for (const remoteState of this.remotePlayerStates.values()) {
      if (remoteState?.isCollapsed) {
        return true;
      }
    }

    return false;
  }

  isRescueImmunityActive() {
    return Boolean(
      !this.playerState.isCollapsed &&
      (this.hasRemoteCollapsedVictim() || this.playerState.carryTargetSocketId || this.playerState.healTargetSocketId)
    );
  }

  hasAnyCollapsedPlayers() {
    return this.playerState.isCollapsed || this.hasRemoteCollapsedVictim();
  }

  isInsideRoadSafeCorridor(position) {
    if (!position) {
      return false;
    }

    return Boolean(this.world?.userData?.isInsideSafeCorridor?.(position.x, position.z));
  }

  clearLocalVigilPressure() {
    if (
      this.playerState.vigilStage === 0 &&
      !this.playerState.dangerZoneId &&
      this.playerState.dangerZoneTime === 0
    ) {
      return;
    }

    this.playerState.vigilStage = 0;
    this.playerState.dangerZoneId = null;
    this.playerState.dangerZoneTime = 0;
    this.playerState.lastDangerZoneId = null;
    this.removeVigilOrb(this.localSocketId);
    this.sharedVigilWarningActive = false;
    this.sharedVigilVictimSocketId = null;
  }

  updateRescueImmunityState(isActive) {
    if (this.rescueImmunityActive === isActive) {
      return;
    }

    this.rescueImmunityActive = isActive;
    console.log(isActive ? "Rescue immunity active" : "Rescue immunity cleared");
  }

  updateVigilState(delta) {
    if (!this.localPlayer?.model) {
      return;
    }

    if (this.playerState.isCollapsed) {
      this.updateRescueImmunityState(false);
      this.playerState.vigilStage = 3;
      this.sharedVigilWarningActive = false;
      return;
    }

    const rescueImmunityActive = this.isRescueImmunityActive();
    this.updateRescueImmunityState(rescueImmunityActive);

    if (rescueImmunityActive) {
      this.clearLocalVigilPressure();
      return;
    }

    if (this.playerState.carriedBySocketId || this.playerState.carryTargetSocketId) {
      return;
    }

    const separationState = this.getSharedSeparationWarningState();

    if (!separationState.active) {
      if (this.playerState.vigilStage > 0 || this.playerState.dangerZoneId) {
        this.clearLocalVigilPressure();
      }
      return;
    }

    if (this.playerState.dangerZoneId !== separationState.zoneId) {
      this.playerState.dangerZoneId = separationState.zoneId;
      this.playerState.dangerZoneTime = 0;
      this.playerState.vigilStage = 0;
      this.playerState.lastDangerZoneId = separationState.zoneId;
      console.log("Entered danger zone:", separationState.zoneId);
    } else {
      this.playerState.dangerZoneTime += delta;
    }

    this.sharedVigilWarningActive = true;
    this.sharedVigilVictimSocketId = separationState.victimSocketId;

    const nextStage = this.getVigilStageForTime(this.playerState.dangerZoneTime);
    const stageBeforeUpdate = this.playerState.vigilStage;

    if (nextStage > stageBeforeUpdate) {
      this.handleVigilStageTransition(nextStage, separationState.zoneId, separationState.distanceMeters);
      return;
    }

    if (nextStage < stageBeforeUpdate) {
      this.playerState.vigilStage = nextStage;

      if (nextStage < 2) {
        this.removeVigilOrb(this.localSocketId);
      }
    }
  }

  getSharedSeparationWarningState() {
    if (!this.localPlayer?.model || this.remotePlayers.size === 0) {
      return {
        active: false,
        zoneId: null,
        distanceMeters: 0,
        victimSocketId: null
      };
    }

    const localPosition = this.localPlayer.getPosition();
    const localZone = this.getDangerZoneAtPosition(localPosition);
    let closestPartner = null;

    for (const [socketId, remotePlayer] of this.remotePlayers.entries()) {
      if (!remotePlayer?.model) {
        continue;
      }

      const remoteState = this.remotePlayerStates.get(socketId);
      if (!remoteState) {
        continue;
      }

      const remotePosition = remotePlayer.getPosition();
      const distanceMeters = Math.hypot(
        remotePosition.x - localPosition.x,
        remotePosition.z - localPosition.z
      );

      if (!closestPartner || distanceMeters < closestPartner.distanceMeters) {
        closestPartner = {
          socketId,
          state: remoteState,
          position: remotePosition,
          distanceMeters
        };
      }
    }

    if (!closestPartner) {
      return {
        active: false,
        zoneId: null,
        distanceMeters: 0,
        victimSocketId: null
      };
    }

    const partnerZone =
      this.getDangerZoneAtPosition(closestPartner.position) ??
      (closestPartner.state.activeDangerZoneId
        ? DANGER_ZONES.find((zone) => zone.id === closestPartner.state.activeDangerZoneId) ?? null
        : null);
    const warningZone = localZone ?? partnerZone;
    const separated = closestPartner.distanceMeters >= FOREST_PARTNER_SAFE_DISTANCE;

    if (!warningZone || !separated) {
      return {
        active: false,
        zoneId: null,
        distanceMeters: closestPartner.distanceMeters,
        victimSocketId: null
      };
    }

    return {
      active: true,
      zoneId: warningZone.id,
      distanceMeters: closestPartner.distanceMeters,
      victimSocketId: this.chooseSharedVigilVictim(localPosition, localZone, closestPartner.position, partnerZone, closestPartner.socketId)
    };
  }

  chooseSharedVigilVictim(localPosition, localZone, remotePosition, remoteZone, remoteSocketId) {
    if (localZone && !remoteZone) {
      return this.localSocketId;
    }

    if (remoteZone && !localZone) {
      return remoteSocketId;
    }

    const localChurchDistance = Math.hypot(
      localPosition.x - churchHealCenter.x,
      localPosition.z - churchHealCenter.z
    );
    const remoteChurchDistance = Math.hypot(
      remotePosition.x - churchHealCenter.x,
      remotePosition.z - churchHealCenter.z
    );

    if (Math.abs(localChurchDistance - remoteChurchDistance) > 0.25) {
      return localChurchDistance > remoteChurchDistance ? this.localSocketId : remoteSocketId;
    }

    const localKey = `${this.localCharacterId ?? ""}:${this.localSocketId ?? ""}`;
    const remoteCharacterId = this.remotePlayerStates.get(remoteSocketId)?.characterId ?? "";
    const remoteKey = `${remoteCharacterId}:${remoteSocketId}`;
    return localKey <= remoteKey ? this.localSocketId : remoteSocketId;
  }

  getVigilStageForTime(timeInZone) {
    if (timeInZone >= VIGIL_COLLAPSE_DELAY) {
      return 3;
    }

    if (timeInZone >= VIGIL_STAGE_2_DELAY) {
      return 2;
    }

    if (timeInZone >= VIGIL_STAGE_1_DELAY) {
      return 1;
    }

    return 0;
  }

  handleVigilStageTransition(nextStage, zoneId, distanceMeters = null) {
    if (nextStage === 1) {
      this.playerState.vigilStage = 1;
      console.log("Warning triggered at distance:", distanceMeters ?? "solo", zoneId);
      return;
    }

    if (nextStage === 2) {
      this.playerState.vigilStage = 2;
      console.log("Vigil stage 2:", zoneId);
      return;
    }

    if (nextStage >= 3) {
      if (this.sharedVigilVictimSocketId === this.localSocketId) {
        this.collapseLocalPlayer(zoneId);
      } else {
        this.playerState.vigilStage = 2;
      }
    }
  }

  collapseLocalPlayer(zoneId) {
    if (this.hasRemoteCollapsedVictim()) {
      this.clearLocalVigilPressure();
      this.updateRescueImmunityState(true);
      return;
    }

    this.playerState.vigilStage = 3;
    this.playerState.isCollapsed = true;
    this.playerState.isJumping = false;
    this.playerState.jumpTime = 0;
    this.playerState.carryTargetSocketId = null;
    this.playerState.carryIntroTimeRemaining = 0;
    this.playerState.dangerZoneId = zoneId;
    this.playerState.movementActive = false;
    this.playerState.movementAnimation = "idle";
    this.sharedVigilWarningActive = false;
    this.sharedVigilVictimSocketId = null;
    this.jumpMomentum.set(0, 0, 0);
    this.snapLocalPlayerToGround();
    this.localPlayer.play("falling_dying");
    console.log("Collapse:", zoneId);
  }

  tryStartCarry() {
    if (
      !this.localPlayer?.model ||
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId
    ) {
      return;
    }

    const carryCandidate = this.getNearbyCarryCandidate();

    if (!carryCandidate) {
      return;
    }

    this.playerState.carryTargetSocketId = carryCandidate.socketId;
    this.playerState.carryIntroTimeRemaining = Math.min(
      this.sharedAnimations.pickup?.duration ?? CARRY_PICKUP_LOCK_SECONDS,
      CARRY_PICKUP_LOCK_SECONDS
    );
    console.log("Carry animation state entered:", carryCandidate.socketId);
    this.removeVigilOrb(carryCandidate.socketId);
    this.syncPlayerAnimation();
  }

  handleEscapeKey() {
    if (!this.gameStarted) {
      return;
    }

    if (this.shellState === GAME_SHELL_STATES.ingame) {
      this.clearGameplayInputState();
      this.setShellState(GAME_SHELL_STATES.paused);
      return;
    }

    if (this.shellState === GAME_SHELL_STATES.paused) {
      this.setShellState(GAME_SHELL_STATES.ingame);
    }
  }

  shouldUpdateGameplay() {
    return this.shellState === GAME_SHELL_STATES.ingame;
  }

  isGameplayInputBlocked() {
    return this.shellState !== GAME_SHELL_STATES.ingame;
  }

  startGameSession() {
    if (this.gameStarted) {
      this.setShellState(GAME_SHELL_STATES.ingame);
      return;
    }

    this.gameStarted = true;
    this.startNetworkTick();
    this.setShellState(GAME_SHELL_STATES.ingame);
    this.initialize();
  }

  clearGameplayInputState() {
    if (
      !this.inputState.forward &&
      !this.inputState.backward &&
      !this.inputState.left &&
      !this.inputState.right &&
      !this.inputState.run
    ) {
      return;
    }

    this.inputState.forward = false;
    this.inputState.backward = false;
    this.inputState.left = false;
    this.inputState.right = false;
    this.inputState.run = false;
    this.syncPlayerAnimation();
  }

  getNearbyCarryCandidate() {
    if (!this.localPlayer?.model) {
      return null;
    }

    const localPosition = this.localPlayer.getPosition();
    let closestCandidate = null;
    let closestDistance = Infinity;

    for (const [socketId, remotePlayer] of this.remotePlayers.entries()) {
      const remoteState = this.remotePlayerStates.get(socketId);

      if (!remoteState?.isCollapsed || !remotePlayer?.model) {
        continue;
      }

      const distance = Math.hypot(
        remotePlayer.model.position.x - localPosition.x,
        remotePlayer.model.position.z - localPosition.z
      );

      if (distance > CARRY_INTERACT_DISTANCE || distance >= closestDistance) {
        continue;
      }

      closestCandidate = {
        socketId,
        state: remoteState,
        player: remotePlayer,
        distance
      };
      closestDistance = distance;
    }

    return closestCandidate;
  }

  updateLocalCarryState() {
    if (!this.playerState.carryTargetSocketId || !this.localPlayer?.model) {
      return;
    }

    const remotePlayer = this.remotePlayers.get(this.playerState.carryTargetSocketId);
    const remoteState = this.remotePlayerStates.get(this.playerState.carryTargetSocketId);

    if (!remotePlayer?.model || !remoteState?.isCollapsed) {
      this.playerState.carryTargetSocketId = null;
      return;
    }

    const carryPosition = this.getCarriedWorldPosition(
      this.localPlayer.getPosition(),
      this.localPlayer.getRotationY()
    );
    remotePlayer.setPosition(carryPosition.x, carryPosition.y, carryPosition.z);
    remotePlayer.setRotationY(this.localPlayer.getRotationY());
    remotePlayer.play("being_carried");
  }

  updateCarriedLocalPlayer() {
    const carrier = this.remotePlayers.get(this.playerState.carriedBySocketId);

    if (!carrier?.model || !this.localPlayer?.model) {
      return;
    }

    const carryPosition = this.getCarriedWorldPosition(
      carrier.getPosition(),
      carrier.getRotationY()
    );

    this.localPlayer.setPosition(carryPosition.x, carryPosition.y, carryPosition.z);
    this.localPlayer.setRotationY(carrier.getRotationY());
  }

  getCarriedWorldPosition(carrierPosition, carrierRotationY) {
    const offset = CARRIED_PLAYER_OFFSET.clone().applyAxisAngle(UP_AXIS, carrierRotationY);
    return {
      x: carrierPosition.x + offset.x,
      y: carrierPosition.y + offset.y,
      z: carrierPosition.z + offset.z
    };
  }

  isInsideChurchSafeArea(position) {
    return (
      Math.hypot(position.x - CHURCH_SAFE_CENTER.x, position.z - CHURCH_SAFE_CENTER.z) <=
      CHURCH_SAFE_RADIUS
    );
  }

  canTriggerChurchHeal() {
    if (!this.playerState.carryTargetSocketId || !this.localPlayer?.model) {
      return false;
    }

    return this.isInsideChurchHealInteractArea(this.localPlayer.getPosition());
  }

  isInsideChurchHealInteractArea(position) {
    return (
      Math.hypot(position.x - churchHealCenter.x, position.z - churchHealCenter.z) <=
      churchHealInteractRadius
    );
  }

  requestChurchHeal() {
    if (!this.canTriggerChurchHeal()) {
      return;
    }

    const targetSocketId = this.playerState.carryTargetSocketId;
    this.playerState.healTargetSocketId = targetSocketId;
    this.playerState.carryTargetSocketId = null;
    this.playerState.carryIntroTimeRemaining = 0;
    this.removeVigilOrb(targetSocketId);
    this.resetRedOrbAggro();
    this.triggerChurchHealEffect(churchHealCenter);
    this.hideInteractionPrompt();

    const carriedPlayer = this.remotePlayers.get(targetSocketId);
    if (carriedPlayer) {
      carriedPlayer.setPosition(
        churchHealRecoveryPosition.x,
        churchHealRecoveryPosition.y,
        churchHealRecoveryPosition.z
      );
      carriedPlayer.setRotationY(churchHealFacingY);
      carriedPlayer.play("idle");
    }

    console.log("Heal zone entered");
    console.log("Church heal:", targetSocketId);
  }

  healLocalPlayer() {
    const wasCollapsed = this.playerState.isCollapsed || this.playerState.carriedBySocketId;

    this.playerState.vigilStage = 0;
    this.playerState.dangerZoneId = null;
    this.playerState.dangerZoneTime = 0;
    this.playerState.isCollapsed = false;
    this.playerState.carryTargetSocketId = null;
    this.playerState.carriedBySocketId = null;
    this.playerState.healTargetSocketId = null;
    this.playerState.carryIntroTimeRemaining = 0;
    this.playerState.lastDangerZoneId = null;
    this.playerState.isJumping = false;
    this.sharedVigilWarningActive = false;
    this.sharedVigilVictimSocketId = null;
    this.jumpMomentum.set(0, 0, 0);
    this.removeVigilOrb(this.localSocketId);
    this.resetRedOrbAggro();
    this.localPlayer.setPosition(
      churchHealRecoveryPosition.x,
      churchHealRecoveryPosition.y,
      churchHealRecoveryPosition.z
    );
    this.localPlayer.setRotationY(churchHealFacingY);
    this.playerState.baseY = churchHealRecoveryPosition.y;
    this.triggerChurchHealEffect(churchHealRecoveryPosition);

    this.syncPlayerAnimation();
    console.log("Revived position set:", churchHealRecoveryPosition.toArray());

    if (wasCollapsed) {
      console.log("Church heal");
    }
  }

  initializeShrineOrbHazards() {
    this.redOrbHazards = this.shrineOrbAnchors.map((anchor, index) => ({
      id: anchor.id,
      home: new THREE.Vector3(anchor.home.x, anchor.home.y, anchor.home.z),
      position: new THREE.Vector3(anchor.home.x, anchor.home.y, anchor.home.z),
      bobSeed: index * 0.91 + 0.37,
      driftSeed: index * 1.27 + 0.41,
      isChasing: false,
      hasLoggedChase: false
    }));
  }

  applyShrineState(nextState = {}, { silent = false } = {}) {
    const previousState = this.shrineState;
    const normalizedState = Object.fromEntries(
      SHRINE_IDS.map((shrineId) => [
        shrineId,
        {
          lit: Boolean(nextState?.[shrineId]?.lit),
          litBySocketId: nextState?.[shrineId]?.litBySocketId ?? null,
          litAt: nextState?.[shrineId]?.litAt ?? null
        }
      ])
    );

    this.shrineState = normalizedState;
    this.world?.userData?.shrines?.setState?.(normalizedState);
    this.updateShrineProgressHud();

    if (this.getLitShrineCount() < SHRINE_IDS.length) {
      this.portalReadyAnnounced = false;
      this.levelCompleteActive = false;
    }

    for (const hook of this.shrineHooks) {
      if (!previousState?.[hook.id]?.lit && normalizedState[hook.id]?.lit) {
        this.removeRedOrbHazard(hook.id);
      }
    }

    if (
      this.currentMapId === "map1" &&
      !this.portalReadyAnnounced &&
      this.getLitShrineCount() >= SHRINE_IDS.length
    ) {
      this.portalReadyAnnounced = true;
      this.showStatusBanner("The portal has opened at the lake road.");
    }

    if (!silent) {
      console.log(
        "Shrines lit:",
        Object.values(normalizedState).filter((shrine) => shrine.lit).length,
        "/",
        SHRINE_IDS.length
      );
    }
  }

  updateActiveShrineHook() {
    if (
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId ||
      this.playerState.healTargetSocketId ||
      !this.localPlayer?.model
    ) {
      this.activeShrineHook = null;
      return;
    }

    const position = this.localPlayer.getPosition();
    let closestHook = null;
    let closestDistance = Infinity;

    for (const hook of this.shrineHooks) {
      if (this.shrineState[hook.id]?.lit) {
        continue;
      }

      const distance = Math.hypot(position.x - hook.position.x, position.z - hook.position.z);
      if (distance <= hook.radius && distance < closestDistance) {
        closestHook = hook;
        closestDistance = distance;
      }
    }

    this.activeShrineHook = closestHook;
  }

  canTriggerShrineInteraction() {
    return Boolean(
      this.activeShrineHook &&
      !this.shrineState[this.activeShrineHook.id]?.lit &&
      !this.playerState.isCollapsed &&
      !this.playerState.carriedBySocketId &&
      !this.playerState.carryTargetSocketId &&
      !this.playerState.healTargetSocketId
    );
  }

  triggerShrineInteraction() {
    if (!this.canTriggerShrineInteraction()) {
      return;
    }

    console.log("Shrine lit:", this.activeShrineHook.id);
    this.networkClient.sendLightShrine(this.activeShrineHook.id);
  }

  getLitShrineCount() {
    return Object.values(this.shrineState).filter((shrine) => shrine?.lit).length;
  }

  shouldShowPortalPrompt() {
    if (
      this.currentMapId !== "map1" ||
      this.getLitShrineCount() < SHRINE_IDS.length ||
      this.levelCompleteActive ||
      !this.localPlayer?.model
    ) {
      return false;
    }

    const localPosition = this.localPlayer.getPosition();
    return (
      Math.hypot(
        localPosition.x - this.portalArea.position.x,
        localPosition.z - this.portalArea.position.z
      ) <= this.portalArea.radius + 3
    );
  }

  isSharedVigilWarningActive() {
    if (this.playerState.vigilStage >= 1 && !this.playerState.isCollapsed) {
      return true;
    }

    for (const remoteState of this.remotePlayerStates.values()) {
      if (clampStage(remoteState?.vigilStage) >= 1 && !remoteState?.isCollapsed) {
        return true;
      }
    }

    return false;
  }

  updateGameOverState() {
    const nextGameOverState = this.playerState.isCollapsed && this.hasRemoteCollapsedVictim();

    if (nextGameOverState === this.gameOverActive) {
      return;
    }

    this.gameOverActive = nextGameOverState;

    if (this.gameOverActive) {
      console.log("Game over: both players fainted.");
      this.clearGameplayInputState();
      this.setShellState(GAME_SHELL_STATES.gameover, {
        title: "Game Over",
        message: "Both of you were taken by the Vigil."
      });
      return;
    }

    if (this.shellState === GAME_SHELL_STATES.gameover) {
      this.setShellState(GAME_SHELL_STATES.ingame);
    }
  }
  applyChurchRitualState(nextState = {}, { silent = false } = {}) {
    const normalizedState = {
      progress: Array.isArray(nextState?.progress) ? nextState.progress.filter((id) => CHURCH_RITUAL_SEQUENCE.includes(id)) : [],
      solved: Boolean(nextState?.solved),
      graveyardUnlocked: Boolean(nextState?.graveyardUnlocked),
      lastEventType: nextState?.lastEventType ?? null,
      lastElementId: nextState?.lastElementId ?? null,
      lastEventNonce: Number.isFinite(nextState?.lastEventNonce) ? nextState.lastEventNonce : 0
    };

    this.churchRitualState = normalizedState;
    this.graveyardPhaseUnlocked = normalizedState.graveyardUnlocked || this.graveyardOfferingState.unlocked;
    this.world?.userData?.churchRitual?.setState?.(normalizedState);

    if (!silent && normalizedState.lastEventNonce > 0 && normalizedState.lastEventNonce !== this.lastChurchRitualEventNonce) {
      this.handleChurchRitualEvent(normalizedState);
    }

    this.lastChurchRitualEventNonce = normalizedState.lastEventNonce;
  }

  handleChurchRitualEvent(churchRitualState) {
    if (churchRitualState.lastEventType === "advance") {
      console.log("Church ritual step entered:", churchRitualState.lastElementId);
      return;
    }

    if (churchRitualState.lastEventType === "reset") {
      console.log("Church ritual reset:", churchRitualState.lastElementId);
      return;
    }

    if (churchRitualState.lastEventType === "success") {
      const ritualCenter = this.getChurchRitualCenter();
      this.triggerChurchHealEffect(ritualCenter);
      this.playChurchBellSound();
      console.log("Church ritual success:", churchRitualState.lastElementId);

      if (churchRitualState.graveyardUnlocked) {
        console.log("Graveyard phase unlocked.");
      }
    }
  }

  getChurchRitualCenter() {
    const center = this.world?.userData?.churchRitual?.center;

    if (!center) {
      return CHURCH_SAFE_CENTER.clone();
    }

    return new THREE.Vector3(center.x, center.y, center.z);
  }

  playChurchBellSound() {
    const context = this.audioListener?.context;

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const strikeOffsets = [0, 0.82];
    const partials = [
      { frequency: 294, gain: 0.2, type: "triangle" },
      { frequency: 438, gain: 0.1, type: "sine" },
      { frequency: 588, gain: 0.07, type: "sine" },
      { frequency: 882, gain: 0.035, type: "sine" }
    ];
    const now = context.currentTime + 0.02;

    strikeOffsets.forEach((offset, strikeIndex) => {
      const strikeTime = now + offset;
      const strikeGain = context.createGain();
      strikeGain.gain.setValueAtTime(0.0001, strikeTime);
      strikeGain.gain.exponentialRampToValueAtTime(strikeIndex === 0 ? 0.32 : 0.2, strikeTime + 0.02);
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 3.4);
      strikeGain.connect(context.destination);

      partials.forEach((partial) => {
        const oscillator = context.createOscillator();
        const partialGain = context.createGain();
        oscillator.type = partial.type;
        oscillator.frequency.setValueAtTime(partial.frequency, strikeTime);
        partialGain.gain.setValueAtTime(partial.gain, strikeTime);
        partialGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 3.6);
        oscillator.connect(partialGain);
        partialGain.connect(strikeGain);
        oscillator.start(strikeTime);
        oscillator.stop(strikeTime + 3.8);
      });
    });

    console.log("Church bell rung.");
  }

  updateActiveChurchRitualElement() {
    if (
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId ||
      this.playerState.healTargetSocketId ||
      this.churchRitualState.solved ||
      !this.localPlayer?.model
    ) {
      this.activeChurchRitualElement = null;
      return;
    }

    const position = this.localPlayer.getPosition();
    let closestHook = null;
    let closestDistance = Infinity;

    for (const hook of this.churchRitualHooks) {
      const distance = Math.hypot(position.x - hook.position.x, position.z - hook.position.z);

      if (distance <= hook.radius && distance < closestDistance) {
        closestHook = hook;
        closestDistance = distance;
      }
    }

    this.activeChurchRitualElement = closestHook;
  }

  canTriggerChurchRitualInteraction() {
    return Boolean(this.activeChurchRitualElement) &&
      !this.churchRitualState.solved &&
      !this.playerState.isCollapsed &&
      !this.playerState.carriedBySocketId &&
      !this.playerState.carryTargetSocketId &&
      !this.playerState.healTargetSocketId &&
      Boolean(this.localPlayer?.model);
  }

  triggerChurchRitualInteraction() {
    if (!this.canTriggerChurchRitualInteraction()) {
      return;
    }

    console.log("Church ritual interaction:", this.activeChurchRitualElement.id);
    this.networkClient.sendChurchRitualAction(this.activeChurchRitualElement.id);
  }
  applyGraveyardOfferingState(nextState = {}, { silent = false } = {}) {
    const fallback = createDefaultGraveyardOfferingState();
    const normalizedState = {
      unlocked: Boolean(nextState?.unlocked),
      revealed: Boolean(nextState?.revealed),
      items: {
        mourning_ribbon: { ...fallback.items.mourning_ribbon, ...(nextState?.items?.mourning_ribbon ?? {}) },
        brass_token: { ...fallback.items.brass_token, ...(nextState?.items?.brass_token ?? {}) },
        lake_icon: { ...fallback.items.lake_icon, ...(nextState?.items?.lake_icon ?? {}) }
      },
      graves: {
        thread_grave: { ...fallback.graves.thread_grave, ...(nextState?.graves?.thread_grave ?? {}) },
        bell_grave: { ...fallback.graves.bell_grave, ...(nextState?.graves?.bell_grave ?? {}) },
        lake_grave: { ...fallback.graves.lake_grave, ...(nextState?.graves?.lake_grave ?? {}) }
      },
      lastEventType: nextState?.lastEventType ?? null,
      lastItemId: nextState?.lastItemId ?? null,
      lastGraveId: nextState?.lastGraveId ?? null,
      lastEventNonce: Number.isFinite(nextState?.lastEventNonce) ? nextState.lastEventNonce : 0
    };

    this.graveyardOfferingState = normalizedState;
    this.graveyardPhaseUnlocked = this.churchRitualState.graveyardUnlocked || normalizedState.unlocked;
    this.world?.userData?.graveyardOffering?.setState?.(normalizedState);

    if (!silent && normalizedState.lastEventNonce > 0 && normalizedState.lastEventNonce !== this.lastGraveyardOfferingEventNonce) {
      this.handleGraveyardOfferingEvent(normalizedState);
    }

    this.lastGraveyardOfferingEventNonce = normalizedState.lastEventNonce;
  }

  handleGraveyardOfferingEvent(graveyardOfferingState) {
    if (graveyardOfferingState.lastEventType === "unlock") {
      console.log("Graveyard offering phase active.");
      const reward = this.world?.userData?.graveyardOffering?.reward;
      if (reward) {
        this.triggerChurchHealEffect(new THREE.Vector3(reward.position.x, reward.position.y, reward.position.z));
      }
      return;
    }

    if (graveyardOfferingState.lastEventType === "pickup") {
      console.log("Offering picked up:", this.getOfferingLabel(graveyardOfferingState.lastItemId));
      return;
    }

    if (graveyardOfferingState.lastEventType === "wrong") {
      console.log("Offering rejected:", graveyardOfferingState.lastItemId, graveyardOfferingState.lastGraveId);
      return;
    }

    if (graveyardOfferingState.lastEventType === "place") {
      console.log("Grave completed:", graveyardOfferingState.lastGraveId);
      return;
    }

    if (graveyardOfferingState.lastEventType === "reveal") {
      const reward = this.world?.userData?.graveyardOffering?.reward;
      if (reward) {
        const rewardPosition = new THREE.Vector3(reward.position.x, reward.position.y, reward.position.z);
        this.triggerChurchHealEffect(rewardPosition);
      }
      this.showClueCard({
        title: "Graveyard Reveal",
        fragment: "A mirror shard rises over the oldest grave.",
        detail: "The offerings settle into the earth, and a pale shard answers with its own light. Something buried here remembers you."
      });
      console.log("graveyard complete");
      console.log("Graveyard reveal triggered.");
    }
  }

  getOfferingLabel(itemId) {
    return this.graveyardOfferingItemHooks.find((hook) => hook.id === itemId)?.label ?? itemId ?? "offering";
  }

  getLocalHeldOfferingItemId() {
    if (!this.localSocketId) {
      return null;
    }

    return Object.entries(this.graveyardOfferingState.items)
      .find(([, itemState]) => itemState.holderSocketId === this.localSocketId)?.[0] ?? null;
  }

  updateActiveGraveyardOfferingTarget() {
    if (
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId ||
      this.playerState.healTargetSocketId ||
      !this.graveyardOfferingState.unlocked ||
      !this.localPlayer?.model
    ) {
      this.activeGraveyardOfferingTarget = null;
      return;
    }

    const position = this.localPlayer.getPosition();
    const heldItemId = this.getLocalHeldOfferingItemId();
    let closestTarget = null;
    let closestDistance = Infinity;

    if (heldItemId) {
      for (const hook of this.graveyardOfferingGraveHooks) {
        const graveState = this.graveyardOfferingState.graves[hook.id];

        if (graveState?.complete) {
          continue;
        }

        const distance = Math.hypot(position.x - hook.position.x, position.z - hook.position.z);

        if (distance <= hook.radius && distance < closestDistance) {
          closestTarget = { type: "grave", ...hook };
          closestDistance = distance;
        }
      }
    } else {
      for (const hook of this.graveyardOfferingItemHooks) {
        const itemState = this.graveyardOfferingState.items[hook.id];
        const available = !itemState?.holderSocketId && !itemState?.placedAtGraveId;

        if (!available) {
          continue;
        }

        const distance = Math.hypot(position.x - hook.position.x, position.z - hook.position.z);

        if (distance <= hook.radius && distance < closestDistance) {
          closestTarget = { type: "item", ...hook };
          closestDistance = distance;
        }
      }
    }

    this.activeGraveyardOfferingTarget = closestTarget;
  }

  canTriggerGraveyardOfferingInteraction() {
    return Boolean(this.activeGraveyardOfferingTarget) && this.graveyardOfferingState.unlocked;
  }

  triggerGraveyardOfferingInteraction() {
    if (!this.canTriggerGraveyardOfferingInteraction()) {
      return;
    }

    if (this.activeGraveyardOfferingTarget.type === "item") {
      console.log("Offering interaction: pickup", this.activeGraveyardOfferingTarget.id);
      this.networkClient.sendGraveyardOfferingAction("pickup", {
        itemId: this.activeGraveyardOfferingTarget.id
      });
      return;
    }

    const heldItemId = this.getLocalHeldOfferingItemId();
    console.log("Offering interaction: place", heldItemId, this.activeGraveyardOfferingTarget.id);
    this.networkClient.sendGraveyardOfferingAction("place", {
      graveId: this.activeGraveyardOfferingTarget.id
    });
  }

  applyLakeFinaleState(nextState = {}, { silent = false } = {}) {
    const normalizedState = {
      unlocked: Boolean(nextState?.unlocked),
      rewardHolderSocketId: nextState?.rewardHolderSocketId ?? null,
      rewardCollected: Boolean(nextState?.rewardCollected),
      completed: Boolean(nextState?.completed),
      lastEventType: nextState?.lastEventType ?? null,
      lastEventNonce: Number.isFinite(nextState?.lastEventNonce) ? nextState.lastEventNonce : 0
    };

    this.lakeFinaleState = normalizedState;
    this.world?.userData?.lakeFinale?.setState?.(normalizedState);

    if (!silent && normalizedState.lastEventNonce > 0 && normalizedState.lastEventNonce !== this.lastLakeFinaleEventNonce) {
      this.handleLakeFinaleEvent(normalizedState);
    }

    this.lastLakeFinaleEventNonce = normalizedState.lastEventNonce;
  }

  handleLakeFinaleEvent(lakeFinaleState) {
    if (lakeFinaleState.lastEventType === "unlock") {
      console.log("reward interactable enabled");
      console.log("Lake finale unlocked.");
      return;
    }

    if (lakeFinaleState.lastEventType === "pickup_reward") {
      const rewardPosition = this.world?.userData?.lakeFinale?.rewardPickupPosition ?? this.world?.userData?.lakeFinale?.rewardPosition;
      if (rewardPosition) {
        this.triggerChurchHealEffect(new THREE.Vector3(rewardPosition.x, rewardPosition.y, rewardPosition.z));
      }
      this.playLakeFinaleSound();
      console.log("shard picked up");
      console.log("Mirror shard claimed for the lake.");
      return;
    }

    if (lakeFinaleState.lastEventType === "drop_reward") {
      console.log("Mirror shard returned to the graveyard.");
      return;
    }

    if (lakeFinaleState.lastEventType === "complete") {
      const finalePosition = this.world?.userData?.lakeFinale?.finalePosition;
      if (finalePosition) {
        this.triggerChurchHealEffect(new THREE.Vector3(finalePosition.x, finalePosition.y, finalePosition.z));
      }
      this.playLakeFinaleSound();
      this.showClueCard({
        title: "Lake Finale",
        fragment: "The lake answers the shard with living light.",
        detail: "A pale reflection blooms across the waterline. Something beyond this shore is awake now, and it has seen both of you."
      });
      console.log("Lake finale completed.");
    }
  }

  hasLakeFinaleReward() {
    return Boolean(this.localSocketId && this.lakeFinaleState.rewardHolderSocketId === this.localSocketId);
  }

  updateActiveLakeFinaleTarget() {
    if (
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId ||
      this.playerState.healTargetSocketId ||
      !this.lakeFinaleState.unlocked ||
      this.lakeFinaleState.completed ||
      !this.localPlayer?.model
    ) {
      this.activeLakeFinaleTarget = null;
      return;
    }

    const position = this.localPlayer.getPosition();

    if (this.hasLakeFinaleReward()) {
      const hook = this.lakeFinaleFinaleHook;
      if (hook) {
        const distance = Math.hypot(position.x - hook.position.x, position.z - hook.position.z);
        this.activeLakeFinaleTarget = distance <= hook.radius ? { type: "finale", ...hook } : null;
        return;
      }
    }

    if (!this.lakeFinaleState.rewardCollected && this.lakeFinaleRewardHook) {
      const hook = this.lakeFinaleRewardHook;
      const distance = Math.hypot(position.x - hook.position.x, position.z - hook.position.z);
      this.activeLakeFinaleTarget = distance <= hook.radius ? { type: "reward", ...hook } : null;
    } else {
      this.activeLakeFinaleTarget = null;
    }

    const nextTargetKey = this.activeLakeFinaleTarget ? `${this.activeLakeFinaleTarget.type}:${this.activeLakeFinaleTarget.id}` : null;
    if (nextTargetKey !== this.lastLakeFinaleTargetKey) {
      if (nextTargetKey === "reward:mirror_shard") {
        console.log("player entered reward radius");
      }
      this.lastLakeFinaleTargetKey = nextTargetKey;
    }
  }

  canTriggerLakeFinaleInteraction() {
    return Boolean(this.activeLakeFinaleTarget) && this.lakeFinaleState.unlocked && !this.lakeFinaleState.completed;
  }

  triggerLakeFinaleInteraction() {
    if (!this.canTriggerLakeFinaleInteraction()) {
      return;
    }

    if (this.activeLakeFinaleTarget.type === "reward") {
      console.log("Lake finale reward pickup.");
      this.networkClient.sendLakeFinaleAction("pickup_reward");
      return;
    }

    console.log("Lake finale interaction: complete");
    this.networkClient.sendLakeFinaleAction("complete");
  }

  playLakeFinaleSound() {
    const context = this.audioListener?.context;

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const now = context.currentTime + 0.02;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    gain.connect(context.destination);

    [392, 588, 784].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const partialGain = context.createGain();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      partialGain.gain.setValueAtTime(index === 0 ? 0.16 : 0.08, now);
      partialGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
      oscillator.connect(partialGain);
      partialGain.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + 3);
    });

    console.log("Lake finale resonance played.");
  }

  updateActiveCluePoint() {
    if (
      this.playerState.isCollapsed ||
      this.playerState.carriedBySocketId ||
      this.playerState.carryTargetSocketId ||
      this.playerState.healTargetSocketId ||
      !this.localPlayer?.model
    ) {
      this.activeCluePoint = null;
      return;
    }

    const position = this.localPlayer.getPosition();
    let closestClue = null;
    let closestDistance = Infinity;

    for (const clue of this.cluePoints) {
      const distance = Math.hypot(position.x - clue.position.x, position.z - clue.position.z);

      if (distance <= clue.radius && distance < closestDistance) {
        closestClue = clue;
        closestDistance = distance;
      }
    }

    this.activeCluePoint = closestClue;
  }

  canInspectActiveClue() {
    return Boolean(this.activeCluePoint);
  }

  inspectActiveClue() {
    if (!this.activeCluePoint) {
      return;
    }

    const clue = this.activeCluePoint;
    this.discoveredClues.add(clue.id);
    this.showClueCard(clue);
    this.renderClueJournal();
    console.log("Clue discovered:", clue.id);
  }

  createInteractionPrompt() {
    const prompt = document.createElement("div");
    prompt.style.position = "fixed";
    prompt.style.left = "50%";
    prompt.style.bottom = "52px";
    prompt.style.transform = "translateX(-50%)";
    prompt.style.padding = "10px 14px";
    prompt.style.borderRadius = "999px";
    prompt.style.background = "rgba(12, 20, 28, 0.82)";
    prompt.style.border = "1px solid rgba(210, 234, 255, 0.28)";
    prompt.style.color = "#f6f1d1";
    prompt.style.fontFamily = "Georgia, serif";
    prompt.style.fontSize = "15px";
    prompt.style.letterSpacing = "0.03em";
    prompt.style.pointerEvents = "none";
    prompt.style.zIndex = "40";
    prompt.style.display = "none";
    document.body.appendChild(prompt);
    return prompt;
  }

  createShrineProgressHud() {
    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.top = "18px";
    panel.style.right = "18px";
    panel.style.padding = "12px 14px";
    panel.style.borderRadius = "16px";
    panel.style.background = "rgba(10, 14, 22, 0.74)";
    panel.style.border = "1px solid rgba(174, 231, 255, 0.18)";
    panel.style.color = "#efe7cf";
    panel.style.fontFamily = "Georgia, serif";
    panel.style.fontSize = "14px";
    panel.style.lineHeight = "1.35";
    panel.style.zIndex = "35";
    panel.style.pointerEvents = "none";
    document.body.appendChild(panel);
    return panel;
  }

  createStatusBanner() {
    const banner = document.createElement("div");
    banner.style.position = "fixed";
    banner.style.top = "22px";
    banner.style.left = "50%";
    banner.style.transform = "translateX(-50%)";
    banner.style.padding = "10px 16px";
    banner.style.borderRadius = "999px";
    banner.style.background = "rgba(16, 22, 30, 0.88)";
    banner.style.border = "1px solid rgba(174, 231, 255, 0.24)";
    banner.style.color = "#f6f1d1";
    banner.style.fontFamily = "Georgia, serif";
    banner.style.fontSize = "15px";
    banner.style.letterSpacing = "0.02em";
    banner.style.zIndex = "41";
    banner.style.pointerEvents = "none";
    banner.style.display = "none";
    document.body.appendChild(banner);
    return banner;
  }

  createGuidanceBanner() {
    const banner = document.createElement("div");
    banner.style.position = "fixed";
    banner.style.left = "50%";
    banner.style.top = "72px";
    banner.style.transform = "translateX(-50%)";
    banner.style.maxWidth = "540px";
    banner.style.padding = "10px 14px";
    banner.style.borderRadius = "16px";
    banner.style.background = "rgba(12, 18, 28, 0.76)";
    banner.style.border = "1px solid rgba(230, 187, 118, 0.22)";
    banner.style.color = "#f1e5c8";
    banner.style.fontFamily = "Georgia, serif";
    banner.style.fontSize = "15px";
    banner.style.lineHeight = "1.35";
    banner.style.textAlign = "center";
    banner.style.pointerEvents = "none";
    banner.style.zIndex = "39";
    banner.style.display = "none";
    document.body.appendChild(banner);
    return banner;
  }

  createTitleMenuOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(4, 8, 14, 0.72)";
    overlay.style.backdropFilter = "blur(10px)";
    overlay.style.zIndex = "60";

    const panel = document.createElement("div");
    panel.style.width = "min(560px, calc(100vw - 40px))";
    panel.style.padding = "28px";
    panel.style.borderRadius = "28px";
    panel.style.background = "rgba(10, 16, 24, 0.9)";
    panel.style.border = "1px solid rgba(174, 231, 255, 0.18)";
    panel.style.boxShadow = "0 24px 60px rgba(0, 0, 0, 0.36)";
    panel.style.color = "#f4ecd4";
    panel.style.fontFamily = "Georgia, serif";

    const eyebrow = document.createElement("div");
    eyebrow.textContent = "Co-op Survival Exploration";
    eyebrow.style.fontSize = "12px";
    eyebrow.style.letterSpacing = "0.18em";
    eyebrow.style.textTransform = "uppercase";
    eyebrow.style.color = "#aee7ff";

    const title = document.createElement("h1");
    title.textContent = "Sweet Dreams";
    title.style.margin = "10px 0 12px";
    title.style.fontSize = "42px";
    title.style.lineHeight = "1.05";

    const blurb = document.createElement("p");
    blurb.textContent = "Stay together, light every shrine, and survive the Vigil long enough to reach the lake portal.";
    blurb.style.margin = "0 0 20px";
    blurb.style.color = "#d9d0b7";
    blurb.style.lineHeight = "1.5";

    const controls = document.createElement("div");
    controls.style.display = "grid";
    controls.style.gridTemplateColumns = "repeat(auto-fit, minmax(160px, 1fr))";
    controls.style.gap = "10px";
    controls.style.marginBottom = "22px";
    controls.innerHTML = `
      <div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#aee7ff;">Move</div>
        <div style="margin-top:6px;">WASD or Arrow Keys</div>
      </div>
      <div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#aee7ff;">Run / Jump</div>
        <div style="margin-top:6px;">Shift to run, Space to jump</div>
      </div>
      <div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#aee7ff;">Interact</div>
        <div style="margin-top:6px;">E to light, carry, or heal</div>
      </div>
      <div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#aee7ff;">Goal</div>
        <div style="margin-top:6px;">Light 10 shrines, then reach the lake portal together</div>
      </div>
    `;

    const playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.style.border = "0";
    playButton.style.borderRadius = "999px";
    playButton.style.padding = "14px 24px";
    playButton.style.background = "#d6a756";
    playButton.style.color = "#2d2111";
    playButton.style.fontFamily = "Georgia, serif";
    playButton.style.fontSize = "18px";
    playButton.style.cursor = "pointer";
    playButton.addEventListener("click", () => this.startGameSession());

    panel.append(eyebrow, title, blurb, controls, playButton);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    return overlay;
  }

  createPauseMenuOverlay() {
    return this.createShellMenuOverlay({
      title: "Paused",
      message: "Take a breath. The forest will wait.",
      buttons: [
        { label: "Resume", onClick: () => this.setShellState(GAME_SHELL_STATES.ingame), variant: "primary" },
        { label: "Restart Run", onClick: () => this.requestRunRestart() },
        { label: "Return to Menu", onClick: () => this.returnToTitleMenu() }
      ]
    });
  }

  createResultScreenOverlay() {
    return this.createShellMenuOverlay({
      title: "Result",
      message: "",
      buttons: [
        { label: "Restart Run", onClick: () => this.requestRunRestart(), variant: "primary" },
        { label: "Return to Menu", onClick: () => this.returnToTitleMenu() }
      ]
    });
  }

  createCreditsOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "linear-gradient(180deg, rgba(7, 12, 18, 0.82) 0%, rgba(11, 18, 28, 0.94) 45%, rgba(8, 14, 22, 0.98) 100%)";
    overlay.style.backdropFilter = "blur(14px)";
    overlay.style.zIndex = "62";
    overlay.style.overflow = "hidden";

    const drift = document.createElement("div");
    drift.style.position = "absolute";
    drift.style.inset = "0";
    drift.style.background = "radial-gradient(circle at 50% 28%, rgba(190, 243, 255, 0.16), transparent 34%), radial-gradient(circle at 50% 78%, rgba(214, 167, 86, 0.1), transparent 28%)";
    drift.style.opacity = "0.9";
    overlay.appendChild(drift);

    const viewport = document.createElement("div");
    viewport.style.position = "relative";
    viewport.style.width = "min(760px, calc(100vw - 48px))";
    viewport.style.height = "min(74vh, 720px)";
    viewport.style.overflow = "hidden";
    viewport.style.maskImage = "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)";
    viewport.style.webkitMaskImage = "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)";

    const track = document.createElement("div");
    track.style.position = "absolute";
    track.style.left = "0";
    track.style.right = "0";
    track.style.bottom = "-70%";
    track.style.display = "flex";
    track.style.flexDirection = "column";
    track.style.alignItems = "center";
    track.style.gap = "26px";
    track.style.textAlign = "center";
    track.style.color = "#f4ecd4";
    track.style.fontFamily = "Georgia, serif";
    track.style.animation = "sweetDreamsCreditsScroll 34s linear forwards";

    const blocks = [
      { html: '<div style="font-size:14px; letter-spacing:0.24em; text-transform:uppercase; color:#aee7ff;">The Night Softens</div>' },
      { html: '<div style="max-width:560px; font-size:30px; line-height:1.55;">They walked where fear wanted silence. They stayed close when the dark tried to teach them distance. Because they kept one another in sight, the night could not keep them.</div>' },
      { html: '<div style="width:140px; height:1px; background:linear-gradient(90deg, transparent, rgba(244,236,212,0.7), transparent);"></div>' },
      { html: '<div style="font-size:52px; line-height:1.05;">Sweet Dreams</div><div style="margin-top:10px; font-size:18px; color:#d8ccb0;">A co-op prototype about companionship, courage, and the light that survives by being shared.</div>' },
      { html: '<div style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#aee7ff;">Credits</div><div style="font-size:28px; line-height:1.6;">Created as a dream of forests, shrines, and two souls refusing to be divided.</div>' },
      { html: '<div style="font-size:24px; line-height:1.7; max-width:520px;">Edvard and Elina crossed the same darkness together, and in the end the darkness had nowhere left to stand.</div>' },
      { html: '<div style="font-size:20px; line-height:1.6; color:#e4d9be;">Thank you for walking beside them.</div>' }
    ];

    blocks.forEach((block) => {
      const node = document.createElement("div");
      node.innerHTML = block.html;
      track.appendChild(node);
    });

    viewport.appendChild(track);
    overlay.appendChild(viewport);

    const controls = document.createElement("div");
    controls.style.position = "absolute";
    controls.style.left = "50%";
    controls.style.bottom = "28px";
    controls.style.transform = "translateX(-50%)";
    controls.style.display = "flex";
    controls.style.gap = "12px";

    [
      { label: "Restart Run", onClick: () => this.requestRunRestart(), primary: true },
      { label: "Return to Menu", onClick: () => this.returnToTitleMenu(), primary: false }
    ].forEach((definition) => {
      const button = document.createElement("button");
      button.textContent = definition.label;
      button.style.border = "0";
      button.style.borderRadius = "999px";
      button.style.padding = "12px 18px";
      button.style.fontFamily = "Georgia, serif";
      button.style.fontSize = "16px";
      button.style.cursor = "pointer";
      button.style.background = definition.primary ? "#d6a756" : "rgba(255,255,255,0.08)";
      button.style.color = definition.primary ? "#2d2111" : "#f4ecd4";
      button.addEventListener("click", definition.onClick);
      controls.appendChild(button);
    });
    overlay.appendChild(controls);

    if (!document.getElementById("sweet-dreams-credits-style")) {
      const style = document.createElement("style");
      style.id = "sweet-dreams-credits-style";
      style.textContent = `
        @keyframes sweetDreamsCreditsScroll {
          from { transform: translateY(0%); }
          to { transform: translateY(-165%); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    return { root: overlay, track };
  }

  createShellMenuOverlay({ title, message, buttons }) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(6, 10, 16, 0.76)";
    overlay.style.backdropFilter = "blur(12px)";
    overlay.style.zIndex = "58";

    const panel = document.createElement("div");
    panel.style.width = "min(440px, calc(100vw - 40px))";
    panel.style.padding = "28px";
    panel.style.borderRadius = "24px";
    panel.style.background = "rgba(10, 16, 24, 0.92)";
    panel.style.border = "1px solid rgba(174, 231, 255, 0.16)";
    panel.style.boxShadow = "0 24px 60px rgba(0, 0, 0, 0.32)";
    panel.style.color = "#f4ecd4";
    panel.style.fontFamily = "Georgia, serif";
    panel.style.textAlign = "center";

    const titleNode = document.createElement("h2");
    titleNode.textContent = title;
    titleNode.style.margin = "0 0 10px";
    titleNode.style.fontSize = "34px";

    const messageNode = document.createElement("p");
    messageNode.textContent = message;
    messageNode.style.margin = "0 0 20px";
    messageNode.style.lineHeight = "1.5";
    messageNode.style.color = "#d9d0b7";

    const buttonColumn = document.createElement("div");
    buttonColumn.style.display = "flex";
    buttonColumn.style.flexDirection = "column";
    buttonColumn.style.gap = "10px";

    const buttonNodes = buttons.map((definition) => {
      const button = document.createElement("button");
      button.textContent = definition.label;
      button.disabled = Boolean(definition.disabled);
      button.style.border = "0";
      button.style.borderRadius = "999px";
      button.style.padding = "12px 18px";
      button.style.fontFamily = "Georgia, serif";
      button.style.fontSize = "16px";
      button.style.cursor = definition.disabled ? "default" : "pointer";
      button.style.background = definition.variant === "primary" ? "#d6a756" : "rgba(255,255,255,0.08)";
      button.style.color = definition.variant === "primary" ? "#2d2111" : "#f4ecd4";
      button.style.opacity = definition.disabled ? "0.45" : "1";
      if (definition.onClick) {
        button.addEventListener("click", definition.onClick);
      }
      buttonColumn.appendChild(button);
      return button;
    });

    panel.append(titleNode, messageNode, buttonColumn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    return {
      root: overlay,
      titleNode,
      messageNode,
      buttonNodes
    };
  }

  showInteractionPrompt(text) {
    if (!this.interactionPrompt) {
      return;
    }

    this.interactionPrompt.textContent = text;
    this.interactionPrompt.style.display = "block";
  }

  hideInteractionPrompt() {
    if (!this.interactionPrompt) {
      return;
    }

    this.interactionPrompt.style.display = "none";
  }

  showStatusBanner(text, durationMs = 3600) {
    if (!this.statusBanner) {
      return;
    }

    this.statusBanner.textContent = text;
    this.statusBanner.style.display = "block";

    if (this.statusBannerHideHandle) {
      window.clearTimeout(this.statusBannerHideHandle);
    }

    this.statusBannerHideHandle = window.setTimeout(() => {
      if (this.statusBanner) {
        this.statusBanner.style.display = "none";
      }
      this.statusBannerHideHandle = null;
    }, durationMs);
  }

  setShellState(nextState, options = {}) {
    this.shellState = nextState;

    if (nextState === GAME_SHELL_STATES.ingame) {
      this.levelCompleteActive = false;
    }

    if (nextState !== GAME_SHELL_STATES.paused) {
      this.clearGameplayInputState();
    }

    this.updateShellVisibility(options);
    this.refreshRoomStatus();
  }

  updateShellVisibility(options = {}) {
    const gameplayVisible = this.shellState === GAME_SHELL_STATES.ingame;
    const hudVisible = this.gameStarted && this.shellState !== GAME_SHELL_STATES.title;

    this.titleMenuOverlay.style.display = this.shellState === GAME_SHELL_STATES.title ? "flex" : "none";
    this.pauseMenuOverlay.root.style.display = this.shellState === GAME_SHELL_STATES.paused ? "flex" : "none";
    this.resultScreenOverlay.root.style.display = this.shellState === GAME_SHELL_STATES.gameover ? "flex" : "none";
    this.creditsOverlay.root.style.display = this.shellState === GAME_SHELL_STATES.complete ? "flex" : "none";

    if (this.shellState === GAME_SHELL_STATES.gameover) {
      this.resultScreenOverlay.titleNode.textContent = options.title ?? "Run Ended";
      this.resultScreenOverlay.messageNode.textContent = options.message ?? "";
    }

    if (this.shellState === GAME_SHELL_STATES.complete) {
      this.creditsOverlay.track.style.animation = "none";
      void this.creditsOverlay.track.offsetWidth;
      this.creditsOverlay.track.style.animation = "sweetDreamsCreditsScroll 34s linear forwards";
    }

    this.interactionPrompt.style.display = gameplayVisible ? this.interactionPrompt.style.display : "none";
    this.shrineProgressHud.style.display = hudVisible ? "block" : "none";
    this.guidanceBanner.style.display = gameplayVisible ? this.guidanceBanner.style.display : "none";
    this.vigilPresenceOverlay.style.display = hudVisible ? "block" : "none";

    if (this.shellState === GAME_SHELL_STATES.title) {
      this.roomOverlay.hide();
    }
  }

  requestRunRestart() {
    if (!this.networkClient.isConnected()) {
      window.location.reload();
      return;
    }

    this.showStatusBanner("Restarting run...");
    this.networkClient.requestRunRestart();
  }

  returnToTitleMenu() {
    this.networkClient.disconnect();
    const menuUrl = `${window.location.origin}${window.location.pathname}`;
    window.location.assign(menuUrl);
  }

  applyPortalArea(portal = null) {
    if (!portal?.position) {
      return;
    }

    this.portalArea.position.set(portal.position.x, portal.position.y, portal.position.z);
    this.portalArea.radius = Number.isFinite(portal.radius) ? portal.radius : this.portalArea.radius;
  }

  updateShrineProgressHud() {
    if (!this.shrineProgressHud) {
      return;
    }

    const litShrines = this.getLitShrineCount();
    if (litShrines === this.cachedLitShrineCount) {
      return;
    }

    this.cachedLitShrineCount = litShrines;
    this.shrineProgressHud.innerHTML =
      '<div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#aee7ff;">Shrine Progress</div>' +
      '<div style="margin-top:4px; font-size:18px; color:#fff5da;">Shrines lit: ' + litShrines + " / " + SHRINE_IDS.length + "</div>";
  }

  updateGuidanceBanner() {
    if (!this.guidanceBanner) {
      return;
    }

    if (this.shellState !== GAME_SHELL_STATES.ingame) {
      this.guidanceBanner.style.display = "none";
      return;
    }

    let text = "";
    let borderColor = "rgba(230, 187, 118, 0.22)";
    let background = "rgba(12, 18, 28, 0.76)";

    if (this.playerState.isCollapsed) {
      text = "You have fallen — wait for your partner to carry you back to the church.";
      borderColor = "rgba(220, 116, 116, 0.3)";
      background = "rgba(32, 12, 16, 0.82)";
    } else if (this.playerState.carryTargetSocketId) {
      text = "Carry " + this.getCharacterDisplayNameBySocketId(this.playerState.carryTargetSocketId) + " to the church to heal.";
      borderColor = "rgba(174, 231, 255, 0.3)";
    } else if (this.hasRemoteCollapsedVictim()) {
      const fallenPlayer = this.getFirstCollapsedRemoteState();
      if (fallenPlayer) {
        text = this.getCharacterDisplayName(fallenPlayer.characterId) + " has fallen — carry them to the church.";
        borderColor = "rgba(220, 116, 116, 0.3)";
        background = "rgba(28, 12, 16, 0.82)";
      }
    } else if (this.isSharedVigilWarningActive()) {
      text = "Stay together — The Vigil is near.";
      borderColor = "rgba(214, 111, 111, 0.34)";
      background = "rgba(34, 12, 16, 0.82)";
    } else if (this.currentMapId === "map1" && this.getLitShrineCount() >= SHRINE_IDS.length) {
      text = "All shrines are lit — enter the portal together at the lake road.";
      borderColor = "rgba(174, 231, 255, 0.34)";
    }

    if (!text) {
      this.guidanceBanner.style.display = "none";
      return;
    }

    this.guidanceBanner.textContent = text;
    this.guidanceBanner.style.border = "1px solid " + borderColor;
    this.guidanceBanner.style.background = background;
    this.guidanceBanner.style.display = "block";
  }

  updateInteractionPrompt() {
    if (this.canTriggerChurchHeal()) {
      this.showInteractionPrompt("Press E to heal");
      return;
    }

    const carryCandidate = this.getNearbyCarryCandidate();
    if (carryCandidate) {
      this.showInteractionPrompt("Press E to carry " + this.getCharacterDisplayNameBySocketId(carryCandidate.socketId));
      return;
    }

    if (this.canTriggerShrineInteraction()) {
      this.showInteractionPrompt(this.activeShrineHook?.prompt ?? "Press E to light shrine");
      return;
    }

    if (this.shouldShowPortalPrompt()) {
      this.showInteractionPrompt("Enter the portal together");
      return;
    }

    this.hideInteractionPrompt();
  }

  createClueJournal() {
    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.top = "18px";
    panel.style.right = "18px";
    panel.style.width = "300px";
    panel.style.padding = "14px 16px";
    panel.style.borderRadius = "16px";
    panel.style.background = "rgba(10, 14, 22, 0.76)";
    panel.style.border = "1px solid rgba(214, 194, 151, 0.26)";
    panel.style.color = "#efe7cf";
    panel.style.fontFamily = "Georgia, serif";
    panel.style.fontSize = "14px";
    panel.style.lineHeight = "1.45";
    panel.style.zIndex = "35";
    panel.style.pointerEvents = "none";
    document.body.appendChild(panel);
    return panel;
  }

  createClueCard() {
    const card = document.createElement("div");
    card.style.position = "fixed";
    card.style.left = "24px";
    card.style.bottom = "92px";
    card.style.width = "320px";
    card.style.padding = "16px 18px";
    card.style.borderRadius = "18px";
    card.style.background = "rgba(24, 18, 12, 0.88)";
    card.style.border = "1px solid rgba(244, 214, 148, 0.28)";
    card.style.color = "#f4eedf";
    card.style.fontFamily = "Georgia, serif";
    card.style.fontSize = "15px";
    card.style.lineHeight = "1.5";
    card.style.zIndex = "38";
    card.style.display = "none";
    card.style.pointerEvents = "none";
    document.body.appendChild(card);
    return card;
  }

  createVigilPresenceOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "12";
    overlay.style.opacity = "0";
    overlay.style.background =
      "radial-gradient(circle at 50% 46%, rgba(120, 18, 28, 0.16) 0%, rgba(64, 8, 16, 0.08) 34%, rgba(10, 3, 8, 0.22) 100%)";
    overlay.style.mixBlendMode = "screen";
    document.body.appendChild(overlay);
    return overlay;
  }

  renderClueJournal() {
    if (!this.clueJournal) {
      return;
    }

    const clueMap = new Map(this.cluePoints.map((clue) => [clue.id, clue]));
    const discoveredList = [...this.discoveredClues]
      .map((id) => clueMap.get(id))
      .filter(Boolean)
      .map((clue) => '<div style="margin-top:8px;"><strong>' + clue.label + ':</strong> ' + clue.fragment + '</div>')
      .join('');

    const solvedHint = this.discoveredClues.size >= 3
      ? '<div style="margin-top:10px; color:#f4d694;">Three fragments now point toward the bell, the white thread, and the lake. The church still asks you to remember how they fit together.</div>'
      : '<div style="margin-top:10px; color:#c4b697;">These fragments feel connected. Compare them carefully before you test anything at the church.</div>';

    this.clueJournal.innerHTML =
      '<div style="font-size:15px; letter-spacing:0.05em; text-transform:uppercase; color:#f4d694;">Field Notes</div>' +
      '<div style="margin-top:6px; color:#dcd2bb;">' + this.discoveredClues.size + '/3 fragments found.</div>' +
      (discoveredList || '<div style="margin-top:8px; color:#bdb4a0;">No clue fragments collected yet.</div>') +
      solvedHint;
  }

  showClueCard(clue) {
    if (!this.clueCard) {
      return;
    }

    if (this.clueCardHideHandle) {
      window.clearTimeout(this.clueCardHideHandle);
    }

    this.clueCard.innerHTML =
      '<div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#f4d694;">' + clue.title + '</div>' +
      '<div style="margin-top:8px; font-size:18px; color:#fff5da;">' + clue.fragment + '</div>' +
      '<div style="margin-top:10px; color:#dacfb7;">' + clue.detail + '</div>';
    this.clueCard.style.display = "block";
    this.clueCardHideHandle = window.setTimeout(() => {
      this.clueCard.style.display = "none";
      this.clueCardHideHandle = null;
    }, 7200);
  }

  createHealZoneMarker() {
    const marker = new THREE.Group();
    marker.position.copy(churchHealCenter);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.11, 12, 48),
      new THREE.MeshBasicMaterial({
        color: 0xaee7ff,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
      })
    );
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = 0.03;
    marker.add(ring);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 32),
      new THREE.MeshBasicMaterial({
        color: 0x7bc8ff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      })
    );
    glow.rotation.x = -Math.PI * 0.5;
    glow.position.y = 0.02;
    marker.add(glow);

    const light = new THREE.PointLight(0xb7e8ff, 0.9, 14, 2);
    light.position.y = 1.6;
    marker.add(light);

    return marker;
  }

  updateVigilPresenceOverlay(delta) {
    if (!this.vigilPresenceOverlay) {
      return;
    }

    const warningActive = this.isSharedVigilWarningActive();
    const localDangerZone = this.localPlayer?.model
      ? this.getDangerZoneAtPosition(this.localPlayer.getPosition())
      : null;
    const targetOpacity =
      warningActive
        ? 0.22 + Math.sin(this.clock.elapsedTime * 4.2) * 0.04
        : localDangerZone
          ? 0.06 + Math.sin(this.clock.elapsedTime * 2.1) * 0.015
          : 0;
    const currentOpacity = Number.parseFloat(this.vigilPresenceOverlay.style.opacity || "0");
    const nextOpacity = THREE.MathUtils.lerp(currentOpacity, Math.max(0, targetOpacity), Math.min(1, delta * 3.2));
    this.vigilPresenceOverlay.style.opacity = nextOpacity.toFixed(3);
  }

  getCharacterDisplayName(characterId) {
    return CHARACTER_CONFIGS[characterId]?.label ?? "Your partner";
  }

  getCharacterDisplayNameBySocketId(socketId) {
    const remoteState = this.remotePlayerStates.get(socketId);
    if (!remoteState?.characterId) {
      return "your partner";
    }

    return this.getCharacterDisplayName(remoteState.characterId);
  }

  getFirstCollapsedRemoteState() {
    for (const remoteState of this.remotePlayerStates.values()) {
      if (remoteState?.isCollapsed) {
        return remoteState;
      }
    }

    return null;
  }

  applyChurchHealingAnchor(healingAnchor) {
    if (!healingAnchor?.center || !healingAnchor?.recoveryPosition) {
      return;
    }

    churchHealCenter.copy(healingAnchor.center);
    churchHealRecoveryPosition.copy(healingAnchor.recoveryPosition);
    churchHealFacingY = Number.isFinite(healingAnchor.facingY) ? healingAnchor.facingY : churchHealFacingY;
    churchHealInteractRadius = Number.isFinite(healingAnchor.interactRadius)
      ? healingAnchor.interactRadius
      : churchHealInteractRadius;
  }

  createHealEffect() {
    const effect = new THREE.Group();
    effect.visible = false;

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xaee7ff,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      })
    );
    effect.add(glow);

    const light = new THREE.PointLight(0x9ddcff, 1.4, 8, 2);
    effect.add(light);

    return effect;
  }

  triggerChurchHealEffect(position) {
    if (!this.healEffect) {
      return;
    }

    this.healEffect.position.set(position.x, position.y + 1.25, position.z);
    this.healEffect.scale.setScalar(0.65);
    this.healEffect.visible = true;
    this.healEffectTimeRemaining = HEAL_EFFECT_DURATION;
  }

  updateHealEffect(delta) {
    if (this.healZoneMarker) {
      const pulse = 0.9 + Math.sin(this.clock.elapsedTime * 1.5) * 0.08;
      this.healZoneMarker.scale.setScalar(pulse);
    }

    if (!this.healEffect || this.healEffectTimeRemaining <= 0) {
      if (this.healEffect) {
        this.healEffect.visible = false;
      }
      return;
    }

    this.healEffectTimeRemaining = Math.max(0, this.healEffectTimeRemaining - delta);
    const progress = 1 - this.healEffectTimeRemaining / HEAL_EFFECT_DURATION;
    const pulse = 0.8 + Math.sin(progress * Math.PI) * 0.35;
    this.healEffect.scale.setScalar(pulse);
    this.healEffect.visible = true;

    if (this.healEffectTimeRemaining === 0) {
      this.healEffect.visible = false;
    }
  }

  updateDangerAudio(delta) {
    const nextTargetVolume = this.getDesiredDangerAudioVolume();
    this.dangerAudioTargetVolume = nextTargetVolume;

    if (nextTargetVolume > 0) {
      this.tryStartDangerAudio();
    }

    if (!this.dangerSound?.buffer) {
      return;
    }

    const currentVolume = this.dangerSound.getVolume();
    const fadeAlpha = Math.min(1, delta * 2.2);
    const nextVolume = THREE.MathUtils.lerp(currentVolume, nextTargetVolume, fadeAlpha);
    this.dangerSound.setVolume(nextVolume);

    if (nextTargetVolume <= 0.001 && this.dangerSound.isPlaying && nextVolume <= 0.01) {
      this.dangerSound.stop();
      this.dangerAudioStarted = false;
    }
  }

  getDesiredDangerAudioVolume() {
    let loudestStage = this.playerState.carriedBySocketId || this.playerState.carryTargetSocketId
      ? 0
      : this.playerState.vigilStage;

    for (const remoteState of this.remotePlayerStates.values()) {
      if (
        !remoteState ||
        remoteState.carriedBySocketId ||
        this.playerState.carryTargetSocketId === remoteState.socketId
      ) {
        continue;
      }

      loudestStage = Math.max(loudestStage, clampStage(remoteState?.vigilStage));
    }

    if (loudestStage >= 3) {
      return DANGER_AUDIO_MAX_VOLUME;
    }

    if (loudestStage === 2) {
      return DANGER_AUDIO_MAX_VOLUME * 0.72;
    }

    if (loudestStage === 1) {
      return DANGER_AUDIO_MAX_VOLUME * 0.45;
    }

    return 0;
  }

  updateVigilOrbs(time) {
    this.updateOrbForPlayer(this.localSocketId, this.localPlayer, {
      vigilStage: this.playerState.vigilStage,
      isCollapsed: this.playerState.isCollapsed
    }, time);

    for (const [socketId, remotePlayer] of this.remotePlayers.entries()) {
      this.updateOrbForPlayer(socketId, remotePlayer, this.remotePlayerStates.get(socketId), time);
    }
  }

  updateOrbForPlayer(socketId, entity, state, time) {
    if (!socketId || !entity?.model) {
      return;
    }

    const rescueActive =
      socketId === this.localSocketId
        ? Boolean(this.playerState.carryTargetSocketId || this.playerState.carriedBySocketId)
        : Boolean(state?.carriedBySocketId || this.playerState.carryTargetSocketId === socketId);
    const shouldShow =
      !rescueActive && (clampStage(state?.vigilStage) >= 2 || Boolean(state?.isCollapsed));

    if (!shouldShow) {
      this.removeVigilOrb(socketId);
      return;
    }

    let orb = this.vigilOrbMap.get(socketId);

    if (!orb) {
      orb = this.createVigilOrb();
      this.vigilOrbMap.set(socketId, orb);
      this.scene.add(orb);
    }

    const bob = Math.sin(time * 1.6 + socketId.length) * 0.14;
    orb.position.set(
      entity.model.position.x + VIGIL_ORB_OFFSET.x,
      entity.model.position.y + VIGIL_ORB_OFFSET.y + bob,
      entity.model.position.z + VIGIL_ORB_OFFSET.z
    );
  }

  createVigilOrb() {
    const orb = new THREE.Group();

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xdff7ff,
        transparent: true,
        opacity: 0.82,
        depthWrite: false
      })
    );
    orb.add(mesh);

    const glow = new THREE.PointLight(0x9fd8ff, 0.65, 5.5, 2);
    orb.add(glow);

    return orb;
  }

  removeVigilOrb(socketId) {
    const orb = this.vigilOrbMap.get(socketId);

    if (!orb) {
      return;
    }

    this.scene.remove(orb);
    this.vigilOrbMap.delete(socketId);
  }

  updateRedOrbHazards(time, delta) {
    const localPosition = this.localPlayer?.model ? this.localPlayer.getPosition() : null;
    const localPlayerIsSafe = localPosition
      ? this.isInsideChurchSafeArea(localPosition) || this.isInsideRoadSafeCorridor(localPosition)
      : true;
    const canChaseLocalPlayer = Boolean(
      localPosition &&
      !this.playerState.isCollapsed &&
      !this.playerState.carriedBySocketId &&
      !this.playerState.carryTargetSocketId &&
      !this.playerState.healTargetSocketId &&
      !this.isRescueImmunityActive() &&
      !localPlayerIsSafe
    );

    for (const orbState of this.redOrbHazards) {
      if (this.shrineState[orbState.id]?.lit) {
        this.removeRedOrbHazard(orbState.id);
        continue;
      }

      if (this.isInsideRoadSafeCorridor(orbState.home)) {
        this.removeRedOrbHazard(orbState.id);
        continue;
      }

      let orb = this.redOrbMap.get(orbState.id);

      if (!orb) {
        orb = this.createRedOrbHazard();
        this.redOrbMap.set(orbState.id, orb);
        this.scene.add(orb);
      }

      const distanceToPlayer = localPosition
        ? Math.hypot(
          orbState.position.x - localPosition.x,
          orbState.position.z - localPosition.z
        )
        : Infinity;
      const shouldChase = canChaseLocalPlayer && distanceToPlayer <= RED_ORB_DETECTION_RADIUS;

      if (shouldChase) {
        orbState.isChasing = true;

        if (!orbState.hasLoggedChase) {
          console.log("Red orb pursuing player:", orbState.id);
          orbState.hasLoggedChase = true;
        }

        this.tempVectorA.set(
          localPosition.x - orbState.position.x,
          0,
          localPosition.z - orbState.position.z
        );
        if (this.tempVectorA.lengthSq() > 0.0001) {
          this.tempVectorA.normalize().multiplyScalar(RED_ORB_CHASE_SPEED * delta);
          orbState.position.add(this.tempVectorA);
        }

        if (distanceToPlayer <= RED_ORB_CAPTURE_RADIUS) {
          this.collapseLocalPlayer(`shrine_orb:${orbState.id}`);
          orbState.isChasing = false;
          orbState.hasLoggedChase = false;
          orbState.position.copy(orbState.home);
        }
      } else {
        orbState.isChasing = false;
        orbState.hasLoggedChase = false;

        this.tempVectorA.set(
          Math.sin(time * RED_ORB_IDLE_SPEED + orbState.driftSeed) * 1.2,
          0,
          Math.cos(time * RED_ORB_IDLE_SPEED * 0.85 + orbState.driftSeed) * 1.2
        );
        this.tempVectorB.copy(orbState.home).add(this.tempVectorA);
        this.tempVectorA.subVectors(
          this.tempVectorB,
          orbState.position
        );
        if (this.tempVectorA.lengthSq() > 0.0001) {
          this.tempVectorA.normalize().multiplyScalar(RED_ORB_RETURN_SPEED * delta);
          orbState.position.add(this.tempVectorA);
        }
      }

      const bob = Math.sin(time * 1.8 + orbState.bobSeed) * 0.18;
      orb.position.set(
        orbState.position.x,
        orbState.position.y + bob,
        orbState.position.z
      );
    }
  }

  createRedOrbHazard() {
    const orb = new THREE.Group();

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff5a5a,
        transparent: true,
        opacity: 0.88,
        depthWrite: false
      })
    );
    orb.add(mesh);

    const innerMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0xffb0a0,
        transparent: true,
        opacity: 0.76,
        depthWrite: false
      })
    );
    orb.add(innerMesh);

    const glow = new THREE.PointLight(0xff4a46, 0.9, 6.2, 2);
    orb.add(glow);

    return orb;
  }

  resetRedOrbAggro() {
    for (const orbState of this.redOrbHazards) {
      orbState.isChasing = false;
      orbState.hasLoggedChase = false;
      orbState.position.copy(orbState.home);
    }
  }

  removeRedOrbHazard(orbId) {
    const orb = this.redOrbMap.get(orbId);

    if (!orb) {
      return;
    }

    this.scene.remove(orb);
    this.redOrbMap.delete(orbId);
  }

}

function roundValue(value) {
  return Math.round(value * 1000) / 1000;
}

function clampStage(value) {
  const numericValue = Number.isFinite(value) ? value : Number.parseInt(value ?? "0", 10);
  return THREE.MathUtils.clamp(Number.isFinite(numericValue) ? numericValue : 0, 0, 3);
}
































