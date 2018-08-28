import Game from '../../Game';

const TILE_SIZE = 32;

class Map {
  constructor(grid, tileset, legend, tileSize = TILE_SIZE) {
    this.grid = grid;
    this.tileset = tileset;
    this.legend = legend;
    this.tileSize = tileSize;
    this.tiles = []
  }

  makeTile(id) {
    const index = this.legend ? this.legend[id] : id;
    const texture = this.tiles[index];
    const tile = Game.createEntity();
    tile.sprite = {
      texture,
      anchorX: 0,
      anchorY: 0,
      scaleX: 1,
      scaleY: 1,
    }
    return tile;
  }

  load() {
    const height = this.grid.length;
    const width = this.grid[0].width;

    world.height = height * this.tileSize;
    world.width = width * this.tileSize;
    world.tileSize = this.tileSize;

    for (let y = 0; y < height; y++) {
      const row = [];
      this.tiles.push(row);

      for (let x = 0; x < width; x++) {
        const tile = this.makeTile(this.grid[y][x]);
        
        tile.transform = { 
          x: x * this.tileSize, 
          y: y * this.tileSize, 
        }
      }
    }
  }
}

export const world = {
  tileSize: 32,
  width: 0,
  height: 0,
  tiles: [],
}

export function loadMap(map, tileset, tileSize = TILE_SIZE) {
  const height = map.length;
  const width = map[0].length;

  world.width = width * TILE_SIZE;
  world.height = height * TILE_SIZE;
  world.tileSize = tileSize;

  for (let y = 0; y < map.length; y++) {
    const row = map[y];

    for (let x = 0; x < row.length; x++) {
      const texture = tileset[row[x]];
      const tile = Game.createEntity();
      tile.transform = { x: x * tileSize, y: y * tileSize };
      tile.sprite = {
        texture,
        anchorX: 0,
        anchorY: 0,
        scaleX: 1,
        scaleY: 1,
      } 
    }
  }
}