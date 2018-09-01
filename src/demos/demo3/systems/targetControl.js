import Game from '../../../Game';
import { dist, angleBetween } from '../../../Math';
import { astar } from '../astar';
import { textures, actors } from '../shared';
import components from '../components';

const { TargetControl, Transform, SteeringControl } = components;

export default {
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
}