import Game from './game';
import GAME_STATUS from './game-status';

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
      });

      expect(game.status).toBe('STATUS');
      expect(game.id).toBe('ID');
    });

    it('a game created without status, creates with WAITING_FOR_PLAYERS', () => {
      const game = new Game({
        id: 'ID',
      });

      expect(game.status).toBe(GAME_STATUS.WAITING_FOR_PLAYERS);
    });
  });

  it('tells whether can be joined', () => {
    const game = new Game({ status: GAME_STATUS.WAITING_FOR_PLAYERS });

    expect(game.canBeJoined()).toBe(true);
  });
});
