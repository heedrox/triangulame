import GAME_STATUS from '../game-status';
import Game from '../game/game';
import RectanglesCreator from '../rectangles-creator/rectangles-creator';
import Player from '../player/player';

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
  constructor (ui, repository, localDb) {
    this.ui = ui;
    this.repository = repository;
    this.localDb = localDb;
    this.game = null;
    this.currentGoal = 1;
  }

  async start () {
    this.ui.start();

    const { name, room } = await this.getNameAndRoom();
    this.player = Player.fromCache(this.localDb, name);
    this.game = await this.createGameIfNotExists(room);
    await this.startRoom(room);
  }

  async startRoom (room) {
    this.repository.game.watch(room, this.handleGameUpdate.bind(this));

    this.ui.waitForPlayers({
      room,
      numGame: this.game.numGame,
      onClickStart: () => {
        this.updateGameStatusToPlay(room);
      },
    });

    await this.addPlayerToGame(this.player.id, room, this.player.name);
  }

  async getNameAndRoom () {
    return this.ui.getNameAndRoom({
      checkValidity: async (rName) => {
        const aGame = await this.repository.game.get(rName);
        return !aGame || aGame.status === GAME_STATUS.WAITING_FOR_PLAYERS
        || aGame.status === GAME_STATUS.FINISHED_ALL_GAMES
        || !aGame.status;
      },
    });
  }

  async createGameIfNotExists (room) {
    const aGame = await this.repository.game.get(room);
    if (aGame) return aGame;
    const newGame = new Game({ id: room });
    await this.repository.game.create(newGame);
    return newGame;
  }

  async addPlayerToGame (id, room, name) {
    await this.repository.game.addPlayer(room, { id, name });
    await this.repository.game.keepPlayerAlive(room, this.player);
  }

  async updateGameStatusToPlay (room) {
    const numberRectangles = Game.numberOfRectangles(this.game.numGame);
    await this.repository.game.update(room, {
      status: GAME_STATUS.PLAYING,
      rectangles: new RectanglesCreator().build(numberRectangles),
    });
  }

  async handleGameUpdate (newGame) {
    const previousStatus = this.game.status;
    this.game = new Game(newGame);
    if (previousStatus === GAME_STATUS.WAITING_FOR_PLAYERS
      && newGame.status === GAME_STATUS.PLAYING) {
      this.playGame();
    } else if (newGame.status === GAME_STATUS.PLAYING) {
      this.ui.updateGameDuringPlay({
        currentGoals: {
          ...this.game.currentGoals,
        },
      });
    } else if (this.game.canBeJoined()) {
      const alivePlayers = removePlayersAgoSecs(this.player.id, newGame.players, 10);
      this.ui.updatePlayers(alivePlayers, this.player.id);
      this.repository.game.update(newGame.id, { players: alivePlayers });
    } else if (previousStatus === GAME_STATUS.PLAYING
      && this.game.status === GAME_STATUS.FINISHED) {
      this.endGame();
    }
  }

  updateGameStatusToEnd (totalSecs) {
    this.repository.game.update(this.game.id, {
      status: GAME_STATUS.FINISHED,
      winner: this.player.name,
      winnerSecs: totalSecs,
      numGame: this.game.numGame + 1,
      currentGoals: {},
      [`results/${this.game.numGame}`]: {
        winner: this.player.name,
        secs: totalSecs,
      },
    });
  }

  playGame () {
    this.repository.game.unkeepPlayerAlive(this.game.id, this.player);
    this.currentGoal = 1;
    this.ui.playGame(this.game, this.player, {
      onFinish: this.updateGameStatusToEnd.bind(this),
      onPress: this.checkRectangle.bind(this),
      onGoalUpdate: this.onGoalUpdate.bind(this),
    });
  }

  checkRectangle (pressedId) {
    if (this.currentGoal === pressedId) {
      this.currentGoal += 1;
    }
  }

  onGoalUpdate (currentGoal) {
    this.repository.game.update(this.game.id, {
      [`currentGoals/${this.player.id}`]: currentGoal,
    });
  }

  endGame () {
    this.ui.endGame(this.game, {
      onRestart: async () => {
        await this.repository.game.update(this.game.id, {
          status: GAME_STATUS.WAITING_FOR_PLAYERS,
        });
        await this.repository.game.addPlayer(this.game.id, this.player);
        await this.startRoom(this.game.id);
      },
      onEnd: async () => await this.repository.game.update(this.game.id, {
        status: GAME_STATUS.FINISHED_ALL_GAMES,
        numGame: 0,
      }),
    });
  }
}

export default GameEngine;
