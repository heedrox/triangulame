import GameEngine from './game-engine';
import LocalStorageMock from '../../tests/local-storage-mock';
import MOCK_UI from '../../tests/mock-ui';
import MOCK_REPOSITORY from '../../tests/mock-repository';

const localDb = () => new LocalStorageMock();

describe('30 - Game Engine waits for players', () => {
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

  it('keep players alive so that they can now they are still connected', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(repository.game.keepPlayerAlive.mock.calls.length).toBe(1);
  });

  it('removes users that are not me and have not been seen more than 10 secs ago', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    const db = localDb();
    db.setItem('uuid', 'uid1');
    repository.game.watch = jest.fn((room, path, cbk) => {
      cbk({
        uid1: { name: 'n1', lastSeen: 1641321420891 },
        uid2: { name: 'n2', lastSeen: 1641321420891 - 11000 },
      });
    });

    const gameEngine = new GameEngine(mockUi, repository, db);
    await gameEngine.start();

    expect(mockUi.updatePlayers.mock.calls.length).toBe(1);
    expect(mockUi.updatePlayers.mock.calls[0][0]).toEqual({
      uid1: { name: 'n1', lastSeen: 1641321420891 },
    });
    expect(mockUi.updatePlayers.mock.calls[0][1]).toEqual('uid1');
    expect(repository.game.updatePlayers.mock.calls.length).toBe(1);
    expect(repository.game.updatePlayers.mock.calls[0][0]).toEqual('ROOM');
    expect(repository.game.updatePlayers.mock.calls[0][1]).toEqual({
      uid1: { name: 'n1', lastSeen: 1641321420891 },
    });
  });
});
