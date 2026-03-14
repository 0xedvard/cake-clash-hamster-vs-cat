import * as THREE from "three";
import { loadGLTFModel } from "../utils/loaders.js";

export const BELARUS_GROUND_Y = 0;
export const MAP1_DISPLAY_NAME = "Калінава";
export const PORTAL_POINT = Object.freeze({
  x: 9.5,
  y: BELARUS_GROUND_Y,
  z: 239.3
});

const SURFACE_TOP_OFFSET = 0.003;
const SURFACE_THICKNESS = 0.012;
const ROAD_SEGMENTS = 84;
const HOUSE_DATA = [
  { id: "house_a", progress: 0.14, side: "left", distance: 9.4, forwardOffset: -1.4, size: [6.2, 4.7, 5.8], color: 0x8d5447, roofScale: 0.8, rotationBias: 0.08, yardDepth: 6.8 },
  { id: "house_b", progress: 0.2, side: "right", distance: 8.8, forwardOffset: 1.2, size: [5.9, 4.2, 5.4], color: 0xa27849, roofScale: 0.74, rotationBias: -0.05, yardDepth: 6.2 },
  { id: "house_c", progress: 0.28, side: "left", distance: 9.9, forwardOffset: 0.8, size: [6.5, 4.8, 6], color: 0x745945, roofScale: 0.82, rotationBias: 0.05, yardDepth: 7.2 },
  { id: "house_d", progress: 0.34, side: "right", distance: 9.1, forwardOffset: -1.1, size: [5.8, 4.3, 5.6], color: 0x875247, roofScale: 0.72, rotationBias: -0.08, yardDepth: 6 },
  { id: "house_e", progress: 0.41, side: "left", distance: 10.2, forwardOffset: 1.4, size: [6.1, 4.6, 5.8], color: 0x9c754a, roofScale: 0.78, rotationBias: 0.04, yardDepth: 6.8 },
  { id: "house_f", progress: 0.47, side: "right", distance: 8.9, forwardOffset: -0.9, size: [5.8, 4.4, 5.5], color: 0x745945, roofScale: 0.76, rotationBias: -0.05, yardDepth: 6.1 },
  { id: "house_g", progress: 0.54, side: "left", distance: 9.2, forwardOffset: 1.1, size: [6, 4.5, 5.5], color: 0x88524a, roofScale: 0.74, rotationBias: 0.09, yardDepth: 5.9 }
];

const COLORS = {
  skyGround: 0x516573,
  grass: 0x5d7458,
  grassDark: 0x4b6149,
  moss: 0x40563f,
  road: 0x8f7654,
  roadLight: 0xb09572,
  roadEdge: 0x6f5d42,
  wheat: 0xa68f42,
  wheatDark: 0x8d7b35,
  fence: 0x5f4834,
  wood: 0x745845,
  roof: 0x342d34,
  churchWall: 0xd9dde2,
  churchRoof: 0x4f6f9d,
  churchAccent: 0x90aac9,
  stationWall: 0xb7a88f,
  stationRoof: 0x5a443a,
  platform: 0x84807a,
  ballast: 0x5b5855,
  rail: 0xa7adb5,
  sleeper: 0x4f3927,
  grave: 0x959c9d,
  stone: 0x7c8488,
  lake: 0x5ba8d6,
  lakeDeep: 0x32739b,
  dock: 0x70543c,
  forest: 0x2b4737,
  forestDark: 0x21352a,
  bush: 0x3f5f43,
  bushLight: 0x58724f,
  reed: 0x7f8c4d,
  flower: 0xd8c07b,
  lampGlow: 0xffd08a,
  windowGlow: 0xf3c66e,
  shrineDormant: 0x72879a,
  shrineLit: 0x8fd7ff,
  shrinePulse: 0xbef3ff,
  mist: 0xb8cad4,
  portal: 0x8ee7ff,
  portalDeep: 0x4277b8,
  crate: 0x745640,
  hay: 0xaa9246,
  laundry: 0xd4dde1,
  rope: 0x9f8d67,
  garden: 0x56683f,
  penGround: 0x706552
};

const ROAD_POINTS = [
  { x: 0, z: -4 },
  { x: -5.5, z: 20 },
  { x: -10.5, z: 40 },
  { x: -4, z: 64 },
  { x: 5.5, z: 88 },
  { x: 10.5, z: 112 },
  { x: 15, z: 138 },
  { x: 20, z: 166 },
  { x: 18, z: 192 },
  { x: 14, z: 214 },
  { x: 10.5, z: 232 },
  { x: 11, z: 244 }
];

const CHURCH_PLACEMENT = { progress: 0.67, side: "left", distance: 17, forwardOffset: -1.6 };
const GRAVEYARD_PLACEMENT = { progress: 0.79, side: "left", distance: 18.5, forwardOffset: 1.8 };
const LAKE_CENTER = new THREE.Vector3(5, BELARUS_GROUND_Y, 260);
const LAKE_FINALE_POSITION = new THREE.Vector3(PORTAL_POINT.x, PORTAL_POINT.y, 238.5);
const SHRINE_DEFINITIONS = [
  { id: "shrine_station_west", position: new THREE.Vector3(-28, BELARUS_GROUND_Y, 14) },
  { id: "shrine_station_east", position: new THREE.Vector3(30, BELARUS_GROUND_Y, 24) },
  { id: "shrine_village_west", position: new THREE.Vector3(-34, BELARUS_GROUND_Y, 58) },
  { id: "shrine_village_east", position: new THREE.Vector3(33, BELARUS_GROUND_Y, 82) },
  { id: "shrine_church_west", position: new THREE.Vector3(-48, BELARUS_GROUND_Y, 150) },
  { id: "shrine_corridor_west", position: new THREE.Vector3(-54, BELARUS_GROUND_Y, 194) },
  { id: "shrine_corridor_east", position: new THREE.Vector3(58, BELARUS_GROUND_Y, 200) },
  { id: "shrine_lake_left", position: new THREE.Vector3(-46, BELARUS_GROUND_Y, 244) },
  { id: "shrine_lake_right", position: new THREE.Vector3(50, BELARUS_GROUND_Y, 250) },
  { id: "shrine_lake_back", position: new THREE.Vector3(10, BELARUS_GROUND_Y, 292) }
];
const ENABLE_STARS = false;
const ENABLE_AURORA = false;
const DEFAULT_WORLD_RENDER_OPTIONS = Object.freeze({
  lowPerformanceMode: false
});

let cachedRoadPath = null;
let cachedRoadTexture = null;
let cachedGrassTexture = null;
let cachedLakeTexture = null;
let grassTextureFallbackLogged = false;
let cachedKenneyTreeLibraryPromise = null;
let cachedKenneyBushLibraryPromise = null;
let cachedKenneyRockLibraryPromise = null;
let cachedKenneyPropLibraryPromise = null;
let kenneyTreeLoadLogged = false;
let kenneyBushLoadLogged = false;
let kenneyRockLoadLogged = false;
let kenneyPropLoadLogged = false;
let activeWorldRenderOptions = DEFAULT_WORLD_RENDER_OPTIONS;

function isLowPerformanceMode() {
  return Boolean(activeWorldRenderOptions.lowPerformanceMode);
}
let kenneyTreeFallbackLogged = false;
let kenneyBushFallbackLogged = false;
let kenneyRockFallbackLogged = false;
let kenneyPropFallbackLogged = false;

