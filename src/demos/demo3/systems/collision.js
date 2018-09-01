import Game from '../../../Game';
import { angleBetween, dist, intersects } from '../../../Math';
import { makeBlast, makeExplosion } from '../actors';
import { grid, camera, PLAYER, BULLET, ENEMY } from '../shared';
import components from '../components';

const { Collider, Transform, Sprite } = components;

export default {
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
          enemy.state.hitpoints--;

          console.log(enemy.state);

          enemy.flash = {};
          
          enemy.force.x += bullet.velocity.x;
          enemy.force.y += bullet.velocity.y;
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
  }
}