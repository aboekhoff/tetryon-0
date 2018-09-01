export default class ObjectPool {
    constructor(factory) {
      this.factory = factory;
      this.marker = 0;
      this.instances = [];
      this.instanceToIndex = new Map();
    }
  
    allocate() {
      const index = this.instances.length;
      const instance = new this.factory();
      this.instances.push(instance);
      this.instanceToIndex.set(instance, index); 
    }
  
    acquire() {
      if (this.marker === this.instances.length) {
        this.allocate();
      }
  
      return this.instances[this.marker++];
    }
  
    release(instance1) {
      if (instance1 == null) {
        debugger;
      }

      const index = this.instanceToIndex.get(instance1);
      this.marker--

      if (this.marker < 0) {
        debugger;
      }
  
      if (index === this.marker) {
        return;
      }
  
      const instance2 = this.instances[this.marker];
      this.instances[index] = instance2;
      this.instances[this.marker] = instance1;
      this.instanceToIndex.set(instance1, this.marker);
      this.instanceToIndex.set(instance2, index);
      return null;
    }

    forEach(callback) {
      for (let i = 0; i < this.marker; i++) {
        callback(this.instances[i]);
      }
    }
  }