const TREE_MODEL_PATHS = {
  tall: [
    { key: "pine_tall_a", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/tree_pineTallA.glb" },
    { key: "pine_tall_b", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/tree_pineTallB.glb" }
  ],
  round: [
    { key: "pine_round_a", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/tree_pineRoundA.glb" },
    { key: "pine_round_c", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/tree_pineRoundC.glb" }
  ],
  small: [
    { key: "pine_small_a", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/tree_pineSmallA.glb" },
    { key: "pine_small_c", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/tree_pineSmallC.glb" }
  ]
};
const TREE_TARGET_HEIGHTS = {
  tall: 8.6,
  round: 6.9,
  small: 4.8
};
const BUSH_MODEL_PATHS = {
  small: [
    { key: "bush_small", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/plant_bushSmall.glb" }
  ],
  lush: [
    { key: "bush_detailed", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/plant_bushDetailed.glb" },
    { key: "bush_large", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/plant_bushLarge.glb" }
  ]
};
const BUSH_TARGET_HEIGHTS = {
  small: 1.55,
  lush: 2.4
};
const ROCK_MODEL_PATHS = {
  small: [
    { key: "rock_small_a", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/rock_smallA.glb" }
  ],
  flat: [
    { key: "rock_small_flat_a", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/rock_smallFlatA.glb" }
  ],
  large: [
    { key: "rock_large_b", path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/rock_largeB.glb" }
  ]
};
const ROCK_TARGET_HEIGHTS = {
  small: 1.05,
  flat: 0.7,
  large: 1.85
};
const PROP_MODEL_PATHS = {
  sign: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/sign.glb",
  wood_path: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/path_wood.glb",
  wood_path_end: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/path_woodEnd.glb",
  log_stack: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/log_stack.glb",
  log_stack_large: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/log_stackLarge.glb",
  pot_small: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/pot_small.glb",
  pot_large: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/pot_large.glb",
  stone_top: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/stone_smallTopA.glb",
  grass_small: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/grass.glb",
  grass_large: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/grass_large.glb",
  plant_short: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/plant_flatShort.glb",
  plant_tall: "/assets/models/kenney/kenney_nature-kit/Models/GLTF/plant_flatTall.glb"
};
const PROP_TARGET_HEIGHTS = {
  sign: 2.2,
  wood_path: 0.24,
  wood_path_end: 0.24,
  log_stack: 0.62,
  log_stack_large: 0.86,
  pot_small: 0.52,
  pot_large: 0.82,
  stone_top: 0.7,
  grass_small: 0.68,
  grass_large: 1.05,
  plant_short: 0.9,
  plant_tall: 1.3
};
const HOUSE_CONFIGS = HOUSE_DATA.map((item) => placeHouseRelativeToRoad(item));

export function getGroundHeightAt() {
  return BELARUS_GROUND_Y;
}

export function createBelarusVillageWorld(options = {}) {
  activeWorldRenderOptions = {
    ...DEFAULT_WORLD_RENDER_OPTIONS,
    ...options,
    lowPerformanceMode: Boolean(options.lowPerformanceMode)
  };

  const world = new THREE.Group();
  world.name = "belarus_village_world";

  if (ENABLE_STARS) {
    console.log("stars enabled");
    const starField = createStarField();
    world.add(starField);
    console.log(`Star field created and added to the scene (${starField.userData.starCount} stars).`);
  } else {
    console.log("stars disabled for recovery");
  }

  let auroraSystem = null;
  if (ENABLE_AURORA) {
    console.log("aurora enabled");
    auroraSystem = createAuroraEffect();
    world.add(auroraSystem.group);
  } else {
    console.log("aurora disabled for recovery");
  }

  world.add(createGround());
  world.add(createTrainStation());
  world.add(createRoadMeshes());
  world.add(createVillageHouses());
  world.add(createRoadsideDetails());
  world.add(createVillageProps());
  world.add(createFields());
  const churchSystem = createChurch();
  world.add(churchSystem.group);
  world.add(createChurchSurroundings());
  world.add(createGraveyard());
  const shrineSystem = createShrineSystem();
  world.add(shrineSystem.group);
  world.add(createShrineAtmosphereDetails());
  world.add(createEnvironmentDressingPass());
  world.add(createForestBoundary());
  world.add(createForestCorridor());
  world.add(createLakeForest());
  const lakeSystem = createLake();
  world.add(lakeSystem);
  world.add(createLakeShoreDetails());
  world.add(createLakeBacklands());
  const mistSystem = isLowPerformanceMode() ? null : createForestMistSystem();
  if (mistSystem) {
    world.add(mistSystem.group);
  }
  const portalSystem = createLakePortalEffect();
  world.add(portalSystem.group);
  const vigilPresenceSystem = isLowPerformanceMode() ? null : createVigilPresenceSystem();
  if (vigilPresenceSystem) {
    world.add(vigilPresenceSystem.group);
  }

  attachKenneyTrees(world);
  attachKenneyBushes(world);
  attachKenneyRocks(world);
  attachKenneyProps(world);

  const fireflySystem = isLowPerformanceMode() ? null : createFireflies();
  if (fireflySystem) {
    world.add(fireflySystem.group);
  }
  const treeSwaySystem = createTreeSwaySystem(world);
  let lastDecorativeUpdateTime = Number.NEGATIVE_INFINITY;
  world.userData.update = (time, context = {}) => {
    if (auroraSystem) {
      auroraSystem.update(time);
    }
    shrineSystem.update?.(time);
    lakeSystem.userData.update?.(time);
    if (isLowPerformanceMode() && time - lastDecorativeUpdateTime < 0.08) {
      return;
    }

    lastDecorativeUpdateTime = time;
    fireflySystem?.update(time);
    mistSystem?.update(time);
    portalSystem.update(time);
    treeSwaySystem.update(time);
    vigilPresenceSystem?.update(time, context);
  };
  world.userData.getGroundHeightAt = getGroundHeightAt;
  world.userData.isInsideSafeCorridor = (x, z) => isInsideRoadSafeCorridor(x, z);
  world.userData.churchHealing = churchSystem.healing;
  world.userData.shrines = shrineSystem;
  world.userData.vigilPresence = vigilPresenceSystem;
  world.userData.lowPerformanceMode = isLowPerformanceMode();
  world.userData.portal = {
    position: { ...PORTAL_POINT },
    radius: 3.2
  };

  return world;
}

function attachKenneyTrees(world) {
  const anchors = [];

  world.traverse((child) => {
    if (child.userData?.treeAnchor) {
      anchors.push(child);
    }
  });

  if (!anchors.length) {
    return;
  }

  getKenneyTreeLibrary()
    .then((library) => {
      anchors.forEach((anchor) => {
        populateKenneyTreeAnchor(anchor, library);
      });
    })
    .catch((error) => {
      if (!kenneyTreeFallbackLogged) {
        console.warn("Kenney tree asset fallback used.", error);
        kenneyTreeFallbackLogged = true;
      }
    });
}

async function getKenneyTreeLibrary() {
  if (!cachedKenneyTreeLibraryPromise) {
    cachedKenneyTreeLibraryPromise = loadKenneyTreeLibrary().catch((error) => {
      cachedKenneyTreeLibraryPromise = null;
      throw error;
    });
  }

  return cachedKenneyTreeLibraryPromise;
}

async function loadKenneyTreeLibrary() {
  const library = { tall: [], round: [], small: [] };

  for (const [variant, definitions] of Object.entries(TREE_MODEL_PATHS)) {
    for (const definition of definitions) {
      const scene = await loadGLTFModel(definition.path);
      library[variant].push({
        key: definition.key,
        prototype: normalizeTreePrototype(scene, TREE_TARGET_HEIGHTS[variant])
      });
    }
  }

  if (!kenneyTreeLoadLogged) {
    const modelCount = Object.values(library).reduce((count, items) => count + items.length, 0);
    console.log(`Kenney tree assets loaded (${modelCount} source models).`);
    kenneyTreeLoadLogged = true;
  }

  return library;
}

function normalizeTreePrototype(scene, targetHeight) {
  const prototype = scene.clone(true);
  prototype.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(prototype);
  const size = new THREE.Vector3();
  bounds.getSize(size);

  const height = Math.max(size.y, 0.001);
  const normalized = new THREE.Group();
  prototype.position.y -= bounds.min.y;
  normalized.add(prototype);
  normalized.scale.setScalar(targetHeight / height);
  normalized.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return normalized;
}

function populateKenneyTreeAnchor(anchor, library) {
  if (anchor.userData.kenneyTreeApplied) {
    return;
  }

  const variant = anchor.userData.treeVariant ?? "round";
  const variants = library[variant] ?? library.round;

  if (!variants || variants.length === 0) {
    return;
  }

  const seed = anchor.userData.treeSeed ?? 0;
  const selectionIndex = Math.min(
    variants.length - 1,
    Math.floor(seededTreeNoise(seed + 1.37) * variants.length)
  );
  const instance = variants[selectionIndex].prototype.clone(true);
  const scaleJitter = THREE.MathUtils.lerp(0.94, 1.08, seededTreeNoise(seed + 6.2));
  const rotationJitter = THREE.MathUtils.lerp(-0.2, 0.2, seededTreeNoise(seed + 11.4));

  instance.scale.multiplyScalar((anchor.userData.treeScale ?? 1) * scaleJitter);
  instance.rotation.y = rotationJitter;

  anchor.clear();
  anchor.add(instance);
  anchor.userData.kenneyTreeApplied = true;
}

function seededTreeNoise(seed) {
  const value = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function attachKenneyBushes(world) {
  const anchors = [];

  world.traverse((child) => {
    if (child.userData?.bushAnchor) {
      anchors.push(child);
    }
  });

  if (!anchors.length) {
    return;
  }

  getKenneyBushLibrary()
    .then((library) => {
      anchors.forEach((anchor) => {
        populateKenneyBushAnchor(anchor, library);
      });
    })
    .catch((error) => {
      if (!kenneyBushFallbackLogged) {
        console.warn("Kenney bush asset fallback used.", error);
        kenneyBushFallbackLogged = true;
      }
    });
}

async function getKenneyBushLibrary() {
  if (!cachedKenneyBushLibraryPromise) {
    cachedKenneyBushLibraryPromise = loadKenneyBushLibrary().catch((error) => {
      cachedKenneyBushLibraryPromise = null;
      throw error;
    });
  }

  return cachedKenneyBushLibraryPromise;
}

async function loadKenneyBushLibrary() {
  const library = { small: [], lush: [] };

  for (const [variant, definitions] of Object.entries(BUSH_MODEL_PATHS)) {
    for (const definition of definitions) {
      const scene = await loadGLTFModel(definition.path);
      library[variant].push({
        key: definition.key,
        prototype: normalizeTreePrototype(scene, BUSH_TARGET_HEIGHTS[variant])
      });
    }
  }

  if (!kenneyBushLoadLogged) {
    const modelCount = Object.values(library).reduce((count, items) => count + items.length, 0);
    console.log(`Kenney bush assets loaded (${modelCount} source models).`);
    kenneyBushLoadLogged = true;
  }

  return library;
}

function populateKenneyBushAnchor(anchor, library) {
  if (anchor.userData.kenneyBushApplied) {
    return;
  }

  const variant = anchor.userData.bushVariant ?? "lush";
  const variants = library[variant] ?? library.lush;

  if (!variants || variants.length === 0) {
    return;
  }

  const seed = anchor.userData.bushSeed ?? 0;
  const selectionIndex = Math.min(
    variants.length - 1,
    Math.floor(seededTreeNoise(seed + 2.11) * variants.length)
  );
  const instance = variants[selectionIndex].prototype.clone(true);
  const scaleJitter = THREE.MathUtils.lerp(0.94, 1.08, seededTreeNoise(seed + 4.7));
  const rotationJitter = THREE.MathUtils.lerp(-0.28, 0.28, seededTreeNoise(seed + 9.9));

  instance.scale.multiplyScalar((anchor.userData.bushScale ?? 1) * scaleJitter);
  instance.rotation.y = rotationJitter;

  anchor.clear();
  anchor.add(instance);
  anchor.userData.kenneyBushApplied = true;
}

function attachKenneyRocks(world) {
  const anchors = [];

  world.traverse((child) => {
    if (child.userData?.rockAnchor) {
      anchors.push(child);
    }
  });

  if (!anchors.length) {
    return;
  }

  getKenneyRockLibrary()
    .then((library) => {
      anchors.forEach((anchor) => {
        populateKenneyRockAnchor(anchor, library);
      });
    })
    .catch((error) => {
      if (!kenneyRockFallbackLogged) {
        console.warn("Kenney rock asset fallback used.", error);
        kenneyRockFallbackLogged = true;
      }
    });
}

async function getKenneyRockLibrary() {
  if (!cachedKenneyRockLibraryPromise) {
    cachedKenneyRockLibraryPromise = loadKenneyRockLibrary().catch((error) => {
      cachedKenneyRockLibraryPromise = null;
      throw error;
    });
  }

  return cachedKenneyRockLibraryPromise;
}

async function loadKenneyRockLibrary() {
  const library = { small: [], flat: [], large: [] };

  for (const [variant, definitions] of Object.entries(ROCK_MODEL_PATHS)) {
    for (const definition of definitions) {
      const scene = await loadGLTFModel(definition.path);
      library[variant].push({
        key: definition.key,
        prototype: normalizeTreePrototype(scene, ROCK_TARGET_HEIGHTS[variant])
      });
    }
  }

  if (!kenneyRockLoadLogged) {
    const modelCount = Object.values(library).reduce((count, items) => count + items.length, 0);
    console.log(`Kenney rock assets loaded (${modelCount} source models).`);
    kenneyRockLoadLogged = true;
  }

  return library;
}

function populateKenneyRockAnchor(anchor, library) {
  if (anchor.userData.kenneyRockApplied) {
    return;
  }

  const variant = anchor.userData.rockVariant ?? "small";
  const variants = library[variant] ?? library.small;

  if (!variants || variants.length === 0) {
    return;
  }

  const seed = anchor.userData.rockSeed ?? 0;
  const selectionIndex = Math.min(
    variants.length - 1,
    Math.floor(seededTreeNoise(seed + 3.41) * variants.length)
  );
  const instance = variants[selectionIndex].prototype.clone(true);
  const scaleJitter = THREE.MathUtils.lerp(0.93, 1.1, seededTreeNoise(seed + 8.2));
  const rotationJitter = THREE.MathUtils.lerp(-0.4, 0.4, seededTreeNoise(seed + 12.6));

  instance.scale.multiplyScalar((anchor.userData.rockScale ?? 1) * scaleJitter);
  instance.rotation.y = rotationJitter;

  anchor.clear();
  anchor.add(instance);
  anchor.userData.kenneyRockApplied = true;
}

function attachKenneyProps(world) {
  const anchors = [];

  world.traverse((child) => {
    if (child.userData?.propAnchor) {
      anchors.push(child);
    }
  });

  if (!anchors.length) {
    return;
  }

  getKenneyPropLibrary()
    .then((library) => {
      anchors.forEach((anchor) => {
        populateKenneyPropAnchor(anchor, library);
      });
    })
    .catch((error) => {
      if (!kenneyPropFallbackLogged) {
        console.warn("Kenney prop asset fallback used.", error);
        kenneyPropFallbackLogged = true;
      }
    });
}

async function getKenneyPropLibrary() {
  if (!cachedKenneyPropLibraryPromise) {
    cachedKenneyPropLibraryPromise = loadKenneyPropLibrary().catch((error) => {
      cachedKenneyPropLibraryPromise = null;
      throw error;
    });
  }

  return cachedKenneyPropLibraryPromise;
}

async function loadKenneyPropLibrary() {
  const library = {};

  for (const [key, path] of Object.entries(PROP_MODEL_PATHS)) {
    const scene = await loadGLTFModel(path);
    library[key] = normalizeTreePrototype(scene, PROP_TARGET_HEIGHTS[key]);
  }

  if (!kenneyPropLoadLogged) {
    console.log(`Kenney prop assets loaded (${Object.keys(library).length} source models).`);
    kenneyPropLoadLogged = true;
  }

  return library;
}

function populateKenneyPropAnchor(anchor, library) {
  if (anchor.userData.kenneyPropApplied) {
    return;
  }

  const kind = anchor.userData.propKind;
  const prototype = library[kind];

  if (!prototype) {
    return;
  }

  const instance = prototype.clone(true);
  const scale = anchor.userData.propScale ?? 1;
  const scaleX = anchor.userData.propScaleX ?? scale;
  const scaleY = anchor.userData.propScaleY ?? scale;
  const scaleZ = anchor.userData.propScaleZ ?? scale;

  instance.scale.set(
    instance.scale.x * scaleX,
    instance.scale.y * scaleY,
    instance.scale.z * scaleZ
  );

  if (anchor.userData.propOffsetY) {
    instance.position.y += anchor.userData.propOffsetY;
  }

  instance.rotation.x = anchor.userData.propRotationX ?? 0;
  instance.rotation.y = anchor.userData.propRotationY ?? 0;
  instance.rotation.z = anchor.userData.propRotationZ ?? 0;

  anchor.clear();
  anchor.add(instance);
  anchor.userData.kenneyPropApplied = true;
}

function createKenneyPropAnchor({
  kind,
  x = 0,
  y = 0,
  z = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  scale = 1,
  scaleX = null,
  scaleY = null,
  scaleZ = null,
  offsetY = 0,
  fallback = null
}) {
  const anchor = new THREE.Group();
  anchor.position.set(x, y, z);
  anchor.userData.propAnchor = true;
  anchor.userData.propKind = kind;
  anchor.userData.propScale = scale;
  anchor.userData.propScaleX = scaleX;
  anchor.userData.propScaleY = scaleY;
  anchor.userData.propScaleZ = scaleZ;
  anchor.userData.propRotationX = rotationX;
  anchor.userData.propRotationY = rotationY;
  anchor.userData.propRotationZ = rotationZ;
  anchor.userData.propOffsetY = offsetY;

  if (fallback) {
    anchor.add(fallback);
  }

  return anchor;
}

function createStarField() {
  const starCount = 2400;
  const radius = 1700;
  const minY = 0.42;
  const maxY = 0.98;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const color = new THREE.Color();

  for (let index = 0; index < starCount; index += 1) {
    const theta = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.lerp(minY, maxY, Math.pow(Math.random(), 0.42));
    const horizontal = Math.sqrt(Math.max(0.001, 1 - y * y));
    const direction = new THREE.Vector3(
      Math.cos(theta) * horizontal,
      y,
      Math.sin(theta) * horizontal
    );

    const distance = radius + Math.random() * 180;
    const position = direction.multiplyScalar(distance);
    const brightness = THREE.MathUtils.lerp(0.88, 1, Math.random());

    positions[index * 3] = position.x;
    positions[index * 3 + 1] = position.y;
    positions[index * 3 + 2] = position.z;

    color.setRGB(brightness, brightness, brightness);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.PointsMaterial({
    size: 6.2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 1,
    vertexColors: true,
    depthWrite: false,
    depthTest: false,
    fog: false
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = "star_field";
  stars.renderOrder = -10;
  stars.frustumCulled = false;
  stars.userData.starCount = starCount;
  stars.userData.radius = radius;
  stars.userData.minY = minY;
  stars.userData.maxY = maxY;

  return stars;
}
function createAuroraEffect() {
  const group = new THREE.Group();
  group.name = "aurora_effect";

  const layers = [
    { width: 980, height: 120, y: 355, z: -250, rotationY: 0.12, speed: 0.11, sway: 10, drift: 0.0025, opacity: 0.24, tint: [0.48, 0.9, 0.78] },
    { width: 760, height: 92, y: 335, z: -180, rotationY: -0.08, speed: 0.14, sway: 8, drift: -0.0018, opacity: 0.18, tint: [0.3, 0.84, 0.74] }
  ];

  const animatedLayers = layers.map((layer, index) => {
    const geometry = new THREE.PlaneGeometry(layer.width, layer.height, 48, 10);
    const position = geometry.attributes.position;
    const base = new Float32Array(position.array.length);
    base.set(position.array);

    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
      const x = base[vertexIndex * 3];
      const y = base[vertexIndex * 3 + 1];
      const arch = Math.cos((x / (layer.width * 0.5)) * Math.PI * 0.5);
      position.array[vertexIndex * 3 + 1] = y + arch * (24 - index * 6);
      position.array[vertexIndex * 3 + 2] = Math.sin((x / layer.width) * Math.PI * 1.35) * (16 - index * 3);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      map: createAuroraTexture(layer.tint, layer.opacity),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      depthTest: false,
      fog: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, layer.y, layer.z);
    mesh.rotation.x = -0.48;
    mesh.rotation.y = layer.rotationY;
    mesh.renderOrder = -9;
    mesh.frustumCulled = false;

    group.add(mesh);

    return { mesh, geometry, base, layer };
  });

  return {
    group,
    update(time) {
      animatedLayers.forEach(({ mesh, geometry, base, layer }, index) => {
        const position = geometry.attributes.position;

        for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
          const baseX = base[vertexIndex * 3];
          const baseY = base[vertexIndex * 3 + 1];
          const baseZ = base[vertexIndex * 3 + 2];
          const along = vertexIndex % 49;
          const wave = Math.sin(time * layer.speed + along * 0.34 + index * 0.8);
          const ripple = Math.cos(time * (layer.speed * 0.65) + baseX * 0.012);

          position.array[vertexIndex * 3 + 1] = baseY + wave * layer.sway;
          position.array[vertexIndex * 3 + 2] = baseZ + ripple * (layer.sway * 0.32);
        }

        position.needsUpdate = true;
        mesh.material.map.offset.x = (time * layer.drift) % 1;
        mesh.position.x = Math.sin(time * layer.speed * 0.4 + index) * 12;
      });
    }
  };
}

function createAuroraTexture(tint, opacity) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(120, 255, 220, 0)");
  gradient.addColorStop(0.18, `rgba(${Math.round(tint[0] * 255)}, ${Math.round(tint[1] * 255)}, ${Math.round(tint[2] * 255)}, ${opacity * 0.7})`);
  gradient.addColorStop(0.55, `rgba(${Math.round((tint[0] * 0.78) * 255)}, ${Math.round((tint[1] * 0.92) * 255)}, ${Math.round((tint[2] * 1.05) * 255)}, ${opacity})`);
  gradient.addColorStop(0.84, `rgba(${Math.round((tint[0] * 0.56) * 255)}, ${Math.round((tint[1] * 0.82) * 255)}, ${Math.round((tint[2] * 0.94) * 255)}, ${opacity * 0.42})`);
  gradient.addColorStop(1, "rgba(80, 180, 160, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.22;
  for (let stripe = 0; stripe < 12; stripe += 1) {
    const x = (stripe / 12) * canvas.width;
    const stripeGradient = context.createLinearGradient(x, 0, x + 20, 0);
    stripeGradient.addColorStop(0, "rgba(255,255,255,0)");
    stripeGradient.addColorStop(0.5, "rgba(255,255,255,0.65)");
    stripeGradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = stripeGradient;
    context.fillRect(x, 0, 24, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}
function createRoadPath() {
  if (!cachedRoadPath) {
    cachedRoadPath = new THREE.CatmullRomCurve3(
      ROAD_POINTS.map((point) => new THREE.Vector3(point.x, BELARUS_GROUND_Y, point.z)),
      false,
      "centripetal",
      0.55
    );
  }

  return cachedRoadPath;
}

function isInsideRoadSafeCorridor(x, z) {
  const effectiveProgress = THREE.MathUtils.clamp((z + 4) / 248, 0, 1);
  const roadWidth = getRoadWidthAtProgress(effectiveProgress);
  const distanceToRoadCenter = getDistanceToRoadCenter(x, z);
  const churchPlacement = getRoadPlacement(CHURCH_PLACEMENT);
  const stationSafe =
    x >= -36 &&
    x <= 36 &&
    z >= -26 &&
    z <= 34;
  const churchSafe =
    Math.hypot(x - churchPlacement.position.x, z - churchPlacement.position.z) <= 18;
  const lakeApproachSafe =
    Math.hypot(x - 10.5, z - 232) <= 10.5;

  return (
    distanceToRoadCenter < roadWidth * 2.15 ||
    stationSafe ||
    churchSafe ||
    lakeApproachSafe
  );
}

function sampleRoadPointAndNormal(progress) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const path = createRoadPath();
  const point = path.getPointAt(t);
  const tangent = path.getTangentAt(t).setY(0).normalize();
  const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
  const left = right.clone().multiplyScalar(-1);

  point.y = BELARUS_GROUND_Y;

  return {
    progress: t,
    point,
    tangent,
    right,
    left,
    rotationY: Math.atan2(tangent.x, tangent.z)
  };
}

function getRoadWidthAtProgress(progress) {
  if (progress >= 0.76) {
    return 2.9;
  }

  if (progress >= 0.6) {
    return 3.2;
  }

  return 3.6;
}

function getDistanceToRoadCenter(x, z, sampleCount = 96) {
  let nearestDistance = Infinity;

  for (let index = 0; index <= sampleCount; index += 1) {
    const progress = index / sampleCount;
    const point = sampleRoadPointAndNormal(progress).point;
    const distance = Math.hypot(x - point.x, z - point.z);

    if (distance < nearestDistance) {
      nearestDistance = distance;
    }
  }

  return nearestDistance;
}

function isInsideRoadClearance(x, z, progress = null, multiplier = 0.6) {
  const effectiveProgress = progress ?? THREE.MathUtils.clamp((z + 4) / 248, 0, 1);
  const roadWidth = getRoadWidthAtProgress(effectiveProgress);
  const distanceToRoadCenter = getDistanceToRoadCenter(x, z);
  return distanceToRoadCenter < roadWidth * multiplier;
}

function getSafeRoadsidePosition(x, z, options = {}) {
  const { progress = null, multiplier = 0.6, extraOffset = 1.15 } = options;
  if (!isInsideRoadClearance(x, z, progress, multiplier)) {
    return { x, z };
  }

  const effectiveProgress = progress ?? THREE.MathUtils.clamp((z + 4) / 248, 0, 1);
  const anchor = sampleRoadPointAndNormal(effectiveProgress);
  const rightDot = (x - anchor.point.x) * anchor.right.x + (z - anchor.point.z) * anchor.right.z;
  const side = rightDot >= 0 ? anchor.right : anchor.left;
  const safeDistance = getRoadWidthAtProgress(effectiveProgress) * multiplier + extraOffset;

  return {
    x: anchor.point.x + side.x * safeDistance,
    z: anchor.point.z + side.z * safeDistance
  };
}

function isInsideRotatedEllipse(x, z, centerX, centerZ, radiusX, radiusZ, rotationY) {
  const dx = x - centerX;
  const dz = z - centerZ;
  const cos = Math.cos(-rotationY);
  const sin = Math.sin(-rotationY);
  const localX = dx * cos - dz * sin;
  const localZ = dx * sin + dz * cos;
  const normalized = (localX * localX) / (radiusX * radiusX) + (localZ * localZ) / (radiusZ * radiusZ);
  return normalized <= 1;
}

function isInsideLakeWaterArea(x, z) {
  return isInsideRotatedEllipse(x, z, LAKE_CENTER.x + 1, LAKE_CENTER.z + 7, 47, 31, -0.05);
}

function getSurfaceCenterY(thickness = SURFACE_THICKNESS, topOffset = SURFACE_TOP_OFFSET) {
  return BELARUS_GROUND_Y - thickness * 0.5 + topOffset;
}

function getRoadPlacement(config) {
  const sample = sampleRoadPointAndNormal(config.progress);
  const sideVector = config.side === "left" ? sample.left : sample.right;
  const roadPoint = sample.point.clone().add(sample.tangent.clone().multiplyScalar(config.forwardOffset ?? 0));
  const position = roadPoint.clone().add(sideVector.clone().multiplyScalar(config.distance));

  return {
    ...sample,
    roadPoint,
    position,
    sideVector,
    toRoad: roadPoint.clone().sub(position).setY(0).normalize()
  };
}

function placeHouseRelativeToRoad(config) {
  const placement = getRoadPlacement(config);
  const facingDirection = placement.toRoad.clone().add(placement.tangent.clone().multiplyScalar(config.rotationBias ?? 0)).normalize();

  return {
    ...config,
    ...placement,
    rotationY: Math.atan2(facingDirection.x, facingDirection.z)
  };
}

function createGround() {
  const group = new THREE.Group();
  group.name = "ground";

  group.add(
    createFlatSurface(280, 320, COLORS.grass, {
      z: 110,
      topOffset: 0,
      thickness: 0.04,
      material: createGrassMaterial(280, 320, COLORS.grass)
    })
  );

  const meadowPatches = [
    { x: -52, z: 84, width: 56, depth: 120, color: COLORS.grassDark, rotationY: -0.06 },
    { x: 44, z: 86, width: 62, depth: 118, color: COLORS.grassDark, rotationY: 0.05 },
    { x: -36, z: 170, width: 74, depth: 98, color: COLORS.grassDark, rotationY: 0.08 },
    { x: 48, z: 172, width: 78, depth: 104, color: COLORS.grassDark, rotationY: -0.06 }
  ];

  meadowPatches.forEach((patch) => {
    group.add(
      createFlatSurface(patch.width, patch.depth, patch.color, {
        x: patch.x,
        z: patch.z,
        thickness: 0.01,
        topOffset: 0.001,
        rotationY: patch.rotationY,
        material: createGrassMaterial(patch.width, patch.depth, patch.color)
      })
    );
  });

  return group;
}

function createGroundVariety() {
  const group = new THREE.Group();
  group.name = "ground_variety";

  const broadPatches = [
    { x: -18, z: 56, width: 58, depth: 40, color: COLORS.grassLight, rotationY: -0.08 },
    { x: 22, z: 98, width: 62, depth: 44, color: COLORS.grassLight, rotationY: 0.06 },
    { x: -26, z: 132, width: 54, depth: 38, color: COLORS.grassDark, rotationY: 0.12 },
    { x: 26, z: 168, width: 60, depth: 42, color: COLORS.grassLight, rotationY: -0.09 },
    { x: -10, z: 212, width: 42, depth: 36, color: COLORS.grassDark, rotationY: 0.05 },
    { x: 8, z: 244, width: 52, depth: 30, color: COLORS.grassLight, rotationY: -0.04 }
  ];

  broadPatches.forEach((patch) => {
    group.add(
      createFlatSurface(patch.width, patch.depth, patch.color, {
        x: patch.x,
        z: patch.z,
        thickness: 0.008,
        topOffset: 0.0012,
        rotationY: patch.rotationY
      })
    );
  });

  HOUSE_CONFIGS.forEach((config, index) => {
    const frontPatch = config.position.clone().add(config.toRoad.clone().multiplyScalar(config.yardDepth * 0.22));
    const sideDrift = config.right.clone().multiplyScalar(index % 2 === 0 ? 0.9 : -0.9);
    const backPatch = config.position.clone().add(config.toRoad.clone().multiplyScalar(-config.yardDepth * 0.35));

    group.add(
      createFlatSurface(config.size[0] + 2.4, config.yardDepth * 0.62, COLORS.yardSoil, {
        x: frontPatch.x + sideDrift.x,
        z: frontPatch.z + sideDrift.z,
        thickness: 0.006,
        topOffset: 0.008,
        rotationY: config.rotationY + (index % 2 === 0 ? 0.05 : -0.04)
      })
    );
    group.add(
      createFlatSurface(config.size[0] + 5.4, config.yardDepth * 0.78, COLORS.grassLight, {
        x: backPatch.x,
        z: backPatch.z,
        thickness: 0.005,
        topOffset: 0.0012,
        rotationY: config.rotationY + (index % 2 === 0 ? -0.04 : 0.04)
      })
    );
  });

  return group;
}
function createTrainStation() {
  const group = new THREE.Group();
  group.name = "train_station";

  group.add(createRailroad());
  group.add(createFlatSurface(26, 5.2, COLORS.platform, { x: 0, z: -10.5, thickness: 0.02, topOffset: 0.002 }));
  group.add(createFlatSurface(14, 8, COLORS.roadLight, { x: -14.5, z: -3, thickness: 0.012, topOffset: 0.0028 }));
  group.add(createFlatSurface(54, 24, COLORS.grass, { x: -6, z: -4, thickness: 0.003, topOffset: 0.0046, rotationY: 0.04 }));
  group.add(createFlatSurface(42, 22, COLORS.grassDark, { x: -28, z: 8, thickness: 0.003, topOffset: 0.0044, rotationY: -0.05 }));
  group.add(createFlatSurface(46, 18, COLORS.grassDark, { x: 22, z: 6, thickness: 0.003, topOffset: 0.0044, rotationY: 0.06 }));
  group.add(createFlatSurface(68, 18, COLORS.grassDark, { x: -2, z: -28, thickness: 0.003, topOffset: 0.0042, rotationY: -0.03 }));

  const station = new THREE.Group();
  station.position.set(-15, BELARUS_GROUND_Y, -3);
  station.rotation.y = 0.08;

  station.add(createMesh(new THREE.BoxGeometry(10, 4.8, 5.8), createSurfaceMaterial(COLORS.stationWall), {
    position: new THREE.Vector3(0, 2.4, 0), castShadow: true, receiveShadow: true
  }));
  station.add(createMesh(new THREE.ConeGeometry(7.2, 4.2, 4), createSurfaceMaterial(COLORS.stationRoof), {
    position: new THREE.Vector3(0, 6.8, 0), rotationY: Math.PI / 4, castShadow: true, receiveShadow: true
  }));
  station.add(createMesh(new THREE.BoxGeometry(5.4, 0.25, 3.4), createSurfaceMaterial(COLORS.stationRoof), {
    position: new THREE.Vector3(7.2, 3.3, -1.8), castShadow: true, receiveShadow: true
  }));

  for (const x of [5.4, 8.8]) {
    station.add(createMesh(new THREE.BoxGeometry(0.22, 3, 0.22), createSurfaceMaterial(COLORS.fence), {
      position: new THREE.Vector3(x, 1.5, -1.8), castShadow: true, receiveShadow: true
    }));
  }

  station.add(createDoor({ position: [0, 1.25, 2.95], width: 1.45, height: 2.5 }));
  addGlowingWindow(station, { position: [-2.4, 2.45, 2.95], scale: [1.05, 1.2, 0.12] });
  addGlowingWindow(station, { position: [2.4, 2.45, 2.95], scale: [1.05, 1.2, 0.12] });
  addGlowingWindow(station, { position: [0, 2.45, -2.95], scale: [1.25, 1.2, 0.12] });
  station.add(createInteriorTableSet({ x: -2.2, z: 1.15, rotationY: 0.08 }));
  station.add(createWarmLampProp({ x: -2.55, y: 1.78, z: 1.25 }));
  station.add(createOpenBookProp({ x: -1.78, y: 1.17, z: 1.08, rotationY: 0.22 }));
  station.add(createPointLightOrb([8, 3.7, -4.2], COLORS.lampGlow, 1.2, 15));

  group.add(station);
  group.add(createStationNameSign(-6.2, 6.8, 0.08));
  group.add(createMailBox(-11.2, 8.6, 0.08));
  group.add(createLetterNote(-11.1, 8.72, 0.18, 0.22));
  group.add(createLampPost(10, -2));
  group.add(createLampPost(-2, 8));
  group.add(createBench(10, -8.5, Math.PI));
  group.add(createCrateStack(5.8, -8.8));
  group.add(createCrateStack(-6.2, -7.6));

  const travelTrunk = new THREE.Group();
  travelTrunk.position.set(6.8, BELARUS_GROUND_Y + 0.18, -7.4);
  travelTrunk.rotation.y = -0.28;
  travelTrunk.add(createMesh(new THREE.BoxGeometry(1.2, 0.48, 0.7), createSurfaceMaterial(0x6f4f38), {
    position: new THREE.Vector3(0, 0.24, 0), castShadow: true, receiveShadow: true
  }));
  travelTrunk.add(createMesh(new THREE.BoxGeometry(1.24, 0.12, 0.74), createSurfaceMaterial(0x8f6a4d), {
    position: new THREE.Vector3(0, 0.54, 0), castShadow: true, receiveShadow: true
  }));
  travelTrunk.add(createMesh(new THREE.BoxGeometry(0.18, 0.12, 0.12), createSurfaceMaterial(COLORS.rail), {
    position: new THREE.Vector3(0, 0.42, 0.38), castShadow: true, receiveShadow: true
  }));
  group.add(travelTrunk);

  const satchel = new THREE.Group();
  satchel.position.set(8.7, BELARUS_GROUND_Y + 0.14, -9.1);
  satchel.rotation.y = 0.42;
  satchel.add(createMesh(new THREE.BoxGeometry(0.65, 0.34, 0.3), createSurfaceMaterial(0x7b5b3f), {
    position: new THREE.Vector3(0, 0.17, 0), castShadow: true, receiveShadow: true
  }));
  satchel.add(createMesh(new THREE.TorusGeometry(0.16, 0.02, 6, 14, Math.PI), createSurfaceMaterial(0x4a3423), {
    position: new THREE.Vector3(0, 0.4, -0.02), rotationX: Math.PI, castShadow: true, receiveShadow: true
  }));
  group.add(satchel);

  group.add(createForestCluster(-46, 6, {
    primaryVariant: "round",
    secondaryVariant: "small",
    accentVariant: "small",
    scale: 0.94,
    width: 7.4,
    depth: 7
  }));
  group.add(createForestCluster(44, 16, {
    primaryVariant: "round",
    secondaryVariant: "small",
    accentVariant: "small",
    scale: 0.96,
    width: 7.8,
    depth: 7.2
  }));
  group.add(createForestCluster(-56, -22, {
    primaryVariant: "tall",
    secondaryVariant: "round",
    accentVariant: "small",
    scale: 1.04,
    width: 8.2,
    depth: 7.6
  }));
  group.add(createForestCluster(54, -24, {
    primaryVariant: "tall",
    secondaryVariant: "round",
    accentVariant: "small",
    scale: 1.06,
    width: 8.4,
    depth: 7.8
  }));
  group.add(createTree(-34, 18, 0.92, 0.18, "small"));
  group.add(createTree(28, 22, 0.88, -0.12, "small"));
  group.add(createTree(-24, -24, 0.94, 0.08, "round"));
  group.add(createTree(18, -26, 0.9, -0.1, "round"));
  group.add(createVegetationCluster(-30, 12, 0.86, { includeBush: true, spread: 0.94 }));
  group.add(createVegetationCluster(24, 12, 0.82, { includeBush: true, spread: 0.9 }));

  return group;
}

function createRailroad() {
  const group = new THREE.Group();
  group.name = "railroad";

  const ballastSegments = [
    { x: -36, z: -16, width: 92 },
    { x: 32, z: -16, width: 58 }
  ];

  ballastSegments.forEach((segment) => {
    group.add(createFlatSurface(segment.width, 10.4, COLORS.ballast, {
      x: segment.x, z: segment.z, thickness: 0.02, topOffset: 0.001
    }));
  });

  for (const railOffset of [-1.9, 1.9]) {
    ballastSegments.forEach((segment) => {
      group.add(createMesh(new THREE.BoxGeometry(segment.width + 1, 0.08, 0.18), createSurfaceMaterial(COLORS.rail), {
        position: new THREE.Vector3(segment.x, BELARUS_GROUND_Y + 0.05, segment.z + railOffset), castShadow: true, receiveShadow: true
      }));
    });
  }

  for (let index = 0; index < 34; index += 1) {
    const x = -58 + index * 4;
    group.add(createMesh(new THREE.BoxGeometry(2.8, 0.06, 4.8), createSurfaceMaterial(COLORS.sleeper), {
      position: new THREE.Vector3(x, BELARUS_GROUND_Y + 0.03, -16), castShadow: true, receiveShadow: true
    }));
  }

  return group;
}

function createRoadMeshes() {
  const group = new THREE.Group();
  group.name = "road_meshes";

  for (let index = 0; index < ROAD_SEGMENTS; index += 1) {
    const startProgress = index / ROAD_SEGMENTS;
    const endProgress = (index + 1) / ROAD_SEGMENTS;
    const start = sampleRoadPointAndNormal(startProgress);
    const end = sampleRoadPointAndNormal(endProgress);
    const segmentVector = end.point.clone().sub(start.point);
    const segmentLength = segmentVector.length();
    const midpoint = start.point.clone().lerp(end.point, 0.5);
    const rotationY = Math.atan2(segmentVector.x, segmentVector.z);
    const width = getRoadWidthAtProgress((startProgress + endProgress) * 0.5);

    group.add(createFlatSurface(width + 1.35, segmentLength + 0.2, COLORS.roadEdge, {
      x: midpoint.x,
      z: midpoint.z,
      thickness: 0.004,
      topOffset: 0.002,
      rotationY
    }));
    group.add(createFlatSurface(width + 0.55, segmentLength + 0.12, COLORS.roadLight, {
      x: midpoint.x,
      z: midpoint.z,
      thickness: 0.004,
      topOffset: 0.0046,
      rotationY
    }));
    group.add(createFlatSurface(width, segmentLength + 0.08, COLORS.road, {
      x: midpoint.x,
      z: midpoint.z,
      thickness: 0.004,
      topOffset: 0.0072,
      rotationY,
      material: createRoadMaterial(segmentLength)
    }));
  }

  const widerPatches = [
    { progress: 0.06, width: 5.4, depth: 10 },
    { progress: 0.34, width: 4.6, depth: 8.8 },
    { progress: 0.66, width: 5, depth: 10.5 },
    { progress: 0.78, width: 3.9, depth: 9.5 },
    { progress: 0.9, width: 3.6, depth: 8.5 },
    { progress: 0.97, width: 3.4, depth: 8 }
  ];

  widerPatches.forEach((patch) => {
    const anchor = sampleRoadPointAndNormal(patch.progress);
    group.add(createFlatSurface(patch.width, patch.depth, COLORS.road, {
      x: anchor.point.x,
      z: anchor.point.z,
      thickness: 0.004,
      topOffset: 0.0072,
      rotationY: anchor.rotationY,
      material: createRoadMaterial(patch.depth)
    }));
  });

  const lakeAnchor = sampleRoadPointAndNormal(0.955);
  group.add(createRoadConnector(lakeAnchor.point, new THREE.Vector3(11, BELARUS_GROUND_Y, 233.5), 2.8));

  return group;
}

function createRoadEdgeDetails() {
  const group = new THREE.Group();
  group.name = "road_edge_details";

  const edgeMarkers = [0.08, 0.14, 0.22, 0.3, 0.38, 0.47, 0.56, 0.66, 0.76, 0.86, 0.94];

  edgeMarkers.forEach((progress, index) => {
    const anchor = sampleRoadPointAndNormal(progress);
    const width = getRoadWidthAtProgress(progress);

    ["left", "right"].forEach((sideName, sideIndex) => {
      const side = sideName === "left" ? anchor.left : anchor.right;
      const edgeBase = anchor.point.clone().add(side.clone().multiplyScalar(width * 0.5 + 1.2));
      const dirtBase = anchor.point.clone().add(side.clone().multiplyScalar(width * 0.5 + 0.8));
      const tangentShift = anchor.tangent.clone().multiplyScalar(sideIndex === 0 ? -0.6 : 0.6);
      const shoulderTopOffset = progress < 0.16 ? 0.0038 : 0.0024;

      group.add(
        createFlatSurface(1.7, 4.8, COLORS.yardSoil, {
          x: dirtBase.x + tangentShift.x,
          z: dirtBase.z + tangentShift.z,
          thickness: 0.004,
          topOffset: shoulderTopOffset,
          rotationY: anchor.rotationY + (sideIndex === 0 ? -0.08 : 0.08)
        })
      );
      group.add(createGrassClump(edgeBase.x + tangentShift.x * 0.5, edgeBase.z + tangentShift.z * 0.5, 0.9 + (index % 3) * 0.08));

      if ((index + sideIndex) % 2 === 0 && progress < 0.72) {
        group.add(createBush(edgeBase.x + side.x * 1.1, edgeBase.z + side.z * 1.1, 0.72 + (index % 2) * 0.1));
      }
    });
  });

  return group;
}
function createRoadConnector(startPoint, endPoint, width) {
  const direction = endPoint.clone().sub(startPoint).setY(0);
  const length = direction.length();
  const midpoint = startPoint.clone().lerp(endPoint, 0.5);
  const rotationY = Math.atan2(direction.x, direction.z);
  const group = new THREE.Group();

  group.add(createFlatSurface(width + 1.25, length + 0.2, COLORS.roadEdge, {
    x: midpoint.x, z: midpoint.z, thickness: 0.004, topOffset: 0.002, rotationY
  }));
  group.add(createFlatSurface(width + 0.45, length + 0.1, COLORS.roadLight, {
    x: midpoint.x, z: midpoint.z, thickness: 0.004, topOffset: 0.0046, rotationY
  }));
  group.add(createFlatSurface(width, length, COLORS.road, {
    x: midpoint.x, z: midpoint.z, thickness: 0.004, topOffset: 0.0072, rotationY, material: createRoadMaterial(length)
  }));

  return group;
}

function createVillageHouses() {
  const group = new THREE.Group();
  group.name = "village_houses";

  HOUSE_CONFIGS.forEach((config, index) => {
    group.add(createHouseSurface(config));
    group.add(createHouse(config, index));
    group.add(createHouseYard(config, index));

    if (index % 2 === 0) {
      const shedOffset = config.side === "left" ? 3.3 : -3.3;
      group.add(createShed(config.position.x + config.right.x * shedOffset, config.position.z + config.right.z * shedOffset, config.rotationY + 0.1 * shedOffset / 3.3));
    }
  });

  return group;
}

function createHouseSurface(config) {
  const frontPatch = config.position.clone().add(config.toRoad.clone().multiplyScalar(config.yardDepth * 0.22));

  return createFlatSurface(config.size[0] + 3.4, config.yardDepth * 0.55, COLORS.roadLight, {
    x: frontPatch.x,
    z: frontPatch.z,
    thickness: 0.004,
    topOffset: 0.0032,
    rotationY: config.rotationY
  });
}

function createHouseYard(config, index) {
  const group = new THREE.Group();
  const yardCenter = config.position.clone().add(config.toRoad.clone().multiplyScalar(-config.yardDepth * 0.45));
  const yardWidth = config.size[0] + 3.8;
  const yardDepth = config.yardDepth;

  group.add(createFlatSurface(yardWidth, yardDepth, index % 2 === 0 ? COLORS.garden : COLORS.penGround, {
    x: yardCenter.x,
    z: yardCenter.z,
    thickness: 0.004,
    topOffset: 0.0024,
    rotationY: config.rotationY
  }));
  group.add(createFenceRectangle({
    center: yardCenter,
    width: yardWidth + 0.8,
    depth: yardDepth + 0.4,
    rotationY: config.rotationY,
    gateOffset: index % 2 === 0 ? -1.5 : 1.4
  }));

  if (index % 3 === 0) {
    group.add(createGardenPlot(yardCenter.x + config.right.x * 1.5, yardCenter.z + config.right.z * 1.5, config.rotationY));
    group.add(createWoodPile(yardCenter.x - config.right.x * 2, yardCenter.z - config.right.z * 2, config.rotationY + 0.12));
  } else if (index % 3 === 1) {
    group.add(createAnimalPen(yardCenter.x, yardCenter.z, config.rotationY));
    group.add(createLaundryLine(yardCenter.x + config.right.x * 1.4, yardCenter.z + config.right.z * 1.4, config.rotationY));
  } else {
    group.add(createGardenPlot(yardCenter.x, yardCenter.z, config.rotationY + 0.08));
    group.add(createCrateStack(yardCenter.x - config.right.x * 1.2, yardCenter.z - config.right.z * 1.2));
  }

  group.add(createVegetationCluster(yardCenter.x + config.right.x * 2.1, yardCenter.z + config.right.z * 2.1, 0.92, { includeBush: index % 2 === 0 }));
  group.add(createVegetationCluster(yardCenter.x - config.right.x * 2.25, yardCenter.z - config.right.z * 2.25, 0.84, { includeBush: false, spread: 0.95 }));
  group.add(createVegetationCluster(yardCenter.x - config.toRoad.x * 1.6, yardCenter.z - config.toRoad.z * 1.6, 0.78 + (index % 2) * 0.08, { includeBush: true, spread: 1.05 }));
  if (index % 2 === 0) {
    group.add(createRock(yardCenter.x + config.right.x * 2.3 - config.toRoad.x * 0.8, yardCenter.z + config.right.z * 2.3 - config.toRoad.z * 0.8, 0.72 + (index % 3) * 0.08, config.rotationY + 0.2, index % 3 === 0 ? "flat" : "small"));
  }

  return group;
}

function createFields() {
  const group = new THREE.Group();
  group.name = "fields";

  const fieldPlacements = [
    { progress: 0.18, side: "left", distance: 23, width: 24, depth: 30, rotation: -0.12 },
    { progress: 0.28, side: "right", distance: 23, width: 22, depth: 30, rotation: 0.08 },
    { progress: 0.42, side: "left", distance: 26, width: 24, depth: 32, rotation: -0.1 },
    { progress: 0.49, side: "right", distance: 25, width: 24, depth: 30, rotation: 0.12 },
    { progress: 0.6, side: "right", distance: 29, width: 26, depth: 36, rotation: 0.05 }
  ];

  fieldPlacements.forEach((field) => {
    const anchor = sampleRoadPointAndNormal(field.progress);
    const side = field.side === "left" ? anchor.left : anchor.right;
    const center = anchor.point.clone().add(side.clone().multiplyScalar(field.distance));

    group.add(createFlatSurface(field.width, field.depth, COLORS.wheat, {
      x: center.x,
      z: center.z,
      thickness: 0.01,
      topOffset: 0.034,
      rotationY: anchor.rotationY + field.rotation
    }));

    const furrowCount = Math.floor(field.width / 2.8);
    for (let index = 0; index < furrowCount; index += 1) {
      const offset = -field.width * 0.45 + index * 2.7;
      const furrowCenter = center.clone().add(anchor.right.clone().multiplyScalar(offset));
      group.add(createFlatSurface(0.4, field.depth - 1.2, COLORS.wheatDark, {
        x: furrowCenter.x,
        z: furrowCenter.z,
        thickness: 0.006,
        topOffset: 0.045,
        rotationY: anchor.rotationY + field.rotation
      }));
    }
  });

  return group;
}

function createChurch() {
  const group = new THREE.Group();
  group.name = "church_zone";

  const placement = getRoadPlacement(CHURCH_PLACEMENT);
  group.add(createFlatSurface(17, 14.5, COLORS.roadLight, {
    x: placement.position.x,
    z: placement.position.z,
    thickness: 0.004,
    topOffset: 0.0032,
    rotationY: placement.rotationY - 0.16
  }));

  const church = new THREE.Group();
  church.position.set(placement.position.x, BELARUS_GROUND_Y, placement.position.z);
  church.rotation.y = placement.rotationY - 0.18;

  const localHealCenter = new THREE.Vector3(0, BELARUS_GROUND_Y, 2.2);
  const localRecoveryPosition = new THREE.Vector3(0, BELARUS_GROUND_Y, 1.6);
  const healCenter = localHealCenter.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), church.rotation.y).add(church.position);
  const recoveryPosition = localRecoveryPosition.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), church.rotation.y).add(church.position);

  church.add(createMesh(new THREE.BoxGeometry(9, 6.2, 12), createSurfaceMaterial(COLORS.churchWall), { position: new THREE.Vector3(0, 3.1, 0), castShadow: true, receiveShadow: true }));
  church.add(createMesh(new THREE.ConeGeometry(7.8, 4, 4), createSurfaceMaterial(COLORS.churchRoof), { position: new THREE.Vector3(0, 8.3, 0), rotationY: Math.PI / 4, castShadow: true, receiveShadow: true }));
  church.add(createMesh(new THREE.BoxGeometry(3.6, 8.8, 3.6), createSurfaceMaterial(COLORS.churchWall), { position: new THREE.Vector3(0, 6, 6.3), castShadow: true, receiveShadow: true }));
  church.add(createMesh(new THREE.ConeGeometry(2.7, 4.2, 4), createSurfaceMaterial(COLORS.churchRoof), { position: new THREE.Vector3(0, 12.3, 6.3), rotationY: Math.PI / 4, castShadow: true, receiveShadow: true }));
  church.add(createMesh(new THREE.BoxGeometry(0.7, 2.6, 0.7), createSurfaceMaterial(COLORS.churchAccent), { position: new THREE.Vector3(0, 15, 6.3), castShadow: true, receiveShadow: true }));
  church.add(createMesh(new THREE.BoxGeometry(7.6, 0.22, 0.22), createSurfaceMaterial(COLORS.churchAccent), { position: new THREE.Vector3(0, 6.2, 5.98), castShadow: true, receiveShadow: true }));
  church.add(createMesh(new THREE.BoxGeometry(0.22, 6.6, 0.22), createSurfaceMaterial(COLORS.churchAccent), { position: new THREE.Vector3(0, 4.9, 5.98), castShadow: true, receiveShadow: true }));
  church.add(createDoor({ position: [0, 1.55, 6.08], width: 1.8, height: 3.1, color: COLORS.churchRoof }));
  addGlowingWindow(church, { position: [-2.3, 3.4, 6.08], scale: [0.85, 1.8, 0.12] });
  addGlowingWindow(church, { position: [2.3, 3.4, 6.08], scale: [0.85, 1.8, 0.12] });
  addGlowingWindow(church, { position: [-4.55, 3.2, 0], scale: [0.12, 2.1, 1.2] });
  addGlowingWindow(church, { position: [4.55, 3.2, 0], scale: [0.12, 2.1, 1.2] });
  addGlowingWindow(church, { position: [0, 7.4, 8.12], scale: [0.72, 1.3, 0.12] });
  church.add(createPointLightOrb([0, 3.8, 10.3], COLORS.lampGlow, 1.15, 18));

  group.add(church);
  group.add(createLampPost(placement.roadPoint.x + placement.right.x * 5.2, placement.roadPoint.z + placement.right.z * 5.2));
  group.add(createLampPost(placement.roadPoint.x + placement.tangent.x * 10 + placement.right.x * 2.6, placement.roadPoint.z + placement.tangent.z * 10 + placement.right.z * 2.6));
  group.add(createBench(placement.position.x + 5.2, placement.position.z + 7.8, placement.rotationY + 0.35));
  group.add(createWell(placement.position.x - 8.5, placement.position.z + 2));

  return {
    group,
    healing: {
      center: healCenter,
      recoveryPosition,
      interactRadius: 2.4,
      facingY: church.rotation.y
    }
  };
}

function createShrineSystem() {
  const group = new THREE.Group();
  group.name = "shrine_system";

  let state = Object.fromEntries(
    SHRINE_DEFINITIONS.map((definition) => [definition.id, { lit: false }])
  );
  const hooks = [];
  const orbAnchors = [];
  const shrineViews = [];
  const pulseStates = new Map();
  let hasAnimatedShrines = false;

  SHRINE_DEFINITIONS.forEach((definition, index) => {
    const shrineGroup = new THREE.Group();
    shrineGroup.position.copy(definition.position);

    shrineGroup.add(createMesh(
      new THREE.CylinderGeometry(0.85, 1.05, 0.32, 18),
      createSurfaceMaterial(0x5f6770),
      {
        position: new THREE.Vector3(0, 0.16, 0),
        castShadow: true,
        receiveShadow: true
      }
    ));
    [-1, 1].forEach((direction) => {
      shrineGroup.add(createMesh(
        new THREE.BoxGeometry(0.46, 0.22, 0.28),
        createSurfaceMaterial(COLORS.stone),
        {
          position: new THREE.Vector3(direction * 0.84, 0.16, 0.3 * direction),
          rotationY: direction * 0.35,
          castShadow: true,
          receiveShadow: true
        }
      ));
      shrineGroup.add(createMesh(
        new THREE.BoxGeometry(0.34, 0.18, 0.22),
        createSurfaceMaterial(COLORS.grave),
        {
          position: new THREE.Vector3(direction * 0.58, 0.12, -0.64 * direction),
          rotationY: -direction * 0.28,
          castShadow: true,
          receiveShadow: true
        }
      ));
    });
    shrineGroup.add(createMesh(
      new THREE.OctahedronGeometry(0.34, 0),
      createSurfaceMaterial(COLORS.shrineDormant, {
        emissive: 0x2f4352,
        emissiveIntensity: 0.14
      }),
      {
        position: new THREE.Vector3(0, 0.92, 0),
        castShadow: true,
        receiveShadow: true
      }
    ));

    const shrineGlow = createGlowOrb({ position: [0, 0.94, 0], radius: 0.18, color: COLORS.shrineLit });
    shrineGlow.material.transparent = true;
    shrineGlow.material.opacity = 0.36;
    shrineGroup.add(shrineGlow);

    const shrineLight = new THREE.PointLight(
      COLORS.shrineLit,
      isLowPerformanceMode() ? 0.08 : 0.12,
      isLowPerformanceMode() ? 4.4 : 5.6,
      2
    );
    shrineLight.position.set(0, 0.96, 0);
    shrineGroup.add(shrineLight);

    group.add(shrineGroup);

    hooks.push({
      id: definition.id,
      position: {
        x: definition.position.x,
        y: BELARUS_GROUND_Y,
        z: definition.position.z
      },
      radius: 2.6,
      prompt: "Press E to light shrine"
    });

    orbAnchors.push({
      id: definition.id,
      home: {
        x: definition.position.x + Math.sin(index * 1.37) * 1.6,
        y: BELARUS_GROUND_Y + 1.45,
        z: definition.position.z + Math.cos(index * 1.37) * 1.6
      }
    });

    pulseStates.set(definition.id, 0);
    shrineViews.push({
      id: definition.id,
      shrineGlow,
      shrineLight,
      pulsePhase: index * 0.73
    });
  });

  function applyStaticVisualState() {
    hasAnimatedShrines = false;

    shrineViews.forEach(({ id, shrineGlow, shrineLight }) => {
      const lit = Boolean(state[id]?.lit);
      if (lit) {
        hasAnimatedShrines = true;
      }

      shrineGlow.material.opacity = lit ? 0.78 : 0.22;
      shrineGlow.material.color.setHex(lit ? COLORS.shrineLit : COLORS.shrineDormant);
      shrineLight.color.setHex(lit ? COLORS.shrinePulse : COLORS.shrineDormant);
      shrineGlow.scale.setScalar(lit ? 1.04 : 0.82);
      shrineLight.intensity = lit
        ? (isLowPerformanceMode() ? 0.34 : 0.52)
        : (isLowPerformanceMode() ? 0.04 : 0.08);
    });
  }

  function setState(nextState = {}) {
    const previousState = state;
    state = Object.fromEntries(
      SHRINE_DEFINITIONS.map((definition) => [
        definition.id,
        {
          lit: Boolean(nextState?.[definition.id]?.lit)
        }
      ])
    );

    SHRINE_DEFINITIONS.forEach((definition) => {
      if (!previousState?.[definition.id]?.lit && state[definition.id]?.lit) {
        pulseStates.set(definition.id, 0.75);
      }
    });
    applyStaticVisualState();
  }

  applyStaticVisualState();

  return {
    group,
    hooks,
    orbAnchors,
    setState,
    getState: () => structuredClone(state),
    update(time) {
      if (!hasAnimatedShrines && ![...pulseStates.values()].some((value) => value > 0)) {
        return;
      }

      shrineViews.forEach(({ id, shrineGlow, shrineLight, pulsePhase }) => {
        const lit = Boolean(state[id]?.lit);
        const pulseTime = pulseStates.get(id) ?? 0;

        if (!lit && pulseTime <= 0) {
          return;
        }

        const wave = lit ? Math.sin(time * 2.2 + pulsePhase) * 0.06 : 0;
        const baseIntensity = lit
          ? (isLowPerformanceMode() ? 0.34 : 0.52)
          : (isLowPerformanceMode() ? 0.04 : 0.08);
        shrineLight.intensity = baseIntensity + wave + pulseTime * (isLowPerformanceMode() ? 0.22 : 0.34);
        shrineGlow.scale.setScalar((lit ? 1.04 + wave : 0.82) + pulseTime * 0.08);
        shrineGlow.material.opacity = (lit ? 0.78 : 0.22) + pulseTime * 0.12;
      });

      pulseStates.forEach((value, key) => {
        if (value > 0) {
          pulseStates.set(key, Math.max(0, value - 0.04));
        }
      });
    }
  };
}

function createShrineAtmosphereDetails() {
  const group = new THREE.Group();
  group.name = "shrine_atmosphere_details";

  const forestShrines = SHRINE_DEFINITIONS.filter((definition) =>
    definition.id.includes("corridor") ||
    definition.id.includes("lake") ||
    definition.id.includes("church")
  );

  forestShrines.forEach((definition, index) => {
    const baseX = definition.position.x;
    const baseZ = definition.position.z;
    const ringOffsets = [
      [-3.4, -1.8],
      [3.1, -2.4],
      [-2.6, 3.4],
      [2.9, 3.1]
    ];

    ringOffsets.forEach(([offsetX, offsetZ], offsetIndex) => {
      const x = baseX + offsetX;
      const z = baseZ + offsetZ;

      if (!isInsideRoadClearance(x, z) && !isInsideLakeWaterArea(x, z)) {
        group.add(createVegetationCluster(x, z, 0.92 + ((index + offsetIndex) % 3) * 0.1, {
          includeBush: (offsetIndex + index) % 2 === 0,
          spread: 1.02
        }));
      }
    });

    [
      [-4.6, 0.8, "flat"],
      [4.2, -0.4, "small"]
    ].forEach(([offsetX, offsetZ, variant], rockIndex) => {
      const x = baseX + offsetX;
      const z = baseZ + offsetZ;
      if (!isInsideRoadClearance(x, z) && !isInsideLakeWaterArea(x, z)) {
        group.add(createRock(x, z, 0.88 + rockIndex * 0.08, (index + rockIndex) * 0.25, variant));
      }
    });

    group.add(createGrassClump(baseX - 1.8, baseZ + 2.2, 0.96));
    group.add(createGrassClump(baseX + 2.1, baseZ - 2.4, 0.88));
  });

  return group;
}

function createEnvironmentDressingPass() {
  const group = new THREE.Group();
  group.name = "environment_dressing_pass";

  group.add(createShrineGroveDressing());
  group.add(createOffRoadForestDressing());
  group.add(createStationSurroundingsDressing());
  group.add(createRoadEdgeNatureDressing());
  group.add(createLakeSurroundingsDressing());

  return group;
}

function createShrineGroveDressing() {
  const group = new THREE.Group();
  group.name = "shrine_grove_dressing";

  const groveShrines = SHRINE_DEFINITIONS.filter((definition) =>
    definition.id.includes("corridor") ||
    definition.id.includes("lake") ||
    definition.id.includes("church")
  );

  groveShrines.forEach((definition, index) => {
    const x = definition.position.x;
    const z = definition.position.z;
    const angleSeed = seededTreeNoise(x * 0.02 + z * 0.03 + index);

    [
      { x: -5.8, z: -3.2, type: "rock" },
      { x: 5.2, z: -2.8, type: "bush" },
      { x: -4.4, z: 4.8, type: "veg" },
      { x: 4.8, z: 4.6, type: "veg" },
      { x: -6.6, z: 0.8, type: "log" },
      { x: 6.9, z: 1.1, type: "stone" }
    ].forEach((offset, offsetIndex) => {
      const pointX = x + offset.x;
      const pointZ = z + offset.z;

      if (isInsideRoadSafeCorridor(pointX, pointZ) || isInsideRoadClearance(pointX, pointZ) || isInsideLakeWaterArea(pointX, pointZ)) {
        return;
      }

      if (offset.type === "rock") {
        group.add(createRock(pointX, pointZ, 0.98 + (offsetIndex % 2) * 0.1, angleSeed + offsetIndex * 0.3, offsetIndex % 2 === 0 ? "large" : "flat"));
      } else if (offset.type === "bush") {
        group.add(createBush(pointX, pointZ, 1.05, "lush"));
        group.add(createVegetationCluster(pointX - 1.1, pointZ + 0.8, 0.92, { includeBush: false, spread: 0.88 }));
      } else if (offset.type === "veg") {
        group.add(createVegetationCluster(pointX, pointZ, 1 + (offsetIndex % 2) * 0.08, { includeBush: true, spread: 0.96 }));
      } else if (offset.type === "log") {
        group.add(createFallenTimber(pointX, pointZ, angleSeed + 0.8, 0.92));
      } else if (offset.type === "stone") {
        group.add(createStoneMarkerCluster(pointX, pointZ, angleSeed - 0.45, 0.92));
      }
    });
  });

  return group;
}

function createOffRoadForestDressing() {
  const group = new THREE.Group();
  group.name = "offroad_forest_dressing";

  const forestPockets = [
    { x: -62, z: 182, scale: 1.08, variant: "tall" },
    { x: 68, z: 188, scale: 1.06, variant: "tall" },
    { x: -72, z: 216, scale: 1.12, variant: "round" },
    { x: 76, z: 226, scale: 1.14, variant: "round" },
    { x: -64, z: 254, scale: 1.18, variant: "tall" },
    { x: 70, z: 266, scale: 1.16, variant: "tall" },
    { x: -34, z: 292, scale: 1.04, variant: "round" },
    { x: 42, z: 300, scale: 1.06, variant: "round" }
  ];

  forestPockets.forEach((pocket, index) => {
    group.add(createForestCluster(pocket.x, pocket.z, {
      primaryVariant: pocket.variant,
      secondaryVariant: index % 2 === 0 ? "round" : "small",
      accentVariant: "small",
      scale: pocket.scale,
      width: 9.4,
      depth: 8.8
    }));

    [
      [-4.4, -2.8],
      [4.8, -1.9],
      [-3.6, 4.2],
      [4.2, 3.9]
    ].forEach(([dx, dz], clusterIndex) => {
      const pointX = pocket.x + dx;
      const pointZ = pocket.z + dz;

      if (isInsideRoadSafeCorridor(pointX, pointZ) || isInsideRoadClearance(pointX, pointZ) || isInsideLakeWaterArea(pointX, pointZ)) {
        return;
      }

      group.add(createVegetationCluster(pointX, pointZ, 0.98 + (clusterIndex % 2) * 0.1, {
        includeBush: clusterIndex % 2 === 0,
        spread: 1.06
      }));
      if (clusterIndex % 2 === 0) {
        group.add(createRock(pointX + 1.4, pointZ - 0.8, 0.96, clusterIndex * 0.22, clusterIndex === 0 ? "large" : "flat"));
      }
    });
  });

  return group;
}

function createStationSurroundingsDressing() {
  const group = new THREE.Group();
  group.name = "station_surroundings_dressing";

  [
    { x: -44, z: -4, scale: 1.02, variant: "round" },
    { x: 46, z: 6, scale: 1.06, variant: "round" },
    { x: -52, z: -24, scale: 1.1, variant: "tall" },
    { x: 56, z: -18, scale: 1.1, variant: "tall" }
  ].forEach((cluster) => {
    group.add(createForestCluster(cluster.x, cluster.z, {
      primaryVariant: cluster.variant,
      secondaryVariant: "small",
      accentVariant: "small",
      scale: cluster.scale,
      width: 7.8,
      depth: 7.2
    }));
  });

  [
    [-40, 12],
    [39, 14],
    [-34, -18],
    [30, -22]
  ].forEach(([x, z], index) => {
    if (!isInsideRoadSafeCorridor(x, z)) {
      group.add(createVegetationCluster(x, z, 0.94 + (index % 2) * 0.08, { includeBush: true, spread: 0.96 }));
      group.add(createRock(x + 2.4, z - 1.3, 0.84 + (index % 3) * 0.06, index * 0.2, index % 2 === 0 ? "small" : "flat"));
    }
  });

  return group;
}

function createRoadEdgeNatureDressing() {
  const group = new THREE.Group();
  group.name = "road_edge_nature_dressing";

  const samples = [0.08, 0.16, 0.24, 0.32, 0.46, 0.58, 0.7, 0.82, 0.9];
  samples.forEach((progress, index) => {
    const anchor = sampleRoadPointAndNormal(progress);
    const roadWidth = getRoadWidthAtProgress(progress);
    const leftBase = {
      x: anchor.point.x + anchor.left.x * (roadWidth * 1.45 + 0.8),
      z: anchor.point.z + anchor.left.z * (roadWidth * 1.45 + 0.8)
    };
    const rightBase = {
      x: anchor.point.x + anchor.right.x * (roadWidth * 1.45 + 0.8),
      z: anchor.point.z + anchor.right.z * (roadWidth * 1.45 + 0.8)
    };

    [leftBase, rightBase].forEach((base, sideIndex) => {
      if (isInsideRoadSafeCorridor(base.x, base.z) && progress < 0.12) {
        return;
      }

      group.add(createVegetationCluster(base.x, base.z, 0.78 + ((index + sideIndex) % 2) * 0.08, {
        includeBush: false,
        spread: 0.82
      }));

      if ((index + sideIndex) % 3 === 0) {
        group.add(createRock(
          base.x + anchor.tangent.x * 0.8,
          base.z + anchor.tangent.z * 0.8,
          0.7,
          anchor.rotationY + 0.2,
          "small"
        ));
      }
    });
  });

  return group;
}

function createLakeSurroundingsDressing() {
  const group = new THREE.Group();
  group.name = "lake_surroundings_dressing";

  [
    { x: -26, z: 236, type: "stone" },
    { x: 24, z: 240, type: "stone" },
    { x: -18, z: 247, type: "log" },
    { x: 18, z: 249, type: "log" },
    { x: -30, z: 256, type: "veg" },
    { x: 32, z: 258, type: "veg" }
  ].forEach((item, index) => {
    if (isInsideRoadSafeCorridor(item.x, item.z) || isInsideLakeWaterArea(item.x, item.z)) {
      return;
    }

    if (item.type === "stone") {
      group.add(createStoneMarkerCluster(item.x, item.z, index * 0.32, 1));
      group.add(createBush(item.x + 1.8, item.z - 0.6, 0.92, "lush"));
    } else if (item.type === "log") {
      group.add(createFallenTimber(item.x, item.z, index * 0.38 + 0.2, 0.98));
      group.add(createVegetationCluster(item.x - 1.2, item.z + 0.9, 0.82, { includeBush: false, spread: 0.84 }));
    } else {
      group.add(createVegetationCluster(item.x, item.z, 1.08, { includeBush: true, spread: 1.08 }));
      group.add(createRock(item.x + 2.1, item.z + 0.7, 0.92, -0.18, "flat"));
    }
  });

  return group;
}

function createChurchRitualSystem() {
  const group = new THREE.Group();
  group.name = "church_ritual";

  const placement = getRoadPlacement(CHURCH_PLACEMENT);
  const rotationY = placement.rotationY - 0.18;
  const upAxis = new THREE.Vector3(0, 1, 0);
  const ritualForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(upAxis, rotationY).normalize();
  const ritualRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(upAxis, rotationY).normalize();
  const doorCenter = placement.position.clone().add(ritualForward.clone().multiplyScalar(6.25));
  const ritualCenter = doorCenter.clone().add(ritualForward.clone().multiplyScalar(-0.65));

  const hookDefs = [
    {
      id: "bell",
      label: "Bell Rope",
      prompt: "Press E to ring the bell rope",
      position: doorCenter.clone().add(ritualRight.clone().multiplyScalar(2.5)).add(ritualForward.clone().multiplyScalar(-0.35)),
      radius: 2.1,
      color: 0xf4d694
    },
    {
      id: "thread",
      label: "White Thread",
      prompt: "Press E to touch the white thread",
      position: doorCenter.clone().add(ritualRight.clone().multiplyScalar(-2.85)).add(ritualForward.clone().multiplyScalar(-0.2)),
      radius: 2.05,
      color: 0xe7eef5
    },
    {
      id: "lake",
      label: "Lake Candle",
      prompt: "Press E to light the lake candle",
      position: ritualCenter.clone().add(ritualForward.clone().multiplyScalar(-2.75)).add(ritualRight.clone().multiplyScalar(0.35)),
      radius: 2.2,
      color: 0x7bc8ff
    }
  ];

  const elementViews = new Map();
  let state = {
    progress: [],
    solved: false,
    graveyardUnlocked: false,
    lastEventType: null,
    lastElementId: null,
    lastEventNonce: 0
  };
  let lastEventNonce = 0;
  let lastUpdateTime = 0;
  let resetFlashTime = 0;
  let resetElementId = null;
  let successPulseTime = 0;

  hookDefs.forEach((hook) => {
    const view = hook.id === "bell"
      ? createBellRitualElement(hook.position)
      : hook.id === "thread"
        ? createThreadRitualElement(hook.position)
        : createLakeRitualElement(hook.position, rotationY);
    elementViews.set(hook.id, view);
    group.add(view.group);
  });

  const successOrb = createGlowOrb({ position: [ritualCenter.x, BELARUS_GROUND_Y + 1.85, ritualCenter.z], radius: 0.26, color: 0xaee7ff });
  successOrb.visible = false;
  group.add(successOrb);

  const successLight = new THREE.PointLight(0xaee7ff, 0, 12, 2);
  successLight.position.set(ritualCenter.x, BELARUS_GROUND_Y + 2.05, ritualCenter.z);
  group.add(successLight);

  function setState(nextState = {}) {
    state = {
      progress: Array.isArray(nextState.progress) ? nextState.progress.filter((id) => hookDefs.some((hook) => hook.id === id)) : [],
      solved: Boolean(nextState.solved),
      graveyardUnlocked: Boolean(nextState.graveyardUnlocked),
      lastEventType: nextState.lastEventType ?? null,
      lastElementId: nextState.lastElementId ?? null,
      lastEventNonce: Number.isFinite(nextState.lastEventNonce) ? nextState.lastEventNonce : 0
    };

    if (state.lastEventNonce !== lastEventNonce) {
      if (state.lastEventType === "reset") {
        resetFlashTime = 0.58;
        resetElementId = state.lastElementId;
      }

      if (state.lastEventType === "success") {
        successPulseTime = 1.9;
      }

      lastEventNonce = state.lastEventNonce;
    }

    applyVisualState(0);
  }

  function applyVisualState(time) {
    const progressSet = new Set(state.progress);

    hookDefs.forEach((hook) => {
      const view = elementViews.get(hook.id);

      if (!view) {
        return;
      }

      let color = hook.color;
      let intensity = 0.24;
      let scale = 0.84;

      if (progressSet.has(hook.id) || state.solved) {
        intensity = 0.72;
        scale = 1.02;
      }

      if (resetFlashTime > 0 && resetElementId === hook.id) {
        color = 0x9ec7ff;
        intensity = 0.38 + Math.sin(time * 18) * 0.08;
        scale = 0.94;
      }

      if (state.solved && successPulseTime > 0) {
        const pulse = 0.85 + Math.sin(time * 6) * 0.25;
        intensity = 1.15 + pulse * 0.35;
        scale = 1.08 + pulse * 0.08;
      }

      view.glow.material.color.setHex(color);
      view.glow.scale.setScalar(scale);
      view.light.color.setHex(color);
      view.light.intensity = intensity;
    });

    if (state.solved || successPulseTime > 0) {
      const pulse = 1 + Math.sin(time * 5.5) * 0.12;
      successOrb.visible = true;
      successOrb.scale.setScalar(pulse);
      successLight.intensity = state.solved ? 1.25 + Math.sin(time * 4) * 0.18 : 1.4;
    } else {
      successOrb.visible = false;
      successLight.intensity = 0;
    }
  }

  setState(state);

  return {
    group,
    hooks: hookDefs.map((hook) => ({
      id: hook.id,
      label: hook.label,
      prompt: hook.prompt,
      radius: hook.radius,
      position: { x: hook.position.x, y: BELARUS_GROUND_Y, z: hook.position.z }
    })),
    center: { x: ritualCenter.x, y: BELARUS_GROUND_Y, z: ritualCenter.z },
    setState,
    getState: () => ({ ...state, progress: [...state.progress] }),
    update(time) {
      const delta = Math.max(0, time - lastUpdateTime);
      lastUpdateTime = time;

      if (resetFlashTime > 0) {
        resetFlashTime = Math.max(0, resetFlashTime - delta);
        if (resetFlashTime === 0) {
          resetElementId = null;
        }
      }

      if (successPulseTime > 0) {
        successPulseTime = Math.max(0, successPulseTime - delta);
      }

      applyVisualState(time);
    }
  };
}

function createBellRitualElement(position) {
  const group = new THREE.Group();
  group.position.copy(position);

  group.add(createMesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), createSurfaceMaterial(COLORS.wood), {
    position: new THREE.Vector3(0, 0.7, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 10), createSurfaceMaterial(COLORS.rope), {
    position: new THREE.Vector3(0, 1.2, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.18, 0.26, 0.28, 12), createSurfaceMaterial(0x9d7d3e), {
    position: new THREE.Vector3(0, 0.72, 0),
    castShadow: true,
    receiveShadow: true
  }));
  const glow = createGlowOrb({ position: [0, 1.02, 0], radius: 0.09, color: 0xf4d694 });
  group.add(glow);
  const light = new THREE.PointLight(0xf4d694, 0.24, 4.8, 2);
  light.position.set(0, 1.06, 0);
  group.add(light);

  return { group, glow, light };
}

function createThreadRitualElement(position) {
  const group = new THREE.Group();
  group.position.copy(position);

  group.add(createMesh(new THREE.CylinderGeometry(0.06, 0.08, 1.05, 8), createSurfaceMaterial(COLORS.wood), {
    position: new THREE.Vector3(0, 0.52, 0),
    castShadow: true,
    receiveShadow: true
  }));
  [-0.07, 0.03, 0.13].forEach((offset, index) => {
    group.add(createMesh(new THREE.BoxGeometry(0.08, 0.34 + index * 0.05, 0.02), createSurfaceMaterial(0xe8eef2), {
      position: new THREE.Vector3(offset, 0.88 - index * 0.06, 0),
      rotationZ: -0.12 + index * 0.1,
      castShadow: true,
      receiveShadow: true
    }));
  });
  const glow = createGlowOrb({ position: [0.02, 0.96, 0], radius: 0.085, color: 0xe7eef5 });
  group.add(glow);
  const light = new THREE.PointLight(0xe7eef5, 0.24, 4.6, 2);
  light.position.set(0.02, 0.98, 0);
  group.add(light);

  return { group, glow, light };
}

function createLakeRitualElement(position, rotationY) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;

  group.add(createMesh(new THREE.CylinderGeometry(0.46, 0.54, 0.24, 12), createSurfaceMaterial(0x6f685f), {
    position: new THREE.Vector3(0, 0.12, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.12, 0.14, 0.28, 10), createSurfaceMaterial(0xf2e4c6), {
    position: new THREE.Vector3(0, 0.34, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.ConeGeometry(0.05, 0.18, 10), createSurfaceMaterial(COLORS.lampGlow), {
    position: new THREE.Vector3(0, 0.56, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.BoxGeometry(0.26, 0.34, 0.02), createSurfaceMaterial(0x9cb8d8), {
    position: new THREE.Vector3(0.32, 0.32, -0.06),
    rotationY: 0.38,
    castShadow: true,
    receiveShadow: true
  }));
  const glow = createGlowOrb({ position: [0, 0.64, 0], radius: 0.09, color: 0x7bc8ff });
  group.add(glow);
  const light = new THREE.PointLight(0x7bc8ff, 0.24, 5.2, 2);
  light.position.set(0, 0.68, 0);
  group.add(light);

  return { group, glow, light };
}

function createGraveyard() {
  const group = new THREE.Group();
  group.name = "graveyard";

  const placement = getRoadPlacement(GRAVEYARD_PLACEMENT);
  const rotationY = placement.rotationY - 0.12;

  group.add(createFlatSurface(17.5, 14.5, COLORS.grassDark, {
    x: placement.position.x,
    z: placement.position.z,
    thickness: 0.004,
    topOffset: 0.0022,
    rotationY
  }));
  group.add(createFlatSurface(2.8, 12.2, COLORS.roadLight, {
    x: placement.position.x,
    z: placement.position.z,
    thickness: 0.004,
    topOffset: 0.0056,
    rotationY
  }));

  const rowOffsetsZ = [-3.8, 0, 3.8];
  const columnOffsetsX = [-5.1, -2.6, 2.6, 5.1];

  rowOffsetsZ.forEach((rowZ) => {
    columnOffsetsX.forEach((columnX) => {
      const local = new THREE.Vector3(columnX, 0, rowZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
      const grave = new THREE.Group();
      grave.position.set(placement.position.x + local.x, BELARUS_GROUND_Y, placement.position.z + local.z);
      grave.rotation.y = rotationY;
      grave.add(createMesh(new THREE.BoxGeometry(0.68, 0.95, 0.18), createSurfaceMaterial(COLORS.grave), { position: new THREE.Vector3(0, 0.475, 0), castShadow: true, receiveShadow: true }));
      grave.add(createMesh(new THREE.BoxGeometry(0.9, 0.14, 0.56), createSurfaceMaterial(COLORS.stone), { position: new THREE.Vector3(0, 0.07, 0.18), castShadow: true, receiveShadow: true }));
      group.add(grave);
    });
  });

  group.add(createTree(placement.position.x - 9.5, placement.position.z - 7.5, 0.9, 0, "small"));
  group.add(createRock(placement.position.x - 6.3, placement.position.z - 6.1, 0.84, 0.16, "small"));
  group.add(createTree(placement.position.x + 8.8, placement.position.z + 7.2, 1, 0, "small"));
  group.add(createTree(placement.position.x - 9.8, placement.position.z + 6.9, 0.82, 0, "small"));
  group.add(createTree(placement.position.x + 9.2, placement.position.z - 6.8, 0.86, 0, "small"));
  group.add(createRock(placement.position.x + 6.2, placement.position.z + 5.7, 0.96, -0.2, "flat"));
  group.add(createVegetationCluster(placement.position.x - 6.8, placement.position.z + 5.8, 0.92, { includeBush: true, spread: 0.95 }));
  group.add(createVegetationCluster(placement.position.x + 7.4, placement.position.z - 5.4, 0.86, { includeBush: false, spread: 0.9 }));
  group.add(createVegetationCluster(placement.position.x + 2.8, placement.position.z + 7.1, 0.78, { includeBush: false, spread: 0.82 }));
  group.add(createVegetationCluster(placement.position.x - 8.4, placement.position.z + 1.4, 0.74, { includeBush: true, spread: 0.88 }));

  return group;
}

function createGraveyardOfferingSystem() {
  const group = new THREE.Group();
  group.name = "graveyard_offering_system";

  const placement = getRoadPlacement(GRAVEYARD_PLACEMENT);
  const rotationY = placement.rotationY - 0.12;
  const upAxis = new THREE.Vector3(0, 1, 0);
  const localToWorld = (x, z) => {
    const offset = new THREE.Vector3(x, 0, z).applyAxisAngle(upAxis, rotationY);
    return new THREE.Vector3(placement.position.x + offset.x, BELARUS_GROUND_Y, placement.position.z + offset.z);
  };

  const itemDefs = [
    {
      id: "mourning_ribbon",
      label: "Mourning Ribbon",
      prompt: "Press E to take the mourning ribbon",
      position: new THREE.Vector3(-5.6, BELARUS_GROUND_Y, 70.8),
      radius: 2.1,
      color: 0xe8eef2
    },
    {
      id: "brass_token",
      label: "Brass Token",
      prompt: "Press E to take the brass token",
      position: new THREE.Vector3(-35.2, BELARUS_GROUND_Y, 193.5),
      radius: 2.2,
      color: 0xd8b46a
    },
    {
      id: "lake_icon",
      label: "Lake Icon",
      prompt: "Press E to take the lake icon",
      position: new THREE.Vector3(7.8, BELARUS_GROUND_Y, 228.6),
      radius: 2.2,
      color: 0x7bc8ff
    }
  ];

  const graveDefs = [
    { id: "thread_grave", label: "Thread Grave", requiredItemId: "mourning_ribbon", position: localToWorld(-5.1, -3.8), radius: 2.25, color: 0xe8eef2 },
    { id: "bell_grave", label: "Bell Grave", requiredItemId: "brass_token", position: localToWorld(2.6, 0), radius: 2.25, color: 0xd8b46a },
    { id: "lake_grave", label: "Lake Grave", requiredItemId: "lake_icon", position: localToWorld(5.1, 3.8), radius: 2.25, color: 0x7bc8ff }
  ];

  const rewardPosition = localToWorld(-0.4, 6.7);
  const itemViews = new Map();
  const graveViews = new Map();
  let state = createDefaultGraveyardOfferingVisualState();
  let lastEventNonce = 0;
  let wrongFlashTime = 0;
  let wrongGraveId = null;
  let rewardPulseTime = 0;
  let lastUpdateTime = 0;

  itemDefs.forEach((item) => {
    const view = createOfferingPickupView(item);
    itemViews.set(item.id, view);
    group.add(view.group);
  });

  graveDefs.forEach((grave) => {
    const view = createMarkedGraveView(grave);
    graveViews.set(grave.id, view);
    group.add(view.group);
  });

  const rewardView = createGraveyardRewardView(rewardPosition);
  group.add(rewardView.group);

  function setState(nextState = {}) {
    state = normalizeGraveyardOfferingVisualState(nextState);

    if (state.lastEventNonce !== lastEventNonce) {
      if (state.lastEventType === "wrong") {
        wrongFlashTime = 0.65;
        wrongGraveId = state.lastGraveId;
      }

      if (state.lastEventType === "reveal") {
        rewardPulseTime = 2.2;
      }

      lastEventNonce = state.lastEventNonce;
    }

    applyVisualState(0);
  }

  function applyVisualState(time) {
    itemDefs.forEach((item) => {
      const itemState = state.items[item.id];
      const view = itemViews.get(item.id);
      const available = !itemState.holderSocketId && !itemState.placedAtGraveId;
      view.group.visible = available;
      const intensity = state.unlocked ? 0.36 + Math.sin(time * 2.2 + item.position.z * 0.01) * 0.04 : 0.08;
      view.light.intensity = available ? Math.max(0.05, intensity) : 0;
      view.glow.material.opacity = state.unlocked ? 0.9 : 0.42;
    });

    graveDefs.forEach((grave) => {
      const graveState = state.graves[grave.id];
      const view = graveViews.get(grave.id);
      const completed = graveState.complete;
      let color = grave.color;
      let intensity = state.unlocked ? 0.2 : 0.06;
      let scale = 0.92;

      if (completed) {
        intensity = 0.82;
        scale = 1.05;
      }

      if (wrongFlashTime > 0 && wrongGraveId === grave.id) {
        color = 0x90aac9;
        intensity = 0.36 + Math.sin(time * 16) * 0.08;
      }

      view.glow.material.color.setHex(color);
      view.glow.scale.setScalar(scale);
      view.light.color.setHex(color);
      view.light.intensity = intensity;
      view.offering.visible = completed;
      view.offering.scale.setScalar(completed ? 0.68 : 0.01);
    });

    rewardView.group.visible = state.revealed;
    rewardView.light.intensity = state.revealed ? 0.9 + Math.sin(time * 3.8) * 0.16 : 0;
    rewardView.glow.visible = state.revealed;

    if (state.revealed) {
      const pulse = 1 + Math.sin(time * 3.2) * 0.12 + (rewardPulseTime > 0 ? 0.18 : 0);
      rewardView.glow.scale.setScalar(pulse);
      rewardView.shard.rotation.y = time * 0.65;
    }
  }

  setState(state);

  return {
    group,
    itemHooks: itemDefs.map((item) => ({
      id: item.id,
      label: item.label,
      prompt: item.prompt,
      radius: item.radius,
      position: { x: item.position.x, y: BELARUS_GROUND_Y, z: item.position.z }
    })),
    graveHooks: graveDefs.map((grave) => ({
      id: grave.id,
      label: grave.label,
      requiredItemId: grave.requiredItemId,
      radius: grave.radius,
      position: { x: grave.position.x, y: BELARUS_GROUND_Y, z: grave.position.z }
    })),
    reward: { position: { x: rewardPosition.x, y: BELARUS_GROUND_Y, z: rewardPosition.z } },
    setState,
    getState: () => JSON.parse(JSON.stringify(state)),
    update(time) {
      const delta = Math.max(0, time - lastUpdateTime);
      lastUpdateTime = time;

      if (wrongFlashTime > 0) {
        wrongFlashTime = Math.max(0, wrongFlashTime - delta);
        if (wrongFlashTime === 0) {
          wrongGraveId = null;
        }
      }

      if (rewardPulseTime > 0) {
        rewardPulseTime = Math.max(0, rewardPulseTime - delta);
      }

      applyVisualState(time);
    }
  };
}

function createDefaultGraveyardOfferingVisualState() {
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

function normalizeGraveyardOfferingVisualState(nextState = {}) {
  const fallback = createDefaultGraveyardOfferingVisualState();
  return {
    unlocked: Boolean(nextState.unlocked),
    revealed: Boolean(nextState.revealed),
    items: {
      mourning_ribbon: { ...fallback.items.mourning_ribbon, ...(nextState.items?.mourning_ribbon ?? {}) },
      brass_token: { ...fallback.items.brass_token, ...(nextState.items?.brass_token ?? {}) },
      lake_icon: { ...fallback.items.lake_icon, ...(nextState.items?.lake_icon ?? {}) }
    },
    graves: {
      thread_grave: { ...fallback.graves.thread_grave, ...(nextState.graves?.thread_grave ?? {}) },
      bell_grave: { ...fallback.graves.bell_grave, ...(nextState.graves?.bell_grave ?? {}) },
      lake_grave: { ...fallback.graves.lake_grave, ...(nextState.graves?.lake_grave ?? {}) }
    },
    lastEventType: nextState.lastEventType ?? null,
    lastItemId: nextState.lastItemId ?? null,
    lastGraveId: nextState.lastGraveId ?? null,
    lastEventNonce: Number.isFinite(nextState.lastEventNonce) ? nextState.lastEventNonce : 0
  };
}

function createOfferingPickupView(item) {
  const group = new THREE.Group();
  group.position.copy(item.position);
  group.add(createOfferingVisual(item.id, { elevated: true }));
  const glow = createGlowOrb({ position: [0, 0.52, 0], radius: 0.09, color: item.color });
  glow.material.transparent = true;
  glow.material.opacity = 0.9;
  group.add(glow);
  const light = new THREE.PointLight(item.color, 0.26, 4.8, 2);
  light.position.set(0, 0.56, 0);
  group.add(light);
  return { group, glow, light };
}

function createMarkedGraveView(grave) {
  const group = new THREE.Group();
  group.position.copy(grave.position);
  group.add(createMesh(new THREE.BoxGeometry(0.72, 0.16, 0.42), createSurfaceMaterial(0x7c8488), {
    position: new THREE.Vector3(0, 1.02, 0.08),
    castShadow: true,
    receiveShadow: true
  }));
  const symbol = createOfferingSymbol(grave.requiredItemId, { onMarker: true });
  symbol.position.set(0, 1.22, 0.12);
  group.add(symbol);
  const glow = createGlowOrb({ position: [0, 1.34, 0.1], radius: 0.08, color: grave.color });
  glow.material.transparent = true;
  glow.material.opacity = 0.88;
  group.add(glow);
  const light = new THREE.PointLight(grave.color, 0.2, 4.2, 2);
  light.position.set(0, 1.32, 0.08);
  group.add(light);
  const offering = createOfferingVisual(grave.requiredItemId, { elevated: false });
  offering.position.set(0, 1.02, -0.08);
  offering.visible = false;
  group.add(offering);
  return { group, glow, light, offering };
}

function createGraveyardRewardView(position) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.visible = false;
  group.add(createMesh(new THREE.BoxGeometry(1.2, 1.35, 0.28), createSurfaceMaterial(0x8f979d), {
    position: new THREE.Vector3(0, 0.68, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.BoxGeometry(1.7, 0.18, 0.82), createSurfaceMaterial(0x7c8488), {
    position: new THREE.Vector3(0, 0.09, 0.12),
    castShadow: true,
    receiveShadow: true
  }));
  const shard = createMesh(new THREE.OctahedronGeometry(0.28, 0), createSurfaceMaterial(0xb9d8ea, { emissive: 0x7bc8ff, emissiveIntensity: 0.55 }), {
    position: new THREE.Vector3(0, 1.42, 0.02),
    castShadow: true,
    receiveShadow: true
  });
  group.add(shard);
  const glow = createGlowOrb({ position: [0, 1.44, 0.02], radius: 0.16, color: 0xaee7ff });
  glow.material.transparent = true;
  glow.material.opacity = 0.86;
  group.add(glow);
  const light = new THREE.PointLight(0xaee7ff, 0, 8, 2);
  light.position.set(0, 1.46, 0.02);
  group.add(light);
  return { group, shard, glow, light };
}

function createOfferingVisual(itemId, { elevated = false } = {}) {
  const group = new THREE.Group();
  const baseY = elevated ? 0.18 : 0.12;

  if (itemId === "mourning_ribbon") {
    group.add(createMesh(new THREE.CylinderGeometry(0.05, 0.06, 0.24, 8), createSurfaceMaterial(0x7a6448), {
      position: new THREE.Vector3(0, baseY + 0.12, 0),
      castShadow: true,
      receiveShadow: true
    }));
    [-0.06, 0.02, 0.1].forEach((offset, index) => {
      group.add(createMesh(new THREE.BoxGeometry(0.07, 0.24 + index * 0.03, 0.015), createSurfaceMaterial(0xe8eef2), {
        position: new THREE.Vector3(offset, baseY + 0.28 - index * 0.04, 0),
        rotationZ: -0.12 + index * 0.08,
        castShadow: true,
        receiveShadow: true
      }));
    });
    return group;
  }

  if (itemId === "brass_token") {
    group.add(createMesh(new THREE.TorusGeometry(0.14, 0.035, 8, 18), createSurfaceMaterial(0xd8b46a), {
      position: new THREE.Vector3(0, baseY + 0.18, 0),
      rotationX: Math.PI * 0.5,
      castShadow: true,
      receiveShadow: true
    }));
    group.add(createMesh(new THREE.BoxGeometry(0.06, 0.16, 0.03), createSurfaceMaterial(0xd8b46a), {
      position: new THREE.Vector3(0, baseY + 0.32, 0),
      castShadow: true,
      receiveShadow: true
    }));
    return group;
  }

  group.add(createMesh(new THREE.OctahedronGeometry(0.16, 0), createSurfaceMaterial(0x8bc9e8), {
    position: new THREE.Vector3(0, baseY + 0.18, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8), createSurfaceMaterial(0x6e8eaa), {
    position: new THREE.Vector3(0, baseY + 0.04, 0),
    castShadow: true,
    receiveShadow: true
  }));
  return group;
}

function createOfferingSymbol(itemId, { onMarker = false } = {}) {
  const group = new THREE.Group();
  const markerScale = onMarker ? 0.8 : 1;

  if (itemId === "mourning_ribbon") {
    [-0.05, 0.03].forEach((offset, index) => {
      group.add(createMesh(new THREE.BoxGeometry(0.06 * markerScale, (0.22 + index * 0.04) * markerScale, 0.012), createSurfaceMaterial(0xe8eef2), {
        position: new THREE.Vector3(offset * markerScale, (0.12 - index * 0.02) * markerScale, 0),
        rotationZ: -0.14 + index * 0.1,
        castShadow: true,
        receiveShadow: true
      }));
    });
    return group;
  }

  if (itemId === "brass_token") {
    group.add(createMesh(new THREE.TorusGeometry(0.11 * markerScale, 0.025, 8, 16), createSurfaceMaterial(0xd8b46a), {
      position: new THREE.Vector3(0, 0.08 * markerScale, 0),
      rotationX: Math.PI * 0.5,
      castShadow: true,
      receiveShadow: true
    }));
    return group;
  }

  group.add(createMesh(new THREE.CircleGeometry(0.11 * markerScale, 12), createSurfaceMaterial(0x8bc9e8), {
    position: new THREE.Vector3(0, 0.08 * markerScale, 0),
    rotationX: -Math.PI * 0.5,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.RingGeometry(0.05 * markerScale, 0.085 * markerScale, 12), createSurfaceMaterial(0xd7ebf5), {
    position: new THREE.Vector3(0, 0.081 * markerScale, 0),
    rotationX: -Math.PI * 0.5,
    castShadow: true,
    receiveShadow: true
  }));
  return group;
}

function createLakeFinaleSystem() {
  const group = new THREE.Group();
  group.name = "lake_finale_system";

  const placement = getRoadPlacement(GRAVEYARD_PLACEMENT);
  const rotationY = placement.rotationY - 0.12;
  const rewardOffset = new THREE.Vector3(-0.4, 0, 6.7).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
  const rewardPosition = new THREE.Vector3(placement.position.x + rewardOffset.x, BELARUS_GROUND_Y, placement.position.z + rewardOffset.z);
  const rewardPickupOffset = new THREE.Vector3(-0.4, 0, 4.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
  const rewardPickupPosition = new THREE.Vector3(placement.position.x + rewardPickupOffset.x, BELARUS_GROUND_Y, placement.position.z + rewardPickupOffset.z);

  const rewardHook = {
    id: "mirror_shard",
    label: "Mirror Shard",
    prompt: "Press E to take the mirror shard",
    radius: 2,
    position: { x: rewardPickupPosition.x, y: BELARUS_GROUND_Y, z: rewardPickupPosition.z }
  };
  const finaleHook = {
    id: "lake_reflection",
    label: "Lake Reflection",
    prompt: "Press E to offer the mirror shard",
    radius: 3.4,
    position: { x: LAKE_FINALE_POSITION.x, y: BELARUS_GROUND_Y, z: LAKE_FINALE_POSITION.z }
  };

  let state = {
    unlocked: false,
    rewardHolderSocketId: null,
    rewardCollected: false,
    completed: false,
    lastEventType: null,
    lastEventNonce: 0
  };
  let lastEventNonce = 0;
  let rewardPulseTime = 0;
  let finalePulseTime = 0;
  let lastUpdateTime = 0;

  const rewardAnchor = new THREE.Object3D();
  rewardAnchor.position.copy(rewardPickupPosition);
  rewardAnchor.visible = false;
  group.add(rewardAnchor);

  const rewardGroup = new THREE.Group();
  rewardGroup.position.copy(rewardPickupPosition);

  const pickupMarker = new THREE.Group();
  pickupMarker.position.copy(rewardPickupPosition);
  const rewardShard = createMesh(new THREE.OctahedronGeometry(0.24, 0), createSurfaceMaterial(0xcfe9ff, { emissive: 0x80d2ff, emissiveIntensity: 0.6 }), {
    position: new THREE.Vector3(0, 0.84, 0),
    castShadow: true,
    receiveShadow: true
  });
  rewardGroup.add(rewardShard);
  const rewardGlow = createGlowOrb({ position: [0, 0.84, 0], radius: 0.16, color: 0xc8ebff });
  rewardGlow.material.transparent = true;
  rewardGlow.material.opacity = 0.86;
  rewardGroup.add(rewardGlow);
  const rewardLight = new THREE.PointLight(0xb8e2ff, 0, 6.5, 2);
  rewardLight.position.set(0, 0.88, 0);
  rewardGroup.add(rewardLight);
  group.add(rewardGroup);

  pickupMarker.add(createMesh(new THREE.CylinderGeometry(0.34, 0.42, 0.1, 16), createSurfaceMaterial(0x6f7a84, { emissive: 0x36586f, emissiveIntensity: 0.18 }), {
    position: new THREE.Vector3(0, 0.05, 0),
    castShadow: true,
    receiveShadow: true
  }));
  const pickupOrb = createGlowOrb({ position: [0, 0.62, 0], radius: 0.14, color: 0xc8ebff });
  pickupOrb.material.transparent = true;
  pickupOrb.material.opacity = 0.88;
  pickupMarker.add(pickupOrb);
  const pickupLight = new THREE.PointLight(0xc8ebff, 0, 6.2, 2);
  pickupLight.position.set(0, 0.66, 0);
  pickupMarker.add(pickupLight);
  group.add(pickupMarker);

  const shrineGroup = new THREE.Group();
  shrineGroup.position.copy(LAKE_FINALE_POSITION);
  shrineGroup.add(createMesh(new THREE.CylinderGeometry(1.05, 1.2, 0.26, 24), createSurfaceMaterial(0x657078), {
    position: new THREE.Vector3(0, 0.13, 0),
    castShadow: true,
    receiveShadow: true
  }));
  shrineGroup.add(createMesh(new THREE.TorusGeometry(0.95, 0.08, 10, 28), createSurfaceMaterial(0x9cb2c0, { emissive: 0x4d89a8, emissiveIntensity: 0.18 }), {
    position: new THREE.Vector3(0, 0.3, 0),
    rotationX: Math.PI * 0.5,
    castShadow: true,
    receiveShadow: true
  }));
  shrineGroup.add(createMesh(new THREE.CircleGeometry(0.62, 24), createSurfaceMaterial(0x7fcfff, { emissive: 0x2a6088, emissiveIntensity: 0.32, transparent: true, opacity: 0.8 }), {
    position: new THREE.Vector3(0, 0.305, 0),
    rotationX: -Math.PI * 0.5,
    receiveShadow: true
  }));
  const shrineGlow = createGlowOrb({ position: [0, 0.62, 0], radius: 0.18, color: 0x9fe7ff });
  shrineGlow.material.transparent = true;
  shrineGlow.material.opacity = 0.76;
  shrineGroup.add(shrineGlow);
  const shrineLight = new THREE.PointLight(0xaee7ff, 0.18, 8, 2);
  shrineLight.position.set(0, 0.64, 0);
  shrineGroup.add(shrineLight);
  group.add(shrineGroup);

  function applyVisualState(time) {
    const rewardVisible = state.unlocked && !state.rewardCollected && !state.completed;
    rewardGroup.visible = rewardVisible;
    pickupMarker.visible = rewardVisible;
    rewardLight.intensity = rewardVisible ? 0.68 + Math.sin(time * 2.5) * 0.08 + (rewardPulseTime > 0 ? 0.18 : 0) : 0;
    rewardShard.rotation.y = time * 0.7;
    rewardGlow.scale.setScalar(1 + Math.sin(time * 2.4) * 0.08 + (rewardPulseTime > 0 ? 0.12 : 0));
    pickupLight.intensity = rewardVisible ? 0.5 + Math.sin(time * 2.9) * 0.08 + (rewardPulseTime > 0 ? 0.16 : 0) : 0;
    pickupOrb.scale.setScalar(0.92 + Math.sin(time * 2.7) * 0.07 + (rewardPulseTime > 0 ? 0.14 : 0));

    shrineGroup.visible = state.unlocked;
    shrineLight.intensity = !state.unlocked ? 0 : state.completed ? 1.18 + Math.sin(time * 3.2) * 0.18 : 0.28 + Math.sin(time * 2.1) * 0.05;
    shrineGlow.visible = state.unlocked;
    shrineGlow.scale.setScalar(state.completed ? 1.18 + Math.sin(time * 3.4) * 0.14 + (finalePulseTime > 0 ? 0.2 : 0) : 0.88 + Math.sin(time * 2.2) * 0.06);
  }

  function setState(nextState = {}) {
    state = {
      unlocked: Boolean(nextState.unlocked),
      rewardHolderSocketId: nextState.rewardHolderSocketId ?? null,
      rewardCollected: Boolean(nextState.rewardCollected),
      completed: Boolean(nextState.completed),
      lastEventType: nextState.lastEventType ?? null,
      lastEventNonce: Number.isFinite(nextState.lastEventNonce) ? nextState.lastEventNonce : 0
    };

    if (state.lastEventNonce !== lastEventNonce) {
      if (state.lastEventType === "unlock" || state.lastEventType === "pickup_reward") {
        rewardPulseTime = 1.4;
      }
      if (state.lastEventType === "complete") {
        finalePulseTime = 2.6;
      }
      lastEventNonce = state.lastEventNonce;
    }

    applyVisualState(0);
  }

  setState(state);

  return {
    group,
    rewardHook,
    finaleHook,
    rewardPosition: { x: rewardPosition.x, y: BELARUS_GROUND_Y, z: rewardPosition.z },
    rewardPickupPosition: { x: rewardPickupPosition.x, y: BELARUS_GROUND_Y, z: rewardPickupPosition.z },
    rewardAnchor: { x: rewardPickupPosition.x, y: BELARUS_GROUND_Y, z: rewardPickupPosition.z },
    finalePosition: { x: LAKE_FINALE_POSITION.x, y: BELARUS_GROUND_Y, z: LAKE_FINALE_POSITION.z },
    setState,
    getState: () => ({ ...state }),
    update(time) {
      const delta = Math.max(0, time - lastUpdateTime);
      lastUpdateTime = time;
      rewardPulseTime = Math.max(0, rewardPulseTime - delta);
      finalePulseTime = Math.max(0, finalePulseTime - delta);
      applyVisualState(time);
    }
  };
}

function createRoadsideDetails() {
  const group = new THREE.Group();
  group.name = "roadside_details";

  const detailPoints = [
        { progress: 0.18, side: "right", distance: 6.2, type: "bench" },
    { progress: 0.26, side: "left", distance: 6.6, type: "crate" },
    { progress: 0.36, side: "right", distance: 6.4, type: "wood" },
    { progress: 0.48, side: "left", distance: 6.1, type: "bench" },
    { progress: 0.58, side: "right", distance: 6.6, type: "lamp" },
    { progress: 0.72, side: "right", distance: 4.7, type: "lamp" },
    { progress: 0.82, side: "left", distance: 4.9, type: "lamp" },
    { progress: 0.92, side: "right", distance: 4.4, type: "lamp" }
  ];

  detailPoints.forEach((item, index) => {
    const anchor = sampleRoadPointAndNormal(item.progress);
    const side = item.side === "left" ? anchor.left : anchor.right;
    const safeDistance = Math.max(item.distance, getRoadWidthAtProgress(item.progress) * 0.5 + 3.35);
    const base = anchor.point.clone().add(side.clone().multiplyScalar(safeDistance));
    const safeBase = getSafeRoadsidePosition(base.x, base.z, { progress: item.progress, extraOffset: 1.4 });

    if (item.type === "lamp") {
      group.add(createLampPost(safeBase.x, safeBase.z));
    } else if (item.type === "bench") {
      group.add(createBench(safeBase.x, safeBase.z, anchor.rotationY + (item.side === "left" ? 0.65 : -0.65)));
    } else if (item.type === "crate") {
      group.add(createCrateStack(safeBase.x, safeBase.z));
    } else if (item.type === "wood") {
      group.add(createWoodPile(safeBase.x, safeBase.z, anchor.rotationY));
    }

    const bushPoint = getSafeRoadsidePosition(safeBase.x + side.x * 1.5, safeBase.z + side.z * 1.5, { progress: item.progress, extraOffset: 1.35 });
    group.add(createBush(bushPoint.x, bushPoint.z, 0.95 + (index % 3) * 0.08));

    if (index % 2 === 0) {
      const rockPoint = getSafeRoadsidePosition(
        safeBase.x + side.x * 2.35 - anchor.tangent.x * 0.5,
        safeBase.z + side.z * 2.35 - anchor.tangent.z * 0.5,
        { progress: item.progress, extraOffset: 1.45 }
      );
      group.add(createRock(rockPoint.x, rockPoint.z, 0.72 + (index % 3) * 0.08, anchor.rotationY + 0.18, index % 3 === 0 ? "flat" : "small"));
    }

    group.add(createVegetationCluster(safeBase.x - side.x * 1.1, safeBase.z - side.z * 1.1, 0.92, { progress: item.progress, includeBush: index % 3 === 0 }));
    group.add(createVegetationCluster(safeBase.x + anchor.tangent.x * 1.3, safeBase.z + anchor.tangent.z * 1.3, 0.76, { progress: item.progress, includeBush: false, spread: 0.9 }));
  });

  return group;
}

function createVillageProps() {
  const group = new THREE.Group();
  group.name = "village_props";

  group.add(createWell(-2.5, 68));
  group.add(createHayBale(-24, 98, [1.9, 1.45, 1.25]));
  group.add(createHayBale(28, 116, [1.7, 1.35, 1.15]));
  group.add(createBush(-15, 84, 1.1));
  group.add(createRock(-18, 88, 0.92, 0.28, "small"));
  group.add(createBush(19, 122, 0.95));
  group.add(createBush(-22, 104, 0.84));
  group.add(createRock(21, 134, 0.86, -0.22, "flat"));
  group.add(createBush(24, 138, 0.78));
  group.add(createGrassClump(-6, 78, 1));
  group.add(createGrassClump(12, 108, 1.1));
  group.add(createGrassClump(26, 146, 0.95));
  group.add(createGrassClump(-18, 118, 0.88));

  return group;
}

function createChurchSurroundings() {
  const group = new THREE.Group();
  group.name = "church_surroundings";

  const placement = getRoadPlacement(CHURCH_PLACEMENT);
  const churchFront = placement.position.clone().add(placement.toRoad.clone().multiplyScalar(5.2));
  const churchSide = placement.right.clone().multiplyScalar(-4.8);

  group.add(createFlatSurface(3, 9.5, COLORS.roadLight, {
    x: churchFront.x,
    z: churchFront.z,
    thickness: 0.004,
    topOffset: 0.0058,
    rotationY: placement.rotationY - 0.16
  }));
  group.add(createFlatSurface(8.5, 5.4, COLORS.grassLight, {
    x: placement.position.x - 7.1,
    z: placement.position.z + 1.1,
    thickness: 0.003,
    topOffset: 0.0026,
    rotationY: placement.rotationY - 0.24
  }));
  group.add(createBench(placement.position.x + 6.6, placement.position.z + 5.5, placement.rotationY + 0.42));
  group.add(createVegetationCluster(placement.position.x - 7.2, placement.position.z - 4.2, 1, { includeBush: true, spread: 1.05 }));
  group.add(createRock(placement.position.x - 10.4, placement.position.z - 2.6, 0.94, 0.24, "small"));
  group.add(createVegetationCluster(placement.position.x + 7.1, placement.position.z - 5.1, 0.92, { includeBush: true, spread: 0.96 }));
  group.add(createVegetationCluster(placement.position.x + 8.7, placement.position.z + 1.5, 0.76, { includeBush: false, spread: 0.82 }));
  group.add(createRock(placement.position.x + 10.8, placement.position.z + 4.2, 0.88, -0.18, "flat"));
  group.add(createVegetationCluster(placement.position.x - 6.2, placement.position.z + 6.6, 1.1, { includeBush: false, spread: 1.1 }));
  group.add(createVegetationCluster(placement.position.x + 4.4, placement.position.z + 7.2, 0.95, { includeBush: false, spread: 0.96 }));
  group.add(createVegetationCluster(placement.position.x - 8.4, placement.position.z + 0.8, 0.96, { includeBush: true, spread: 0.9 }));
  group.add(createTree(placement.position.x + churchSide.x, placement.position.z + churchSide.z - 5.5, 1.02, 0.18, "small"));
  group.add(createTree(placement.position.x + churchSide.x - 3.6, placement.position.z + churchSide.z + 5.5, 0.9, -0.14, "small"));

  return group;
}
function createForestCorridor() {
  const group = new THREE.Group();
  group.name = "forest_corridor";

  for (let z = 6; z <= 224; z += 12) {
    group.add(createTree(-56 - Math.sin(z * 0.04) * 6, z, 0.95 + (z % 28) / 50, 0.14, "tall"));
    group.add(createTree(60 + Math.cos(z * 0.035) * 7, z, 0.92 + (z % 24) / 45, -0.12, "tall"));
    group.add(createTree(-69 - Math.cos(z * 0.032) * 4.2, z + 2.2, 1.06 + (z % 18) / 68, 0.08, "tall"));
    group.add(createTree(74 + Math.sin(z * 0.03) * 4.6, z - 1.6, 1.02 + (z % 16) / 70, -0.06, "tall"));

    if (z >= 34 && z <= 184) {
      group.add(createTree(-62 - Math.cos(z * 0.05) * 3, z + 3.4, 0.72 + (z % 20) / 60, 0.22, "round"));
      group.add(createTree(67 + Math.sin(z * 0.04) * 3.2, z - 2.8, 0.76 + (z % 18) / 60, -0.18, "round"));
      group.add(createTree(-47 - Math.sin(z * 0.05) * 2.1, z - 1.8, 0.68 + (z % 12) / 75, -0.22, "small"));
      group.add(createTree(50 + Math.cos(z * 0.048) * 2.2, z + 1.6, 0.7 + (z % 10) / 78, 0.18, "small"));
      group.add(createTree(-76 - Math.sin(z * 0.038) * 3.1, z + 0.6, 0.88 + (z % 18) / 72, 0.1, "tall"));
      group.add(createTree(81 + Math.cos(z * 0.036) * 3.2, z - 0.4, 0.9 + (z % 16) / 72, -0.08, "tall"));
      if (z % 28 === 6) {
        group.add(createRock(-49 - Math.sin(z * 0.04) * 2.4, z + 1.8, 0.88, 0.18, "small"));
        group.add(createRock(52 + Math.cos(z * 0.035) * 2.1, z - 2.2, 0.94, -0.16, "small"));
        group.add(createVegetationCluster(-46 - Math.sin(z * 0.04) * 1.5, z + 0.9, 0.82, { includeBush: false, spread: 0.95 }));
        group.add(createVegetationCluster(48 + Math.cos(z * 0.035) * 1.3, z - 1.1, 0.86, { includeBush: false, spread: 0.98 }));
        if (z >= 62 && z <= 174) {
          group.add(createVegetationCluster(-51 - Math.sin(z * 0.03) * 1.4, z + 3.1, 0.72, { includeBush: true, spread: 0.88 }));
          group.add(createVegetationCluster(54 + Math.cos(z * 0.04) * 1.2, z - 3.4, 0.74, { includeBush: true, spread: 0.88 }));
        }
      }
    }
  }

  for (let z = 168; z <= 264; z += 7) {
    const progress = THREE.MathUtils.clamp((z + 4) / 248, 0, 1);
    const anchor = sampleRoadPointAndNormal(progress);
    group.add(createTree(anchor.point.x - 16 - Math.cos(z * 0.06) * 2, z, 1.04, 0.16, "round"));
    group.add(createTree(anchor.point.x + 15 + Math.sin(z * 0.05) * 2.5, z, 1.02, -0.14, "round"));
    group.add(createTree(anchor.point.x - 20 - Math.sin(z * 0.04) * 2.4, z + 2.1, 0.82, -0.24, "tall"));
    group.add(createTree(anchor.point.x + 19 + Math.cos(z * 0.05) * 2.1, z - 1.8, 0.86, 0.2, "tall"));
    group.add(createTree(anchor.point.x - 25 - Math.cos(z * 0.037) * 2.8, z - 1.2, 0.9, 0.12, "round"));
    group.add(createTree(anchor.point.x + 24 + Math.sin(z * 0.043) * 2.5, z + 1.4, 0.94, -0.1, "round"));
    group.add(createTree(anchor.point.x - 31 - Math.sin(z * 0.033) * 2.8, z + 1.8, 0.82, -0.18, "tall"));
    group.add(createTree(anchor.point.x + 30 + Math.cos(z * 0.031) * 2.7, z - 1.4, 0.84, 0.16, "tall"));
    if (z >= 190) {
      group.add(createTree(anchor.point.x - 12.8 - Math.cos(z * 0.047) * 1.5, z + 0.9, 0.72, -0.16, "small"));
      group.add(createTree(anchor.point.x + 12.2 + Math.sin(z * 0.044) * 1.5, z - 0.7, 0.74, 0.12, "small"));
    }
  }

  return group;
}

function createForestBoundary() {
  const group = new THREE.Group();
  group.name = "forest_boundary";

  const sideRows = [
    { x: -72, variant: "round", scale: 0.96, zStart: 22, zEnd: 244, step: 18, drift: 4.2 },
    { x: -88, variant: "tall", scale: 1.08, zStart: 18, zEnd: 252, step: 18, drift: 5.2 },
    { x: -104, variant: "tall", scale: 1.14, zStart: 12, zEnd: 264, step: 20, drift: 6.1 },
    { x: -122, variant: "tall", scale: 1.2, zStart: 10, zEnd: 286, step: 22, drift: 6.8 },
    { x: 74, variant: "round", scale: 0.94, zStart: 24, zEnd: 246, step: 18, drift: 4.2 },
    { x: 90, variant: "tall", scale: 1.08, zStart: 16, zEnd: 254, step: 18, drift: 5.4 },
    { x: 106, variant: "tall", scale: 1.15, zStart: 12, zEnd: 266, step: 20, drift: 6.2 },
    { x: 124, variant: "tall", scale: 1.2, zStart: 10, zEnd: 286, step: 22, drift: 6.9 }
  ];

  sideRows.forEach((row, rowIndex) => {
    for (let z = row.zStart; z <= row.zEnd; z += row.step) {
      if (z < 28 && Math.abs(row.x) < 94) {
        continue;
      }

      const x = row.x + Math.sin(z * 0.032 + rowIndex) * row.drift;
      group.add(createForestCluster(x, z, {
        primaryVariant: row.variant,
        secondaryVariant: row.variant === "tall" ? "round" : "small",
        accentVariant: row.variant === "tall" ? "small" : "round",
        scale: row.scale + ((z + rowIndex * 7) % 22) / 90,
        width: 7.6,
        depth: 7.2
      }));
    }
  });

  for (let x = -126; x <= 126; x += 16) {
    if (x > -18 && x < 24) {
      continue;
    }

    const z = 292 + Math.cos(x * 0.055) * 10;
    group.add(createForestCluster(x, z, {
      primaryVariant: Math.abs(x) > 58 ? "tall" : "round",
      secondaryVariant: Math.abs(x) > 58 ? "round" : "small",
      accentVariant: "small",
      scale: Math.abs(x) > 58 ? 1.12 : 0.96,
      width: 8.6,
      depth: 7.8
    }));
  }

  return group;
}

function createForestCluster(x, z, options = {}) {
  const {
    primaryVariant = "tall",
    secondaryVariant = "round",
    accentVariant = "small",
    scale = 1,
    width = 7,
    depth = 7
  } = options;

  const group = new THREE.Group();
  const seed = seededTreeNoise(x * 0.051 + z * 0.033 + scale * 0.77);
  const baseRotation = THREE.MathUtils.lerp(-0.28, 0.28, seed);
  const placements = [
    { variant: primaryVariant, x: 0, z: 0, scale: scale * 1.02, rotation: baseRotation },
    { variant: secondaryVariant, x: Math.cos(seed * Math.PI * 2) * width * 0.42, z: Math.sin(seed * Math.PI * 2) * depth * 0.28 + 1.1, scale: scale * 0.86, rotation: baseRotation + 0.22 },
    { variant: accentVariant, x: -Math.sin(seed * Math.PI * 2) * width * 0.38, z: Math.cos(seed * Math.PI * 2) * depth * 0.32 - 1.4, scale: scale * 0.72, rotation: baseRotation - 0.18 }
  ];

  placements.forEach((placement, index) => {
    const treeX = x + placement.x;
    const treeZ = z + placement.z;

    if (isInsideRoadClearance(treeX, treeZ)) {
      return;
    }

    group.add(createTree(treeX, treeZ, placement.scale + index * 0.02, placement.rotation, placement.variant));
  });

  return group;
}

function createLakeForest() {
  const group = new THREE.Group();
  group.name = "lake_forest";

  const lakeClusters = [
    { x: -30, z: 222, primary: "round", secondary: "small", scale: 0.96 },
    { x: 30, z: 220, primary: "round", secondary: "small", scale: 0.94 },
    { x: -40, z: 232, primary: "round", secondary: "small", scale: 1.02 },
    { x: 42, z: 230, primary: "round", secondary: "small", scale: 1.02 },
    { x: -54, z: 236, primary: "round", secondary: "small", scale: 1.02 },
    { x: 54, z: 236, primary: "round", secondary: "small", scale: 1.02 },
    { x: -18, z: 240, primary: "round", secondary: "small", scale: 0.88 },
    { x: 22, z: 241, primary: "round", secondary: "small", scale: 0.9 },
    { x: -28, z: 246, primary: "round", secondary: "small", scale: 0.92 },
    { x: 34, z: 246, primary: "round", secondary: "small", scale: 0.94 },
    { x: -68, z: 248, primary: "tall", secondary: "round", scale: 1.12 },
    { x: 66, z: 250, primary: "tall", secondary: "round", scale: 1.1 },
    { x: -58, z: 260, primary: "tall", secondary: "round", scale: 1.08 },
    { x: 58, z: 262, primary: "tall", secondary: "round", scale: 1.08 },
    { x: -76, z: 268, primary: "tall", secondary: "round", scale: 1.16 },
    { x: 78, z: 270, primary: "tall", secondary: "round", scale: 1.16 },
    { x: -34, z: 280, primary: "round", secondary: "small", scale: 0.92 },
    { x: 40, z: 282, primary: "round", secondary: "small", scale: 0.94 },
    { x: -64, z: 286, primary: "tall", secondary: "round", scale: 1.18 },
    { x: 66, z: 288, primary: "tall", secondary: "round", scale: 1.18 },
    { x: -18, z: 296, primary: "round", secondary: "small", scale: 0.98 },
    { x: 18, z: 298, primary: "round", secondary: "small", scale: 0.98 },
    { x: -86, z: 300, primary: "tall", secondary: "round", scale: 1.22 },
    { x: 90, z: 302, primary: "tall", secondary: "round", scale: 1.22 }
  ];

  lakeClusters.forEach((cluster) => {
    group.add(createForestCluster(cluster.x, cluster.z, {
      primaryVariant: cluster.primary,
      secondaryVariant: cluster.secondary,
      accentVariant: "small",
      scale: cluster.scale,
      width: 8.2,
      depth: 7.4
    }));
  });

  return group;
}

function createLakeBacklands() {
  const group = new THREE.Group();
  group.name = "lake_backlands";

  [
    { x: 6, z: 301, width: 168, depth: 56, rotationY: -0.03 },
    { x: -52, z: 286, width: 52, depth: 20, rotationY: 0.08 },
    { x: 58, z: 288, width: 58, depth: 22, rotationY: -0.1 }
  ].forEach((patch, index) => {
    group.add(createFlatSurface(patch.width, patch.depth, index === 0 ? COLORS.grassDark : COLORS.grass, {
      x: patch.x,
      z: patch.z,
      thickness: 0.003,
      topOffset: 0.0018,
      rotationY: patch.rotationY
    }));
  });

  group.add(createVegetationCluster(-36, 287, 1.18, { includeBush: true, spread: 1.15 }));
  group.add(createVegetationCluster(34, 289, 1.1, { includeBush: true, spread: 1.1 }));
  group.add(createVegetationCluster(-8, 306, 1.24, { includeBush: false, spread: 1.2 }));
  group.add(createVegetationCluster(18, 308, 1.16, { includeBush: false, spread: 1.14 }));
  group.add(createRock(-28, 292, 1.02, 0.2, "flat"));
  group.add(createRock(30, 294, 1.08, -0.18, "large"));
  group.add(createReedClump(-14, 279, 0.86));
  group.add(createReedClump(24, 281, 0.84));

  return group;
}

function createLakePortalEffect() {
  const group = new THREE.Group();
  group.name = "lake_portal_effect";
  group.position.set(LAKE_FINALE_POSITION.x, BELARUS_GROUND_Y, LAKE_FINALE_POSITION.z + 0.8);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.1, 14, 42),
    new THREE.MeshBasicMaterial({
      color: COLORS.portal,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    })
  );
  outerRing.rotation.x = Math.PI * 0.5;
  outerRing.position.y = 0.12;
  group.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.07, 12, 36),
    new THREE.MeshBasicMaterial({
      color: COLORS.portalDeep,
      transparent: true,
      opacity: 0.58,
      depthWrite: false
    })
  );
  innerRing.rotation.x = Math.PI * 0.5;
  innerRing.position.y = 0.18;
  group.add(innerRing);

  const coreGlow = createGlowOrb({ position: [0, 0.7, 0], radius: 0.34, color: COLORS.portal });
  coreGlow.material.transparent = true;
  coreGlow.material.opacity = 0.46;
  group.add(coreGlow);

  const groundGlow = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 28),
    new THREE.MeshBasicMaterial({
      color: COLORS.portal,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    })
  );
  groundGlow.rotation.x = -Math.PI * 0.5;
  groundGlow.position.y = 0.03;
  group.add(groundGlow);

  const light = new THREE.PointLight(
    COLORS.portal,
    isLowPerformanceMode() ? 0.38 : 0.65,
    isLowPerformanceMode() ? 9 : 14,
    2
  );
  light.position.set(0, 1.1, 0);
  group.add(light);

  const particles = [];
  const particleCount = isLowPerformanceMode() ? 4 : 10;
  for (let index = 0; index < particleCount; index += 1) {
    const particle = createGlowOrb({
      position: [0, 0.48 + index * 0.04, 0],
      radius: 0.05 + (index % 3) * 0.01,
      color: index % 2 === 0 ? COLORS.portal : COLORS.shrinePulse
    });
    particle.material.transparent = true;
    particle.material.opacity = 0.48;
    group.add(particle);
    particles.push({ particle, phase: index * 0.57, radius: 0.54 + (index % 4) * 0.18 });
  }

  return {
    group,
    update(time) {
      outerRing.rotation.z = time * 0.22;
      innerRing.rotation.z = -time * 0.34;
      outerRing.material.opacity = 0.34 + Math.sin(time * 1.6) * 0.06;
      innerRing.material.opacity = 0.48 + Math.sin(time * 1.9 + 0.6) * 0.08;
      coreGlow.scale.setScalar(0.94 + Math.sin(time * 2.4) * 0.08);
      coreGlow.material.opacity = 0.42 + Math.sin(time * 2.2) * 0.08;
      groundGlow.material.opacity = 0.12 + Math.sin(time * 1.8) * 0.05;
      light.intensity = 0.58 + Math.sin(time * 2) * 0.14;

      particles.forEach(({ particle, phase, radius }, index) => {
        const angle = time * (0.4 + index * 0.03) + phase;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius * 0.55;
        particle.position.y = 0.42 + Math.sin(time * 1.2 + phase) * 0.18 + index * 0.02;
      });
    }
  };
}

function createVigilPresenceSystem() {
  const group = new THREE.Group();
  group.name = "vigil_presence_system";

  const corruptionDefs = [
    { x: -47, z: 185, radius: 1.4, light: 5.4 },
    { x: 50, z: 192, radius: 1.5, light: 5.8 },
    { x: -39, z: 233, radius: 1.6, light: 6.2 },
    { x: 42, z: 242, radius: 1.6, light: 6.2 },
    { x: -14, z: 267, radius: 1.7, light: 6.8 },
    { x: 24, z: 274, radius: 1.7, light: 6.8 }
  ];

  const corruptionNodes = corruptionDefs.map((definition, index) => {
    const node = new THREE.Group();
    node.position.set(definition.x, BELARUS_GROUND_Y, definition.z);

    const groundPulse = new THREE.Mesh(
      new THREE.CircleGeometry(definition.radius, 20),
      new THREE.MeshBasicMaterial({
        color: 0x7f1020,
        transparent: true,
        opacity: 0.1,
        depthWrite: false
      })
    );
    groundPulse.rotation.x = -Math.PI * 0.5;
    groundPulse.position.y = 0.03;
    node.add(groundPulse);

    const core = createGlowOrb({
      position: [0, 0.75 + (index % 2) * 0.08, 0],
      radius: 0.14 + (index % 3) * 0.02,
      color: 0xb11e2d
    });
    core.material.transparent = true;
    core.material.opacity = 0.22;
    node.add(core);

    const light = new THREE.PointLight(0x8c1024, 0.2, definition.light, 2);
    light.position.set(0, 0.9, 0);
    node.add(light);

    group.add(node);
    return { definition, node, groundPulse, core, light, phase: index * 0.87 };
  });

  const watcherDefs = [
    { x: -61, z: 190, scale: 1.35, triggerRadius: 34 },
    { x: 66, z: 204, scale: 1.3, triggerRadius: 34 },
    { x: -50, z: 246, scale: 1.45, triggerRadius: 38 },
    { x: 55, z: 254, scale: 1.45, triggerRadius: 38 },
    { x: 6, z: 289, scale: 1.55, triggerRadius: 42 }
  ];

  const watcherTexture = createWatcherTexture();
  const watchers = watcherDefs.map((definition, index) => {
    const watcher = new THREE.Group();
    watcher.position.set(definition.x, BELARUS_GROUND_Y, definition.z);

    const silhouette = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6 * definition.scale, 5.2 * definition.scale),
      new THREE.MeshBasicMaterial({
        map: watcherTexture,
        color: 0x240912,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    silhouette.position.y = 2.8 * definition.scale;
    watcher.add(silhouette);

    const eyeLeft = createGlowOrb({ position: [-0.18 * definition.scale, 3.3 * definition.scale, 0.04], radius: 0.05, color: 0xd84a4a });
    const eyeRight = createGlowOrb({ position: [0.18 * definition.scale, 3.3 * definition.scale, 0.04], radius: 0.05, color: 0xd84a4a });
    eyeLeft.material.transparent = true;
    eyeRight.material.transparent = true;
    eyeLeft.material.opacity = 0;
    eyeRight.material.opacity = 0;
    watcher.add(eyeLeft);
    watcher.add(eyeRight);

    group.add(watcher);
    return {
      definition,
      watcher,
      silhouette,
      eyeLeft,
      eyeRight,
      activeUntil: 0,
      nextAttemptTime: 6 + index * 2.8,
      phase: index * 1.13
    };
  });

  function getShrineCalmFactor(position, shrineState = {}) {
    let calmFactor = 1;
    SHRINE_DEFINITIONS.forEach((definition) => {
      if (!shrineState?.[definition.id]?.lit) {
        return;
      }
      const distance = Math.hypot(position.x - definition.position.x, position.z - definition.position.z);
      if (distance < 22) {
        calmFactor *= 0.45;
      }
    });
    return calmFactor;
  }

  return {
    group,
    update(time, context = {}) {
      const localPosition = context.localPosition ?? null;
      const warningActive = Boolean(context.warningActive);
      const shrineState = context.shrineState ?? {};

      corruptionNodes.forEach(({ definition, node, groundPulse, core, light, phase }) => {
        const calmFactor = getShrineCalmFactor(definition, shrineState);
        const warningBoost = warningActive ? 1.9 : 1;
        const pulse = 0.68 + Math.sin(time * 1.8 + phase) * 0.22;
        const opacity = 0.08 * calmFactor * warningBoost * pulse;
        groundPulse.material.opacity = opacity;
        core.material.opacity = 0.16 * calmFactor * warningBoost * pulse;
        core.scale.setScalar(0.92 + Math.sin(time * 2.2 + phase) * 0.12 + (warningActive ? 0.1 : 0));
        core.position.y = 0.72 + Math.sin(time * 1.4 + phase) * 0.08;
        light.intensity = 0.14 * calmFactor * warningBoost + pulse * 0.12 * calmFactor * warningBoost;
        node.visible = calmFactor > 0.08;
      });

      watchers.forEach((watcherState, index) => {
        const { definition, watcher, silhouette, eyeLeft, eyeRight } = watcherState;
        const calmFactor = getShrineCalmFactor(definition, shrineState);

        watcher.rotation.y = Math.sin(time * 0.08 + watcherState.phase) * 0.18;
        watcher.position.x = definition.x + Math.sin(time * 0.14 + watcherState.phase) * 0.45;
        watcher.position.z = definition.z + Math.cos(time * 0.11 + watcherState.phase) * 0.32;

        let targetOpacity = 0;
        let eyeOpacity = 0;

        if (localPosition) {
          const distance = Math.hypot(localPosition.x - watcher.position.x, localPosition.z - watcher.position.z);
          const withinTrigger = distance < definition.triggerRadius;
          const tooClose = distance < 8.5;
          const safeArea = isInsideRoadSafeCorridor(localPosition.x, localPosition.z);

          if (!safeArea && withinTrigger && time >= watcherState.nextAttemptTime && time >= watcherState.activeUntil) {
            watcherState.activeUntil = time + 1.2 + seededTreeNoise(time * 0.1 + index) * 1.4;
            watcherState.nextAttemptTime = time + 9 + seededTreeNoise(index * 3.1 + time * 0.05) * 14;
          }

          if (!safeArea && time < watcherState.activeUntil) {
            const life = Math.max(0, watcherState.activeUntil - time);
            const fadeIn = Math.min(1, (1.8 - life) / 0.45);
            const fadeOut = Math.min(1, life / 0.6);
            const distanceFade = tooClose ? 0 : THREE.MathUtils.clamp((distance - 9) / 14, 0, 1);
            targetOpacity = 0.24 * calmFactor * fadeIn * fadeOut * distanceFade;
            eyeOpacity = 0.42 * calmFactor * fadeIn * fadeOut * distanceFade;
          }
        }

        if (warningActive) {
          targetOpacity *= 1.28;
          eyeOpacity *= 1.35;
        }

        silhouette.material.opacity = targetOpacity;
        eyeLeft.material.opacity = eyeOpacity;
        eyeRight.material.opacity = eyeOpacity;
      });
    }
  };
}

function createLake() {
  const group = new THREE.Group();
  group.name = "lake";

  const animatedMaterials = [];
  const shoreMaterial = createLakeMaterial({
    color: 0x78c6de,
    emissive: 0x1d5576,
    emissiveIntensity: 0.18,
    opacity: 0.82,
    textureScale: [5.2, 3.8],
    drift: [0.0012, -0.0008],
    shimmer: 0.024,
    roughness: 0.34,
    metalness: 0.02
  });
  const waterMaterial = createLakeMaterial({
    color: COLORS.lake,
    emissive: 0x184a70,
    emissiveIntensity: 0.24,
    opacity: 0.9,
    textureScale: [4.2, 3.2],
    drift: [0.0018, -0.0011],
    shimmer: 0.032,
    roughness: 0.24,
    metalness: 0.03
  });
  const deepMaterial = createLakeMaterial({
    color: COLORS.lakeDeep,
    emissive: 0x102d4c,
    emissiveIntensity: 0.2,
    opacity: 0.94,
    textureScale: [3.2, 2.6],
    drift: [-0.0013, 0.0009],
    shimmer: 0.02,
    roughness: 0.2,
    metalness: 0.04
  });

  animatedMaterials.push(shoreMaterial, waterMaterial, deepMaterial);

  group.add(createFlatSurface(94, 62, 0x78c6de, {
    x: LAKE_CENTER.x + 1,
    z: LAKE_CENTER.z + 7,
    thickness: 0.01,
    topOffset: -0.014,
    rotationY: -0.05,
    material: shoreMaterial
  }));
  group.add(createFlatSurface(86, 56, COLORS.lake, {
    x: LAKE_CENTER.x + 1,
    z: LAKE_CENTER.z + 7,
    thickness: 0.012,
    topOffset: -0.024,
    rotationY: -0.05,
    material: waterMaterial
  }));
  group.add(createFlatSurface(62, 36, COLORS.lakeDeep, {
    x: LAKE_CENTER.x + 5,
    z: LAKE_CENTER.z + 10,
    thickness: 0.01,
    topOffset: -0.034,
    rotationY: -0.04,
    material: deepMaterial
  }));
  group.add(createFlatSurface(22, 14, 0x99ceb4, {
    x: 10,
    z: 235,
    thickness: 0.004,
    topOffset: 0.0018,
    rotationY: -0.08,
    material: createSurfaceMaterial(0x99ceb4, { roughness: 0.98, metalness: 0 })
  }));
  group.add(createFlatSurface(16, 10, COLORS.roadLight, {
    x: 10.5,
    z: 230.5,
    thickness: 0.004,
    topOffset: 0.0035,
    rotationY: -0.08
  }));

  group.add(createLampPost(16, 233));
  group.add(createLampPost(6.5, 236));
  group.add(createBench(-3, 224, 0.38));

  group.userData.update = (time) => {
    animatedMaterials.forEach((material) => updateLakeMaterial(material, time));
  };

  return group;
}

function createLakeShoreDetails() {
  const group = new THREE.Group();
  group.name = "lake_shore_details";

  const shorePoints = [
    { x: -16, z: 238, scale: 1.05 },
    { x: -6, z: 233, scale: 0.95 },
    { x: 8, z: 232, scale: 1 },
    { x: 22, z: 236, scale: 1.08 },
    { x: 30, z: 248, scale: 0.9 }
  ];

  const shorelinePatches = [
    { x: -12, z: 233, width: 14, depth: 8, rotationY: 0.1 },
    { x: 8, z: 231, width: 18, depth: 9, rotationY: -0.06 },
    { x: 24, z: 241, width: 16, depth: 8, rotationY: 0.08 }
  ];

  shorelinePatches.forEach((patch) => {
    group.add(createFlatSurface(patch.width, patch.depth, COLORS.grassLight, {
      x: patch.x,
      z: patch.z,
      thickness: 0.003,
      topOffset: 0.0026,
      rotationY: patch.rotationY
    }));
  });

  shorePoints.forEach((point, index) => {
    group.add(createReedClump(point.x, point.z, point.scale));
    group.add(createVegetationCluster(point.x - 1.6, point.z - 2.1, 0.74 + index * 0.04, { includeBush: index % 2 === 0, spread: 0.92 }));
    group.add(createVegetationCluster(point.x + 1.1, point.z - 1.2, 0.68 + index * 0.03, { includeBush: false, spread: 0.76 }));
  });

  group.add(createTree(-22, 246, 1.05, 0.18, "small"));
  group.add(createTree(30, 250, 1.12, -0.14, "small"));
  group.add(createTree(24, 236, 0.94, 0.12, "small"));
  group.add(createVegetationCluster(-16, 239, 0.84, { includeBush: true, spread: 0.84 }));
  group.add(createRock(-12, 241, 0.88, 0.12, "flat"));
  group.add(createVegetationCluster(22, 233, 0.78, { includeBush: true, spread: 0.84 }));
  group.add(createReedClump(-6, 236.5, 0.88));
  group.add(createReedClump(14, 234.5, 0.84));
  group.add(createBench(0, 228.5, 0.22));
  group.add(createRock(5, 237, 1.12, -0.1, "large"));
  group.add(createRock(19, 246, 0.9, 0.22, "small"));
  group.add(createVegetationCluster(-8, 229.5, 1.15, { includeBush: false, spread: 1.05 }));
  group.add(createVegetationCluster(15, 229, 1, { includeBush: false, spread: 1 }));
  group.add(createReedClump(30, 241, 0.78));
  group.add(createReedClump(-20, 244, 0.82));

  return group;
}
function createFireflies() {
  const group = new THREE.Group();
  const clusterDefinitions = [
    { center: { x: -14, z: 236 }, count: 4, spreadX: 4.2, spreadZ: 5.1, baseY: 1.18 },
    { center: { x: 18, z: 242 }, count: 4, spreadX: 4.8, spreadZ: 5.2, baseY: 1.24 },
    { center: { x: -40, z: 220 }, count: 3, spreadX: 3.8, spreadZ: 4.6, baseY: 1.16 },
    { center: { x: 36, z: 218 }, count: 3, spreadX: 3.6, spreadZ: 4.2, baseY: 1.14 },
    { center: { x: -17, z: 156 }, count: 3, spreadX: 3.4, spreadZ: 3.8, baseY: 1.12 },
    { center: { x: -54, z: 194 }, count: 3, spreadX: 3.6, spreadZ: 3.6, baseY: 1.06 },
    { center: { x: 58, z: 200 }, count: 3, spreadX: 3.4, spreadZ: 3.5, baseY: 1.08 },
    { center: { x: -46, z: 244 }, count: 4, spreadX: 4.2, spreadZ: 4, baseY: 1.16 },
    { center: { x: 50, z: 250 }, count: 4, spreadX: 4.2, spreadZ: 4, baseY: 1.18 }
  ];

  const particles = [];
  let particleIndex = 0;

  clusterDefinitions.forEach((cluster, clusterIndex) => {
    for (let index = 0; index < cluster.count; index += 1) {
      const angle = clusterIndex * 1.37 + index * 2.11;
      const baseX = cluster.center.x + Math.cos(angle) * cluster.spreadX * (0.42 + (index % 3) * 0.18);
      const baseZ = cluster.center.z + Math.sin(angle * 1.1) * cluster.spreadZ * (0.38 + (index % 2) * 0.22);

      if (isInsideRoadClearance(baseX, baseZ)) {
        continue;
      }

      const mesh = createGlowOrb({
        position: [baseX, BELARUS_GROUND_Y + cluster.baseY + (index % 3) * 0.12, baseZ],
        radius: 0.07 + (index % 2) * 0.015,
        color: 0xf7e88c
      });
      group.add(mesh);
      particles.push({
        mesh,
        baseX,
        baseY: mesh.position.y,
        baseZ,
        phase: particleIndex * 0.86,
        drift: 0.32 + (index % 3) * 0.08
      });
      particleIndex += 1;
    }
  });

  return {
    group,
    update(time) {
      particles.forEach((particle, index) => {
        particle.mesh.position.x = particle.baseX + Math.sin(time * 0.42 + particle.phase) * particle.drift;
        particle.mesh.position.y = particle.baseY + Math.sin(time * 0.95 + particle.phase * 1.4) * 0.12;
        particle.mesh.position.z = particle.baseZ + Math.cos(time * 0.36 + index * 0.7) * (particle.drift * 0.88);
      });
    }
  };
}

function createForestMistSystem() {
  const group = new THREE.Group();
  group.name = "forest_mist_system";
  const mistTexture = createMistTexture();
  const patches = [
    { x: -48, z: 186, y: 1.35, width: 22, height: 7.5, opacity: 0.16, drift: 0.42, phase: 0.3, rotationY: 0.12 },
    { x: 52, z: 194, y: 1.45, width: 24, height: 8.2, opacity: 0.15, drift: 0.38, phase: 1.4, rotationY: -0.1 },
    { x: -42, z: 238, y: 1.3, width: 26, height: 8.8, opacity: 0.17, drift: 0.36, phase: 2.2, rotationY: 0.18 },
    { x: 44, z: 246, y: 1.5, width: 25, height: 8.6, opacity: 0.17, drift: 0.34, phase: 3.1, rotationY: -0.16 },
    { x: 8, z: 284, y: 1.25, width: 30, height: 10, opacity: 0.15, drift: 0.3, phase: 4.2, rotationY: 0.06 },
    { x: -12, z: 266, y: 1.18, width: 18, height: 6.4, opacity: 0.12, drift: 0.28, phase: 5.1, rotationY: -0.08 }
  ];

  const layers = patches.map((patch, index) => {
    const material = new THREE.MeshBasicMaterial({
      color: COLORS.mist,
      map: mistTexture,
      transparent: true,
      opacity: patch.opacity,
      depthWrite: false,
      fog: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(patch.width, patch.height, 1, 1),
      material
    );
    mesh.position.set(patch.x, BELARUS_GROUND_Y + patch.y, patch.z);
    mesh.rotation.y = patch.rotationY;
    mesh.rotation.x = -0.05 + (index % 2) * 0.02;
    mesh.renderOrder = 2;
    group.add(mesh);

    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(patch.width * 1.16, patch.height * 0.52, 1, 1),
      material.clone()
    );
    ribbon.material.opacity = patch.opacity * 0.66;
    ribbon.position.set(patch.x * 0.98, BELARUS_GROUND_Y + patch.y * 0.82, patch.z - 1.2);
    ribbon.rotation.y = patch.rotationY + 0.18;
    ribbon.rotation.x = -0.12;
    ribbon.renderOrder = 2;
    group.add(ribbon);

    return { patch, mesh, ribbon };
  });

  return {
    group,
    update(time) {
      layers.forEach(({ patch, mesh, ribbon }, index) => {
        const driftX = Math.sin(time * patch.drift + patch.phase) * (0.85 + index * 0.08);
        const driftZ = Math.cos(time * patch.drift * 0.78 + patch.phase) * (0.48 + index * 0.05);
        mesh.position.x = patch.x + driftX;
        mesh.position.z = patch.z + driftZ;
        mesh.material.opacity = patch.opacity + Math.sin(time * 0.42 + patch.phase) * 0.025;
        ribbon.position.x = patch.x - driftX * 0.52;
        ribbon.position.z = patch.z - 1.2 + driftZ * 0.4;
        ribbon.material.opacity = patch.opacity * 0.66 + Math.cos(time * 0.36 + patch.phase) * 0.02;
      });
    }
  };
}

function createRoadMaterial(length) {
  const texture = getRoadTexture().clone();
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, Math.max(1.4, length / 2.6));

  return new THREE.MeshStandardMaterial({ color: COLORS.road, roughness: 1, metalness: 0, map: texture });
}

function createGrassMaterial(width, depth, color) {
  const texture = getGrassTexture();

  if (!texture) {
    return createSurfaceMaterial(color, { roughness: 1, metalness: 0 });
  }

  const tiledTexture = texture.clone();
  tiledTexture.needsUpdate = true;
  tiledTexture.wrapS = THREE.RepeatWrapping;
  tiledTexture.wrapT = THREE.RepeatWrapping;
  tiledTexture.repeat.set(Math.max(3, width / 12), Math.max(3, depth / 12));

  return new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0,
    map: tiledTexture
  });
}

function getRoadTexture() {
  if (!cachedRoadTexture) {
    cachedRoadTexture = new THREE.TextureLoader().load("/assets/textures/dirt-road.svg");
    cachedRoadTexture.wrapS = THREE.RepeatWrapping;
    cachedRoadTexture.wrapT = THREE.RepeatWrapping;
    cachedRoadTexture.colorSpace = THREE.SRGBColorSpace;
  }

  return cachedRoadTexture;
}

function getGrassTexture() {
  if (cachedGrassTexture) {
    return cachedGrassTexture;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (!context) {
      if (!grassTextureFallbackLogged) {
        console.warn("Grass texture fallback used.");
        grassTextureFallbackLogged = true;
      }
      return null;
    }

    context.fillStyle = "#5e7656";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < 420; index += 1) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 1 + Math.random() * 3.5;
      context.fillStyle = index % 3 === 0 ? "rgba(119, 147, 98, 0.32)" : "rgba(53, 79, 51, 0.28)";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    for (let blade = 0; blade < 180; blade += 1) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      context.strokeStyle = blade % 2 === 0 ? "rgba(150, 176, 113, 0.18)" : "rgba(72, 104, 63, 0.2)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (Math.random() - 0.5) * 5, y - 5 - Math.random() * 7);
      context.stroke();
    }

    cachedGrassTexture = new THREE.CanvasTexture(canvas);
    cachedGrassTexture.wrapS = THREE.RepeatWrapping;
    cachedGrassTexture.wrapT = THREE.RepeatWrapping;
    cachedGrassTexture.colorSpace = THREE.SRGBColorSpace;

    return cachedGrassTexture;
  } catch (error) {
    if (!grassTextureFallbackLogged) {
      console.warn("Grass texture fallback used.", error);
      grassTextureFallbackLogged = true;
    }
    return null;
  }
}
function getLakeTexture() {
  if (cachedLakeTexture) {
    return cachedLakeTexture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#93d5ea");
  gradient.addColorStop(0.45, "#58a6ce");
  gradient.addColorStop(1, "#2f6d96");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let ripple = 0; ripple < 22; ripple += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radiusX = 18 + Math.random() * 42;
    const radiusY = 4 + Math.random() * 10;
    context.strokeStyle = ripple % 2 === 0 ? "rgba(210, 245, 255, 0.18)" : "rgba(120, 220, 235, 0.14)";
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, Math.random() * Math.PI, 0, Math.PI * 2);
    context.stroke();
  }

  context.globalAlpha = 0.2;
  for (let band = 0; band < 10; band += 1) {
    const y = (band / 10) * canvas.height;
    context.fillStyle = band % 2 === 0 ? "rgba(255,255,255,0.4)" : "rgba(110, 225, 235, 0.28)";
    context.fillRect(0, y, canvas.width, 6 + Math.random() * 10);
  }
  context.globalAlpha = 1;

  cachedLakeTexture = new THREE.CanvasTexture(canvas);
  cachedLakeTexture.wrapS = THREE.RepeatWrapping;
  cachedLakeTexture.wrapT = THREE.RepeatWrapping;
  cachedLakeTexture.colorSpace = THREE.SRGBColorSpace;

  return cachedLakeTexture;
}

function createLakeMaterial({
  color,
  emissive,
  emissiveIntensity,
  opacity,
  textureScale,
  drift,
  shimmer,
  roughness,
  metalness
}) {
  const baseTexture = getLakeTexture();
  const texture = baseTexture ? baseTexture.clone() : null;

  if (texture) {
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(textureScale[0], textureScale[1]);
  }

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity,
    roughness,
    metalness,
    transparent: true,
    opacity,
    map: texture ?? null
  });

  material.userData.lakeDrift = drift;
  material.userData.lakeBaseEmissiveIntensity = emissiveIntensity;
  material.userData.lakeShimmer = shimmer;
  return material;
}

function updateLakeMaterial(material, time) {
  if (!material) {
    return;
  }

  if (material.map) {
    material.map.offset.x = (time * material.userData.lakeDrift[0]) % 1;
    material.map.offset.y = (time * material.userData.lakeDrift[1]) % 1;
  }

  const base = material.userData.lakeBaseEmissiveIntensity ?? material.emissiveIntensity;
  const shimmer = material.userData.lakeShimmer ?? 0.02;
  material.emissiveIntensity = base + Math.sin(time * 0.45) * shimmer;
}
function createFlatSurface(width, depth, color, { x = 0, z = 0, thickness = SURFACE_THICKNESS, topOffset = SURFACE_TOP_OFFSET, rotationY = 0, material = null } = {}) {
  const surfaceMaterial = material ?? createSurfaceMaterial(color);
  const depthPriority = Math.max(1, Math.round((topOffset + 0.05) * 1000));
  surfaceMaterial.polygonOffset = true;
  surfaceMaterial.polygonOffsetFactor = -1;
  surfaceMaterial.polygonOffsetUnits = -depthPriority;

  return createMesh(
    new THREE.BoxGeometry(width, thickness, depth),
    surfaceMaterial,
    {
      position: new THREE.Vector3(x, BELARUS_GROUND_Y - thickness * 0.5 + topOffset, z),
      rotationY,
      receiveShadow: true
    }
  );
}

function createHouse(config, index) {
  const house = new THREE.Group();
  house.position.set(config.position.x, BELARUS_GROUND_Y, config.position.z);
  house.rotation.y = config.rotationY;

  const bodyWidth = config.size[0];
  const bodyHeight = config.size[1];
  const bodyDepth = config.size[2];

  house.add(createMesh(new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth), createSurfaceMaterial(config.color), { position: new THREE.Vector3(0, bodyHeight * 0.5, 0), castShadow: true, receiveShadow: true }));
  house.add(createMesh(new THREE.ConeGeometry(Math.max(bodyWidth, bodyDepth) * 0.72, bodyHeight * config.roofScale, 4), createSurfaceMaterial(COLORS.roof), { position: new THREE.Vector3(0, bodyHeight + bodyHeight * config.roofScale * 0.45, 0), rotationY: Math.PI / 4, castShadow: true, receiveShadow: true }));
  house.add(createMesh(new THREE.BoxGeometry(0.45, 1.6, 0.45), createSurfaceMaterial(COLORS.roof), { position: new THREE.Vector3(bodyWidth * 0.24, bodyHeight + 1.6, -bodyDepth * 0.1), castShadow: true, receiveShadow: true }));
  house.add(createMesh(new THREE.BoxGeometry(bodyWidth * 0.52, 0.18, 1.1), createSurfaceMaterial(COLORS.wood), { position: new THREE.Vector3(0, 0.28, bodyDepth * 0.5 + 0.45), castShadow: true, receiveShadow: true }));
  house.add(createMesh(new THREE.BoxGeometry(bodyWidth * 0.56, 0.12, 0.22), createSurfaceMaterial(COLORS.wood), { position: new THREE.Vector3(0, 1.95, bodyDepth * 0.5 + 0.08), castShadow: true, receiveShadow: true }));
  house.add(createDoor({ position: [0, 1.15, bodyDepth * 0.5 + 0.03], width: 1.25, height: 2.3 }));
  addGlowingWindow(house, { position: [-bodyWidth * 0.22, 2.45, bodyDepth * 0.5 + 0.06], scale: [0.9, 1.1, 0.1] });
  addGlowingWindow(house, { position: [bodyWidth * 0.22, 2.45, bodyDepth * 0.5 + 0.06], scale: [0.9, 1.1, 0.1] });
  addGlowingWindow(house, { position: [-bodyWidth * 0.5 - 0.04, 2.4, 0], scale: [0.1, 1.1, 1.1] });
  if (index % 2 === 0) {
    addGlowingWindow(house, { position: [bodyWidth * 0.5 + 0.04, 2.35, 0.2], scale: [0.1, 1, 1] });
  }

  [-1, 1].forEach((dir) => {
    house.add(createMesh(new THREE.BoxGeometry(0.12, 1.15, 0.08), createSurfaceMaterial(COLORS.fence), {
      position: new THREE.Vector3(dir * bodyWidth * 0.22, 2.45, bodyDepth * 0.5 + 0.12),
      castShadow: true,
      receiveShadow: true
    }));
  });

  if (index % 3 === 0) {
    house.add(createMesh(new THREE.BoxGeometry(bodyWidth * 0.42, 1.25, 0.18), createSurfaceMaterial(COLORS.stationRoof), {
      position: new THREE.Vector3(-bodyWidth * 0.16, 1.25, bodyDepth * 0.5 + 0.62),
      castShadow: true,
      receiveShadow: true
    }));
  }

  if (index === 1) {
    house.add(createInteriorTableSet({ x: 0.1, z: bodyDepth * 0.18, rotationY: 0.04 }));
    house.add(createOpenBookProp({ x: 0.35, y: 1.18, z: bodyDepth * 0.14, rotationY: 0.2 }));
  }

  if (index === 2) {
    house.add(createChildDrawingProp({ x: -bodyWidth * 0.34, y: 2.55, z: bodyDepth * 0.32, rotationY: 0 }));
  }

  if (index === 4) {
    house.add(createBootsProp({ x: 0.9, z: bodyDepth * 0.5 + 0.72, rotationY: 0.08 }));
    house.add(createWallMuralProp({ x: bodyWidth * 0.5 + 0.08, y: 2.5, z: -0.3, rotationY: Math.PI * 0.5 }));
  }

  return house;
}

function createShed(x, z, rotationY) {
  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  group.add(createMesh(new THREE.BoxGeometry(3.2, 2.6, 2.8), createSurfaceMaterial(COLORS.wood), { position: new THREE.Vector3(0, 1.3, 0), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.ConeGeometry(2.7, 1.8, 4), createSurfaceMaterial(COLORS.roof), { position: new THREE.Vector3(0, 3.2, 0), rotationY: Math.PI / 4, castShadow: true, receiveShadow: true }));
  return group;
}

function createFenceRectangle() {
  return new THREE.Group();
}

function createFenceRun() {
  return new THREE.Group();
}

function createPrimitiveFencePiece() {
  return new THREE.Group();
}

function createGardenPlot(x, z, rotationY) {
  return createFlatSurface(3.4, 2.6, COLORS.garden, { x, z, thickness: 0.008, topOffset: 0.0015, rotationY });
}

function createAnimalPen(x, z, rotationY) {
  const center = new THREE.Vector3(x, BELARUS_GROUND_Y, z);
  const group = new THREE.Group();
  group.add(createFlatSurface(3.4, 2.8, COLORS.penGround, { x, z, thickness: 0.006, topOffset: 0.001, rotationY }));
  group.add(createFenceRectangle({ center, width: 4.2, depth: 3.6, rotationY, gateOffset: 0.8 }));
  return group;
}

function createLaundryLine(x, z, rotationY) {
  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  [-1.2, 1.2].forEach((offset) => {
    group.add(createMesh(new THREE.BoxGeometry(0.12, 1.7, 0.12), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(offset, 0.85, 0), castShadow: true, receiveShadow: true }));
  });
  group.add(createMesh(new THREE.BoxGeometry(2.4, 0.04, 0.04), createSurfaceMaterial(COLORS.rope), { position: new THREE.Vector3(0, 1.4, 0), castShadow: true, receiveShadow: true }));
  [-0.65, 0, 0.65].forEach((offset, index) => {
    group.add(createMesh(new THREE.BoxGeometry(0.42, 0.6, 0.03), createSurfaceMaterial(index % 2 === 0 ? COLORS.laundry : COLORS.churchAccent), { position: new THREE.Vector3(offset, 1.02, 0), castShadow: true, receiveShadow: true }));
  });
  group.add(createMesh(new THREE.BoxGeometry(0.22, 0.92, 0.04), createSurfaceMaterial(0xf2f4f6), {
    position: new THREE.Vector3(0.95, 0.94, 0),
    rotationZ: 0.18,
    castShadow: true,
    receiveShadow: true
  }));
  return group;
}

function createWell(x, z) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.add(createKenneyPropAnchor({
    kind: "stone_top",
    scale: 1.8,
    fallback: createMesh(new THREE.CylinderGeometry(1.2, 1.4, 0.8, 8), createSurfaceMaterial(COLORS.stone), { position: new THREE.Vector3(0, 0.4, 0), castShadow: true, receiveShadow: true })
  }));
  group.add(createKenneyPropAnchor({
    kind: "wood_path",
    y: 1.38,
    scaleX: 0.9,
    scaleY: 1,
    scaleZ: 1.2,
    fallback: createMesh(new THREE.BoxGeometry(2.1, 0.16, 0.16), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(0, 2.3, 0), castShadow: true, receiveShadow: true })
  }));
  group.add(createKenneyPropAnchor({
    kind: "pot_small",
    y: 0.24,
    scale: 0.72,
    fallback: createMesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), createSurfaceMaterial(COLORS.roof), { position: new THREE.Vector3(0, 0.28, 0), castShadow: true, receiveShadow: true })
  }));
  return group;
}

function createBench(x, z, rotationY) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  group.add(createKenneyPropAnchor({
    kind: "wood_path",
    y: 0.62,
    scaleX: 0.95,
    scaleZ: 0.8,
    fallback: createPrimitiveBenchFallback()
  }));
  group.add(createKenneyPropAnchor({
    kind: "wood_path_end",
    y: 0.98,
    z: -0.18,
    rotationX: -0.32,
    scaleX: 0.95,
    scaleZ: 0.8
  }));
  return group;
}

function createPrimitiveBenchFallback() {
  const group = new THREE.Group();
  group.add(createMesh(new THREE.BoxGeometry(1.8, 0.12, 0.45), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(0, 0.78, 0), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.BoxGeometry(1.8, 0.12, 0.2), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(0, 1.2, -0.16), rotationX: -0.25, castShadow: true, receiveShadow: true }));
  [-0.7, 0.7].forEach((offset) => {
    group.add(createMesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(offset, 0.4, -0.12), castShadow: true, receiveShadow: true }));
    group.add(createMesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(offset, 0.4, 0.12), castShadow: true, receiveShadow: true }));
  });
  return group;
}

