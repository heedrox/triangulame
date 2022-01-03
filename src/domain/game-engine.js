import {
  get, set, ref,
} from 'firebase/database';
import { db } from '../firebase/app';
import GAME_STATUS from './game-status';
import Game from './game';

class GameEngine {
  constructor(ui, repository) {
    this.ui = ui;
    this.repository = repository;
  }

  async start() {
    this.ui.start();
    const { room } = await this.ui.getNameAndRoom({
      checkValidity: async (rName) => {
        const aGame = await this.repository.game.get(rName);
        return !aGame || aGame.status === GAME_STATUS.WAITING_FOR_PLAYERS || !aGame.status;
      },
    });

    const aGame = await this.repository.game.get(room);
    if (!aGame) {
      const newGame = new Game({ id: room });
      await this.repository.game.create(newGame);
    }
    this.ui.waitForPlayers({ room });
  }
}

export default GameEngine;
