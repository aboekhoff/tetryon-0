import components from '../components';
import { DEBRIS } from '../shared';
import { makeExplosion } from '../actors';

const { Transform, State } = components;

export default {
  components: [Transform, State],

  each (e) {
    const t = e.transform;
    const s = e.state;

    if (s.alive && s.hitpoints <= 0) {
      e.targetControl = null;
      e.steeringControl = null;
      e.flash = null;
      e.velocity.drag = 0.1;
      
      e.collider.type = DEBRIS;

      s.alive = false;
      s.orientation = 'right';
      s.moving = false;
      
      e.sprite._sprite.tint = 0x888888;
      e.sprite.zIndex = 2;
      e.sprite.rotation = Math.random() < 0.5 ? Math.PI/2 : Math.PI/2*3;
    }
  }
}