function createSignPost(x, z, rotationY) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  const fallback = new THREE.Group();
  fallback.add(createMesh(new THREE.BoxGeometry(0.15, 2.2, 0.15), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(0, 1.1, 0), castShadow: true, receiveShadow: true }));
  fallback.add(createMesh(new THREE.BoxGeometry(1.3, 0.5, 0.12), createSurfaceMaterial(COLORS.stationWall), { position: new THREE.Vector3(0.8, 1.7, 0), castShadow: true, receiveShadow: true }));
  group.add(createKenneyPropAnchor({ kind: "sign", fallback }));
  return group;
}

function createCrateStack(x, z) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.add(createKenneyPropAnchor({
    kind: "pot_large",
    scale: 0.9,
    fallback: createMesh(new THREE.BoxGeometry(1, 0.7, 1), createSurfaceMaterial(COLORS.crate), { position: new THREE.Vector3(0, 0.35, 0), castShadow: true, receiveShadow: true })
  }));
  group.add(createKenneyPropAnchor({
    kind: "pot_small",
    x: 0.55,
    y: 0.62,
    z: 0.28,
    scale: 0.82,
    fallback: createMesh(new THREE.BoxGeometry(0.8, 0.55, 0.8), createSurfaceMaterial(COLORS.crate), { position: new THREE.Vector3(0.55, 0.98, 0.28), castShadow: true, receiveShadow: true })
  }));
  return group;
}

