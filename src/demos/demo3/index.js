import Game from '../../Game.js';
import Random from '../../Random.js';
import { makePlayer, makeEnemy } from './actors';
import { load, textures } from './resources';
import './components';
import './systems';
import './input';

window.game = Game;

export default function start() {
  load(() => {
    makePlayer();
    for (let i = 0; i < 20; i++) {
      makeEnemy();
    }
    Game.init();
    Game.runSystem(Game.systemsByName.animation);
    Game.runSystem(Game.systemsByName.sprite);
    Game.start();  
  })
}