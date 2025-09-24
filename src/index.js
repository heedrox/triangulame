import GameEngine from './domain/game-engine/game-engine';
import PhaserUi from './phaser-ui';
import I18n from './i18n';
import FirebaseRepository from './firebase/firebase-repository';
import GAME_STATUS from './domain/game-status';
import { showIosNotice } from './web/show-ios-notice';

const i18n = new I18n();
i18n.init();

const ui = new PhaserUi(i18n);
const repository = new FirebaseRepository();
const localDb = localStorage;

const gameEngine = new GameEngine(ui, repository, localDb);

(async () => {
  const isStandalone = () => (('standalone' in window.navigator) && (window.navigator.standalone));
  const isIos = () => !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  const isSafari = () => (navigator.userAgent.toLowerCase().indexOf('safari/') > -1)
  && (navigator.userAgent.toLowerCase().indexOf('chrome') === -1);

  if (!isStandalone() && isIos() && isSafari()) {
    showIosNotice();
  } else {
  // hack
    await repository.game.update('Galerna', { status: GAME_STATUS.WAITING_FOR_PLAYERS });
    await gameEngine.start();
  }
})();
