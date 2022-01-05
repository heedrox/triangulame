import GameEngine from './game-engine';
import LocalStorageMock from '../../../tests/local-storage-mock';
import MOCK_UI from '../../../tests/mock-ui';
import MOCK_REPOSITORY from '../../../tests/mock-repository';
import GAME_STATUS from '../game-status';

const localDb = () => new LocalStorageMock();

describe('40 - Game Engine starts game itself - when players ready', () => {
  xit('starts game', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.watch = () => ({ });
    mockUi.waitForPlayers = jest.fn(() => Promise.resolve());

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(mockUi.playGame.mock.calls.length).toBe(1);
  });

  it('changes game status to PLAYING', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = jest.fn(() => Promise.resolve());

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(repository.game.update.mock.calls.length).toBe(1);
    expect(repository.game.update.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.update.mock.calls[0][1].status).toBe(GAME_STATUS.PLAYING);
  });

  it('builds rectangles', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = jest.fn(() => Promise.resolve());

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(repository.game.update.mock.calls.length).toBe(1);
    expect(repository.game.update.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.update.mock.calls[0][1].status).toBe(GAME_STATUS.PLAYING);
    expect(repository.game.update.mock.calls[0][1].rectangles.length >= 30).toBeTruthy();
  });
});
