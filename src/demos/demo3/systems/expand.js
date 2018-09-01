import components from '../components';

const { Expand, Sprite } = components;

export default {
  components: [Expand, Sprite],

  each (e) {
    e.sprite.scaleX += e.expand.amount;
    e.sprite.scaleY += e.expand.amount;
  }
}