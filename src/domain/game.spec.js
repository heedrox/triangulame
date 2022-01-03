import Game from './game';

describe('Game', () => {
  describe('#constructor', () => {
    it('should create a new game', () => {
      const game = new Game();
      expect(game).toBeInstanceOf(Game);
    });
  });
});
