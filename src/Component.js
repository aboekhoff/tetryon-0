import ObjectPool from './ObjectPool';

let nextId = 0;
const byName = {};
const byId = {};

export function makeConstructor(name, defaults) {
  const fragments = [];
  Object.keys(defaults).forEach(field => {
    fragments.push(`this['${field}'] = (params && '${field}' in params) ? params['${field}'] : defaults['${field}'];`)
  });
  const body = `return function ${name} (params) { ${fragments.join(' ')} }`
  return new Function('defaults', body)(defaults);
}

export function define1(name, defaults, events = {}) {
  const id = nextId++;
  const mask = 1 << id;

  const _defaults = Object.assign(defaults, { _eid: -1 });

  const allocator = makeConstructor(name, _defaults);

  const pool = new ObjectPool(allocator);
  const byEntityId = new Map();

  const acquire = function(entityId, params = {}) {
    const component = pool.acquire();

    if (component == null) {
      debugger;
    }

    component._eid = entityId;
    byEntityId.set(entityId, component);

    if (events.acquire) {
      events.acquire.call(component, params, _defaults);
    } else {
      Object.assign(component, params);
    }

    return component;
  };

  const release = function(component) {
    if (events.release) {
      events.release.call(component);
    } else {
      Object.assign(component, _defaults);
    }
    byEntityId.delete(component._eid);
    pool.release(component);
  };

  allocator.prototype._release = function() {
    release(this);
  }

  const component = {
    name,
    byEntityId,
    mask,
    pool,
    acquire,
    release,
    events,
    defaults: _defaults,
  }

  byName[name] = component;
  byId[id] = component;

  return component;
}

export function define(spec) {
  const out = {};

  Object.keys(spec).forEach(name => {
    const args = spec[name];
    
    let defaults, events;

    if (Array.isArray(args)) {
      defaults = args[0];
      events = args[1];
    } else if (args instanceof Object) {
      defaults = args;
      events = {};
    } else {
      throw Error('malformed spec')
    }

    out[name] = define1(name, defaults, events);  
  })

  return out;
}

export default {
  define,
  define1,
  byName,
  byId,
}