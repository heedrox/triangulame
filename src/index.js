import 'babel-polyfill';
import GameEngine from './domain/game-engine';
import PhaserUi from './phaser-ui';
import I18n from './i18n';
import FirebaseRepository from './firebase/firebase-repository';

const i18n = new I18n();
i18n.init();

const ui = new PhaserUi(i18n);
const repository = new FirebaseRepository();
const localDb = localStorage;

const gameEngine = new GameEngine(ui, repository, localDb);

(async () => {
  await gameEngine.start();
})();
