import { io } from "socket.io-client";

const DEFAULT_SERVER_URL = "http://localhost:3001";
const VALID_MAP_IDS = new Set(["map1"]);
const FORWARDED_EVENTS = [
  "connect",
  "disconnect",
  "connect_error",
  "room_created",
  "joined_room",
  "room_full",
  "room_not_found",
  "player_joined",
  "player_left",
  "player_state",
  "shrine_state",
  "run_reset",
  "room_state"
];

export class NetworkClient {
  constructor({ serverUrl = DEFAULT_SERVER_URL } = {}) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.listeners = new Map();
    this.connectPromise = null;
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName).add(handler);

    return () => {
      this.listeners.get(eventName)?.delete(handler);
    };
  }

  emitLocal(eventName, payload) {
    for (const handler of this.listeners.get(eventName) ?? []) {
      handler(payload);
    }
  }

  ensureSocket() {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      autoConnect: false,
      withCredentials: true
    });

    for (const eventName of FORWARDED_EVENTS) {
      this.socket.on(eventName, (payload) => {
        this.emitLocal(eventName, payload);
      });
    }

    return this.socket;
  }

  async connect() {
    const socket = this.ensureSocket();

    if (socket.connected) {
      return socket.id;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const handleConnect = () => {
        cleanup();
        resolve(socket.id);
      };

      const handleError = (error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleError);
        this.connectPromise = null;
      };

      socket.on("connect", handleConnect);
      socket.on("connect_error", handleError);
      socket.connect();
    });

    return this.connectPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }

  createRoom(mapId = "map1") {
    const normalizedMapId = VALID_MAP_IDS.has(mapId) ? mapId : "map1";
    this.ensureSocket().emit("create_room", { mapId: normalizedMapId });
  }

  joinRoom(roomCode) {
    this.ensureSocket().emit("join_room", { roomCode });
  }

  sendPlayerState(playerState) {
    if (!this.isConnected()) {
      return;
    }

    this.socket.emit("player_state", playerState);
  }

  sendLightShrine(shrineId) {
    if (!this.isConnected() || !shrineId) {
      return;
    }

    this.socket.emit("light_shrine", { shrineId });
  }

  requestRunRestart() {
    if (!this.isConnected()) {
      return;
    }

    this.socket.emit("restart_run");
  }
}
