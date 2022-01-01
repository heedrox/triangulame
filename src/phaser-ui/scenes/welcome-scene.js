import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

class WelcomeScene extends Phaser.Scene {
  create() {
    this.scene.switch(SCENE_KEYS.PLAYING_SCENE);
  }
}

export default WelcomeScene;
