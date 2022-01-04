import GameEngine from './game-engine';
import GAME_STATUS from './game-status';
import Game from './game';
import LocalStorageMock from '../../tests/local-storage-mock';

const MOCK_UI = () => ({
  start: jest.fn(),
  getNameAndRoom: jest.fn(() => Promise.resolve({
    name: 'NAME',
    room: 'ROOM',
  })),
  waitForPlayers: jest.fn(),
  updatePlayers: jest.fn(),
  playGame: jest.fn(),
});

const MOCK_REPOSITORY = () => ({
  game: {
    get: () => jest.fn(() => Promise.resolve({})),
    create: jest.fn(() => Promise.resolve({})),
    watch: () => {},
    addPlayer: jest.fn(() => Promise.resolve({})),
  },
});

const localDb = () => new LocalStorageMock();

describe('Game Engine', () => {
  it('starts UI when starts', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi, MOCK_REPOSITORY(), localDb());

    await gameEngine.start();

    expect(mockUi.start.mock.calls.length).toBe(1);
  });

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
    ${new Game({ status: GAME_STATUS.FINISHED })}            | ${false}
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

  it('waits for players in the returned room', async () => {
    const mockUi = MOCK_UI();
    mockUi.getNameAndRoom = jest.fn(() => Promise.resolve({
      name: 'NAME',
      room: 'ROOM',
    }));
    const gameEngine = new GameEngine(mockUi, MOCK_REPOSITORY(), localDb());

    await gameEngine.start();

    expect(mockUi.waitForPlayers.mock.calls.length).toBe(1);
    expect(mockUi.waitForPlayers.mock.calls[0][0].room).toBe('ROOM');
  });

  it('adds itself as a player when users not first time', async () => {
    const mockUi = MOCK_UI();
    mockUi.getNameAndRoom = jest.fn(() => Promise.resolve({
      name: 'NAME',
      room: 'ROOM',
    }));
    const repository = MOCK_REPOSITORY();
    const db = localDb();
    db.setItem('uuid', 'UUID');
    const gameEngine = new GameEngine(mockUi, repository, db);

    await gameEngine.start();

    expect(repository.game.addPlayer.mock.calls.length).toBe(1);
    expect(repository.game.addPlayer.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.addPlayer.mock.calls[0][1].name).toBe('NAME');
    expect(repository.game.addPlayer.mock.calls[0][1].id).toBe('UUID');
  });

  it('adds itself as a player when users first time', async () => {
    const mockUi = MOCK_UI();
    mockUi.getNameAndRoom = jest.fn(() => Promise.resolve({
      name: 'NAME',
      room: 'ROOM',
    }));
    const repository = MOCK_REPOSITORY();
    const db = localDb();
    const gameEngine = new GameEngine(mockUi, repository, db);

    await gameEngine.start();

    expect(repository.game.addPlayer.mock.calls.length).toBe(1);
    expect(repository.game.addPlayer.mock.calls[0][0]).toBe('ROOM');
    expect(repository.game.addPlayer.mock.calls[0][1].name).toBe('NAME');
    expect(repository.game.addPlayer.mock.calls[0][1].id.length).toBe(36);
    expect(db.getItem('uuid')).toBe(repository.game.addPlayer.mock.calls[0][1].id);
  });

  it('notifies ui if new players exist', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.watch = (room, path, fn) => fn(({ uid1: { name: 'n1' } }));

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(mockUi.updatePlayers.mock.calls.length).toBe(1);
  });

  it('it does not notify ui if no players exist', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.watch = () => ({ });

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(mockUi.updatePlayers.mock.calls.length).toBe(0);
  });
});
