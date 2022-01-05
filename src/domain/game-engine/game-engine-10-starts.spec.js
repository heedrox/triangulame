import GameEngine from './game-engine';
import LocalStorageMock from '../../../tests/local-storage-mock';
import MOCK_UI from '../../../tests/mock-ui';
import MOCK_REPOSITORY from '../../../tests/mock-repository';

const localDb = () => new LocalStorageMock();

describe('10 - Game Engine - when starts', () => {
  it('starts UI', async () => {
    const mockUi = MOCK_UI();
    const gameEngine = new GameEngine(mockUi, MOCK_REPOSITORY(), localDb());

    await gameEngine.start();

    expect(mockUi.start.mock.calls.length).toBe(1);
  });
});
