import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';
import eventsCenter from '../events-center';
import shareButton from '../../assets/players/share.svg';
import PLAYERS_COLORS from './constants/players-colors';

const IMAGES = {
  SHARE: 'share',
}
class PlayersScene extends Phaser.Scene {
  constructor(i18n) {
    super({
      key: SCENE_KEYS.PLAYERS_SCENE,
    });
    this.i18n = i18n;
    this.eventsCenter = eventsCenter;
    this.texts = [];
    this.sortedPlayers = [];
    this.onClickStart = null;
  }

  init(data) {
    const updatePlayersFn = (eventData) => this.updatePlayers(eventData.players, eventData.myId);
    this.room = data.room;
    this.onClickStart = data.onClickStart;
    this.numGame = data.numGame;
    this.eventsCenter.on('players.updated', updatePlayersFn);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.eventsCenter.off('players.updated', updatePlayersFn);
    });
  }

  preload() {
    this.load.image(IMAGES.SHARE, shareButton);
  }

  create() {
    this.addRoomName();
    this.texts = this.createRectanglesForNames();
    this.addStartButton();
    this.addShareButton();
    this.addNumGame();
  }

  addRoomName() {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 10;
    this.add.text(x, y, this.room, {
      font: 'bold 4vh monospace',
      fill: '#000',
      align: 'center',
    }).setShadow(2, 2, '#ffffff', 0, false, true)
      .setOrigin(0.5, 0.5);
  }

  addNumGame() {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 10 + (0.04 * this.cameras.main.height);
    this.add.text(x, y, this.i18n.get('game-number', { numRectangles: this.numGame * 2 + 12 }), {
      font: '4vw monospace',
      fill: '#000',
      align: 'center',
    }).setOrigin(0.5, 0.5);
  }

  createRectanglesForNames() {
    const texts = [];
    const x = this.cameras.main.width / 4;
    const y = this.cameras.main.height / 4;
    const w = x * 1.5;
    const h = y * 0.3;
    texts.push(this.createRectangle(x, y, w, h, 0));
    texts.push(this.createRectangle(3 * x, y, w, h, 1));
    texts.push(this.createRectangle(x, 2 * y, w, h, 2));
    texts.push(this.createRectangle(3 * x, 2 * y, w, h, 3));
    return texts;
  }

  createRectangle(x, y, w, h, n) {
    this.add
      .rectangle(x, y, w, h, PLAYERS_COLORS[n], 1)
      .setStrokeStyle(10, 0xffffff)
      .setOrigin(0.5, 0.5);

    return this.add.text(x, y, '          ', {
      font: '5vw monospace',
      fill: '#000',
      align: 'center',
    }).setOrigin(0.5, 0.5)
    .setDisplaySize(w-30,Math.round(2*h/4));
  }

  updatePlayers(players, myId) {
    const sortedPlayers = Object.values(players).sort((a, b) => a.id.localeCompare(b.id));
    this.sortedPlayers = sortedPlayers;
    sortedPlayers.forEach((player, idx) => {
      if (this.texts[idx]) {
        this.texts[idx].setText(player.name);
      }      
    });
    const restToEmpty = Array(4 - sortedPlayers.length).fill(null).map((_, idx) => 4 - idx - 1);
    restToEmpty.forEach((idxEmpty) => {
      if (this.texts[idxEmpty]) {
        this.texts[idxEmpty].setText('');
      }
    });
    this.updateStartOrWarnTextVisibility(myId);
  }

  addStartButton() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.startButton = this.add.text(w / 2, h, this.i18n.get('start'), {
      font: '4vh monospace',
      fill: '#000',
      align: 'center',
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5)
      .setVisible(false);

    this.startButton.setY(h - 200 - this.startButton.height);

    this.rectangle = this.add
      .rectangle(
        w / 2,
        h - 200 - this.startButton.height,
        this.startButton.width + 50,
        this.startButton.height + 25,
        0x000000,
        0.1,
      )
      .setStrokeStyle(10, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setInteractive()
      .on('pointerdown', this.clickStart, this);

    this.warnText = this.add.text(w / 2, h - 200, this.i18n.get('start-only-main-player', { mainPlayer: this.getMainPlayer().name }), {
      font: '4vw monospace',
      fill: '#000',
      align: 'center',
    }).setVisible(false)
      .setOrigin(0.5, 0.5);

    this.updateStartOrWarnTextVisibility('');
  }

  addShareButton() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.image(w - 50, h - 50, IMAGES.SHARE)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(50, 50)
      .setInteractive()
      .on('pointerdown', async () => {
        const url = `${window.location.origin}?room=${this.room}`;
        await navigator.clipboard.writeText(`Juega conmigo a Triangula.me. Abre el juego en: ${url}`);
        alert(this.i18n.get('copied-to-clipboard'));
      });
  }
    
  getMainPlayer() {
    if (this.sortedPlayers && this.sortedPlayers.length >= 1) {
      return this.sortedPlayers[0];
    }
    return { name: '' };
  }

  updateStartOrWarnTextVisibility(myId) {
    if (this.warnText) {
      const wVisible = this.sortedPlayers.length >= 1 && this.sortedPlayers[0].id !== myId;
      const bVisible = this.sortedPlayers.length >= 2 && this.sortedPlayers[0].id === myId;
      this.warnText.setVisible(wVisible);
      this.startButton.setVisible(bVisible);
      this.rectangle.setVisible(bVisible);  
      this.warnText.setText(this.i18n.get('start-only-main-player', { mainPlayer: this.getMainPlayer().name }));
    }
  }

  clickStart() {
    this.onClickStart();
  }
}

export default PlayersScene;
