import { MAP1_DISPLAY_NAME } from "../world/BelarusVillageWorld.js";

const OVERLAY_STYLES = `
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
  width: min(360px, calc(100vw - 40px));
  padding: 16px;
  border-radius: 16px;
  background: rgba(245, 247, 249, 0.92);
  border: 1px solid rgba(88, 97, 107, 0.18);
  box-shadow: 0 20px 40px rgba(35, 45, 58, 0.18);
  font-family: Georgia, serif;
  color: #24303d;
  backdrop-filter: blur(12px);
`;

export class RoomOverlay {
  constructor(parent = document.body) {
    this.root = document.createElement("div");
    this.root.style.cssText = OVERLAY_STYLES;

    this.title = document.createElement("h1");
    this.title.textContent = "Sweet Dreams";
    this.title.style.margin = "0 0 8px";
    this.title.style.fontSize = "24px";

    this.role = document.createElement("p");
    this.role.style.margin = "0 0 8px";
    this.role.style.fontSize = "14px";
    this.role.style.fontWeight = "600";

    this.status = document.createElement("p");
    this.status.style.margin = "0 0 12px";
    this.status.style.lineHeight = "1.4";

    this.createButton = document.createElement("button");
    this.createButton.textContent = "Create Room";
    this.createButton.style.cssText = `
      display: none;
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: #2d5a8c;
      color: white;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 12px;
    `;

    this.mapLabel = document.createElement("p");
    this.mapLabel.textContent = `Map: ${MAP1_DISPLAY_NAME}`;
    this.mapLabel.style.cssText = "display:none; margin:0 0 12px; font-size:13px; color:#4a5b6d;";

    this.inviteLabel = document.createElement("label");
    this.inviteLabel.textContent = "Invite Link";
    this.inviteLabel.style.cssText = "display:none; font-size:12px; font-weight:600; margin-bottom:6px;";

    this.inviteRow = document.createElement("div");
    this.inviteRow.style.cssText = "display:none; gap:8px; align-items:center;";

    this.inviteInput = document.createElement("input");
    this.inviteInput.readOnly = true;
    this.inviteInput.style.cssText = `
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(88, 97, 107, 0.25);
      border-radius: 10px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.9);
      color: #24303d;
    `;

    this.copyButton = document.createElement("button");
    this.copyButton.textContent = "Copy";
    this.copyButton.style.cssText = `
      border: 0;
      border-radius: 10px;
      padding: 10px 12px;
      background: #d6a756;
      color: #2d2111;
      cursor: pointer;
      font-size: 13px;
    `;

    this.copyButton.addEventListener("click", async () => {
      if (!this.inviteInput.value) {
        return;
      }

      await navigator.clipboard.writeText(this.inviteInput.value);
      this.setStatus("Invite link copied.");
    });

    this.inviteRow.append(this.inviteInput, this.copyButton);
    this.root.append(
      this.title,
      this.role,
      this.status,
      this.mapLabel,
      this.createButton,
      this.inviteLabel,
      this.inviteRow
    );

    parent.appendChild(this.root);
  }

  show() {
    this.root.style.display = "block";
  }

  hide() {
    this.root.style.display = "none";
  }

  setStatus(text, { error = false } = {}) {
    this.status.textContent = text;
    this.status.style.color = error ? "#9b2c2c" : "#344252";
  }

  setRole(text = "") {
    this.role.textContent = text;
    this.role.style.display = text ? "block" : "none";
  }

  showCreateButton(onClick) {
    this.mapLabel.style.display = "block";
    this.createButton.style.display = "inline-block";
    this.createButton.onclick = onClick;
  }

  hideCreateButton() {
    this.mapLabel.style.display = "none";
    this.createButton.style.display = "none";
    this.createButton.onclick = null;
  }

  getSelectedMapId() {
    return "map1";
  }

  setInviteLink(url = "") {
    const visible = Boolean(url);
    this.inviteLabel.style.display = visible ? "block" : "none";
    this.inviteRow.style.display = visible ? "flex" : "none";
    this.inviteInput.value = url;
  }
}