function createWoodPile(x, z, rotationY = 0) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  const fallback = new THREE.Group();
  for (let index = 0; index < 5; index += 1) {
    fallback.add(createMesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 8), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(-0.8 + index * 0.38, 0.18 + (index % 2) * 0.16, 0), rotationZ: Math.PI * 0.5, castShadow: true, receiveShadow: true }));
  }
  group.add(createKenneyPropAnchor({ kind: "log_stack_large", fallback }));
  return group;
}

function createFallenTimber(x, z, rotationY = 0, scale = 1) {
  if (isInsideRoadClearance(x, z) || isInsideRoadSafeCorridor(x, z) || isInsideLakeWaterArea(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  group.add(createKenneyPropAnchor({
    kind: "wood_path",
    y: 0.08,
    rotationX: Math.PI * 0.5,
    rotationZ: 0.08,
    scaleX: scale * 0.9,
    scaleY: scale * 1.1,
    scaleZ: scale * 1.15,
    fallback: createMesh(new THREE.CylinderGeometry(0.16, 0.18, 2.4, 8), createSurfaceMaterial(COLORS.wood), {
      position: new THREE.Vector3(0, 0.22, 0),
      rotationZ: Math.PI * 0.5,
      castShadow: true,
      receiveShadow: true
    })
  }));
  group.add(createKenneyPropAnchor({
    kind: "wood_path_end",
    x: 0.82,
    y: 0.1,
    rotationX: Math.PI * 0.5,
    rotationZ: -0.05,
    scale: scale * 0.84
  }));
  return group;
}

function createStoneMarkerCluster(x, z, rotationY = 0, scale = 1) {
  if (isInsideRoadClearance(x, z) || isInsideRoadSafeCorridor(x, z) || isInsideLakeWaterArea(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  group.add(createKenneyPropAnchor({
    kind: "stone_top",
    scale: scale,
    fallback: createMesh(new THREE.DodecahedronGeometry(0.62, 0), createSurfaceMaterial(COLORS.stone), {
      position: new THREE.Vector3(0, 0.42, 0),
      castShadow: true,
      receiveShadow: true
    })
  }));
  group.add(createKenneyPropAnchor({
    kind: "stone_top",
    x: 0.78,
    z: -0.32,
    scale: scale * 0.72
  }));
  group.add(createKenneyPropAnchor({
    kind: "stone_top",
    x: -0.64,
    z: 0.26,
    scale: scale * 0.58
  }));
  return group;
}

function createLampPost(x, z) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.add(createMesh(new THREE.BoxGeometry(0.16, 3.8, 0.16), createSurfaceMaterial(0x313840), { position: new THREE.Vector3(0, 1.9, 0), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), createSurfaceMaterial(0x313840), { position: new THREE.Vector3(0.26, 3.55, 0), castShadow: true, receiveShadow: true }));
  group.add(createGlowOrb({ position: [0.56, 3.35, 0], radius: 0.18, color: COLORS.lampGlow }));
  if (!isLowPerformanceMode()) {
    const light = new THREE.PointLight(COLORS.lampGlow, 0.88, 12, 2);
    light.position.set(0.56, 3.35, 0);
    group.add(light);
  }
  return group;
}

function createDock(x, z, rotationY) {
  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  group.add(createMesh(new THREE.BoxGeometry(2.2, 0.12, 9), createSurfaceMaterial(COLORS.dock), { position: new THREE.Vector3(0, 0.06, 0), castShadow: true, receiveShadow: true }));
  [-0.8, 0.8].forEach((offsetX) => {
    [-3.2, -0.6, 2.2].forEach((offsetZ) => {
      group.add(createMesh(new THREE.BoxGeometry(0.22, 1.4, 0.22), createSurfaceMaterial(COLORS.fence), { position: new THREE.Vector3(offsetX, -0.55, offsetZ), castShadow: true, receiveShadow: true }));
    });
  });
  group.add(createMesh(new THREE.BoxGeometry(3.1, 0.1, 2), createSurfaceMaterial(COLORS.dock), { position: new THREE.Vector3(0, 0.08, -3.4), castShadow: true, receiveShadow: true }));
  return group;
}

function createTree(x, z, scale = 1, rotationY = 0, variant = "round") {
  if (isInsideRoadClearance(x, z) || isInsideLakeWaterArea(x, z)) {
    return new THREE.Group();
  }

  const anchor = new THREE.Group();
  anchor.position.set(x, BELARUS_GROUND_Y, z);
  anchor.rotation.y = rotationY;
  anchor.userData.treeAnchor = true;
  anchor.userData.treeVariant = variant;
  anchor.userData.treeScale = scale;
  anchor.userData.treeSeed = x * 12.9898 + z * 78.233 + scale * 37.719;
  anchor.userData.baseRotationX = 0;
  anchor.userData.baseRotationZ = 0;
  anchor.add(createPrimitiveTreeFallback(scale));
  return anchor;
}

function createTreeSwaySystem(root) {
  const anchors = [];
  root.traverse((child) => {
    if (child.userData?.treeAnchor) {
      anchors.push(child);
    }
  });

  return {
    update(time) {
      anchors.forEach((anchor, index) => {
        const seed = anchor.userData.treeSeed ?? index * 1.37;
        const scale = anchor.userData.treeScale ?? 1;
        const swayAmount = 0.008 + Math.min(0.02, scale * 0.006);
        anchor.rotation.z = Math.sin(time * 0.62 + seed * 0.004) * swayAmount;
        anchor.rotation.x = Math.cos(time * 0.48 + seed * 0.003) * swayAmount * 0.45;
      });
    }
  };
}

function createPrimitiveTreeFallback(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  group.add(createMesh(new THREE.CylinderGeometry(0.18, 0.26, 2.6, 6), createSurfaceMaterial(0x6a4d35), {
    position: new THREE.Vector3(0, 1.3, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.34, 0.22, 0.38, 6), createSurfaceMaterial(0x4e6a44), {
    position: new THREE.Vector3(0, 2.5, 0),
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.OctahedronGeometry(1.45, 0), createSurfaceMaterial(0x274334), {
    position: new THREE.Vector3(0.02, 3.55, 0),
    rotationY: Math.PI * 0.16,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.OctahedronGeometry(1.12, 0), createSurfaceMaterial(0x32523d), {
    position: new THREE.Vector3(-0.1, 4.72, 0.06),
    rotationY: Math.PI * 0.08,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.OctahedronGeometry(0.78, 0), createSurfaceMaterial(0x5c7a59), {
    position: new THREE.Vector3(0.06, 5.7, -0.04),
    rotationY: Math.PI * 0.24,
    castShadow: true,
    receiveShadow: true
  }));

  return group;
}

function createBush(x, z, scale = 1, variant = null) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const anchor = new THREE.Group();
  anchor.position.set(x, BELARUS_GROUND_Y, z);
  anchor.userData.bushAnchor = true;
  anchor.userData.bushVariant = variant ?? (scale < 0.86 ? "small" : "lush");
  anchor.userData.bushScale = scale;
  anchor.userData.bushSeed = x * 41.37 + z * 23.19 + scale * 17.03;
  anchor.add(createPrimitiveBushFallback(scale));
  return anchor;
}

function createPrimitiveBushFallback(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  group.add(createMesh(new THREE.SphereGeometry(1.15, 10, 10), createSurfaceMaterial(COLORS.bush), { position: new THREE.Vector3(0, 0.82, 0), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.SphereGeometry(0.86, 10, 10), createSurfaceMaterial(COLORS.bushLight), { position: new THREE.Vector3(0.65, 1.05, 0.1), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.SphereGeometry(0.76, 10, 10), createSurfaceMaterial(COLORS.forestDark), { position: new THREE.Vector3(-0.7, 0.95, -0.08), castShadow: true, receiveShadow: true }));
  return group;
}

function createRock(x, z, scale = 1, rotationY = 0, variant = null) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const anchor = new THREE.Group();
  anchor.position.set(x, BELARUS_GROUND_Y, z);
  anchor.rotation.y = rotationY;
  anchor.userData.rockAnchor = true;
  anchor.userData.rockVariant = variant ?? (scale > 1.1 ? "large" : "small");
  anchor.userData.rockScale = scale;
  anchor.userData.rockSeed = x * 19.91 + z * 63.77 + scale * 9.37;
  anchor.add(createPrimitiveRockFallback(scale));
  return anchor;
}

function createPrimitiveRockFallback(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  group.add(createMesh(new THREE.DodecahedronGeometry(0.78, 0), createSurfaceMaterial(COLORS.stone), { position: new THREE.Vector3(0, 0.52, 0), rotationY: 0.2, castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.DodecahedronGeometry(0.46, 0), createSurfaceMaterial(COLORS.grave), { position: new THREE.Vector3(0.46, 0.34, 0.18), rotationY: -0.18, castShadow: true, receiveShadow: true }));
  return group;
}

function createGrassClump(x, z, scale = 1) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  const seed = seededTreeNoise(x * 0.11 + z * 0.07 + scale * 1.7);
  const rotationBias = THREE.MathUtils.lerp(-0.35, 0.35, seed);
  group.add(createKenneyPropAnchor({
    kind: scale > 0.95 ? "grass_large" : "grass_small",
    scale: scale,
    rotationY: rotationBias,
    fallback: createPrimitiveGrassClumpFallback(scale)
  }));
  group.add(createKenneyPropAnchor({
    kind: "plant_short",
    x: -0.34,
    z: 0.08,
    scale: scale * 0.82,
    rotationY: rotationBias - 0.42
  }));
  group.add(createKenneyPropAnchor({
    kind: "plant_short",
    x: 0.28,
    z: -0.12,
    scale: scale * 0.74,
    rotationY: rotationBias + 0.36
  }));
  return group;
}

function createPrimitiveGrassClumpFallback(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  [-0.3, 0, 0.32].forEach((offset, index) => {
    group.add(createMesh(new THREE.ConeGeometry(0.18 + index * 0.03, 0.72 + index * 0.08, 5), createSurfaceMaterial(index % 2 === 0 ? COLORS.grassDark : COLORS.grass), { position: new THREE.Vector3(offset, 0.36 + index * 0.04, index === 1 ? 0.08 : -0.04), castShadow: true, receiveShadow: true }));
  });
  return group;
}

function createReedClump(x, z, scale = 1) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  const seed = seededTreeNoise(x * 0.09 + z * 0.13 + scale * 2.1);
  const rotationBias = THREE.MathUtils.lerp(-0.28, 0.28, seed);
  group.add(createKenneyPropAnchor({
    kind: "plant_tall",
    scale: scale,
    rotationY: rotationBias,
    fallback: createPrimitiveReedClumpFallback(scale)
  }));
  group.add(createKenneyPropAnchor({
    kind: "plant_tall",
    x: 0.34,
    z: 0.16,
    scale: scale * 0.78,
    rotationY: rotationBias + 0.42
  }));
  group.add(createKenneyPropAnchor({
    kind: "grass_large",
    x: -0.28,
    z: -0.12,
    scale: scale * 0.66,
    rotationY: rotationBias - 0.36
  }));
  return group;
}

function createPrimitiveReedClumpFallback(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  [-0.35, -0.1, 0.15, 0.4].forEach((offset, index) => {
    group.add(createMesh(new THREE.BoxGeometry(0.08, 0.85 + index * 0.1, 0.08), createSurfaceMaterial(index % 2 === 0 ? COLORS.reed : COLORS.flower), { position: new THREE.Vector3(offset, 0.42 + index * 0.05, (index % 2) * 0.12), rotationZ: (index - 1.5) * 0.08, castShadow: true, receiveShadow: true }));
  });
  return group;
}

function createVegetationCluster(x, z, scale = 1, options = {}) {
  const { progress = null, includeBush = false, spread = 1.15 } = options;
  const group = new THREE.Group();
  const safeCenter = getSafeRoadsidePosition(x, z, { progress, extraOffset: 1.4 });
  const seed = seededTreeNoise(safeCenter.x * 0.07 + safeCenter.z * 0.05 + scale * 0.91);
  const rotation = THREE.MathUtils.lerp(-0.55, 0.55, seed);

  const offsets = [
    { x: 0, z: 0, scale: scale },
    { x: Math.cos(rotation) * spread * 0.7, z: Math.sin(rotation) * spread * 0.55, scale: scale * 0.84 },
    { x: -Math.sin(rotation) * spread * 0.85, z: Math.cos(rotation) * spread * 0.65, scale: scale * 0.72 }
  ];

  offsets.forEach((offset) => {
    const point = getSafeRoadsidePosition(safeCenter.x + offset.x, safeCenter.z + offset.z, { progress, extraOffset: 1.1 });
    group.add(createGrassClump(point.x, point.z, offset.scale));
  });

  if (includeBush) {
    const bushPoint = getSafeRoadsidePosition(
      safeCenter.x + Math.cos(rotation + 0.6) * spread * 1.15,
      safeCenter.z + Math.sin(rotation + 0.6) * spread * 0.9,
      { progress, extraOffset: 1.35 }
    );
    group.add(createBush(bushPoint.x, bushPoint.z, scale * 0.68, scale < 0.9 ? "small" : null));
  }

  return group;
}

function createCart() {
  return new THREE.Group();
}

function createHayBale(x, z, scale = [1.6, 1.3, 1.1]) {
  if (isInsideRoadClearance(x, z)) {
    return new THREE.Group();
  }

  return createMesh(new THREE.BoxGeometry(scale[0], scale[1], scale[2]), createSurfaceMaterial(COLORS.hay), { position: new THREE.Vector3(x, scale[1] * 0.5, z), castShadow: true, receiveShadow: true });
}
function createPointLightOrb(position, color, intensity, distance) {
  const group = new THREE.Group();
  group.add(createGlowOrb({ position, radius: 0.32, color }));
  if (!isLowPerformanceMode()) {
    const light = new THREE.PointLight(color, intensity, distance, 2);
    light.position.set(position[0], position[1], position[2]);
    group.add(light);
  }
  return group;
}

function addGlowingWindow(parent, { position, scale }) {
  parent.add(createMesh(new THREE.BoxGeometry(scale[0], scale[1], scale[2]), new THREE.MeshStandardMaterial({ color: COLORS.windowGlow, emissive: COLORS.windowGlow, emissiveIntensity: 0.75, roughness: 0.9, metalness: 0 }), { position: new THREE.Vector3(position[0], position[1], position[2]) }));
}

function createGlowOrb({ position, radius, color }) {
  return createMesh(new THREE.SphereGeometry(radius, 12, 12), new THREE.MeshBasicMaterial({ color }), { position: new THREE.Vector3(position[0], position[1], position[2]) });
}

function createWatcherTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  const silhouetteGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  silhouetteGradient.addColorStop(0, "rgba(12, 6, 10, 0)");
  silhouetteGradient.addColorStop(0.18, "rgba(18, 8, 14, 0.42)");
  silhouetteGradient.addColorStop(0.55, "rgba(18, 8, 14, 0.78)");
  silhouetteGradient.addColorStop(0.88, "rgba(8, 4, 8, 0.24)");
  silhouetteGradient.addColorStop(1, "rgba(8, 4, 8, 0)");
  context.fillStyle = silhouetteGradient;
  context.beginPath();
  context.ellipse(canvas.width * 0.5, canvas.height * 0.2, 18, 24, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(canvas.width * 0.34, canvas.height * 0.36);
  context.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.18, canvas.width * 0.66, canvas.height * 0.36);
  context.lineTo(canvas.width * 0.76, canvas.height * 0.84);
  context.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.98, canvas.width * 0.24, canvas.height * 0.84);
  context.closePath();
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createMistTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.18, "rgba(225,235,240,0.2)");
  gradient.addColorStop(0.5, "rgba(235,244,248,0.58)");
  gradient.addColorStop(0.82, "rgba(220,232,238,0.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.24;
  for (let puff = 0; puff < 18; puff += 1) {
    const x = Math.random() * canvas.width;
    const y = 16 + Math.random() * (canvas.height - 32);
    const radiusX = 18 + Math.random() * 30;
    const radiusY = 8 + Math.random() * 16;
    context.fillStyle = "rgba(255,255,255,0.45)";
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createDoor({ position, width, height, color = COLORS.fence }) {
  return createMesh(new THREE.BoxGeometry(width, height, 0.12), createSurfaceMaterial(color), { position: new THREE.Vector3(position[0], position[1], position[2]), castShadow: true, receiveShadow: true });
}

function createStoryTexture(drawFn, width = 256, height = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  drawFn(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createStationNameSign(x, z, rotationY = 0) {
  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;

  const signTexture = createStoryTexture((context, width, height) => {
    context.fillStyle = "#f0e6cb";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#5b4636";
    context.lineWidth = 10;
    context.strokeRect(5, 5, width - 10, height - 10);
    context.fillStyle = "#433126";
    context.font = "bold 58px serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(MAP1_DISPLAY_NAME, width * 0.5, height * 0.52);
  });

  [-1.2, 1.2].forEach((offset) => {
    group.add(createMesh(new THREE.BoxGeometry(0.16, 2.1, 0.16), createSurfaceMaterial(COLORS.wood), {
      position: new THREE.Vector3(offset, 1.05, 0), castShadow: true, receiveShadow: true
    }));
  });
  group.add(createMesh(
    new THREE.BoxGeometry(4.2, 1.3, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xf0e6cb, map: signTexture, roughness: 0.92, metalness: 0 }),
    { position: new THREE.Vector3(0, 2.15, 0), castShadow: true, receiveShadow: true }
  ));
  return group;
}

function createMailBox(x, z, rotationY = 0) {
  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  group.add(createMesh(new THREE.BoxGeometry(0.18, 1.6, 0.18), createSurfaceMaterial(COLORS.wood), { position: new THREE.Vector3(0, 0.8, 0), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.BoxGeometry(0.72, 0.58, 0.52), createSurfaceMaterial(0x6c2f2a), { position: new THREE.Vector3(0, 1.48, 0), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.BoxGeometry(0.44, 0.08, 0.04), createSurfaceMaterial(0xf0d8a6), { position: new THREE.Vector3(0, 1.52, 0.27), castShadow: true, receiveShadow: true }));
  return group;
}

function createLetterNote(x, z, y = 0.18, rotationY = 0) {
  return createMesh(new THREE.BoxGeometry(0.34, 0.02, 0.24), createSurfaceMaterial(0xf4eddc), {
    position: new THREE.Vector3(x, BELARUS_GROUND_Y + y, z),
    rotationY,
    castShadow: true,
    receiveShadow: true
  });
}

function createInteriorTableSet({ x = 0, z = 0, rotationY = 0 }) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  group.add(createMesh(new THREE.BoxGeometry(1.2, 0.12, 0.8), createSurfaceMaterial(0x7b5d43), { position: new THREE.Vector3(0, 1.02, 0), castShadow: true, receiveShadow: true }));
  [-0.46, 0.46].forEach((offsetX) => {
    [-0.26, 0.26].forEach((offsetZ) => {
      group.add(createMesh(new THREE.BoxGeometry(0.1, 0.92, 0.1), createSurfaceMaterial(0x6a4d35), { position: new THREE.Vector3(offsetX, 0.5, offsetZ), castShadow: true, receiveShadow: true }));
    });
  });
  group.add(createMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 10), createSurfaceMaterial(0xe9e1d1), { position: new THREE.Vector3(-0.18, 1.1, 0.05), castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), createSurfaceMaterial(0xd9c2a0), { position: new THREE.Vector3(0.16, 1.12, -0.08), castShadow: true, receiveShadow: true }));
  return group;
}

function createWarmLampProp({ x = 0, y = 1.6, z = 0 }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.add(createMesh(new THREE.CylinderGeometry(0.08, 0.12, 0.16, 10), createSurfaceMaterial(0x6c5242), { position: new THREE.Vector3(0, 0.08, 0), castShadow: true, receiveShadow: true }));
  group.add(createGlowOrb({ position: [0, 0.34, 0], radius: 0.1, color: COLORS.windowGlow }));
  return group;
}

function createOpenBookProp({ x = 0, y = 1.08, z = 0, rotationY = 0 }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  group.add(createMesh(new THREE.BoxGeometry(0.24, 0.02, 0.18), createSurfaceMaterial(0xf1ebdf), { position: new THREE.Vector3(-0.07, 0, 0), rotationZ: -0.22, castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.BoxGeometry(0.24, 0.02, 0.18), createSurfaceMaterial(0xf1ebdf), { position: new THREE.Vector3(0.07, 0, 0), rotationZ: 0.22, castShadow: true, receiveShadow: true }));
  group.add(createMesh(new THREE.BoxGeometry(0.02, 0.03, 0.18), createSurfaceMaterial(0x8d5447), { position: new THREE.Vector3(0, 0.01, 0), castShadow: true, receiveShadow: true }));
  return group;
}

function createChildDrawingProp({ x = 0, y = 2.2, z = 0, rotationY = 0 }) {
  const texture = createStoryTexture((context, width, height) => {
    context.fillStyle = "#f7f2e6";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#6aa4d6";
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(24, height - 18);
    context.lineTo(width * 0.35, 26);
    context.lineTo(width * 0.7, height - 18);
    context.stroke();
    context.strokeStyle = "#d66a78";
    context.beginPath();
    context.arc(width * 0.72, height * 0.32, 18, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = "#7aa35d";
    context.beginPath();
    context.moveTo(width * 0.15, height - 14);
    context.lineTo(width * 0.32, height * 0.55);
    context.lineTo(width * 0.48, height - 14);
    context.stroke();
  }, 128, 96);

  return createMesh(
    new THREE.BoxGeometry(0.62, 0.48, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xf7f2e6, map: texture, roughness: 0.96, metalness: 0 }),
    { position: new THREE.Vector3(x, y, z), rotationY, castShadow: true, receiveShadow: true }
  );
}

function createBootsProp({ x = 0, z = 0, rotationY = 0 }) {
  const group = new THREE.Group();
  group.position.set(x, BELARUS_GROUND_Y, z);
  group.rotation.y = rotationY;
  [-0.12, 0.12].forEach((offset) => {
    group.add(createMesh(new THREE.BoxGeometry(0.18, 0.34, 0.28), createSurfaceMaterial(0x4d3a2f), { position: new THREE.Vector3(offset, 0.17, 0), castShadow: true, receiveShadow: true }));
  });
  return group;
}

function createWallMuralProp({ x = 0, y = 2.2, z = 0, rotationY = 0 }) {
  const texture = createStoryTexture((context, width, height) => {
    context.fillStyle = "#e4d6bf";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#b64954";
    context.fillRect(18, 22, width - 36, height - 44);
    context.fillStyle = "#f0d36a";
    context.beginPath();
    context.arc(width * 0.3, height * 0.5, 18, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#7aa35d";
    context.fillRect(width * 0.5, height * 0.32, 22, 30);
  }, 160, 96);

  return createMesh(
    new THREE.BoxGeometry(0.9, 0.62, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xe4d6bf, map: texture, roughness: 0.94, metalness: 0 }),
    { position: new THREE.Vector3(x, y, z), rotationY, castShadow: true, receiveShadow: true }
  );
}

function createCluePointSystem() {
  const group = new THREE.Group();
  group.name = "clue_points";

  const muralHouse = HOUSE_CONFIGS[4];
  const muralPosition = muralHouse.position.clone()
    .add(muralHouse.right.clone().multiplyScalar(muralHouse.size[0] * 0.5 + 1.15))
    .add(muralHouse.toRoad.clone().multiplyScalar(-0.55));
  const porchCluePosition = muralPosition.clone()
    .add(muralHouse.toRoad.clone().multiplyScalar(1.95))
    .add(muralHouse.right.clone().multiplyScalar(-1.35));

  const cluePoints = [
    {
      id: "station_letter",
      title: "Station Letter",
      label: "Folded Letter",
      prompt: "Press E to unfold the station letter",
      position: { x: -11.05, y: BELARUS_GROUND_Y, z: 8.72 },
      radius: 2.1,
      fragment: "When the bronze voice wakes, the white thread must answer.",
      detail: "A folded letter tucked beside the mailbox smells faintly of rain and coal dust. The sentence is underlined once, then crossed out, then written again by a shakier hand."
    },
    {
      id: "porch_drawing",
      title: "Porch Drawing",
      label: "Weathered Drawing",
      prompt: "Press E to study the weathered drawing",
      position: { x: porchCluePosition.x, y: BELARUS_GROUND_Y, z: porchCluePosition.z },
      radius: 2.4,
      fragment: "The white thread is shown before the lake's blue eye.",
      detail: "A child's drawing has been wedged under a porch stone to keep it from blowing away. Someone circled the little white scarf in charcoal, then marked the lake after it."
    },
    {
      id: "forest_charm",
      title: "Forest Charm",
      label: "Birch Charm",
      prompt: "Press E to examine the birch charm",
      position: { x: 16, y: BELARUS_GROUND_Y, z: 214 },
      radius: 2.45,
      fragment: "The water waits at the end, never at the beginning.",
      detail: "A white ribbon and weathered page have been tied to a birch switch near the lake approach. Beneath them, a stone is scratched with a lake eye and one final notch."
    }
  ];

  cluePoints.forEach((clue) => {
    group.add(createClueDisplay(clue));
  });

  return { group, cluePoints };
}

function createClueDisplay(clue) {
  switch (clue.id) {
    case "station_letter":
      return createStationLetterClue(clue);
    case "porch_drawing":
      return createPorchDrawingClue(clue);
    case "forest_charm":
      return createForestCharmClue(clue);
    default:
      return createLetterNote(clue.position.x, clue.position.z, 0.16, 0);
  }
}

function createStationLetterClue(clue) {
  const group = new THREE.Group();
  group.position.set(clue.position.x, BELARUS_GROUND_Y, clue.position.z);
  group.name = clue.id;

  group.add(createMesh(new THREE.BoxGeometry(0.44, 0.02, 0.3), createSurfaceMaterial(0xf0e6cb), {
    position: new THREE.Vector3(0, 0.12, 0),
    rotationY: 0.22,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.BoxGeometry(0.3, 0.018, 0.2), createSurfaceMaterial(0xf7f0e2), {
    position: new THREE.Vector3(-0.04, 0.135, -0.01),
    rotationY: -0.08,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), createSurfaceMaterial(0x8e3138), {
    position: new THREE.Vector3(0.11, 0.145, 0.02),
    castShadow: true,
    receiveShadow: true
  }));

  return group;
}

function createPorchDrawingClue(clue) {
  const group = new THREE.Group();
  group.position.set(clue.position.x, BELARUS_GROUND_Y, clue.position.z);
  group.name = clue.id;

  group.add(createMesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), createSurfaceMaterial(0x8a6849), {
    position: new THREE.Vector3(0.04, 0.1, -0.02),
    rotationY: 0.18,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.BoxGeometry(0.62, 0.46, 0.03), new THREE.MeshStandardMaterial({
    color: 0xf7f2e6,
    map: createStoryTexture((context, width, height) => {
      context.fillStyle = "#f7f2e6";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "#6a9cc6";
      context.lineWidth = 9;
      context.beginPath();
      context.moveTo(24, height - 16);
      context.lineTo(width * 0.34, 22);
      context.lineTo(width * 0.67, height - 20);
      context.stroke();
      context.strokeStyle = "#d3d7dc";
      context.lineWidth = 8;
      context.beginPath();
      context.moveTo(width * 0.48, 18);
      context.lineTo(width * 0.66, height * 0.5);
      context.stroke();
      context.strokeStyle = "#5e4f42";
      context.lineWidth = 5;
      context.beginPath();
      context.arc(width * 0.78, height * 0.64, 14, 0, Math.PI * 2);
      context.stroke();
    }, 128, 96),
    roughness: 0.96,
    metalness: 0
  }), {
    position: new THREE.Vector3(-0.1, 0.4, 0),
    rotationY: -0.18,
    rotationZ: 0.08,
    castShadow: true,
    receiveShadow: true
  }));

  return group;
}

function createForestCharmClue(clue) {
  const group = new THREE.Group();
  group.position.set(clue.position.x, BELARUS_GROUND_Y, clue.position.z);
  group.name = clue.id;

  group.add(createMesh(new THREE.CylinderGeometry(0.045, 0.06, 1.2, 6), createSurfaceMaterial(0x7b5e44), {
    position: new THREE.Vector3(0, 0.6, 0),
    rotationZ: 0.08,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.BoxGeometry(0.1, 0.42, 0.02), createSurfaceMaterial(0xf0f2f4), {
    position: new THREE.Vector3(0.08, 0.96, 0),
    rotationY: 0.35,
    rotationZ: 0.16,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.BoxGeometry(0.26, 0.02, 0.18), createSurfaceMaterial(0xe7dfd0), {
    position: new THREE.Vector3(-0.18, 0.16, 0.06),
    rotationY: -0.28,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.CylinderGeometry(0.28, 0.34, 0.16, 8), createSurfaceMaterial(0x7d7569), {
    position: new THREE.Vector3(-0.06, 0.08, -0.16),
    rotationY: 0.18,
    castShadow: true,
    receiveShadow: true
  }));
  group.add(createMesh(new THREE.RingGeometry(0.08, 0.12, 16), createSurfaceMaterial(0xdde3e8), {
    position: new THREE.Vector3(0.08, 0.98, 0.02),
    rotationX: Math.PI * 0.5,
    castShadow: true,
    receiveShadow: true
  }));

  return group;
}

function createStoryHooks() {
  return [
    { id: "station_arrival", type: "memory_flash", label: "Arrival Platform", character: "elina", position: { x: -6.2, y: BELARUS_GROUND_Y, z: 6.8 } },
    { id: "church_threshold", type: "memory_flash", label: "Church Threshold", character: "elina", position: { x: -20, y: BELARUS_GROUND_Y, z: 156 } },
    { id: "graveyard_edge", type: "memory_flash", label: "Graveyard Edge", character: "elina", position: { x: -24, y: BELARUS_GROUND_Y, z: 184 } },
    { id: "lake_arrival", type: "memory_flash", label: "Lake Arrival", character: "elina", position: { x: 10, y: BELARUS_GROUND_Y, z: 230 } }
  ];
}

function createSoundHooks() {
  return [
    { id: "station_whistle", cue: "distant_train_whistle", position: { x: -8, y: BELARUS_GROUND_Y, z: -4 } },
    { id: "square_accordion", cue: "distant_accordion", position: { x: 2, y: BELARUS_GROUND_Y, z: 96 } },
    { id: "church_bell", cue: "church_bell", position: { x: -18, y: BELARUS_GROUND_Y, z: 156 } }
  ];
}

function createSurfaceMaterial(color, overrides = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.96, metalness: 0, ...overrides });
}

function createMesh(geometry, material, options = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  if (options.position) {
    mesh.position.copy(options.position);
  }
  if (options.rotationY != null) {
    mesh.rotation.y = options.rotationY;
  }
  if (options.rotationX != null) {
    mesh.rotation.x = options.rotationX;
  }
  if (options.rotationZ != null) {
    mesh.rotation.z = options.rotationZ;
  }
  if (options.castShadow) {
    mesh.castShadow = true;
  }
  if (options.receiveShadow) {
    mesh.receiveShadow = true;
  }
  return mesh;
}

















































