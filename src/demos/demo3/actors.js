import Game from '../../Game';
import { actors, rng, BULLET, ENEMY, PLAYER } from './shared';
import { textures } from './resources';

function makeHumanAnimations(resource) {
  return {
    up: { 
      frames: textures.humans[resource].back, 
      speed: 200, 
      idle: { 0: true, 2: true },
      flip: false,
    },
    down: { 
      frames: textures.humans[resource].front, 
      speed: 200, 
      idle: { 0: true, 2: true }, 
      flip: false,
    },
    right: { 
      frames: textures.humans[resource].side, 
      speed: 200, 
      idle: { 0: true, 2: true },
      flip: true, 
    },
    left: { 
      frames: textures.humans[resource].side, 
      speed: 200, 
      idle: { 0: true, 2: true },
      flip: false, 
    }, 
  }
}

export function makeExplosion(x, y) {
  const numParticles = rng.nextInt(32, 256);
  for (let i = 0; i < numParticles; i++) {
    const speed = rng.nextFloat(0.1, 1) * rng.nextFloat(1, 2);
    const duration = rng.nextInt(50, 200);
    const rotation = rng.nextFloat(0, Math.PI * 2);

    const vx = Math.cos(rotation) * speed;
    const vy = Math.sin(rotation) * speed;

    const p = Game.createEntity();
    p.transform = { x, y };
    p.velocity = { x: vx, y: vy };
    p.force = {};
    p.duration = { time: duration };
    p.sprite = {
      texture: textures.particles.particle3,
      scaleX: 0.005,
      scaleY: 0.005,
      zIndex: 1,
    }
  }
}

export function makeBlast(x, y) {
  const e = Game.createEntity();
  e.transform = { x, y };
  e.expand = { amount: 0.01 };
  e.duration = { time: 100 };
  e.sprite = {
    alpha: 1,
    texture: textures.particles.particle2,
    scaleX: 0.01,
    scaleY: 0.01,
    zIndex: 1,
  }
}

export function makeBullet(x, y, vx, vy, duration = 1000) {
  const e = Game.createEntity();

  e.transform = { x, y };
  e.velocity = { x: vx, y: vy, drag: 0 };
  e.duration = { time: duration };
  e.force = {};
  e.sprite = { 
    texture: textures.particles.particle2,
    scaleX: 0.025,
    scaleY: 0.025,
    zIndex: 1,
  };
  e.collider = { type: BULLET };

  return e;
} 

export function makeEnemy(x, y, avatar) {
  x = x || rng.nextInt(250, 600);
  y = y || rng.nextInt(250, 600);

  const avatars = Object.keys(textures.humans);
  avatar = avatar || avatars[rng.nextInt(avatars.length)];

  const e = Game.createEntity();

  e.transform = { x, y, rotation: 0 };
  e.force = { x: 0, y: 0 };
  e.velocity = { x: 0, y: 0, drag: 0.5 };
  e.state = { orientation: 'down', moving: false, hitpoints: 1 },
  e.targetControl = {};
  e.steeringControl = {};
  e.animationControl = makeHumanAnimations(avatar);
  e.animation = { data: e.animationControl.down };
  e.sprite = { scaleX: 1, scaleY: 1, zIndex: 1 };  
  e.collider = { type: ENEMY };
}

export function makePlayer(x, y, avatar) {
  const e = Game.createEntity();

  e.transform = { x, y, rotation: 0 };
  e.force = { x: 0, y: 0 };
  e.velocity = { x: 0, y: 0, drag: 0.4 };
  e.state = { orientation: 'down', moving: false },
  e.steeringControl = {};
  e.animationControl = makeHumanAnimations('ninja1');
  e.animation = { data: e.animationControl.down };
  e.sprite = { scaleX: 1, scaleY: 1, zIndex: 1 };  
  e.sprite._sprite.texture = e.animation.data.frames[0];
  e.collider = { type: PLAYER };

  window.player = e;
  actors.player = e;

  return e;
}