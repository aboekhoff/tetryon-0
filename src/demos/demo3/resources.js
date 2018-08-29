import * as PIXI from 'pixi.js';

function enqueue(object) {
  Object.keys(object).forEach(key => {
    PIXI.loader.add(key, object[key]);
  });
}

const TILE_ASSETS = {
  dungeon_1: 'assets/maps/tiles_dungeon_1.png',
  dungeon_2: 'assets/maps/tiles_dungeon_2.png',
};

const TILE_DATA_ASSETS = {
  dungeon_1_data: 'assets/maps/tiles_dungeon_1.json',
};

const MAP_ASSETS = {
  map1: 'assets/maps/map1.txt',
  map2: 'assets/maps/map2.json',
};

const TILED_MAPS = {
  map2: {
    tiles: 'dungeon_2',
    json: 'map2',
  }
}

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
  tiles: {},
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

function enqueueTileAssets() {
  enqueue(TILE_ASSETS);
}

// using the 32 x 32 dungeon tile set
function processTileAssets() {
  const SIZE = 32;

  Object.keys(TILE_ASSETS).forEach(key => {
    const resource = PIXI.loader.resources[key];
    const baseTexture = resource.texture.baseTexture;
  
    textures.tiles[key] = []

    for (let y = 0; y < baseTexture.height; y += SIZE) {
      for (let x = 0; x < baseTexture.width; x += SIZE) {
        const rectangle = new PIXI.Rectangle(x, y, SIZE, SIZE);
        const texture = new PIXI.Texture(baseTexture, rectangle);
        textures.tiles[key].push(texture);
      }
    }
  });
}

const MAPS = ['map1'];

function processMapAssets() {
  MAPS.forEach(map => {
    const { data } = PIXI.loader.resources[map];
    const rows = data.split(/\s+/);
    const grid = rows.map(row => row.split('').map(n => parseInt(n, 36)));
    maps[map] = grid;
  });
} 

export function load(callback) {
  enqueueHumanAssets();
  enqueueParticleAssets();
  enqueue(TILE_ASSETS);
  enqueue(TILE_DATA_ASSETS);
  enqueue(MAP_ASSETS);

  PIXI.loader.load((loader, resources) => {
    processHumanAssets();
    processParticleAssets();
    processTileAssets();
    processMapAssets();
    console.log(textures);
    console.log(resources.map2);
    console.log(resources.dungeon_1_data);
    if (callback) { callback(); }
  })
}

const callbacks = [];