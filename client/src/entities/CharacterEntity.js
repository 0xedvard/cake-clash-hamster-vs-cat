import * as THREE from "three";
import { loadFBXModel } from "../utils/loaders.js";

const TRANSITION_DURATION = 0.2;
const ONE_SHOT_ANIMATIONS = new Set(["jump", "falling_dying", "pickup"]);

export class CharacterEntity {
  constructor({
    scene,
    modelPath,
    animations,
    scale = 0.01,
    position = { x: 0, y: 0, z: 0 },
    rotationY = 0,
    facingOffsetY = 0,
    visualOffsetY = 0,
    name = "character",
    onAnimationFinished = null
  }) {
    this.scene = scene;
    this.modelPath = modelPath;
    this.animations = animations ?? {};
    this.scale = scale;
    this.position = { ...position };
    this.rotationY = rotationY;
    this.facingOffsetY = facingOffsetY;
    this.visualOffsetY = visualOffsetY;
    this.name = name;
    this.onAnimationFinished = onAnimationFinished;

    this.model = null;
    this.visualModel = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.currentActionName = null;

    this.handleActionFinished = this.handleActionFinished.bind(this);
  }

  async load() {
    console.log(`${this.name}: loading model`, this.modelPath);

    const visualModel = await loadFBXModel(this.modelPath);
    const root = new THREE.Group();
    root.name = `${this.name}_root`;
    root.position.set(this.position.x, this.position.y, this.position.z);
    root.rotation.y = this.rotationY;
    root.scale.setScalar(this.scale);

    visualModel.rotation.y = this.facingOffsetY;
    visualModel.position.y = this.visualOffsetY;
    root.add(visualModel);

    this.scene.add(root);
    this.model = root;
    this.visualModel = visualModel;
    this.mixer = new THREE.AnimationMixer(visualModel);
    this.mixer.addEventListener("finished", this.handleActionFinished);
    this.createActions();

    console.log(`${this.name} loaded.`);
    console.log(`${this.name}: actions ready`, Object.keys(this.actions));

    if (this.actions.idle) {
      this.play("idle");
    }

    return root;
  }

  createActions() {
    this.actions = {};

    for (const [name, clip] of Object.entries(this.animations)) {
      if (!clip) {
        continue;
      }

      this.actions[name] = this.mixer.clipAction(clip);
    }
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  setPosition(x, y, z) {
    this.position = { x, y, z };

    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  setRotationY(radians) {
    this.rotationY = radians;

    if (this.model) {
      this.model.rotation.y = radians;
    }
  }

  getPosition() {
    if (!this.model) {
      return { ...this.position };
    }

    return {
      x: this.model.position.x,
      y: this.model.position.y,
      z: this.model.position.z
    };
  }

  getRotationY() {
    return this.model ? this.model.rotation.y : this.rotationY;
  }

  getAnimationName() {
    return this.currentActionName ?? "idle";
  }

  play(name) {
    const nextAction = this.actions[name];

    if (!nextAction) {
      console.warn(`${this.name}: animation '${name}' is not available.`);
      return;
    }

    if (this.currentActionName === name) {
      return;
    }

    this.configureAction(name, nextAction);
    nextAction.reset();
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, TRANSITION_DURATION, false);
    } else {
      nextAction.fadeIn(TRANSITION_DURATION);
    }

    this.currentAction = nextAction;
    this.currentActionName = name;

    console.log(`${this.name}: playing '${name}'.`);
  }

  configureAction(name, action) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);

    if (ONE_SHOT_ANIMATIONS.has(name)) {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      return;
    }

    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
  }

  handleActionFinished(event) {
    const finishedAnimationName = this.getActionName(event.action);

    if (!finishedAnimationName || !ONE_SHOT_ANIMATIONS.has(finishedAnimationName)) {
      return;
    }

    console.log(`${this.name}: '${finishedAnimationName}' finished.`);

    if (this.onAnimationFinished) {
      this.onAnimationFinished(finishedAnimationName, this, event);
      return;
    }

    if (finishedAnimationName === "jump" && this.actions.idle) {
      this.play("idle");
    }
  }

  getActionName(action) {
    for (const [name, candidate] of Object.entries(this.actions)) {
      if (candidate === action) {
        return name;
      }
    }

    return null;
  }

  destroy() {
    if (this.mixer) {
      this.mixer.removeEventListener("finished", this.handleActionFinished);
      this.mixer.stopAllAction();
    }

    if (this.model) {
      this.scene.remove(this.model);
    }

    this.actions = {};
    this.currentAction = null;
    this.currentActionName = null;
    this.mixer = null;
    this.visualModel = null;
    this.model = null;
  }
}

