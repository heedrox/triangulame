import { v4 as uuidv4 } from 'uuid';
import GAME_STATUS from '../game-status';
import Game from '../game/game';
import RectanglesCreator from '../rectangles-creator/rectangles-creator';
import Player from '../player/player';

const GAME_GOAL = 6;

const removePlayersAgoSecs = (myId, players, secs) => {
  const newPlayers = JSON.parse(JSON.stringify(players));
  const myPlayer = players[myId];
  if (!myPlayer) return players;
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
    this.player = new Player(this.buildPlayerIdIfNotExists(), name);
    this.game = await this.createGameIfNotExists(room);
    await this.startRoom(room);
  }

  async startRoom(room) {
    this.repository.game.watch(room, this.handleGameUpdate.bind(this));

    this.ui.waitForPlayers({
      room,
      onClickStart: () => {
        this.updateGameStatusToPlay(room);
      },
    });

    await this.addPlayerToGame(this.player.id, room, this.player.name);
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
    await this.repository.game.keepPlayerAlive(room, this.player);
  }

  buildPlayerIdIfNotExists() {
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
    console.log('game updaate', newGame);
    const previousStatus = this.game.status;
    this.game = new Game(newGame);
    if (previousStatus === GAME_STATUS.WAITING_FOR_PLAYERS
      && newGame.status === GAME_STATUS.PLAYING) {
      this.repository.game.unkeepPlayerAlive(this.game.id, this.player);
      this.ui.playGame(this.game, {
        onFinish: (totalSecs) => {
          this.updateGameStatusToEnd(totalSecs);
        },
      });
    } else if (this.game.canBeJoined()) {
      const alivePlayers = removePlayersAgoSecs(this.player.id, newGame.players, 10);
      console.log('updateando players', alivePlayers);
      this.ui.updatePlayers(alivePlayers, this.player.id);
      this.repository.game.update(newGame.id, { players: alivePlayers });
    } else if (previousStatus === GAME_STATUS.PLAYING
      && this.game.status === GAME_STATUS.FINISHED) {
      this.endGame();
    }
  }

  async updateGameStatusToEnd(totalSecs) {
    this.repository.game.update(this.game.id, {
      status: GAME_STATUS.FINISHED,
      winner: this.player.name,
      winnerSecs: totalSecs,
    });
  }

  endGame() {
    this.ui.endGame(this.game, {
      onRestart: async () => {
        await this.repository.game.update(this.game.id, {
          status: GAME_STATUS.WAITING_FOR_PLAYERS,
        });
        await this.repository.game.addPlayer(this.game.id, this.player);
        await this.startRoom(this.game.id);
      },
    });
  }
}

export default GameEngine;
