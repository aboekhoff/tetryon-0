import components from '../components';
const { Transform, Sprite } = components;

export default {
  components: [Transform, Sprite],

  each(e) {
    const { x, y } = e.transform;
    const { scaleX, scaleY, texture, _sprite, alpha } = e.sprite;

    _sprite.texture = texture;
    _sprite.position.x = x;
    _sprite.position.y = y;
    _sprite.scale.x = scaleX;
    _sprite.scale.y = scaleY;
    _sprite.alpha = alpha;
  }
}