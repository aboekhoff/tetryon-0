import * as PIXI from 'pixi.js';

const PARTICLES = [
  'particle1',
  'particle2',
  'particle3',
];

const HUMANS = [
  'adventurer_f',
  'adventurer_m',
  'cleric',
  'fighter',
  'guard',
  'hunter',
  'knight',
  'mage',
  'ninja',
  'oldman',
  'rogue',
  'templar',
  'thief',
  'warrior',
  'wizard',
];

const DIRECTIONS = [
  'back', 
  'front', 
  'side'
];

const TYPES = [1, 2, 3, 4];

export const textures = {
  humans: {},
  monsters: {},
  particles: {},
  dungeon: [],
}

export const maps = {

}

const enqueuedMonsters = [];
const enqueuedHumans = [];

function enqueueHumanAssets() {
  HUMANS.forEach(human => {

    TYPES.forEach(type => {
      const name = `${human}${type}`;
      
      DIRECTIONS.forEach(direction => {
        const name =`${human}${type}_${direction}`;
        const path = `assets/human/${direction}/${human}${type}.png`;
        PIXI.loader.add(name, path);
        enqueuedHumans.push({
          spriteName: `${human}${type}`,
          resourceName: name,
          type,
          direction,
          path,
        })
      });
    });
  });
}

const NUM_FRAMES = 4;
const HUMAN_WIDTH = 16;
const HUMAN_HEIGHT = 16;

function processHumanAsset({spriteName, resourceName, direction}) {
  const frames = [];

  for (let i = 0; i < NUM_FRAMES; i++) {
    const baseTexture = PIXI.loader.resources[resourceName].texture.baseTexture;
    
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    
    const rectangle = new PIXI.Rectangle(HUMAN_WIDTH * i, 0, HUMAN_WIDTH, HUMAN_HEIGHT);
    const texture = new PIXI.Texture(baseTexture, rectangle);
    frames.push(texture);
  }

  textures.humans[spriteName] = textures.humans[spriteName] || {};
  textures.humans[spriteName][direction] = frames;
};

function processHumanAssets() {
  enqueuedHumans.forEach(processHumanAsset);
}

function enqueueParticleAssets() {
  PARTICLES.forEach(particle => {
    PIXI.loader.add(particle, `assets/particles/${particle}.png`);
  });
}

function processParticleAssets() {
  PARTICLES.forEach(name => {
    textures.particles[name] = PIXI.loader.resources[name].texture;
  });
}

function enqueueDungeonAssets() {
  PIXI.loader.add('dungeon', 'assets/tiles/dungeon_tileset_32.png');
}

// using the 32 x 32 dungeon tile set
function processDungeonAssets() {
  const SIZE = 32;

  const resource = PIXI.loader.resources['dungeon'];
  const baseTexture = resource.texture.baseTexture;
  
  for (let y = 0; y < baseTexture.height; y += SIZE) {
    for (let x = 0; x < baseTexture.width; x += SIZE) {
      const rectangle = new PIXI.Rectangle(x, y, SIZE, SIZE);
      const texture = new PIXI.Texture(baseTexture, rectangle);
      textures.dungeon.push(texture);
    }
  }
}

const MAPS = ['map1'];

function enqueueMapAssets() {
  MAPS.forEach(map => {
    PIXI.loader.add(map, `assets/maps/${map}.txt`);
  });
}

function processMapAssets() {
  MAPS.forEach(map => {
    const { data } = PIXI.loader.resources[map];
    const rows = data.split(/\s+/);
    const grid = rows.map(row => row.split('').map(n => parseInt(n, 36)));
    maps[map] = grid;
  });

  console.log(maps);
}

export function load(callback) {
  enqueueHumanAssets();
  enqueueParticleAssets();
  enqueueDungeonAssets();
  enqueueMapAssets();

  PIXI.loader.load((loader, resources) => {
    processHumanAssets();
    processParticleAssets();
    processDungeonAssets();
    processMapAssets();
    console.log(textures);
    if (callback) { callback(); }
  })
}

const callbacks = [];