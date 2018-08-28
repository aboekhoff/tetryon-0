import Game from '../../Game';

export function makeEffect(eid, component, property, delta, theta) {
  const target = Game.getEntity(eid);

  const start = target[component][property];
  const end = start + start * delta;
  const range = end - start;

  const e = Game.createEntity();

  e.duration = { time: theta };
  
  e.effect = {
    targetId: eid,
    start,
    end,
    range,
    theta,
  };
}