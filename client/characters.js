const STAGE_LABELS = [
  "Slim",
  "Slightly Chubby",
  "Chubby",
  "Very Chubby",
  "Extremely Cakey",
  "Too Much Cake"
];

function fatStage(hitCount) {
  if (hitCount >= 10) return 5;
  if (hitCount >= 8) return 4;
  if (hitCount >= 5) return 3;
  if (hitCount >= 3) return 2;
  if (hitCount >= 1) return 1;
  return 0;
}

export function mountCharacter(root, type) {
  root.innerHTML = `
    <div class="battle-fighter ${type}" data-stage="0">
      <div class="fighter-shadow"></div>
      <div class="fighter-crumb crumbs-a"></div>
      <div class="fighter-crumb crumbs-b"></div>
      <div class="fighter-body">
        <div class="fighter-ear ear-left"></div>
        <div class="fighter-ear ear-right"></div>
        <div class="fighter-tail"></div>
        <div class="fighter-belly"></div>
        <div class="fighter-face">
          <span class="eye eye-left"></span>
          <span class="eye eye-right"></span>
          <span class="nose"></span>
          <span class="cheek cheek-left"></span>
          <span class="cheek cheek-right"></span>
        </div>
        <div class="frosting frosting-a"></div>
        <div class="frosting frosting-b"></div>
      </div>
      <div class="fighter-label"></div>
    </div>
  `;
}

export function stageLabel(hitCount) {
  return STAGE_LABELS[fatStage(hitCount)];
}

export function syncCharacter(root, player, options = {}) {
  const fighter = root.querySelector(".battle-fighter");
  if (!fighter || !player) return;

  const stage = fatStage(player.hitCount ?? 0);
  fighter.dataset.stage = String(stage);
  fighter.classList.toggle("is-artist", Boolean(options.isArtist));
  fighter.classList.toggle("is-guesser", Boolean(options.isGuesser));
  fighter.classList.toggle("is-attacker", Boolean(options.isAttacker));
  fighter.classList.toggle("is-defender", Boolean(options.isDefender));
  fighter.classList.toggle("is-winner", Boolean(options.isWinner));
  fighter.classList.toggle("is-loser", Boolean(options.isLoser));
  fighter.classList.toggle("is-connected", Boolean(player.connected));
  fighter.style.setProperty("--battle-x", `${options.x ?? 0}px`);
  fighter.querySelector(".fighter-label").textContent = player.name;
}
