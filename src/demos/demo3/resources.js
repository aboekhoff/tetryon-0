import * as PIXI from 'pixi.js';

const BASE_URL = '/assets/';

export const textures = window.textures = {
  humans: {},
  monsters: {},
  particles: {},
  tiles: {},
  tileData: {},
  maps: {},
}

const TILE_ASSETS = {
  'tiles_dungeon_1.png': 'maps/tiles_dungeon_1.png',
};

const TILE_DATA_ASSETS = {
  'tiles_dungeon_1.png.data': 'maps/tiles_dungeon_1.png.json',
};

const MAP_ASSETS = {
  map2: 'maps/map2.json',
};

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

const NUM_FRAMES = 4;
const HUMAN_WIDTH = 16;
const HUMAN_HEIGHT = 16;

export const maps = {}

function loadResource(url) {
  const loader = new PIXI.loaders.Loader(BASE_URL);
  
  return new Promise((resolve, reject) => {
    loader.add(url, url);
    loader.load((loader, resources) => {
      resolve(resources[url]);
    })
  });
}

function loadHumanAssets() {
  const promises = [];

  HUMANS.forEach(human => {

    TYPES.forEach(type => {
      const name = `${human}${type}`;
      
      DIRECTIONS.forEach(direction => {
        const name =`${human}${type}_${direction}`;
        const path = `human/${direction}/${human}${type}.png`;

        promises.push(loadResource(path).then((resource) => {
          processHumanAsset({
            spriteName: `${human}${type}`,
            resourceName: name,
            type,
            direction,
            path,  
            resource: resource,
          })
        }));
      });
    });
  });

  return promises;
}

function processHumanAsset({spriteName, resourceName, direction, resource}) {
  const frames = [];

  for (let i = 0; i < NUM_FRAMES; i++) {
    const baseTexture = resource.texture.baseTexture;
    
    baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    
    const rectangle = new PIXI.Rectangle(HUMAN_WIDTH * i, 0, HUMAN_WIDTH, HUMAN_HEIGHT);
    const texture = new PIXI.Texture(baseTexture, rectangle);
    frames.push(texture);
  }

  textures.humans[spriteName] = textures.humans[spriteName] || {};
  textures.humans[spriteName][direction] = frames;
};


function loadParticleAssets() {
  return PARTICLES.map(particle => {
    const url = `particles/${particle}.png`;
    return loadResource(url).then(resource => {
      textures.particles[particle] = resource.texture; 
    });
  });
}


// using the 32 x 32 dungeon tile set
function loadTileAssets() {
  const SIZE = 16;

  return Object.keys(TILE_ASSETS).map(key => {
    return loadResource(TILE_ASSETS[key]).then(resource => {
      const baseTexture = resource.texture.baseTexture;

      baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  
      textures.tiles[key] = []

      for (let y = 0; y < baseTexture.height; y += SIZE) {
        for (let x = 0; x < baseTexture.width; x += SIZE) {
          const rectangle = new PIXI.Rectangle(x, y, SIZE, SIZE);
          const texture = new PIXI.Texture(baseTexture, rectangle);
          textures.tiles[key].push(texture);
        }
      }
    });
  });
}

function loadMapAssets() {
  return Object.keys(MAP_ASSETS).map(name => {
    const url = MAP_ASSETS[name];
    
    return loadResource(url).then(resource => {
      textures.maps[name] = resource;
    }); 
  });
} 

function loadTileDataAssets() {
  return Object.keys(TILE_DATA_ASSETS).map(name => {
    return loadResource(TILE_DATA_ASSETS[name]).then(resource => {
      textures.tileData[name] = resource;
    })
  })
}

export function load() {
  const promises = [
    ...loadHumanAssets(),
    ...loadMapAssets(),
    ...loadParticleAssets(),
    ...loadTileAssets(),
    ...loadTileDataAssets(),
  ]

  console.log(promises);

  return Promise.all(promises);
}

const callbacks = [];