import { get, ref } from 'firebase/database';

class GameRepository {
  constructor(db) {
    this.db = db;
  }

  async get(roomName) {
    const roomRef = ref(this.db, `games/${roomName}`);
    const room = await get(roomRef);
    return room.val();
  }
}

export default GameRepository;
