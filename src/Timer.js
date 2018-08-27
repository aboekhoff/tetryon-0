export default class Timer {
  constructor() {
    this.start = 0;
    this.delta = 0;
    this.last = 0;
    this.elapsed = 0;
  }

  reset() {
    this.start = 0;
    this.delta = 0;
    this.last = Date.now();
  }

  update() {
    const now = Date.now();
    this.elapsed = now - this.start;
    this.delta = now - this.last;
    this.last = now;
  }
}