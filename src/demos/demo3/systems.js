import Game from '../../Game';
import components from './components';
import { grid, actors, stage, camera, BULLET, ENEMY, PLAYER, rng } from './shared';
import { angleBetween, turningAngle, wrapRotation, clamp, dist, intersects } from '../../Math.js';
import { makeBullet, makeBlast, makeExplosion } from './actors';
import { astar } from './astar';
import { textures } from './resources';
import { getOrientationFromRotation } from './util';

const { 
  Force, 
  State,
  Duration,
  TargetControl,
  SteeringControl, 
  AnimationControl, 
  Collider, 
  Transform, 
  Velocity, 
  Animation, 
  Sprite,
  Flash,
  Expand,
} = components;

Game.defineSystems({
  input: {
    run() {
      Game.input.update();

      const { right, left, up, down, fire } = Game.input.buttons; 
      const player = actors.player;
      const sc = player.steeringControl;

      const R = right.isDown;
      const L = left.isDown;
      const U = up.isDown;
      const D = down.isDown;

      sc.accelerate = R || L || U || D;

      if (R && D) { sc.rotation = Math.PI/4; }
      else if (L && D) { sc.rotation = Math.PI/4*3; }
      else if (L && U) { sc.rotation = Math.PI/4*5; }
      else if (R && U) { sc.rotation = Math.PI/4*7; }
      else if (R) { sc.rotation = 0; }
      else if (L) { sc.rotation = Math.PI; }
      else if (D) { sc.rotation = Math.PI/2; }
      else if (U) { sc.rotation = Math.PI/2*3; }

      if (fire.pressed) {
        const x = Math.cos(sc.rotation);
        const y = Math.sin(sc.rotation);

        makeBullet(
          player.transform.x, 
          player.transform.y,
          x * 6,
          y * 6,
        );
      }
    }
  },

  targetControl: {
    components: [TargetControl, Transform, SteeringControl],
    showPath: false,

    each(e) {
      e.targetControl.timer -= Game.timer.delta;

      if (e.targetControl.timer <= 0) {
        e.targetControl.timer = e.targetControl.thinkTime;
        e.targetControl.path = astar(
          { 
            x: e.transform.x + 8, 
            y: e.transform.y + 8 
          }, 
          { 
            x: actors.player.transform.x + 8, 
            y: actors.player.transform.y + 8 
          }
        );
      }

      if (e.targetControl.path == null) {
        return;
      }

      while (e.targetControl.path.length) {
        const target = e.targetControl.path[0];
        
        const { x: x1, y: y1 } = e.transform;
        const x2 = target.x * 16;
        const y2 = target.y * 16;
        
        if (dist(x1, y1, x2, y2) < 16) {
          e.targetControl.path.shift();
        } else {
          break;
        }
      } 

      if (this.showPath) {
        e.targetControl.path.forEach(node => {
          const e = Game.createEntity();
          
          e.transform = {
            x: node.x * 16,
            y: node.y * 16,
          }
  
          e.sprite = {
            texture: textures.particles.particle2,
            scaleX: 0.01,
            scaleY: 0.01,
          }
  
          e.duration = {
            time: 100,
          }
        })
      }

      const target = e.targetControl.path[0];

      if (!target) { return; }

      const { x: x1, y: y1 } = e.transform;
      const x2 = target.x * 16;
      const y2 = target.y * 16;
      
      e.steeringControl.rotation = angleBetween(x1, y1, x2, y2);
      e.steeringControl.accelerate = true;
    }
  },

  steeringControl: {
    components: [SteeringControl, State, Force],

    each(e) {
      const { rotation, accelerate } = e.steeringControl;
      const f = e.force;
      const dt = Game.timer.delta;

      e.state.moving = false;

      if (accelerate) {
        e.state.orientation = getOrientationFromRotation(rotation);
        e.state.moving = true;
        const dx = Math.cos(rotation);
        const dy = Math.sin(rotation);

        f.x += dx;
        f.y += dy;
      }
    }
  },

  animationControl: {
    components: [State, AnimationControl, Animation],
    
    each(e) {
      const st = e.state;
      const ac = e.animationControl;
      const a = e.animation;

      a.active = st.moving;
      
      if (ac[st.orientation]) {
        a.data = ac[st.orientation];  
      }
    }
  },

  collision: {
    active: false,
    components: [Collider, Transform, Sprite],
    destroyList: new Set(),

    each(e) {
      const { x, y } = e.transform;
      const { width: w, height: h } = e.sprite._sprite;
      grid.move(x-w/2, y-h/2, x+w/2, y+h/2, e.id);
    },

    after() {
      grid.getCandidates().forEach(([eid1, eid2]) => {
        const e1 = Game.getEntity(eid1);
        const e2 = Game.getEntity(eid2);

        if (!intersects(e1.sprite._sprite, e2.sprite._sprite)) {
          return;
        }

        if (e1.collider.static && e2.collider.static) {
          return;
        }

        if (e1.collider.static || e2.collider.static) {
          let staticObject, dynamicObject;

          if (e1.collider.static) {
            staticObject = e1;
            dynamicObject = e2;
          }

          if (e2.collider.static) {
            staticObject = e2;
            dynamicObject = e1;
          }


          const ds = dynamicObject.sprite._sprite;
          const ss = staticObject.sprite._sprite;

          const { width: dw, height: dh } = ds;
          const { width: sw, height: sh } = ss;

          const { x: x1, y: y1 } = dynamicObject.transform;
          const { x: x2, y: y2 } = staticObject.transform;

          const a = (x1 + dw/2) < (x2 - sw/2);
          const b = (x1 - dw/2) > (x2 + sw/2);
          const c = (y1 + dh/2) < (y2 - sh/2);
          const d = (y1 - dh/2) > (y2 + sh/2);

          if (Math.abs(x1 - x2) >= Math.abs(y1 - y2)) {
            dynamicObject.transform.x = x1 < x2 ? x2 - sw/2 - dw/2 : x2 + sw/2 + dw/2;
            dynamicObject.velocity.x *= -1;
          } else {
            dynamicObject.transform.y = y1 < y2 ? y2 - sh/2 - dh/2 : y2 + sh/2 + dh/2;
            dynamicObject.velocity.y *= -1;
          }

          if (dynamicObject.collider.type === BULLET) {
            makeBlast(dynamicObject.transform.x, dynamicObject.transform.y);
            this.destroyList.add(dynamicObject);
          }

          return;
        }

        const t1 = e1.transform;
        const t2 = e2.transform;
        const v1 = e1.velocity;
        const f1 = e1.force;
        const v2 = e2.velocity;
        const f2 = e2.force;

        const { x: x1, y: y1 } = t1;
        const { x: x2, y: y2 } = t2;

        const s1 = Math.sqrt(e1.sprite._sprite.width * e1.sprite._sprite.height) / 2;
        const s2 = Math.sqrt(e2.sprite._sprite.width * e2.sprite._sprite.height) / 2;

        const d = dist(x1, y1, x2, y2);
        const depth = (s1 + s2) - d;

        const dt = game.timer.delta;

        if (depth > 0) {
          const bulletEnemy = BULLET ^ ENEMY;
          const playerEnemy = PLAYER ^ ENEMY;           
          const collisionType = e1.collider.type ^ e2.collider.type;

          let staticObject, dynamicObject;

          if (e1.collider.static || e2.collider.static) {
            if (e1.collider.static) {
              staticObject = e1;
              dynamicObject = e2;
            }
  
            if (e2.collider.static) {
              staticObject = e2;
              dynamicObject = e1;
            }

            const dx = dynamicObject.transform.x - staticObject.transform.x;
            const dy = dynamicObject.transform.y - staticObject.transform.y;
            
            dynamicObject.transform.x += dx * 0.25;
            dynamicObject.transform.y += dy * 0.25;
            return;
          }

          if (collisionType === bulletEnemy) {
            const [bullet, enemy] = e1.collider.type === BULLET ? [e1, e2] : [e2, e1];

            this.destroyList.add(bullet);
            
            enemy.flash = {};
            
            const collisionAngle = angleBetween(bullet.transform.x, bullet.transform.y, enemy.transform.x, enemy.transform.y);
            enemy.force.x += Math.cos(collisionAngle) * 20;
            enemy.force.y += Math.sin(collisionAngle) * 20;
            makeBlast(bullet.transform.x, bullet.transform.y);
            return;
          }

          if (collisionType === playerEnemy) {
            player.flash = {};
            camera.trauma = Math.min(10, camera.trauma + 0.5);
          }

          if (collisionType === playerEnemy ||
              !collisionType && e1.collider.type === ENEMY) {

            const impactAngle = angleBetween(x1, y1, x2, y2);
            const impactX = Math.cos(impactAngle);
            const impactY = Math.sin(impactAngle);

            t1.x -= impactX * (depth / 12);
            t1.y -= impactX * (depth / 12);
            t2.x += impactX * (depth / 12);
            t2.y += impactY * (depth / 12);

            // f2.x += v1.x;
            // f2.y += v1.y;
            // f2.x -= v2.x;
            // f2.y -= v2.y;
            // f1.x += v2.x;
            // f1.y += v2.y;
            // f1.x -= v1.x;
            // f1.y -= v1.y;

            return;
          }
  
        }
      });

      this.destroyList.forEach(e => {
        e.release();
      });

      this.destroyList.clear();
    }, 
  },

  physics: {
    active: false,
    components: [Transform, Force, Velocity],
    
    each (e) {
      const t = e.transform;
      const f = e.force;
      const v = e.velocity;

      v.x += f.x;
      v.y += f.y;

      f.x = 0;
      f.y = 0;

      if (v.drag) {
        v.x -= v.x * v.drag;
        v.y -= v.y * v.drag;
      }

      t.x += v.x;
      t.y += v.y;
      t.rotation += v.rotation;
    }
  },

  logic: {
    run() {
      Game.runSystem(Game.systemsByName.collision);
      Game.runSystem(Game.systemsByName.physics);
    }
  },

  animation: {
    components: [Animation, Sprite],

    each(e) {
      const dt = Game.timer.delta;
      const a = e.animation;
      const s = e.sprite;

      a.elapsed += dt;

      if (a.active || !a.data.idle[a.frame]) {
        if (a.elapsed >= a.data.speed) {
          a.frame = (a.frame + 1) % a.data.frames.length;
          a.elapsed = 0;
        }
      }

      s.texture = a.data.frames[a.frame];

      const scaleX = Math.abs(s.scaleX);
      s.scaleX = a.data.flip ? -scaleX : scaleX;
    }
  },

  sprite: {
    components: [Transform, Sprite],

    each(e) {
      const { x, y, scale } = e.transform;
      const { anchorX, anchorY, scaleX, scaleY, texture, _sprite, alpha } = e.sprite;

      _sprite.texture = texture;
      _sprite.position.x = x;
      _sprite.position.y = y;
      _sprite.scale.x = scaleX;
      _sprite.scale.y = scaleY;
      _sprite.alpha = alpha;
    }
  },

  flash: {
    components: [Flash, Sprite],

    each (e) {
      e.flash.time += Game.timer.delta;
      if (e.flash.time >= e.flash.duration) {
        e.sprite._sprite.tint = 0xFFFFFF;
        e.removeComponent(Flash);
      } else {
        e.sprite._sprite.tint = Math.floor(0xFFFFFF - (0xFFFFFF * e.flash.time / e.flash.duration));
      }  
    }
  },

  expand: {
    components: [Expand, Sprite],

    each (e) {
      e.sprite.scaleX += e.expand.amount;
      e.sprite.scaleY += e.expand.amount;
    }
  },

  duration: {
    components: [Duration],

    each(e) {
      e.duration.time -= Game.timer.delta;
      if (e.duration.time <= 0) {
        e.release();
      }
    }
  },

  camera: {
    run() {
      const { x: x1, y: y1, target, threshold, offset, trauma } = camera;

      stage.pivot.x = x1;
      stage.pivot.y = y1;
      stage.rotation = 0;

      if (trauma > 0) {  
        console.log(trauma)
        const traumaCoefficient = Math.pow(trauma / 10, 2);
        const traumaX = traumaCoefficient * (rng.nextFloat(-1, 1));
        const traumaY = traumaCoefficient * (rng.nextFloat(-1, 1));
        const traumaRotation = traumaCoefficient * (rng.nextFloat(-0.02, 0.02));

        stage.pivot.x += traumaX;
        stage.pivot.y += traumaY;
        stage.rotation += traumaRotation;
        camera.trauma = Math.max(trauma - 0.1, 0);
      }

      const { orientation } = target.state;
      let { x: x2, y: y2 } = target.transform;

      switch (orientation) {
        case 'right':
          x2 += offset;
          break;
        case 'left':
          x2 -= offset; 
          break;
        case 'up':
          y2 -= offset;
          break;
        case 'down':
          y2 += offset;
          break;
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      camera.x += (dx / threshold) * 0.15;
      camera.y += (dy / threshold) * 0.15;
    }
  }
});
