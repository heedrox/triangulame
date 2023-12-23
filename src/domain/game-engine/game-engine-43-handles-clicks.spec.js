import GameEngine from './game-engine';
import LocalStorageMock from '../../../tests/local-storage-mock';
import MOCK_UI from '../../../tests/mock-ui';
import MOCK_REPOSITORY from '../../../tests/mock-repository';
import GAME_STATUS from '../game-status';

const localDb = () => new LocalStorageMock();

describe('43 - Game Engine handles clicks', () => {
  it('starts with currentGoal 1', async () => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.watch = ((_, fn) => fn({
      id: 'ROOM',
      status: GAME_STATUS.PLAYING,
      players: {},
    }));
    mockUi.playGame = () => ({});

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(gameEngine.currentGoal).toBe(1);
  });
  it.each`
    keyPressed | expectedCurrentGoal
    ${1}       | ${2}
    ${4}       | ${1}
  `('increments currentGoal only if clicked rectangle is currentGoal - #keyPressed - #expectedCurrentGoal', async ({ keyPressed, expectedCurrentGoal }) => {
    const mockUi = MOCK_UI();
    const repository = MOCK_REPOSITORY();
    repository.game.watch = ((_, fn) => fn({
      id: 'ROOM',
      status: GAME_STATUS.PLAYING,
      players: {},
    }));
    mockUi.playGame = (_, cbks) => cbks.onPress(keyPressed);

    const gameEngine = new GameEngine(mockUi, repository, localDb());
    await gameEngine.start();

    expect(gameEngine.currentGoal).toBe(expectedCurrentGoal);
  });

  describe('ComboCheck is handled', () => {
    it.todo('');
  });
});
