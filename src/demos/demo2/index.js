import Game from '../../Game.js';
import Random from '../../Random.js';
import { canvas } from './shared';
import { load } from './resources';
import './components';
import './systems';

const NUM_CIRCLES = 32;

const rng = new Random(42);

function makeCircle(x, y, rotation, scale) {
  const e = Game.createEntity();

  rotation = (rotation != null) ? rotation : rng.nextFloat(0, Math.PI * 2);
  scale = (scale != null) ? scale : rng.nextInt(1, 10);

  e.transform = { 
    x: (x != null) ? x : rng.nextInt(0, canvas.width),
    y: (y != null) ? y : rng.nextInt(0, canvas.height), 
    scale: (scale != null) ? scale : rng.nextInt(2, 32),
  };

  

  const vx = Math.cos(rotation);
  const vy = Math.sin(rotation);

  e.transform.x += vx * NUM_CIRCLES * scale / 2;
  e.transform.y += vy * NUM_CIRCLES * scale / 2;

  e.velocity = {
    x: vx,
    y: vy,
  };
  
  e.render = {
    color: rng.nextColor()
  }

  e.force = {
    x: 0, 
    y: 0,
  }

  e.collider = {};
}

export default function start() {
  for (let i = 0; i < NUM_CIRCLES; i++) {
    // const rotation = (Math.PI * 2) / NUM_CIRCLES * i;
    // makeCircle(canvas.width / 2, canvas.height / 2, rotation, 2); 
    makeCircle();
  } 
  Game.start();
}

load();