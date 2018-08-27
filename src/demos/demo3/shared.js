import * as PIXI from 'pixi.js';
import Grid from '../../Grid.js';
import Random from '../../Random.js';

// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const RANDOM_SEED = 42;

export const BULLET = (1 << 0);
export const ENEMY  = (1 << 1);
export const PLAYER = (1 << 2);

export const rng = new Random(RANDOM_SEED);

export const textures = {

};

export const actors = {
  player: null,
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
}

window.addEventListener('resize', onresize);