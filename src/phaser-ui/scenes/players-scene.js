import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';
import eventsCenter from '../events-center';

const PLAYERS_COLORS = [
  0xcc0000,
  0x00cc00,
  0x0000cc,
  0xcc00cc,
];
class PlayersScene extends Phaser.Scene {
  constructor(i18n) {
    super({
      key: SCENE_KEYS.PLAYERS_SCENE,
    });
    this.i18n = i18n;
    this.eventsCenter = eventsCenter;
  }

  init(data) {
    this.room = data.room;
  }

  create() {
    const updatePlayersFn = (data) => this.updatePlayers(data.players);
    this.eventsCenter.on('players.updated', updatePlayersFn);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.eventsCenter.off('players.updated', updatePlayersFn);
    });

    this.addRoomName();
    this.texts = this.createRectanglesForNames();
  }

  addRoomName() {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 10;
    this.add.text(x, y, this.room, {
      font: 'bold 60px monospace',
      fill: '#000',
      align: 'center',
    }).setShadow(2, 2, '#ffffff', 0, false, true)
      .setOrigin(0.5, 0.5);
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

    const text = this.add.text(x, y, '          ', {
      font: '60px monospace',
      fill: '#000',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    return text;
  }

  updatePlayers(players) {
    const sortedPlayers = Object.values(players).sort((a, b) => a.id.localeCompare(b.id));
    sortedPlayers.forEach((player, idx) => {
      this.texts[idx].setText(player.name);
    });
    const restToEmpty = Array(4 - sortedPlayers.length).fill(null).map((_, idx) => 4 - idx - 1);
    restToEmpty.forEach((idxEmpty) => {
      this.texts[idxEmpty].setText('');
    });
  }
}

export default PlayersScene;
