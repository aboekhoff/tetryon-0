import Game from '../../Game.js';
import { makePlayer, makeEnemy } from './actors';
import { load, maps, textures } from './resources';
import { camera } from './shared';
import { loadTiledMap } from './world';
import { theme } from './audio';
import './components';
import systems from './systems';

window.game = Game;

const NUM_ENEMIES = 80;

export default function start() {
  load().then(() => {
    theme.once('load', () => theme.play());
    loadTiledMap('map2');
    for (let i = 0; i < NUM_ENEMIES; i++) { makeEnemy(66 * 16, 42 * 16); }
    const player = makePlayer(66 * 16, 48 * 16);

    camera.target = player;
    camera.x = player.transform.x;
    camera.y = player.transform.y;

    Game.init();
    // run these systems immediately to render starting state
    // and make sure sprites have textures for generating colliders
    Game.runSystem(Game.systemsByName.animation);
    Game.runSystem(Game.systemsByName.sprite);
    Game.start();  
  });
}