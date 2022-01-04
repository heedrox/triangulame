import { v4 as uuidv4 } from 'uuid';
import GAME_STATUS from './game-status';
import Game from './game';

class GameEngine {
  constructor(ui, repository, localDb) {
    this.ui = ui;
    this.repository = repository;
    this.localDb = localDb;
  }

  async start() {
    this.ui.start();
    const { name, room } = await this.ui.getNameAndRoom({
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
    const id = this.getPlayerId();
    await this.repository.game.addPlayer(room, { id, name });
    this.repository.game.watch(room, '/players', (players) => {
      this.ui.updatePlayers(players);
    });
    await this.ui.waitForPlayers({ room });
  }

  getPlayerId() {
    const id = this.localDb.getItem('uuid');
    if (id) return id;
    this.localDb.setItem('uuid', uuidv4());
    return this.localDb.getItem('uuid');
  }
}

export default GameEngine;
