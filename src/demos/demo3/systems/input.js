import Game from '../../../Game';
import { KEYS } from '../../../Input';
import { actors } from '../shared';
import { makeBullet, makeBlast } from '../actors';

Game.input.addButton('right', KEYS.RIGHT);
Game.input.addButton('left', KEYS.LEFT);
Game.input.addButton('up', KEYS.UP);
Game.input.addButton('down', KEYS.DOWN);
Game.input.addButton('fire', KEYS.SPACE);

export default {
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
      const { width, height } = player.sprite._sprite;
      const r = Math.sqrt(width * width + height * height);

      makeBlast(
        player.transform.x + x * r/2,
        player.transform.y + y * r/2,
      )

      makeBullet(
        player.transform.x + x * r/2, 
        player.transform.y + y * r/2,
        x * 6,
        y * 6,
      );
    }
  }
}