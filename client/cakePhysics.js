export const FIELD_WIDTH = 760;
export const FIELD_HEIGHT = 280;
export const GROUND_Y = 228;
export const CAKE_RADIUS = 18;
export const GRAVITY = 820;

export const LANES = {
  0: {
    min: 86,
    max: 320,
    base: 168,
    launchX: 190,
    launchY: 154,
    groundY: GROUND_Y
  },
  1: {
    min: 440,
    max: 674,
    base: 592,
    launchX: 570,
    launchY: 154,
    groundY: GROUND_Y
  }
};

export function clampDefenderX(slot, x) {
  const lane = LANES[slot];
  return Math.max(lane.min, Math.min(lane.max, x));
}

export function createShotFromPower(attackerSlot, power) {
  const lane = LANES[attackerSlot];
  const direction = attackerSlot === 0 ? 1 : -1;
  const charge = Math.max(0.15, Math.min(1, power));

  return {
    x: lane.launchX,
    y: lane.launchY,
    vx: direction * (240 + charge * 280),
    vy: -(260 + charge * 260),
    radius: CAKE_RADIUS
  };
}

export function stepShot(cake, dt) {
  return {
    ...cake,
    x: cake.x + cake.vx * dt,
    y: cake.y + cake.vy * dt,
    vy: cake.vy + GRAVITY * dt
  };
}

export function isCakeOutOfBounds(cake) {
  return cake.x < -60 || cake.x > FIELD_WIDTH + 60 || cake.y > FIELD_HEIGHT + 80;
}

export function checkCakeHit(cake, defenderSlot, defenderX, hitCount) {
  const bodyRadius = 40 + Math.min(38, hitCount * 4);
  const centerX = clampDefenderX(defenderSlot, defenderX);
  const centerY = GROUND_Y - 34;
  const dx = cake.x - centerX;
  const dy = cake.y - centerY;
  return Math.hypot(dx, dy) <= bodyRadius + cake.radius;
}
