import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

const ENDING_GAME_NUMBER = 1;

class EndingScene extends Phaser.Scene {
  constructor(i18n) {
    super(SCENE_KEYS.ENDING_SCENE);
    this.i18n = i18n;
  }

  init(data) {
    this.game = data.game;
    this.onRestart = data.onRestart;
    this.onEnd = data.onEnd;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.addWinner(w, h);    
    this.addSummary(w, h);
    if (this.game.numGame < ENDING_GAME_NUMBER) {
      this.addRestartButton(w, h);
    } else {
      this.addEndButton(w, h);
    }

  }

  addRestartButton(w, h) {
    const restart = this.add.text(w / 2, 3 / 4 * h, 'Continuar', {
      font: '4vh monospace',
      fill: '#444444',
    }).setInteractive();

    restart.setOrigin(0.5);
    restart.on('pointerup', () => {
      this.scene.stop();
      this.onRestart();
    });
  }

  addEndButton(w, h) {
    const end = this.add.text(w / 2, 3 / 4 * h, 'Terminar', {
      font: '4vh monospace',
      fill: '#990000',
    }).setInteractive();

    end.setOrigin(0.5);
    end.on('pointerup', async () => {
      this.scene.stop();
      await this.onEnd();
      window.location.reload();
    });
  }

  addWinner(w, h) {
    const winnerText = this.make.text({
      x: w / 2,
      y: h / 3,
      text: `${this.i18n.get('winner')}: ${this.game.winner}\n${this.game.winnerSecs} segs.`,
      style: {
        font: '4vw monospace',
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
  }

  addSummary(w, h) {
    const summaryText = this.game.getSummary()
      .map((s) => `${s.player}: ${s.secs} segs.`)
      .join('\n');
    
    const summary = this.make.text({
      x: w / 2,
      y: h / 2,
      text: summaryText,
      style: {
        font: '4vw monospace',
        fill: '#000000',
        align: 'center',
      },
    }).setOrigin(0.5, 0.5)
      .setScale(0);

    this.add.tween({
      targets: summary,
      scale: 1,
      duration: 500,
      ease: 'Sine.easeInOut',
    });
  }
}

export default EndingScene;
