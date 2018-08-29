const { floor, ceil, min, max } = Math;

function xy2k(x, y) {
  return `${x}:${y}`
}

export default class Grid {
  constructor(config = {}) {
    const { cellWidth = 64, cellHeight = 64 } = config;
    this.index = new Map();
    this.cells = new Map();
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  insert(_x1, _y1, _x2, _y2, e) {
    const { cellWidth: w, cellHeight: h } = this;
    const x1 = floor(_x1 / w);
    const y1 = floor(_y1 / h);
    const x2 = floor(_x2 / w);
    const y2 = floor(_y2 / h);

    let cells = this.index.get(e);

    if (cells == null) {
      cells = new Set();
      this.index.set(e, cells);
    }

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        const key = xy2k(x, y);
        let entry = this.cells.get(key);
        if (entry == null) {
          entry = new Set(); 
          this.cells.set(key, entry); 
        }
        cells.add(entry);
        entry.add(e);
      }
    }
  }

  remove(e) {
    const cells = this.index.get(e);
    if (cells) {
      cells.forEach(set => {
        set.delete(e);
        cells.delete(set);
      })
    }
  }

  move(_x1, _y1, _x2, _y2, e) {
    this.remove(e);
    this.insert(_x1, _y1, _x2, _y2, e);
  }

  query(e) {
    const cells = this.index.get(e); 
    const result = new Set();

    if (cells) {
      cells.forEach(cell => {
        cell.forEach(member => {
          if (member !== e) {
            result.add(member);
          }
        })
      });
    }
    
    return result;
  }

  getCandidates() {
    const candidates = [];
    const seen = new Set();

    this.cells.forEach(cell => {
      if (cell.size < 2) { return; }
      
      const entries = Array.from(cell);
      
      for (let i = 0; i < entries.length - 1; i++) {
        const a = entries[i]
        
        for (let j = i + 1; j < entries.length; j++) {
          const b = entries[j]
          const key = a < b ? `${a}:${b}` : `${b}:${a}`;
          
          if (!seen.has(key)) {
            seen.add(key);
            candidates.push([a, b]);
          }
        }
      }
    });

    return candidates;
  }
}
