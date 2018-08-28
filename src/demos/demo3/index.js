import Game from '../../Game.js';
import { makePlayer, makeEnemy } from './actors';
import { load, maps, textures } from './resources';
import { camera } from './shared';
import { loadMap } from './world';
import { theme } from './audio';
import './components';
import './systems';
import './input';

window.game = Game;

export default function start() {
  load(() => {
    theme.once('load', () => theme.play());
    loadMap(maps.map1, textures.dungeon);
    const player = makePlayer();
    for (let i = 0; i < 4; i++) { makeEnemy(); }
    camera.target = player;

    Game.init();
    // run these systems immediately to render starting state
    // and make sure sprites have textures for generating colliders
    Game.runSystem(Game.systemsByName.animation);
    Game.runSystem(Game.systemsByName.sprite);
    Game.start();  
  })
}