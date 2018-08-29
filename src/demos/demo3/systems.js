import Game from '../../Game';
import components from './components';
import { grid, actors, stage, camera, BULLET, ENEMY, PLAYER } from './shared';
import { angleBetween, turningAngle, wrapRotation, clamp, dist, intersects } from '../../Math.js';
import { makeBullet, makeExplosion } from './actors';
import { astar } from './astar';
import { textures } from './resources';

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
  Sprite 
} = components;

let ctimer = 0;

Game.defineSystems({
  input: {
    run() {
      Game.input.update();

      const { right, left, up, down, fire } = Game.input.buttons; 
      const player = actors.player;
      const sc = player.steeringControl;

      sc.right = right.isDown;
      sc.left = left.isDown;
      sc.up = up.isDown;
      sc.down = down.isDown;

      if (fire.pressed) {
        let x = 0;
        let y = 0;

        switch (player.state.orientation) {
          case 'down': y = 1; break;
          case 'right': x = 1; break;
          case 'left': x = -1; break;
          case 'up': y = -1; break;
        }

        makeBullet(
          player.transform.x, 
          player.transform.y,
          player.velocity.x + (x * 6),
          player.velocity.y + (y * 6),
        )
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
        
        if (dist(x1, y1, x2, y2) < 8) {
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
      
      const theta = angleBetween(x1, y1, x2, y2);

      const dx = Math.cos(theta);
      const dy = Math.sin(theta);

      e.steeringControl.right = false;
      e.steeringControl.left = false;
      e.steeringControl.up = false;
      e.steeringControl.down = false;


      if (dx > 0) {
        e.steeringControl.right = true;
      } else if (dx < 0) {
        e.steeringControl.left = true;
      }

      if (dy > 0) {
        e.steeringControl.down = true;
      } else if (dy < 0) {
        e.steeringControl.up = true;
      }
    }
  },

  steeringControl: {
    components: [SteeringControl, State, Force],

    each(e) {
      const { right, left, up, down, fire } = e.steeringControl;
      const f = e.force;

      e.state.moving = false;

      if (right) { 
        f.x += 1; 
        e.state.orientation = 'right'; 
        e.state.moving = true;
      }

      if (left) { 
        f.x -= 1; 
        e.state.orientation = 'left'; 
        e.state.moving = true;
      }
      
      if (up) { 
        f.y -= 1; 
        e.state.orientation = 'up'; 
        e.state.moving = true;
      }

      if (down) { 
        f.y += 1; 
        e.state.orientation = 'down'; 
        e.state.moving = true;
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
            makeExplosion(dynamicObject.transform.x, dynamicObject.transform.y);
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

        const s1 = e1.sprite._sprite.width / 2;
        const s2 = e2.sprite._sprite.width / 2;

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
            this.destroyList.add(e1);
            this.destroyList.add(e2);
            makeExplosion(e1.transform.x, e1.transform.y);
            return;
          }

          if (collisionType === playerEnemy ||
              !collisionType && e1.collider.type === ENEMY) {

            const impactAngle = angleBetween(x1, y1, x2, y2);
            const impactX = Math.cos(impactAngle);
            const impactY = Math.sin(impactAngle);

            t1.x -= impactX * (depth / 6);
            t1.y -= impactX * (depth / 6);
            t2.x += impactX * (depth / 6);
            t2.y += impactY * (depth / 6);

            // f2.x += v1.x;
            // f2.y += v1.y;
            // f2.x -= v2.x;
            // f2.y -= v2.y;
            // f1.x += v2.x;
            // f1.y += v2.y;
            // f1.x -= v1.x;
            // f1.y -= v1.y;
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
      Game.runSystem(Game.systemsByName.collision);
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
      const { anchorX, anchorY, scaleX, scaleY, texture, _sprite } = e.sprite;

      _sprite.texture = texture;
      _sprite.position.x = x;
      _sprite.position.y = y;
      _sprite.scale.x = scaleX;
      _sprite.scale.y = scaleY;
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
      const { x: x1, y: y1, target, threshold, offset } = camera;

      stage.pivot.x = x1;
      stage.pivot.y = y1;
      
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
