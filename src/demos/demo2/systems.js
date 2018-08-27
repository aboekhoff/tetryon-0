import Game from '../../Game';
import components from './components';
import { grid, context, canvas } from './shared';
import { angleBetween, turningAngle, wrapRotation, clamp, dist } from '../../Math.js';
const { Force, Collider, Transform, Velocity, Render } = components;

let ctimer = 0;

Game.defineSystems({
  collision: {
    active: false,
    components: [Collider, Transform],
    each(e) {
      const { x, y, scale } = e.transform;
      grid.move(x-scale, y-scale, x+scale, y+scale, e);
    },
    after() {
      grid.getCandidates().forEach(([e1, e2]) => {
        const t1 = e1.transform;
        const t2 = e2.transform;
        const v1 = e1.velocity;
        const f1 = e1.force;
        const v2 = e2.velocity;
        const f2 = e2.force;

        const { x: x1, y: y1, scale: s1 } = t1;
        const { x: x2, y: y2, scale: s2 } = t2;
        const d = dist(x1, y1, x2, y2);

        const depth = (s1 + s2) - d;

        if (depth > 0) {
          t1.x -= v1.x * (depth / 2);
          t1.y -= v1.y * (depth / 2);

          t2.x -= v2.x * depth / 2;
          t2.y -= v2.y * depth / 2;

          f2.x += v1.x;
          f2.y += v1.y;
          f2.x -= v2.x;
          f2.y -= v2.y;
          f1.x += v2.x;
          f1.y += v2.y;
          f1.x -= v1.x;
          f1.y -= v1.y;  
        }
      });
    } 
  },

  physics: {
    active: false,
    components: [Transform, Force, Velocity],
    
    each (e) {
      const { width: w, height: h } = canvas;
      
      const t = e.transform;
      const f = e.force;
      const v = e.velocity;

      v.x += f.x;
      v.y += f.y;

      f.x = 0;
      f.y = 0;

      t.x += v.x;
      t.y += v.y;
      t.rotation += v.rotation;

      if (t.x < 0) { t.x = 0; v.x *= -1; }
      if (t.x > w) { t.x = w; v.x *= -1; }
      if (t.y < 0) { t.y = 0; v.y *= -1; }
      if (t.y > h) { t.y = h; v.y *= -1; } 
    }
  },

  logic: {
    run() {
      Game.runSystem(Game.systemsByName.collision);
      Game.runSystem(Game.systemsByName.physics);
      Game.runSystem(Game.systemsByName.collision);
      Game.runSystem(Game.systemsByName.physics);
    }
  },

  render: {
    components: [Transform, Render],

    before() {
      context.clearRect(0, 0, canvas.width, canvas.height);
    },

    each(e) {
      const { x, y, scale } = e.transform;
      context.beginPath();
      context.arc(x, y, scale, 0, Math.PI * 2);
      context.closePath();
      context.fillStyle = '#ccc';
      context.strokeStyle = '#333';
      context.stroke();
      context.fill();
    }
  },
});
