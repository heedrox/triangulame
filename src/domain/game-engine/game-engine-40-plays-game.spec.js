import GameEngine from './game-engine';
import LocalStorageMock from '../../../tests/local-storage-mock';
import MOCK_UI from '../../../tests/mock-ui';
import MOCK_REPOSITORY from '../../../tests/mock-repository';
import GAME_STATUS from '../game-status';

const localDb = () => new LocalStorageMock();

describe('40 - Game Engine starts game itself - when players ready', () => {
  it('changes game status to PLAYING', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = ({ _, onClickStart }) => onClickStart();

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(repository.game.update.mock.calls.length).toBe(1);
    expect(repository.game.update.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.update.mock.calls[0][1].status).toBe(GAME_STATUS.PLAYING);
  });

  it('builds and saves rectangles', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = ({ _, onClickStart }) => onClickStart();

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(repository.game.update.mock.calls[0][1].rectangles.length >= 30).toBeTruthy();
  });

  describe('when status changes, handles start of game', () => {
    it('starts game when state changes from WAITING_FOR_PLAYERS to PLAYING', async () => {
      const mockUi = MOCK_UI();
      const repository = MOCK_REPOSITORY();
      mockUi.waitForPlayers = ({ _, onClickStart }) => onClickStart();
      repository.game.watch = ((_, fn) => fn({
        status: GAME_STATUS.PLAYING,
        players: {},
      }));

      const gameEngine = new GameEngine(mockUi, repository, localDb());
      await gameEngine.start();

      expect(mockUi.playGame.mock.calls.length).toBe(1);
    });

    it('does not start game when state does not change to PLAYING', async () => {
      const mockUi = MOCK_UI();
      const repository = MOCK_REPOSITORY();
      mockUi.waitForPlayers = ({ _, onClickStart }) => onClickStart();
      repository.game.watch = ((_, fn) => fn({
        status: GAME_STATUS.WAITING_FOR_PLAYERS,
        players: {},
      }));

      const gameEngine = new GameEngine(mockUi, repository, localDb());
      await gameEngine.start();

      expect(mockUi.playGame.mock.calls.length).toBe(0);
    });

    it('does not start game when state does not change (even if its PLAYING)', async () => {
      const mockUi = MOCK_UI();
      const repository = MOCK_REPOSITORY();
      mockUi.waitForPlayers = jest.fn(() => Promise.resolve());
      repository.game.watch = ((_, fn) => {
        fn({
          id: 'ROOM',
          status: GAME_STATUS.WAITING_FOR_PLAYERS,
          players: {},
        });
        fn({
          id: 'ROOM',
          status: GAME_STATUS.PLAYING,
          players: {},
        });
        fn({
          id: 'ROOM',
          status: GAME_STATUS.PLAYING,
          players: {},
        });
      });
      const gameEngine = new GameEngine(mockUi, repository, localDb());
      await gameEngine.start();

      expect(mockUi.playGame.mock.calls.length).toBe(1);
      expect(mockUi.playGame.mock.calls[0][0]).toBe('ROOM');
    });
  });
});
