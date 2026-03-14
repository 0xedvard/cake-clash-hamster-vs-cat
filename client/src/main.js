import { GameApp } from "./GameApp.js";

const root = document.getElementById("app");

if (!root) {
  throw new Error("App root element not found.");
}

const app = new GameApp(root);
app.start();