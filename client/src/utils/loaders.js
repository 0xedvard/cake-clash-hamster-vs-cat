import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();

export async function loadFBXModel(path) {
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      path,
      (object) => {
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        resolve(object);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

export async function loadFBXAnimation(path) {
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      path,
      (object) => {
        const [clip] = object.animations ?? [];

        if (!clip) {
          reject(new Error(`No animation clip found in FBX: ${path}`));
          return;
        }

        resolve(clip);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

export async function loadGLTFModel(path) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
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
        reject(error);
      }
    );
  });
}
