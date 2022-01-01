import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

class WelcomeScene extends Phaser.Scene {
  constructor(i18n) {
    super({
      key: SCENE_KEYS.WELCOME_SCENE,
    });
    this.i18n = i18n;
  }

  init(data) {
    this.oncomplete = data.oncomplete;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const form = `
        <div style="text-align: center">
        <p style="color: #000; font: 6vw monospace;">Tu nombre:</p>
        <input type="text" autocomplete="off" placeholder="${this.i18n.get('name')}" id="name"
        style="width: 60%; font: 6vw monospace; color: #fff; background-color: #000; border: solid 2vw #fff; padding: 2vw; text-align: center">
        <p style="color: #000; font: 6vw monospace; margin-top: 5vh;">Una sala:</p>
        <input type="text" autocomplete="off"  placeholder="${this.i18n.get('room')}" id="room"
        style="width: 60%; font: 6vw monospace; color: #fff; background-color: #000; border: solid 2vw #fff; padding: 2vw; text-align: center">
        <p style="color: #000; font: 4vw monospace;width: 80%; font-style: italic; text-align: center; margin: 3vh auto auto;">
        ${this.i18n.get('room-info')}</p>
        </div>`;

    const element = this.add.dom(w / 2, 0).createFromHTML(form, 'form');
    element.setVisible(true);
    element.setDepth(1);
    element.setOrigin(0.5, 1);
    this.add.tween({
      targets: element,
      y: element.height + 200,
      duration: 1500,
      ease: 'Power2',
    });

    const startButton = this.add.text(w / 2, h, this.i18n.get('start'), {
      font: '60px monospace',
      fill: '#000',
      align: 'center',
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5);
    const rectangle = this.add.rectangle(w / 2, h, startButton.width + 50, startButton.height + 25, 0x000000, 0.1)
      .setStrokeStyle(10, 0xffffff)
      .setOrigin(0.5, 0.5);
    rectangle.setInteractive().on('pointerdown', () => {
      const name = element.getChildByID('name').value.trim();
      const room = element.getChildByID('room').value.trim();
      if (name !== '' && room !== '') {
        this.scene.stop();
        this.oncomplete({
          name, room,
        });
      }
    });
    this.add.tween({
      targets: [startButton, rectangle],
      y: h - 200 - startButton.height,
      duration: 1000,
      ease: 'Power2',
    });
  }
}

export default WelcomeScene;
