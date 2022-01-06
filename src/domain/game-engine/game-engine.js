import { v4 as uuidv4 } from 'uuid';
import GAME_STATUS from '../game-status';
import Game from '../game/game';
import RectanglesCreator from '../rectangles-creator/rectangles-creator';

const GAME_GOAL = 48;

const removePlayersAgoSecs = (myId, players, secs) => {
  const newPlayers = JSON.parse(JSON.stringify(players));
  const myPlayer = players[myId];
  if (!myPlayer) return [myId];
  const myLastSeen = myPlayer.lastSeen;
  Object.keys(players).forEach((id) => {
    if (players[id].lastSeen && players[id].lastSeen < myLastSeen - secs * 1000) {
      delete newPlayers[id];
    } else if (players[id].lastSeen === null || players[id].lastSeen === undefined) {
      delete newPlayers[id];
    }
  });
  return newPlayers;
};

class GameEngine {
  constructor(ui, repository, localDb) {
    this.ui = ui;
    this.repository = repository;
    this.localDb = localDb;
    this.game = null;
  }

  async start() {
    this.ui.start();
    const { name, room } = await this.getNameAndRoom();
    this.game = await this.createGameIfNotExists(room);
    const id = this.getPlayerId();

    this.repository.game.watch(room, (newGame) => {
      console.log('game changed', newGame.players);
      // this.updateGame(game);
      // si antes estaba en otro estado y ahora en este, entonces voy y creo el juego
      this.game = new Game(newGame);
      if (this.game.canBeJoined()) {
        const alivePlayers = removePlayersAgoSecs(id, newGame.players, 10);
        this.ui.updatePlayers(alivePlayers, id);
        this.repository.game.update(room, { players: alivePlayers });
      }
    });

    await this.addPlayerToGame(id, room, name);
    await this.ui.waitForPlayers({ room });
    await this.startGame(room);
  }

  async getNameAndRoom() {
    return this.ui.getNameAndRoom({
      checkValidity: async (rName) => {
        const aGame = await this.repository.game.get(rName);
        return !aGame || aGame.status === GAME_STATUS.WAITING_FOR_PLAYERS || !aGame.status;
      },
    });
  }

  async createGameIfNotExists(room) {
    const aGame = await this.repository.game.get(room);
    if (aGame) return aGame;
    const newGame = new Game({ id: room });
    await this.repository.game.create(newGame);
    return newGame;
  }

  async addPlayerToGame(id, room, name) {
    await this.repository.game.addPlayer(room, { id, name });
    await this.repository.game.keepPlayerAlive(room, id);
  }

  getPlayerId() {
    const id = this.localDb.getItem('uuid');
    if (id) return id;
    this.localDb.setItem('uuid', uuidv4());
    return this.localDb.getItem('uuid');
  }

  async startGame(room) {
    const rectangles = new RectanglesCreator().build(GAME_GOAL);
    await this.repository.game.update(room, {
      status: GAME_STATUS.PLAYING,
      rectangles,
    });
  }
}

export default GameEngine;
