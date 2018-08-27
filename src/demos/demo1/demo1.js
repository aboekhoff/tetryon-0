import Game from '../../Game.js';
import Component from '../../Component.js';
import System from '../../System.js';
import Entity from '../../Entity.js';
import Random from '../../Random.js';
import { angleBetween, turningAngle, wrapRotation, clamp, dist } from '../../Math.js';
import Grid from '../../Grid.js';

const PI = Math.PI;
const TAU = PI * 2;

const CIRCLE = 'CIRCLE';
const TRIANGLE = 'TRIANGLE';
const RED = 'RED';

const NUM_CIRCLES = 10;
const SCALE = 1;

const CAMERA = {
  x: 0, 
  y: 0,
  scaleX: 1,
  scaleY: 1, 
}

const rng = new Random(42);

function makeTriangle() {
  const e = Game.createEntity();
  
  e.transform = { 
    x: world.width / 2,
    y: world.height / 2, 
    scale: 20,
    rotation: 0,
  };

  e.velocity = { x: 0, y: 0 };

  e.render = { color: '#a66', shape: TRIANGLE };

  e.control = {};

  e.propulsion = {
    active: false,
    speed: 0,
    topSpeed: 0.08,
    rate: 0.01,
  }

  console.log(e.getComponents());
}

function randomCircle() {
  const e = Entity.acquire();
  e.addComponent(
    Transform, 
    { 
      x: rng.nextInt(0, world.width),
      y: rng.nextInt(0, world.height), 
      scale: rng.nextInt(2, 32),
    }
  );

  const rotation = rng.nextFloat(0, Math.PI * 2);

  e.addComponent(
    Velocity,
    {
      x: Math.cos(rotation) * 4,
      y: Math.sin(rotation) * 4,
    }
  );
  e.addComponent(
    Render,
    { color: rng.nextColor() }
  )
}

const state = Game.state;

const world = {
  width: 1000,
  height: 1000,
}

const grid = new Grid(world.width, world.height);

window.Game = Game;
window.Entity = Entity;
window.System = System;

let screen, ctx;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  screen.width = w;
  screen.height = h;
}

export default function start() {
  screen = document.createElement('canvas');
  ctx = screen.getContext('2d');
  
  document.body.appendChild(screen);
  window.addEventListener('resize', resize);

  resize();

  // Game.addSystem(control);
  // Game.addSystem(propulsion);
  // Game.addSystem(physics);
  // Game.addSystem(render);

  for (let i = 0; i < NUM_CIRCLES; i++) {
    randomCircle();
  }

  makeTriangle();

  console.log(Transform.pool.instances);
  console.log(Velocity.pool.instances);
  console.log(Render.pool.instances);

  Game.start();
}

const { Transform, Velocity, Render, Control, Propulsion } = Game.defineComponents({
  Transform: { x: 0, y: 0, rotation: 0, scale: 1 },
  Velocity: { x: 0, y: 0, rotation: 0, drag: 0 },
  Render: { shape: CIRCLE, color: '#000' },
  Control: {},
  Propulsion: { active: 0, speed: 0, topSpeed: 0, rate: 0 },
})

const { control, propulsion, physics, render } = Game.defineSystems({
  control: {
    components: [Control, Propulsion, Transform],

    state: {
      initialized: false,
      pointer: { x: null, y: null },
      buttons: { 
        accelerate: false,
        up: false,
        down: false,
        right: false,
      },
    },

    before() {
      if (!this.state.initialized) {
        window.addEventListener('mousemove', (e) => {
          this.state.pointer.x = e.clientX;
          this.state.pointer.y = e.clientY;
        });
        window.addEventListener('keydown', (e) => {
          this.state.buttons.accelerate = true;
        });
        window.addEventListener('keyup', (e) => {
          this.state.buttons.accelerate = false;
        })
        this.state.initialized = true;
      }
    },

    each(e) {
      const t = e.getComponent(Transform);
      const p = e.getComponent(Propulsion);

      const { x: x1, y: y1 } = t;
      const { x: x2, y: y2 } = this.state.pointer;
      const target = angleBetween(x1, y1, x2, y2);
      const turn = turningAngle(t.rotation, target);
      t.rotation = wrapRotation(t.rotation + turn * 0.2);
      p.active = this.state.buttons.accelerate;
    }

  },

  propulsion: {
    components: [Propulsion, Transform, Velocity],

    each (e) {
      const t = e.getComponent(Transform);
      const p = e.getComponent(Propulsion);
      const v = e.getComponent(Velocity);

      if (p.active) {
        p.speed += p.rate
      } else {
        p.speed -= p.rate;
      }

      p.speed = clamp(p.speed, 0, p.topSpeed);

      const x = Math.cos(t.rotation);
      const y = Math.sin(t.rotation);

      const dx = x * p.speed;
      const dy = y * p.speed;

      v.x += dx;
      v.y += dy;
    },
  },

  collision: {
    components: [Transform, Velocity],

    all(es) {
      for (let i = 0; i < es.length - 1; i++) {
        const { transform: t1, velocity: v1 } = es[i];
        const { x: vx1, y: vy1 } = v1;
        const { x: tx1, y: ty1, scale: s1 } = t1;
        for (let j = i + 1; j < es.length; j++) {
          const { transform: t2, velocity: v2 } = es[j];
          const { x: vx2, y: vy2 } = v2;
          const { x: tx2, y: ty2, scale: s2 } = t2;
          const s = s1 + s2;
          const d = dist(tx1, ty1, tx2, ty2);

          if (d <= s) {
            v2.x += vx1;
            v2.y += vy1;
            v2.x -= vx2;
            v2.y -= vy2;
            v1.x += vx2;
            v1.y += vy2;
            v1.x -= vx1;
            v1.y -= vy1;
          }
        }
      }
    }
  },

  physics: {
    components: [Transform, Velocity],
    
    each (e) {
      const { width: w, height: h } = world;
      
      const t = e.getComponent(Transform);
      const v = e.getComponent(Velocity);

      t.x += v.x /* * (1 - Math.abs(t.scale) / 20); */
      t.y += v.y /* * (1 - Math.abs(t.scale) / 20); */
      t.rotation += v.rotation;

      if (t.x < 0) { t.x = 0; v.x *= -1; }
      if (t.x > w) { t.x = w; v.x *= -1; }
      if (t.y < 0) { t.y = 0; v.y *= -1; }
      if (t.y > h) { t.y = h; v.y *= -1; } 
    }
  },

  render: {
    components: [Transform, Render],

    before() {
      ctx.clearRect(0, 0, screen.width, screen.height);
      ctx.save();
      ctx.scale(SCALE, SCALE);
    },

    each (e) {
      const t = e.getComponent(Transform);
      const r = e.getComponent(Render);

      const { x, y, scale, rotation } = t;
      const { shape, color } = r;
      // const y = world.height - _y;

      switch (shape) {
        case CIRCLE:
        ctx.beginPath();
        ctx.arc(x, y, scale, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        return;

        case TRIANGLE:
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(scale, 0);
        ctx.lineTo(-scale, scale / 2);
        ctx.lineTo(-scale, -scale / 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
        return;
      } 
    },

    after() {
      ctx.restore();
    }
  },
});