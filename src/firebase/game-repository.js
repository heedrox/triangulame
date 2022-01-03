import { get, ref, set } from 'firebase/database';
import Game from '../domain/game';

class GameRepository {
  constructor(db) {
    this.db = db;
  }

  async get(roomName) {
    const gameRef = ref(this.db, `games/${roomName}`);
    const gameSnapshot = await get(gameRef);
    const game = gameSnapshot.val();
    return game ? new Game(game) : null;
  }

  async create(room) {
    const gameRef = ref(this.db, `games/${room.id}`);
    return set(gameRef, room);
  }
}

export default GameRepository;
