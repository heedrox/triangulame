import GameEngine from './game-engine';
import GAME_STATUS from './game-status';

const MOCK_UI = () => ({
  start: jest.fn(),
  getNameAndRoom: jest.fn(() => Promise.resolve({
    name: 'NAME',
    room: 'ROOM',
  })),
  waitForPlayers: jest.fn(),
  playGame: jest.fn(),
});

describe('Game Engine', () => {
  it('starts UI when starts', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi);

    await gameEngine.start();

    expect(mockUi.start.mock.calls.length).toBe(1);
  });

  it('asks for name and room, sending a checkValidity function', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi);

    await gameEngine.start();

    expect(mockUi.getNameAndRoom.mock.calls.length).toBe(1);
    expect(typeof mockUi.getNameAndRoom.mock.calls[0][0].checkValidity).toBe('function');
  });

  it.each`
    game                                           | expected
    ${null}                                        | ${true}
    ${{ status: GAME_STATUS.WAITING_FOR_PLAYERS }} | ${true}
    ${{ status: GAME_STATUS.FINISHED }}            | ${false}
  `('when checking room is valid', async ({ game, expected }) => {
    const mockUi = MOCK_UI();
    const repository = {
      game: {
        get: jest.fn(() => Promise.resolve(game)),
      },
    };
    const gameEngine = new GameEngine(mockUi, repository);
    await gameEngine.start();
    expect(mockUi.getNameAndRoom.mock.calls.length).toBe(1);

    const checkValid = mockUi.getNameAndRoom.mock.calls[0][0].checkValidity;
    const isValid = await checkValid('ROOM');

    expect(isValid).toBe(expected);
  });

  it('waits for players in the returned room', async () => {
    const mockUi = MOCK_UI();
    mockUi.getNameAndRoom = jest.fn(() => Promise.resolve({
      name: 'NAME',
      room: 'ROOM',
    }));
    const gameEngine = new GameEngine(mockUi);

    await gameEngine.start();

    expect(mockUi.waitForPlayers.mock.calls.length).toBe(1);
    expect(mockUi.waitForPlayers.mock.calls[0][0].room).toBe('ROOM');
  });
});
