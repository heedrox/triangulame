import Game from './game';
import GAME_STATUS from '../game-status';

describe('Game', () => {
  describe('#constructor', () => {
    it('creates a new game', () => {
      const game = new Game();
      expect(game).toBeInstanceOf(Game);
    });

    it('creates game from repository', () => {
      const game = new Game({
        status: 'STATUS',
        id: 'ID',
        players: { id: { name: 'NAME' } },
        rectangles: [],
        winner: 'WINNER',
        winnerSecs: 100,
        results: [
          { player: 'PLAYER1', secs: 1 },
          { player: 'PLAYER2', secs: 2 }
        ]
      });

      expect(game.status).toBe('STATUS');
      expect(game.id).toBe('ID');
      expect(game.players.id.name).toBe('NAME');
      expect(game.rectangles.length).toBe(0);
      expect(game.winner).toBe('WINNER');
      expect(game.winnerSecs).toBe(100);
      expect(game.results).toStrictEqual([
        { player: 'PLAYER1', secs: 1 },
        { player: 'PLAYER2', secs: 2 }
      ])
    });

    it('creates game with numGame reset', () => {
      const game = new Game({
        status: 'STATUS',
        id: 'ID',
        players: { id: { name: 'NAME' } },
        rectangles: [],
        winner: 'WINNER',
        winnerSecs: 100,
        results: []
      });

      expect(game.numGame).toBe(0);
    });

    it('a game created without status, creates with WAITING_FOR_PLAYERS', () => {
      const game = new Game({
        id: 'ID',
      });

      expect(game.status).toBe(GAME_STATUS.WAITING_FOR_PLAYERS);
    });

    it('a game created without players, creates with empty object', () => {
      const game = new Game({
        id: 'ID',
      });

      expect(game.players).toEqual({});
    });
  });

  it('tells whether can be joined', () => {
    const game = new Game({ status: GAME_STATUS.WAITING_FOR_PLAYERS });

    expect(game.canBeJoined()).toBe(true);
  });

  it('gets results table', () => {
    const game = new Game({
      results: {
        0: { winner: 'PLAYER1', secs: 1 },
        3: { winner: 'PLAYER2', secs: 2 }
      }
    });

    expect(game.getResultsTable()).toStrictEqual([
      { numGame: 0, winner: 'PLAYER1', secs: 1 },
      { numGame: 3, winner: 'PLAYER2', secs: 2 }
    ]);
  });
});
