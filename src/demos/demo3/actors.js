import Game from '../../Game';
import { actors, rng, BULLET, ENEMY, PLAYER } from './shared';
import { textures } from './resources';
import { world } from './world';

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
    const speed = rng.nextInt(4, 8);
    const duration = rng.nextInt(50, 300);
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
      scaleX: 0.01,
      scaleY: 0.01,
    }
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
  e.velocity = { x: 0, y: 0, drag: 0.25 };
  e.state = { orientation: 'down', moving: false },
  e.targetControl = {};
  e.steeringControl = {};
  e.animationControl = makeHumanAnimations(avatar);
  e.animation = { data: e.animationControl.down };
  e.sprite = { scaleX: 2, scaleY: 2 };  
  e.collider = { type: ENEMY };
}

export function makePlayer(x, y, avatar) {
  const e = Game.createEntity();

  e.transform = { x: world.width / 2, y: world.width / 2, rotation: 0 };
  e.force = { x: 0, y: 0 };
  e.velocity = { x: 0, y: 0, drag: 0.24 };
  e.state = { orientation: 'down', moving: false },
  e.steeringControl = {};
  e.animationControl = makeHumanAnimations('ninja1');
  e.animation = { data: e.animationControl.down };
  e.sprite = { scaleX: 2, scaleY: 2 };  
  e.sprite._sprite.texture = e.animation.data.frames[0];
  e.collider = { type: PLAYER };

  window.player = e;
  actors.player = e;

  return e;
}