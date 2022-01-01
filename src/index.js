import 'babel-polyfill';
import GameEngine from './domain/game-engine';
import PhaserUi from './phaser-ui';
import I18n from './i18n';

const i18n = new I18n();
const ui = new PhaserUi(i18n);

const gameEngine = new GameEngine(ui);

gameEngine.start();
