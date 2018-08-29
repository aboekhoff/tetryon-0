import { world } from "./world";
import { dist } from "../../Math";
const { floor } = Math;

function nodeDistance(a, b) {
  return dist(a.x, a.y, b.x, b.y);
}

function getNeighbors(start, nodes) {
  const neighbors = [];
  const xs = [0, -1, 1, 0];
  const ys = [-1, 0, 0, 1];

  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i];
    const dy = ys[i];
    const x = start.x + dx;
    const y = start.y + dy;
    const key = `${x}:${y}`;
    const node = nodes[key];
    if (node) { neighbors.push(node); }
  }

  return neighbors;
}

function reconstructPath(cameFrom, current) {
  const totalPath = [current];

  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    totalPath.push(current);
  }

  totalPath.pop();
  return totalPath.reverse();
}

export function astar(startTransform, goalTransform) {
  const { tileSize, graph } = world;
  const nodes = world.graph.nodes;

  const startX = floor(startTransform.x / tileSize);
  const startY = floor(startTransform.y / tileSize);
  const startKey = `${startX}:${startY}`;
  const startNode = nodes[startKey];

  const goalX = floor(goalTransform.x / tileSize);
  const goalY = floor(goalTransform.y / tileSize);
  const goalKey = `${goalX}:${goalY}`;
  const goalNode = nodes[goalKey];

  console.log(startNode, goalNode);

  return _astar(startNode, goalNode, graph.nodes);
}

function _astar(start, goal, nodes, heuristic = nodeDistance) {
  const closedSet = new Set();
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(start, 0);

  function get(map, node) {
    const value = map.get(node);
    return value == null ? Infinity : value;
  } 

  fScore.set(start, heuristic(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => {
      const x = get(fScore, a);
      const y = get(fScore, b);
      return y - x;
    })
    
    const current = openSet.pop();

    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }

    closedSet.add(current);

    getNeighbors(current, nodes).forEach(neighbor => {
      if (closedSet.has(neighbor)) {
        return;
      }

      const tentativeGScore = get(gScore, current) + nodeDistance(current, neighbor);

      if (openSet.indexOf(neighbor) === -1) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= gScore.get(neighbor)) {
        return;
      }
    
      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(neighbor, get(gScore, neighbor) + heuristic(neighbor, goal));
    });
  }

  return null;
}