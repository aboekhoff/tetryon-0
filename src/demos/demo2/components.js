import Game from '../../Game.js';
import { grid, BLACK, GRAY, CIRCLE } from './shared.js';

export default Game.defineComponents({
  Transform: { x: 0, y: 0, rotation: 0, scale: 1 },
  Force: { x: 0, y: 0 },
  Velocity: { x: 0, y: 0 },
  Render: { fill: GRAY, stroke: BLACK, shape: CIRCLE },
  Collider: [
    { x1: -1, x2: 1, y1: -1, y2: 1 },
    { 
      acquire() {
        const e = Game.getEntity(this._eid);
        
        if (!e.transform) {
          throw Error('Cannot add collider to entity without transform!');
        }

        const { x, y, scale } = e.transform;

        this.x1 = x - scale;
        this.x2 = x + scale;
        this.y1 = y - scale;
        this.y2 = y + scale;

        grid.insert(this.x1, this.y1, this.x2, this.y2, e);
      },

      release() {
        const e = Game.getEntity(this._eid);
        grid.remove(e);
      }
    },
  ],
});