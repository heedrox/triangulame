import {
  get, ref, set, onValue, update, remove, serverTimestamp,
} from 'firebase/database';
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

  watch(room, path, callback) {
    const pathRef = ref(this.db, `games/${room}/${path}`);
    onValue(pathRef, (snapshot) => callback(snapshot.val()));
  }

  async addPlayer(room, player) {
    const playersRef = ref(this.db, `games/${room}/players`);
    return update(playersRef, { [player.id]: player });
  }

  async removePlayer(room, player) {
    const playerRef = ref(this.db, `games/${room}/players/${player.id}`);
    return remove(playerRef);
  }

  async updatePlayers(room, players) {
    const playersRef = ref(this.db, `games/${room}/players`);
    return set(playersRef, players);
  }

  async keepPlayerAlive(room, id) {
    setInterval(() => {
      console.log('updateo');
      const playerRef = ref(this.db, `games/${room}/players/${id}`);
      return update(playerRef, { lastSeen: serverTimestamp() });
    }, 5000);
  }
}

export default GameRepository;
