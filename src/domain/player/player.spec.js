import Player from './player';

describe('Player', () => {
  it('inits', () => {
    const player = new Player('uuid', 'PLAYER_NAME');

    expect(player.id).toBe('uuid');
    expect(player.name).toBe('PLAYER_NAME');
  });
});
