import Phaser from 'phaser';
import WelcomeScene from './scenes/welcome-scene';
import PlayersScene from './scenes/players-scene';
import PlayingScene from './scenes/playing-scene';
import SCENE_KEYS from './scenes/constants/scene-keys';
import eventsCenter from './events-center';
import EndingScene from './scenes/ending-scene';

const BACKGROUND_PIECE = 0xcccc00;

class PhaserUi {
  constructor(i18n) {
    this.i18n = i18n;
    this.eventsCenter = eventsCenter;
  }

  start() {
    const config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.RESIZE,
      },
      backgroundColor: BACKGROUND_PIECE,
      autoCenter: 1,
      parent: 'content',
      width: window.innerWidth * window.devicePixelRatio,
      height: window.innerHeight * window.devicePixelRatio,
      dom: {
        createContainer: true,
      },
      scene: [],
    };    
    this.game = new Phaser.Game(config);    
    this.game.scene.add(SCENE_KEYS.WELCOME_SCENE, new WelcomeScene(this.i18n));
    this.game.scene.add(SCENE_KEYS.PLAYERS_SCENE, new PlayersScene(this.i18n));
    this.game.scene.add(SCENE_KEYS.PLAYING_SCENE, new PlayingScene(this.i18n));
    this.game.scene.add(SCENE_KEYS.ENDING_SCENE, new EndingScene(this.i18n));
  }

  getNameAndRoom({ checkValidity }) {
    return new Promise((resolve) => {
      this.game.scene.start(SCENE_KEYS.WELCOME_SCENE, {
        checkValidity,
        oncomplete: ({ name, room }) => {
          localStorage.setItem('previousName', name);
          localStorage.setItem('previousRoom', room);
          resolve({ name, room });
        },
        previousName: localStorage.getItem('previousName'),
        previousRoom: localStorage.getItem('previousRoom'),
      });
    });
  }

  waitForPlayers({ room, onClickStart, numGame }) {
    this.game.scene.start(SCENE_KEYS.PLAYERS_SCENE, {
      room,
      numGame,
      onClickStart: () => onClickStart(),
    });
  }

  updatePlayers(players, myId) {
    this.eventsCenter.emit('players.updated', { players, myId });
  }

  playGame(game, callbacks) {
    this.game.scene.stop(SCENE_KEYS.PLAYERS_SCENE);
    this.game.scene.start(SCENE_KEYS.PLAYING_SCENE, {
      room: game.id,
      players: game.players,
      rectangles: game.rectangles,
      onFinish: (totalSecs) => callbacks.onFinish(totalSecs),
    });
  }

  endGame(game, callbacks) {
    this.game.scene.stop(SCENE_KEYS.PLAYING_SCENE);
    this.game.scene.start(SCENE_KEYS.ENDING_SCENE, {
      game,
      onRestart: () => callbacks.onRestart(),
      onEnd: () => callbacks.onEnd(),
    });
  }
}

export default PhaserUi;
