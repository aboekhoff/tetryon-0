import Game from '../../../Game';

import animation from './animation';
import animationControl from './animationControl';
import camera from './camera';
import collision from './collision';
import duration from './duration';
import expand from './expand';
import flash from './flash';
import input from './input';
import life from './life';
import logic from './logic';
import physics from './physics';
import sprite from './sprite';
import steeringControl from './steeringControl';
import targetControl from './targetControl';

export default Game.defineSystems({
  input,
  targetControl,
  steeringControl,
  animationControl,
  collision,
  physics,
  logic,
  expand,
  flash,
  duration,
  animation,
  sprite,
  camera,
  life,
})