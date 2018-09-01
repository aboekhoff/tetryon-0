import Entity from './Entity';
import Timer from './Timer';
import Component from './Component';
import System from './System';
import { Input } from './Input';

class Game {
  constructor() {
    this.systems = [];
    this.running = false;
    this.timer = new Timer();
    this.state = {};
    this.systemsByName = {};
    this.input = new Input();

    this.input.addCallbacks();
  }

  init() {
    this.systems.sort((a , b) => {
      const x = a.priority || 0;
      const y = b.priority || 0;
      return x < y ? - 1 : y < x ? -1 : 0;
    });

    this.timer.reset();
  }

  start() {
    if (this.running) {
      return;
    }

    this.init();

    this.running = true;
    
    const loop = () => {
      if (!this.running) { return; }
      this.timer.update();
      this.runSystems();
      requestAnimationFrame(loop);
    }

    loop();
  }

  stop() {
    this.running = false;
  }

  createEntity() {
    return Entity.acquire();
  }

  getEntity(id) {
    return Entity.byId.get(id);
  }

  defineComponents(spec) {
    console.log(spec);
    const components = Component.define(spec);
    this.registerComponents(...Object.keys(components).map(key => components[key]));
    console.log(components);
    return components;
  }

  defineSystems(spec) {
    const systems = System.define(spec);
    console.log(systems);
    this.registerSystems(...Object.keys(systems).map(key => systems[key]));
    return systems;
  }

  registerComponent(componentType) {
    const { name } = componentType;
    const fieldName = name[0].toLowerCase() + name.substring(1);

    Object.defineProperty(Entity.prototype, fieldName, {
      get() {
        return this.getComponent(componentType);
      },

      set(params) {
        this.removeComponent(componentType);
        if (params) {
          this.addComponent(componentType, params);
        }
      }
    });
  }

  registerComponents(...componentTypes) {
    componentTypes.forEach(componentType => {
      this.registerComponent(componentType);
    });
    return this;
  }

  registerSystem(system) {
    this.systems.push(system);
    this.systemsByName[system.name] = system;
  }

  registerSystems(...systems) {
    systems.forEach(system => {
      this.registerSystem(system);
    })
  }

  runSystems() {
    for (let i = 0; i < this.systems.length; i++) {
      const system = this.systems[i];
      if (system.active) {
        this.runSystem(system);
      }
    }
  }

  runSystem(system) {
    if (system.before) {
      system.before();
    }

    if (system.run) {
      system.run();
    }

    if (system.all || system.each) {
      const entities = [];
      
      Entity.pool.forEach(e => {
        if ((e.mask & system.mask) === system.mask) {
          entities.push(e);
        }
      });

      if (system.sort) {
        entities.sort(system.sort);
      }

      if (system.all) {
        system.all(entities);
      }

      if (system.each) {
        for (let i = 0; i < entities.length; i++) {
          system.each(entities[i]);
        }
      }
    }

    if (system.after) {
      system.after();
    }
  }
}

export default new Game();