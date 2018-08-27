export default class Random {
  constructor(seed) {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
  }

  nextInt(min = 2147483647, max) {
    if (max == null) {  
      max = min;
      min = 0;
    }
    const n = this._seed = this._seed * 16807 % 2147483647;
    return n % (max - min) + min;
  }

  nextFloat(min = 1, max) {
    if (max == null) {  
      max = min;
      min = 0;
    }
    const n = (this.nextInt() - 1) / 2147483646;
    return n * (max - min) + min;
  }

  select(array) {
    return array[this.nextInt() % array.length];
  }

  nextColor() {
    const r = this.nextInt(0, 255);
    const g = this.nextInt(0, 255);
    const b = this.nextInt(0, 255);

    return `rgb(${r}, ${g}, ${b})`;
  }
}