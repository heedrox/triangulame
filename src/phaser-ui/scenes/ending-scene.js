import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.ENDING_SCENE);
  }

  init(data) {
    console.log('game data', data.game);
  }

  create() {
    this.add.image(400, 300, 'end-screen');
    this.add.text(400, 300, 'You Win!', {
      fontSize: '32px',
      fill: '#fff',
      align: 'center',
    });
    this.add.text(400, 350, 'Press Space to Restart', {
      fontSize: '32px',
      fill: '#fff',
      align: 'center',
    });
    this.input.keyboard.on('keydown_SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}

export default EndingScene;
