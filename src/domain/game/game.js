import GAME_STATUS from '../game-status';

class Game {
  constructor (options) {
    if (options) {
      this.id = options.id;
      this.status = options.status ? options.status : GAME_STATUS.WAITING_FOR_PLAYERS;
      this.players = options.players ? options.players : {};
      this.rectangles = options.rectangles;
      this.winner = options.winner;
      this.winnerSecs = options.winnerSecs;
      this.numGame = options.numGame ? options.numGame : 0;
      this.results = options.results;
      this.currentGoals = options.currentGoals ? options.currentGoals : {};
    }
  }

  canBeJoined () {
    return this.status === GAME_STATUS.WAITING_FOR_PLAYERS;
  }

  getSummary () {
    try {
      const getCleanResultsArray = (r) => Object.keys(this.results).map((key) => ({
        numGame: parseInt(key, 10),
        ...this.results[key],
      }));
      const uniquePlayers = (r) => [...new Set(r.map((result) => result.winner))];
      const results = getCleanResultsArray(this.results);
      const players = uniquePlayers(results);
      const playerResults = players.map((player) => ({
        player,
        secs: results.filter((result) => result.winner === player).reduce((acc, result) => acc + result.secs, 0),
      }));
      return playerResults.sort((a, b) => b.secs - a.secs);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  static numberOfRectangles (numGame) {
    return numGame * 2 + 12;
  }
}

export default Game;
