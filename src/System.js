import Intercom from './Intercom';

const all = [];
const byName = {};

function compileComponents(deps) {
  let mask = 0;

  if (deps) {
    for (let i = 0; i < deps.length; i++) {
      mask |= deps[i].mask;
    }
  }

  return mask;
}

function define1(name, spec) {
  const system = Object.assign(
    {}, 
    spec, 
    { 
      name,  
      mask: compileComponents(spec.components),
    }
  );

  if (system.active == null) {
    system.active = true;
  }

  if (system.events) {
    system.events.forEach(topic => {
      Intercom.subscribe(topic, system.events[topic].bind(system));
    });
  }

  all.push(system);
  byName[name] = system;

  return system;
}

function define(spec) {
  const out = {};

  Object.keys(spec).forEach(name => {
    out[name] = define1(name, spec[name]);
  })

  return out;
}

export default {
  define1,
  define,
  all,
  byName,
};