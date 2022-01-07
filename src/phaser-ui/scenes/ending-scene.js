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
    this.onRestart = data.onRestart;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const winnerText = this.make.text({
      x: w / 2,
      y: h / 3,
      text: `${this.i18n.get('winner')}: ${this.game.winner}\n${this.game.winnerSecs} segs.`,
      style: {
        font: '60px monospace',
        fill: '#000000',
        align: 'center',
      },
    }).setOrigin(0.5, 0.5)
      .setScale(0);

    this.add.tween({
      targets: winnerText,
      scale: 1,
      duration: 500,
      ease: 'Sine.easeInOut',
    });

    const restart = this.add.text(w / 2, 3 / 4 * h, 'Reintentar', {
      font: '60px monospace',
      fill: '#444444',
    }).setInteractive();

    restart.setOrigin(0.5);
    restart.on('pointerup', () => {
      this.scene.stop();
      this.onRestart();
    });
  }
}

export default EndingScene;
