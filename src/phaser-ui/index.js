import Phaser from 'phaser';
import PlayingScene from './scenes/playing-scene';
import WelcomeScene from './scenes/welcome-scene';
import SCENE_KEYS from './scenes/constants/scene-keys';

const BACKGROUND_PIECE = 0xcccc00;

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  backgroundColor: BACKGROUND_PIECE,
  autoCenter: 1,
  parent: 'phaser-triangles',
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
  dom: {
    createContainer: true,
  },
  scene: [],
};

class PhaserUi {
  constructor(i18n) {
    this.i18n = i18n;
  }

  start() {
    this.game = new Phaser.Game(config);
    this.game.scene.add(SCENE_KEYS.WELCOME_SCENE, new WelcomeScene(this.i18n));
    this.game.scene.add(SCENE_KEYS.PLAYING_SCENE, new PlayingScene(this.i18n));
  }

  getNameAndRoom() {
    return new Promise((resolve) => {
      this.game.scene.start(SCENE_KEYS.WELCOME_SCENE, {
        oncomplete: (name, room) => {
          resolve({ name, room });
        },
      });
    });
  }

  playGame(room) {
    this.game.scene.start(SCENE_KEYS.PLAYING_SCENE);
  }
}

export default PhaserUi;
