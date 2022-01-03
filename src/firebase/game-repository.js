import { get, ref, set } from 'firebase/database';

class GameRepository {
  constructor(db) {
    this.db = db;
  }

  async get(roomName) {
    const roomRef = ref(this.db, `games/${roomName}`);
    const room = await get(roomRef);
    return room.val();
  }

  async create(room) {
    const roomRef = ref(this.db, `games/${room.id}`);
    set(roomRef, room);
  }
}

export default GameRepository;
