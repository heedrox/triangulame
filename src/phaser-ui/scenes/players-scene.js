import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

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
}

export default PlayersScene;
