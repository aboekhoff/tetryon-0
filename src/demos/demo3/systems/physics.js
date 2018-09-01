import components from '../components';
const { Transform, Force, Velocity } = components;

export default {
  active: false,
  components: [Transform, Force, Velocity],
  
  each (e) {
    const t = e.transform;
    const f = e.force;
    const v = e.velocity;

    v.x += f.x;
    v.y += f.y;

    f.x = 0;
    f.y = 0;

    if (v.drag) {
      v.x -= v.x * v.drag;
      v.y -= v.y * v.drag;
    }

    t.x += v.x;
    t.y += v.y;
    t.rotation += v.rotation;
  }
}