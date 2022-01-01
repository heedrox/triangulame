import GameEngine from './game-engine';

describe('Game Engine', () => {
  it('starts with welcome screen', () => {
    const mockUi = {
      showWelcomeScreen: jest.fn(),
    };
    const gameEngine = new GameEngine(mockUi);

    gameEngine.start();

    expect(mockUi.showWelcomeScreen.mock.calls.length).toBe(1);
  });
});
