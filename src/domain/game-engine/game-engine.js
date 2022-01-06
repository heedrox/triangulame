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
    this.playerId = this.getPlayerId();

    const { name, room } = await this.getNameAndRoom();
    this.game = await this.createGameIfNotExists(room);

    this.repository.game.watch(room, this.handleGameUpdate.bind(this));

    await this.addPlayerToGame(this.playerId, room, name);

    this.ui.waitForPlayers({
      room,
      onClickStart: () => {
        this.updateGameStatusToPlay(room);
      },
    });
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

  async updateGameStatusToPlay(room) {
    const rectangles = new RectanglesCreator().build(GAME_GOAL);
    await this.repository.game.update(room, {
      status: GAME_STATUS.PLAYING,
      rectangles,
    });
  }

  async handleGameUpdate(newGame) {
    const previousStatus = this.game.status;
    this.game = new Game(newGame);
    if (previousStatus === GAME_STATUS.WAITING_FOR_PLAYERS
      && newGame.status === GAME_STATUS.PLAYING) {
      this.ui.playGame(this.game);
    } else if (this.game.canBeJoined()) {
      const alivePlayers = removePlayersAgoSecs(this.playerId, newGame.players, 10);
      this.ui.updatePlayers(alivePlayers, this.playerId);
      this.repository.game.update(newGame.id, { players: alivePlayers });
    }
  }
}

export default GameEngine;
