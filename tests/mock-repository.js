const MOCK_REPOSITORY = () => ({
  game: {
    get: () => jest.fn(() => Promise.resolve({})),
    create: jest.fn(() => Promise.resolve({})),
    watch: () => {},
    addPlayer: jest.fn(() => Promise.resolve({})),
    keepPlayerAlive: jest.fn(() => Promise.resolve({})),
    updatePlayers: jest.fn(() => Promise.resolve({})),
  },
});

export default MOCK_REPOSITORY;
