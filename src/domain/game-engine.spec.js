import GameEngine from './game-engine';

describe('Game Engine', () => {
  it('starts UI when starts', () => {
    const mockUi = {
      start: jest.fn(),
    };
    const gameEngine = new GameEngine(mockUi);

    gameEngine.start();

    expect(mockUi.start.mock.calls.length).toBe(1);
  });
});
