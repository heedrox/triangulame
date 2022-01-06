import GameEngine from './game-engine';
import LocalStorageMock from '../../../tests/local-storage-mock';
import MOCK_UI from '../../../tests/mock-ui';
import MOCK_REPOSITORY from '../../../tests/mock-repository';
import GAME_STATUS from '../game-status';
import Game from '../game/game';

const localDb = () => new LocalStorageMock();

describe('50 - Game Engine ends', () => {
  it('updates status to FINISHED when user finishes', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = () => {};
    repository.game.watch = ((_, fn) => fn({
      id: 'ROOM',
      status: GAME_STATUS.PLAYING,
      players: {},
    }));
    const db = localDb();
    db.setItem('uuid', 'PLAYER_ID');
    mockUi.playGame = (game, cbks) => cbks.onFinish(100);

    const gameEngine = new GameEngine(mockUi, repository, db);
    await gameEngine.start();

    expect(repository.game.update.mock.calls.length).toBe(1);
    expect(repository.game.update.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.update.mock.calls[0][1].status).toBe(GAME_STATUS.FINISHED);
    expect(repository.game.update.mock.calls[0][1].winner).toBe('PLAYER_ID');
    expect(repository.game.update.mock.calls[0][1].winnerSecs).toBe(100);
  });

  it('ends when game status FINISHED is received, and it was PLAYING', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = () => {};
    repository.game.watch = ((_, fn) => {
      fn({
        id: 'ROOM',
        status: GAME_STATUS.PLAYING,
        players: {},
      });
      fn({
        id: 'ROOM',
        status: GAME_STATUS.FINISHED,
        players: {},
      });
    });

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(mockUi.endGame.mock.calls.length).toBe(1);
    expect(mockUi.endGame.mock.calls[0][0]).toBeInstanceOf(Game);
  });

  it('does not end game again when game status FINISHED is received, but it was not playing', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = () => {};
    repository.game.watch = ((_, fn) => {
      fn({
        id: 'ROOM',
        status: GAME_STATUS.WAITING_FOR_PLAYERS,
        players: {},
      });
      fn({
        id: 'ROOM',
        status: GAME_STATUS.FINISHED,
        players: {},
      });
    });

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(mockUi.endGame.mock.calls.length).toBe(0);
  });

  it('stops keeping player alive', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    mockUi.waitForPlayers = () => {};
    repository.game.watch = ((_, fn) => {
      fn({
        id: 'ROOM',
        status: GAME_STATUS.PLAYING,
        players: {},
      });
      fn({
        id: 'ROOM',
        status: GAME_STATUS.FINISHED,
        players: {},
      });
    });
    const db = localDb();
    db.setItem('uuid', 'PLAYER_ID');
    const gameEngine = new GameEngine(mockUi, repository, db);
    await gameEngine.start();

    expect(repository.game.unkeepPlayerAlive.mock.calls.length).toBe(1);
    expect(repository.game.unkeepPlayerAlive.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.unkeepPlayerAlive.mock.calls[0][1]).toBe('PLAYER_ID');
  });
});
