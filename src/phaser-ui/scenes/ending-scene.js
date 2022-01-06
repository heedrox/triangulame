import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

class EndingScene extends Phaser.Scene {
  constructor(i18n) {
    super(SCENE_KEYS.ENDING_SCENE);
    this.i18n = i18n;
  }

  init(data) {
    console.log('game data', data.game);
    this.game = data.game;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.loadingText = this.make.text({
      x: w / 2,
      y: h / 2 - 50,
      text: `${this.game.winnerSecs} segs.`,
      style: {
        font: '60px monospace',
        fill: '#000000',
        align: 'center',
      },
    });
    this.loadingText.setOrigin(0.5, 0.5);
    this.goalText.setText('');

    const restart = this.add.text(w / 2, 3 / 4 * h, 'Reintentar', {
      font: '60px monospace',
      fill: '#444444',
    }).setInteractive();

    restart.setOrigin(0.5);
    restart.on('pointerup', () => {
      this.music.stop();
      this.scene.restart();
    });
  }
}

export default EndingScene;
