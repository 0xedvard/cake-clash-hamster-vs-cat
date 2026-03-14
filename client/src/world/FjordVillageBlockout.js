import * as THREE from "three";

const COLORS = {
  water: 0x2f8e98,
  waterShallow: 0x62b7bd,
  waterDeep: 0x236a73,
  ground: 0xdfcfac,
  square: 0xebdfc3,
  path: 0xc5b086,
  grass: 0x7b9860,
  cliff: 0x7b8794,
  cliffDark: 0x66717d,
  cliffLight: 0x909cab,
  houseRed: 0xa95547,
  houseOchre: 0xba8a46,
  houseBrown: 0x7b5b46,
  roof: 0x4c4138,
  wood: 0x7a5a39,
  woodDark: 0x5b422a,
  pine: 0x2f5d3e,
  pineDark: 0x234731,
  towerRoof: 0x8c6239,
  backdropGround: 0x87a070,
  mountain: 0x8e9ba8,
  mountainDark: 0x6f7c89,
  snow: 0xc9d4dc
};

export function createFjordVillageBlockout() {
  const world = new THREE.Group();
  world.name = "fjord_village_blockout";

  world.add(createWater());
  world.add(createTerrain());
  world.add(createVillage());
  world.add(createDockCluster());
  world.add(createPaths());
  world.add(createCliffs());
  world.add(createTower());
  world.add(createForestEdge());
  world.add(createBackdrop());

  return world;
}

