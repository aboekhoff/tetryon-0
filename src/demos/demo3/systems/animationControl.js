import components from '../components';
const { State, AnimationControl, Animation } = components;

export default {
  components: [State, AnimationControl, Animation],
  
  each(e) {
    const st = e.state;
    const ac = e.animationControl;
    const a = e.animation;

    a.active = st.moving;
    
    if (ac[st.orientation]) {
      a.data = ac[st.orientation];  
    }
  }
}