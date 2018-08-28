import * as PIXI from 'pixi.js';
import Grid from '../../Grid.js';
import Random from '../../Random.js';

// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const RANDOM_SEED = 42;

export const BULLET = (1 << 0);
export const ENEMY  = (1 << 1);
export const PLAYER = (1 << 2);
export const rng = new Random(RANDOM_SEED);

export const actors = {
  player: null,
};

export const camera = { 
  x: 0, 
  y: 0, 
  threshold: 20,
  offset: 180,
  rotation: 0,
  target: null, 
  trauma: 0 
};

export const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const stage = app.stage;

document.body.appendChild(app.view);

export const grid = new Grid();

function onresize() {
  app.view.width = window.innerWidth;
  app.view.height = window.innerHeight;
  stage.position.x = app.view.width / 2;
  stage.position.y = app.view.height / 2;
  stage.scale.x = 1.5;
  stage.scale.y = 1.5;
}

onresize();

window.addEventListener('resize', onresize);