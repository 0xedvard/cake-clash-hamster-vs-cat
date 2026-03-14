import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const BUILDING_BASE_PATH =
  "/assets/models/kenney/buildings-kit/kenney_fantasy-town_kit/Models/GLB format";
const buildingCache = new Map();

export async function loadKenneyBuilding(name) {
  const normalizedName = normalizeBuildingName(name);

  if (!buildingCache.has(normalizedName)) {
    buildingCache.set(normalizedName, loadBuildingPrototype(normalizedName));
  }

  const prototype = await buildingCache.get(normalizedName);
  return prototype.clone(true);
}

function normalizeBuildingName(name) {
  const trimmed = String(name ?? "").trim();

  if (!trimmed) {
    throw new Error("Kenney building name is required.");
  }

  return trimmed.endsWith(".glb") ? trimmed : `${trimmed}.glb`;
}

async function loadBuildingPrototype(fileName) {
  return new Promise((resolve, reject) => {
    loader.load(
      `${BUILDING_BASE_PATH}/${fileName}`,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        reject(new Error(`Failed to load Kenney building '${fileName}': ${error.message}`));
      }
    );
  });
}
