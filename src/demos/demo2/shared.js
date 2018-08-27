import * as PIXI from 'pixi.js';
import Grid from '../../Grid.js';

export const app = new PIXI.Application();

export const canvas = document.createElement('canvas');

export const context = canvas.getContext('2d');

export const grid = new Grid();

function onresize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', onresize);

document.body.appendChild(canvas);
onresize();