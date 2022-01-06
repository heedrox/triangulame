const MOCK_UI = () => ({
  start: jest.fn(),
  getNameAndRoom: jest.fn(() => Promise.resolve({
    name: 'NAME',
    room: 'ROOM',
  })),
  waitForPlayers: jest.fn(),
  updatePlayers: jest.fn(),
  playGame: jest.fn(),
  endGame: jest.fn(),
});

export default MOCK_UI;
