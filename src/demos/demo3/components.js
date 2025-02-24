import Game from '../../Game.js';
import { grid, stage } from './shared.js';

export default Game.defineComponents({
  Transform: { x: 0, y: 0, rotation: 0, scale: 1 },
  Force: { x: 0, y: 0 },
  Velocity: { x: 0, y: 0 },
  Duration: { time: 0 },
  TargetControl: { 
    targetId: null,
    state: 'seek',
    path: null,
    timer: 0,
    thinkTime: 500,
  },
  Effect: {
    targetId: null,
    component: null,
    property: null,
    start: 0,
    end: 0,
    range: 0,
    theta: 0,
  },
  Weapon: {
    rateOfFire: 100,
    cooldown: 0,
    bullet: 'default',
  },
  SteeringControl: {
    rotation: false,
    accelerate: false,
    fire: false,
    action: false,
  },
  Flash: { 
    duration: 500, 
    time: 0 
  },
  Expand: {
    amount: 0.001,
  },
  State: {
    orientation: 'down',
    moving: false,
    firing: false,
    hitpoints: 2,
    alive: true,
  },
  AnimationControl: {
    right: null,
    left: null,
    up: null,
    down: null,
    fire: null,
    action: null,
  },
  Animation: { 
    data: { frames: [], speed: 200, loop: true },
    frame: 0,
    speed: 200,
    elapsed: 0,
    active: false,
  },
  Sprite: [
    { 
      alpha: 1,
      anchorX: 0.5, 
      anchorY: 0.5, 
      scaleX: 1, 
      scaleY: 1, 
      rotation: 0, 
      texture: null,
      layer: 1, 
      _sprite: null 
    },
    {
      acquire(params, defaults) {
        const {
          anchorX = defaults.anchorX,
          anchorY = defaults.anchorY,
          scaleX = defaults.scaleX,
          scaleY = defaults.scaleY,
          rotation = defaults.rotation,
          texture = defaults.texture,
        } = params;

        if (this._sprite == null) {
          this._sprite = new PIXI.Sprite();
          stage.addChild(this._sprite);
        }

        this._sprite.visible = true;
        this.texture = this._sprite.texture = texture;
        this.anchorX = this._sprite.anchor.x = anchorX;
        this.anchorY = this._sprite.anchor.y = anchorY;
        this.rotation = this._sprite.rotation = rotation;
        this.scaleX = this._sprite.scale.x = scaleX;
        this.scaleY = this._sprite.scale.y = scaleY;
      },

      release() {
        this._sprite.visible = false;
      }
    }
  ],  
  Collider: [
    { type: null },
    { 
      release() {
        const e = Game.getEntity(this._eid);
        grid.remove(this._eid);
      }
    },
  ],
});