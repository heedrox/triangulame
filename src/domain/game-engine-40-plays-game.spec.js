import GameEngine from './game-engine';
import LocalStorageMock from '../../tests/local-storage-mock';
import MOCK_UI from '../../tests/mock-ui';
import MOCK_REPOSITORY from '../../tests/mock-repository';

const localDb = () => new LocalStorageMock();

describe('40 - Game Engine starts game itself', () => {
  it('starts game when players are ready', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.watch = () => ({ });
    mockUi.waitForPlayers = jest.fn(() => Promise.resolve());

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(mockUi.playGame.mock.calls.length).toBe(1);
  });
});
