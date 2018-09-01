import Game from '../../../Game';

export default {
  run() {
    Game.runSystem(Game.systemsByName.collision);
    Game.runSystem(Game.systemsByName.physics);
  }
}