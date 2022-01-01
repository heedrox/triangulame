import GameEngine from './game-engine';

const MOCK_UI = () => ({
  start: jest.fn(),
  getNameAndRoom: jest.fn(() => Promise.resolve({ name: 'NAME', room: 'ROOM' })),
  playGame: jest.fn(),
});

describe('Game Engine', () => {
  it('starts UI when starts', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi);

    await gameEngine.start();

    expect(mockUi.start.mock.calls.length).toBe(1);
  });

  it('asks for name and room', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi);

    await gameEngine.start();

    expect(mockUi.getNameAndRoom.mock.calls.length).toBe(1);
  });

  it('starts game with returned room', async () => {
    const mockUi = MOCK_UI();
    mockUi.getNameAndRoom = jest.fn(() => Promise.resolve({
      name: 'NAME',
      room: 'ROOM',
    }));
    const gameEngine = new GameEngine(mockUi);

    await gameEngine.start();

    expect(mockUi.playGame.mock.calls.length).toBe(1);
    expect(mockUi.playGame.mock.calls[0][0].room).toBe('ROOM');
  });
});
