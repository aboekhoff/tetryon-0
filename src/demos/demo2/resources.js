import * as PIXI from 'pixi.js';

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
]

const DIRECTIONS = [
  'back', 
  'front', 
  'side'
];

const TYPES = [1, 2, 3, 4];

export const textures = {
  humans: {},
  monsters: {},
}

const enqueued = [];

function enqueueHumanAssets() {
  HUMANS.forEach(human => {

    TYPES.forEach(type => {
      const name = `${human}${type}`;
      
      DIRECTIONS.forEach(direction => {
        const name =`${human}${type}_${direction}`;
        const path = `assets/human/${direction}/${human}${type}.png`;
        PIXI.loader.add(name, path);
        enqueued.push({
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
    const rectangle = new PIXI.Rectangle(HUMAN_WIDTH * i, 0, HUMAN_WIDTH, HUMAN_HEIGHT);
    const texture = new PIXI.Texture(baseTexture, rectangle);
    frames.push(texture);
  }

  textures.humans[spriteName] = textures.humans[spriteName] || {};
  textures.humans[spriteName][direction] = frames;
};

function processHumanAssets() {
  enqueued.forEach(processHumanAsset);
}

export function load(callback) {
  enqueueHumanAssets();
  PIXI.loader.load((loader, resources) => {
    processHumanAssets();
    console.log(resources);
    console.log(loader);
    console.log(textures);
    if (callback) { callback(); }
  })
}