import { get, ref, set } from 'firebase/database';
import Game from '../domain/game';

class GameRepository {
  constructor(db) {
    this.db = db;
  }

  async get(roomName) {
    const roomRef = ref(this.db, `games/${roomName}`);
    const room = await get(roomRef);
    return new Game(room.val());
  }

  async create(room) {
    const roomRef = ref(this.db, `games/${room.id}`);
    return set(roomRef, room);
  }
}

export default GameRepository;
