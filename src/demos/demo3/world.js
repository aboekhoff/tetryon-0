import Game from '../../Game';
import { textures } from './resources';

const TILE_SIZE = 32;

export const world = window.world = {
  tileSize: 32,
  width: 0,
  height: 0,
  tiles: [],
  graph: null,
}

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.key = `${x}:${y}`;
  }

  toString() {
    return this.key;
  }
}

export function getPathNodesFromMap(tiledMap) {
  const nodes = {};
  console.log(tiledMap)
  console.log(textures);

  const { layers, tilesets, width, height } = tiledMap;
  
  const dataResourceName = `${tilesets[0].image}.data`
  console.log(dataResourceName);
  console.log(textures.tileData);
  console.log(textures.tileData[dataResourceName].data)

  const tileData = textures.tileData[dataResourceName].data;

  layers.forEach(layer => {
    const data = layer.data;
    for (let i = 0; i < data.length; i++) {
      const id = layer.data[i];
    
      if (!id) { continue; }

      const { type } = tileData.tiles[id-1];
      const y = Math.floor(i / height);
      const x = i % width;
      const key = `${x}:${y}`;
      
      if (type !== 'floor') {
        nodes[key] = false;
      }

      if (nodes[key] === false) {
        continue;
      }

      nodes[key] = new Node(x, y);
    }
  });

  return {
    nodes,
    width,
    height,
  }
}

export function loadTiledMap(name) {
  const tiledMap = textures.maps[name].data;

  world.graph = getPathNodesFromMap(tiledMap);

  const { layers, tilesets, width, height, tilewidth, tileheight } = tiledMap;

  world.width = width * tilewidth;
  world.height = height * tileheight;
  world.tileSize = tilewidth;

  const tileset = tilesets[0];
  const tileData = textures.tileData[`${tileset.image}.data`].data;
  const tiles = textures.tiles[tileset.image];

  console.log(tiles)

  layers.forEach(layer => {
    for (let i = 0; i < layer.data.length; i++) {
      const id = layer.data[i];

      if (id) {
        const y = Math.floor(i / height);
        const x = i % width;

        const texture = tiles[id-1];
        const tile = Game.createEntity();
        const { type } = tileData.tiles[id-1];

        tile.transform = { 
          x: x * tilewidth, 
          y: y * tileheight 
        };

        tile.sprite = {
          texture,
          anchorX: 0.5,
          anchorY: 0.5,
          scaleX: 1,
          scaleY: 1,
        }

        if (type !== 'floor') {
          tile.collider = { type, static: true };
        }
      }
    }
  });
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
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 1,
        scaleY: 1,
      } 
    }
  }
}

