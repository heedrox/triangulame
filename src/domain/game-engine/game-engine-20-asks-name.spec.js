import GameEngine from './game-engine';
import GAME_STATUS from '../game-status';
import Game from '../game/game';
import LocalStorageMock from '../../../tests/local-storage-mock';
import MOCK_REPOSITORY from '../../../tests/mock-repository';
import MOCK_UI from '../../../tests/mock-ui';

const localDb = () => new LocalStorageMock();

describe('20 - Game Engine asks for name and room', () => {
  it('asks for name and room, sending a checkValidity function', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi, MOCK_REPOSITORY(), localDb());

    await gameEngine.start();

    expect(mockUi.getNameAndRoom.mock.calls.length).toBe(1);
    expect(typeof mockUi.getNameAndRoom.mock.calls[0][0].checkValidity).toBe('function');
  });

  it.each`
    game                                           | expected
    ${null}                                        | ${true}
    ${new Game({ status: GAME_STATUS.WAITING_FOR_PLAYERS })} | ${true}
    ${new Game({ status: GAME_STATUS.PLAYING })}              | ${false}
    ${new Game({ status: GAME_STATUS.FINISHED })}            | ${true}
    ${new Game({ status: GAME_STATUS.FINISHED_ALL_GAMES })}  | ${false}
  `('when checking room is valid - #game', async ({ game, expected }) => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.get = jest.fn(() => Promise.resolve(game));
    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();
    expect(mockUi.getNameAndRoom.mock.calls.length).toBe(1);

    const checkValid = mockUi.getNameAndRoom.mock.calls[0][0].checkValidity;
    const isValid = await checkValid('ROOM');

    expect(isValid).toBe(expected);
  });

  describe('handles creation of room game', () => {
    it.each`
     explanation              | game                                           | callsExpected
     ${'room exists'}         | ${new Game({ status: GAME_STATUS.WAITING_FOR_PLAYERS })} | ${0}
     ${'room does not exist'} | ${null}                                        | ${1}
    `('creates room if it does not exist. case #explanation', async ({ game, callsExpected }) => {
      const mockUi = MOCK_UI();
      const repository = MOCK_REPOSITORY();
      repository.game.get = jest.fn(() => Promise.resolve(game));
      const gameEngine = new GameEngine(mockUi, repository, localDb());
      await gameEngine.start();

      expect(repository.game.create.mock.calls.length).toBe(callsExpected);
    });

    it('creates game in WAITING_FOR_PLAYER status', async () => {
      const mockUi = MOCK_UI();
      const repository = MOCK_REPOSITORY();
      repository.game.get = jest.fn(() => Promise.resolve(null));
      const gameEngine = new GameEngine(mockUi, repository, localDb());
      await gameEngine.start();

      expect(repository.game.create.mock.calls[0][0].status).toBe(GAME_STATUS.WAITING_FOR_PLAYERS);
    });
  });
});
