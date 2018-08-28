import { Howl, Howler } from 'howler';

export const theme = new Howl({
  src: ['assets/audio/slow_drip.mp3'],
  autoplay: true,
  loop: true,
  volume: 0.5,
});