function createWater() {
  const group = new THREE.Group();
  group.name = "fjord_water";

  group.add(
    createMesh(
      new THREE.PlaneGeometry(320, 240),
      createMaterial(COLORS.waterDeep),
      {
        position: new THREE.Vector3(118, -1.65, -3),
        rotationX: -Math.PI / 2,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.PlaneGeometry(160, 118),
      createMaterial(COLORS.water),
      {
        position: new THREE.Vector3(66, -1.56, -3),
        rotationX: -Math.PI / 2
      }
    )
  );

  group.add(
    createMesh(
      new THREE.PlaneGeometry(70, 64),
      createMaterial(COLORS.waterShallow),
      {
        position: new THREE.Vector3(31, -1.48, -3),
        rotationX: -Math.PI / 2
      }
    )
  );

  const shorelineRim = [
    { position: [16, -0.8, 22], scale: [18, 1.8, 10], rotationY: -0.26 },
    { position: [22, -0.9, 6], scale: [16, 1.9, 8], rotationY: -0.18 },
    { position: [25, -0.95, -10], scale: [18, 1.8, 10], rotationY: -0.12 },
    { position: [20, -0.9, -25], scale: [20, 2, 12], rotationY: 0.18 }
  ];

  for (const rim of shorelineRim) {
    group.add(createRockPlate(rim, COLORS.ground));
  }

  return group;
}

function createTerrain() {
  const group = new THREE.Group();
  group.name = "terrain";

  group.add(
    createMesh(
      new THREE.CylinderGeometry(48, 54, 2.8, 40),
      createMaterial(COLORS.ground),
      {
        position: new THREE.Vector3(0, -1.4, 0),
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.CylinderGeometry(18, 20, 0.18, 40),
      createMaterial(COLORS.square),
      {
        position: new THREE.Vector3(0, 0.09, 0),
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.BoxGeometry(28, 1.4, 50),
      createMaterial(COLORS.ground),
      {
        position: new THREE.Vector3(15, -0.7, -3),
        receiveShadow: true
      }
    )
  );

  const grassPads = [
    { position: [-14, 0.02, 0], radiusTop: 18, radiusBottom: 21 },
    { position: [3, 0.03, 18], radiusTop: 14, radiusBottom: 16 },
    { position: [2, 0.03, -18], radiusTop: 13, radiusBottom: 15 }
  ];

  for (const pad of grassPads) {
    group.add(
      createMesh(
        new THREE.CylinderGeometry(pad.radiusTop, pad.radiusBottom, 0.12, 28),
        createMaterial(COLORS.grass),
        {
          position: new THREE.Vector3(...pad.position),
          receiveShadow: true
        }
      )
    );
  }

  return group;
}

function createVillage() {
  const group = new THREE.Group();
  group.name = "village";

  const houses = [
    {
      position: [-12.5, 0, -9.5],
      width: 6,
      depth: 6.6,
      height: 4.8,
      bodyColor: COLORS.houseRed,
      rotationY: 0.34
    },
    {
      position: [-11.5, 0, 10.5],
      width: 5.5,
      depth: 5.6,
      height: 4.4,
      bodyColor: COLORS.houseOchre,
      rotationY: -0.35
    },
    {
      position: [9.5, 0, -10.5],
      width: 5.8,
      depth: 6.2,
      height: 4.7,
      bodyColor: COLORS.houseBrown,
      rotationY: -0.28
    },
    {
      position: [17.5, 0, 6],
      width: 5,
      depth: 5,
      height: 4.1,
      bodyColor: COLORS.houseRed,
      rotationY: 0.16
    }
  ];

  for (const house of houses) {
    group.add(createHouse(house));
  }

  group.add(
    createMesh(
      new THREE.BoxGeometry(3.6, 0.35, 1.8),
      createMaterial(0x8f6946),
      {
        position: new THREE.Vector3(4.5, 0.45, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.BoxGeometry(1.8, 1.5, 1.8),
      createMaterial(0x9e774e),
      {
        position: new THREE.Vector3(6.2, 0.75, 3.2),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  return group;
}

function createDockCluster() {
  const group = new THREE.Group();
  group.name = "docks";

  group.add(createDock({ position: [20, 0.18, -4], length: 18, width: 4, rotationY: 0 }));
  group.add(createDock({ position: [28, 0.15, 9], length: 10, width: 3, rotationY: 0.18 }));

  group.add(
    createMesh(
      new THREE.BoxGeometry(6.5, 0.5, 4.6),
      createMaterial(COLORS.wood),
      {
        position: new THREE.Vector3(16.5, 0.35, -4),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  return group;
}

function createPaths() {
  const group = new THREE.Group();
  group.name = "paths";

  const dockPath = [
    { position: [8, 0.05, -2], scale: [12, 0.1, 5.5], rotationY: -0.04 },
    { position: [16, 0.06, -3], scale: [10, 0.1, 5], rotationY: -0.06 }
  ];
  const towerPath = [
    { position: [-8, 0.05, 12], scale: [12, 0.1, 5], rotationY: -0.4 },
    { position: [-17, 0.08, 19], scale: [14, 0.1, 5], rotationY: -0.72 },
    { position: [-26, 0.1, 13], scale: [13, 0.1, 4.8], rotationY: -1.03 },
    { position: [-31, 0.12, 2], scale: [12, 0.1, 4.5], rotationY: -1.11 }
  ];

  for (const segment of [...dockPath, ...towerPath]) {
    group.add(
      createMesh(
        new THREE.BoxGeometry(segment.scale[0], segment.scale[1], segment.scale[2]),
        createMaterial(COLORS.path),
        {
          position: new THREE.Vector3(...segment.position),
          rotationY: segment.rotationY,
          receiveShadow: true
        }
      )
    );
  }

  return group;
}

function createCliffs() {
  const group = new THREE.Group();
  group.name = "cliffs";

  const masses = [
    {
      position: [-38, 8, 4],
      tiers: [
        { size: [18, 12, 34], offset: [0, 0, 0], color: COLORS.cliffDark },
        { size: [14, 8, 24], offset: [4, 9, -3], color: COLORS.cliff },
        { size: [10, 4, 14], offset: [6, 15, -5], color: COLORS.grass }
      ]
    },
    {
      position: [-30, 11, 24],
      tiers: [
        { size: [24, 18, 18], offset: [0, 0, 0], color: COLORS.cliff },
        { size: [16, 8, 12], offset: [4, 11, -2], color: COLORS.cliffLight },
        { size: [10, 4, 8], offset: [5, 17, -1], color: COLORS.grass }
      ]
    },
    {
      position: [-18, 9, -34],
      tiers: [
        { size: [34, 16, 18], offset: [0, 0, 0], color: COLORS.cliffDark },
        { size: [22, 7, 12], offset: [-3, 10, 2], color: COLORS.cliff },
        { size: [14, 4, 9], offset: [-4, 15, 3], color: COLORS.grass }
      ]
    },
    {
      position: [12, 8, -48],
      tiers: [
        { size: [50, 15, 16], offset: [0, 0, 0], color: COLORS.cliff },
        { size: [30, 8, 10], offset: [-6, 10, 2], color: COLORS.cliffLight },
        { size: [20, 4, 8], offset: [-10, 15, 2], color: COLORS.grass }
      ]
    },
    {
      position: [48, 6, 34],
      tiers: [
        { size: [22, 12, 28], offset: [0, 0, 0], color: COLORS.cliffDark },
        { size: [14, 6, 18], offset: [-4, 8, -3], color: COLORS.cliff },
        { size: [10, 3.5, 10], offset: [-5, 12, -3], color: COLORS.grass }
      ]
    }
  ];

  for (const mass of masses) {
    group.add(createCliffMass(mass));
  }

  return group;
}

function createTower() {
  const group = new THREE.Group();
  group.name = "lookout_tower";
  group.position.set(-31, 17.5, 11);

  group.add(
    createMesh(
      new THREE.BoxGeometry(8, 2.2, 8),
      createMaterial(COLORS.ground),
      {
        position: new THREE.Vector3(0, -1.2, 0),
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.BoxGeometry(4.8, 1.2, 4.8),
      createMaterial(COLORS.woodDark),
      {
        position: new THREE.Vector3(0, 0.6, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  for (const x of [-1.6, 1.6]) {
    for (const z of [-1.6, 1.6]) {
      group.add(
        createMesh(
          new THREE.BoxGeometry(0.5, 8.5, 0.5),
          createMaterial(COLORS.wood),
          {
            position: new THREE.Vector3(x, 4.7, z),
            castShadow: true,
            receiveShadow: true
          }
        )
      );
    }
  }

  group.add(
    createMesh(
      new THREE.BoxGeometry(5.8, 0.45, 5.8),
      createMaterial(COLORS.wood),
      {
        position: new THREE.Vector3(0, 8.7, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.BoxGeometry(3.9, 2.9, 3.9),
      createMaterial(0x9c7448),
      {
        position: new THREE.Vector3(0, 10.55, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.ConeGeometry(3.3, 2.7, 4),
      createMaterial(COLORS.towerRoof),
      {
        position: new THREE.Vector3(0, 13.35, 0),
        rotationY: Math.PI / 4,
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  return group;
}

function createForestEdge() {
  const group = new THREE.Group();
  group.name = "forest_edge";

  const treePositions = [
    [-24, 0, 29],
    [-29, 0, 24],
    [-35, 0, 18],
    [-37, 0, 11],
    [-36, 0, -12],
    [-30, 0, -23],
    [-22, 0, -34],
    [-4, 0, -40],
    [14, 0, -43],
    [31, 0, -40],
    [45, 0, 12],
    [50, 0, 24]
  ];

  treePositions.forEach((position, index) => {
    group.add(createTree(position[0], position[1], position[2], 6 + (index % 4) * 1.1));
  });

  return group;
}

function createBackdrop() {
  const group = new THREE.Group();
  group.name = "backdrop";

  group.add(
    createMesh(
      new THREE.BoxGeometry(250, 12, 190),
      createMaterial(COLORS.backdropGround),
      {
        position: new THREE.Vector3(110, -7, -4),
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.PlaneGeometry(250, 170),
      createMaterial(COLORS.water),
      {
        position: new THREE.Vector3(128, -1.2, -4),
        rotationX: -Math.PI / 2
      }
    )
  );

  const mountains = [
    { position: [88, 18, -82], scale: [48, 38, 24], color: COLORS.mountainDark },
    { position: [140, 24, -72], scale: [60, 52, 28], color: COLORS.mountain },
    { position: [192, 30, -64], scale: [76, 66, 32], color: COLORS.mountainDark },
    { position: [98, 20, 78], scale: [54, 42, 26], color: COLORS.mountain },
    { position: [152, 28, 88], scale: [68, 56, 30], color: COLORS.mountainDark },
    { position: [208, 34, 74], scale: [84, 72, 34], color: COLORS.mountain }
  ];

  for (const mountain of mountains) {
    group.add(createBackdropMountain(mountain));
  }

  const farForest = new THREE.Group();
  farForest.position.set(62, 0, -58);
  for (let index = 0; index < 12; index += 1) {
    farForest.add(createTree(index * 10, 0, (index % 3) * 5, 7 + (index % 4)));
  }
  group.add(farForest);

  return group;
}

function createHouse({ position, width, depth, height, bodyColor, rotationY = 0 }) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  group.add(
    createMesh(
      new THREE.BoxGeometry(width, height, depth),
      createMaterial(bodyColor),
      {
        position: new THREE.Vector3(0, height / 2, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.ConeGeometry(Math.max(width, depth) * 0.78, height * 0.72, 4),
      createMaterial(COLORS.roof),
      {
        position: new THREE.Vector3(0, height + height * 0.34, 0),
        rotationY: Math.PI / 4,
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.BoxGeometry(1.1, 2.1, 0.2),
      createMaterial(COLORS.woodDark),
      {
        position: new THREE.Vector3(0, 1.05, depth / 2 + 0.08),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  return group;
}

function createDock({ position, length, width, rotationY = 0 }) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  group.add(
    createMesh(
      new THREE.BoxGeometry(length, 0.38, width),
      createMaterial(COLORS.wood),
      {
        position: new THREE.Vector3(length / 2, 0, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  const postOffsets = [
    [1.8, -0.9, width * 0.35],
    [1.8, -0.9, -width * 0.35],
    [length - 1.8, -0.9, width * 0.35],
    [length - 1.8, -0.9, -width * 0.35]
  ];

  for (const offset of postOffsets) {
    group.add(
      createMesh(
        new THREE.BoxGeometry(0.36, 1.95, 0.36),
        createMaterial(COLORS.woodDark),
        {
          position: new THREE.Vector3(offset[0], offset[1], offset[2]),
          castShadow: true,
          receiveShadow: true
        }
      )
    );
  }

  return group;
}

function createCliffMass({ position, tiers }) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  for (const tier of tiers) {
    group.add(
      createMesh(
        new THREE.BoxGeometry(tier.size[0], tier.size[1], tier.size[2]),
        createMaterial(tier.color),
        {
          position: new THREE.Vector3(tier.offset[0], tier.offset[1], tier.offset[2]),
          rotationY: 0.16,
          castShadow: true,
          receiveShadow: true
        }
      )
    );
  }

  return group;
}

function createBackdropMountain({ position, scale, color }) {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  group.add(
    createMesh(
      new THREE.BoxGeometry(scale[0], scale[1], scale[2]),
      createMaterial(color),
      {
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.BoxGeometry(scale[0] * 0.55, scale[1] * 0.46, scale[2] * 0.5),
      createMaterial(COLORS.snow),
      {
        position: new THREE.Vector3(0, scale[1] * 0.3, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  return group;
}

function createTree(x, y, z, height = 6.5) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  group.add(
    createMesh(
      new THREE.CylinderGeometry(0.32, 0.44, height * 0.34, 6),
      createMaterial(COLORS.woodDark),
      {
        position: new THREE.Vector3(0, height * 0.17, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.ConeGeometry(height * 0.42, height * 0.82, 8),
      createMaterial(COLORS.pine),
      {
        position: new THREE.Vector3(0, height * 0.55, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  group.add(
    createMesh(
      new THREE.ConeGeometry(height * 0.28, height * 0.56, 8),
      createMaterial(COLORS.pineDark),
      {
        position: new THREE.Vector3(0, height * 0.88, 0),
        castShadow: true,
        receiveShadow: true
      }
    )
  );

  return group;
}

function createRockPlate(config, color) {
  return createMesh(
    new THREE.BoxGeometry(config.scale[0], config.scale[1], config.scale[2]),
    createMaterial(color),
    {
      position: new THREE.Vector3(config.position[0], config.position[1], config.position[2]),
      rotationY: config.rotationY,
      receiveShadow: true,
      castShadow: true
    }
  );
}

function createMesh(geometry, material, options = {}) {
  const mesh = new THREE.Mesh(geometry, material);

  if (options.position) {
    mesh.position.copy(options.position);
  }

  if (options.rotationX !== undefined) {
    mesh.rotation.x = options.rotationX;
  }

  if (options.rotationY !== undefined) {
    mesh.rotation.y = options.rotationY;
  }

  if (options.rotationZ !== undefined) {
    mesh.rotation.z = options.rotationZ;
  }

  mesh.castShadow = Boolean(options.castShadow);
  mesh.receiveShadow = Boolean(options.receiveShadow);

  return mesh;
}

function createMaterial(color) {
  return new THREE.MeshLambertMaterial({ color });
}
