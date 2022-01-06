import GAME_STATUS from '../game-status';

class Game {
  constructor(options) {
    if (options) {
      this.id = options.id;
      this.status = options.status ? options.status : GAME_STATUS.WAITING_FOR_PLAYERS;
      this.players = options.players ? options.players : {};
      this.rectangles = options.rectangles;
    }
  }

  canBeJoined() {
    return this.status === GAME_STATUS.WAITING_FOR_PLAYERS;
  }
}

export default Game;
