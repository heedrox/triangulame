import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';
import eventsCenter from '../events-center';

class PlayersScene extends Phaser.Scene {
  constructor(i18n) {
    super({
      key: SCENE_KEYS.PLAYERS_SCENE,
    });
    this.i18n = i18n;
  }

  init(data) {
    this.room = data.room;
  }

  create() {
    eventsCenter.on('players.updated', this.updatePlayers, this);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventsCenter.off('players.updated', this.updatePlayers, this);
    });
  }

  updatePlayers(players) {
    console.log('players received', players);
  }
}

export default PlayersScene;
