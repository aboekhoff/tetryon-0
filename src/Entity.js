import ObjectPool from './ObjectPool';
import Component from './Component';

let nextId = 0;

export default class Entity {
  constructor() {
    this.id = -1;
    this.mask = 0;
  }

  addComponent(componentType, params) {
    Entity.addComponent(this, componentType, params);
    return this;
  }

  removeComponent(componentType) {
    Entity.removeComponent(this, componentType);
    return this;
  }

  getComponent(componentType) {
      return componentType.byEntityId.get(this.id);
  };

  getComponents() {
    return Entity.getComponents(this);
  };

  release() {
    Entity.release(this);
  }
}

Entity.pool = new ObjectPool(Entity);
Entity.byId = new Map();

Entity.acquire = function() {
  const e = Entity.pool.acquire();
  e.id = nextId++;
  Entity.byId.set(e.id, e);
  return e;
}

Entity.release = function(entity) {
  Entity.getComponents(entity).forEach(component => component._release());
  Entity.byId.delete(entity);
  Entity.pool.release(entity);
  entity.mask = 0;
  entity.id = null;
}

Entity.addComponent = function(entity, componentType, params) {
  entity.mask |= componentType.mask;
  componentType.acquire(entity.id, params)
}

Entity.removeComponent = function(entity, componentType) {
  if (!(entity.mask & componentType.mask)) { return; }
  entity.mask &= ~componentType.mask;
  const component = componentType.byEntityId.get(entity.id);
  if (component) { componentType.release(component); }
}

Entity.getComponents = function(entity) {
  const out = [];
  const eid = entity.id;
  let mask = entity.mask;
  let cid = 0;
  
  while (mask) {
    if (mask & 1) {
      out.push(Component.byId[cid].byEntityId.get(eid));
    }
    mask >>>= 1;
    cid++;
  }

  return out;
}