import GAME_STATUS from '../game-status';

class Game {
  constructor(options) {
    if (options) {
      this.id = options.id;
      this.status = options.status ? options.status : GAME_STATUS.WAITING_FOR_PLAYERS;
      this.players = options.players ? options.players : {};
      this.rectangles = options.rectangles;
      this.winner = options.winner;
      this.winnerSecs = options.winnerSecs;
      this.numGame = options.numGame ? options.numGame : 0;
      this.results = options.results ? options.results.map((result) => ({ player: result.player })) : []
    }
  }

  canBeJoined() {
    return this.status === GAME_STATUS.WAITING_FOR_PLAYERS;
  }
}

export default Game;
