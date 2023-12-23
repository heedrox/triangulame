import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

class WelcomeScene extends Phaser.Scene {
  constructor(i18n) {
    super({
      key: SCENE_KEYS.WELCOME_SCENE,
    });
    this.i18n = i18n;
    this.form = null;
  }

  init(data) {
    this.oncomplete = data.oncomplete;
    this.previousName = data.previousName;
    this.previousRoom = data.previousRoom;
    this.checkValidity = data.checkValidity;
  }

  create() {
    this.form = this.addForm();
    this.addStartButton();
  }

  addForm() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const formHtml = `
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

    this.form = this.add.dom(w / 2, 0).createFromHTML(formHtml, 'form');
    this.form.setVisible(true);
    this.form.setDepth(1);
    this.form.setOrigin(0.5, 1);
    this.add.tween({
      targets: this.form,
      y: this.form.height + h/20,
      duration: 1500,
      ease: 'Power2',
    });
    if (this.previousName) this.form.getChildByID('name').value = this.previousName;
    if (this.previousRoom) this.form.getChildByID('room').value = this.previousRoom;
    return this.form;
  }

  addStartButton() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const startButton = this.add.text(w / 2, h, this.i18n.get('start'), {
      font: '3vh monospace',
      fill: '#000',
      align: 'center',
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5);

    const rectangle = this.add
      .rectangle(w / 2, h, startButton.width + 50, startButton.height + 25, 0x000000, 0.1)
      .setStrokeStyle(10, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerdown', this.clickStart, this);
    this.add.tween({
      targets: [startButton, rectangle],
      y: h -  (h/20) - startButton.height,
      duration: 1000,
      ease: 'Power2',
    });
  }

  async clickStart() {
    const name = this.form.getChildByID('name').value.trim();
    const room = this.form.getChildByID('room').value.trim();
    if (name !== '' && room !== '') {
      const isValid = await this.checkValidity(room);
      if (isValid) {
        this.scene.stop();
        this.oncomplete({
          name,
          room,
        });
      } else {
        this.showRoomNotAvailable();
      }
    }
  }

  showRoomNotAvailable() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const errorTxt = this.add.text(w / 2, h + 100, this.i18n.get('room-not-available'), {
      font: '48px monospace',
      fill: '#cc0000',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.add.tween({
      targets: [errorTxt],
      duration: 1000,
      y: h * 0.75,
      ease: 'Power2',
    });
    this.add.tween({
      targets: [errorTxt],
      duration: 2000,
      delay: 2000,
      alpha: 0,
      ease: 'Power2',
    });
  }
}

export default WelcomeScene;
