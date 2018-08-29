import Game from '../../Game.js';
import { makePlayer, makeEnemy } from './actors';
import { load, maps, textures } from './resources';
import { camera } from './shared';
import { loadTiledMap } from './world';
import { theme } from './audio';
import './components';
import './systems';
import './input';

window.game = Game;

export default function start() {
  load(() => {
    theme.once('load', () => theme.play());
    loadTiledMap('map2');
    const player = makePlayer(66 * 16, 48 * 16);
    for (let i = 0; i < 24; i++) { makeEnemy(66 * 16, 42 * 16); }
    
    camera.target = player;
    camera.x = player.transform.x;
    camera.y = player.transform.y;

    Game.init();
    // run these systems immediately to render starting state
    // and make sure sprites have textures for generating colliders
    Game.runSystem(Game.systemsByName.animation);
    Game.runSystem(Game.systemsByName.sprite);
    Game.start();  
  })
}