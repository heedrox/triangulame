import {
  get, ref, set, onValue, update, remove, serverTimestamp,
} from 'firebase/database';
import Game from '../domain/game/game';

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

  async update(roomId, game) {
    console.log('updating game', game);
    const updates = {};
    Object.keys(game).forEach((key) => {
      updates[`games/${roomId}/${key}`] = game[key];
    });
    return update(ref(this.db), updates);
  }

  watch(room, callback) {
    const pathRef = ref(this.db, `games/${room}`);
    onValue(pathRef, (snapshot) => callback(snapshot.val()));
  }

  async addPlayer(room, player) {
    const playersRef = ref(this.db, `games/${room}/players`);
    return update(playersRef, {
      [player.id]: {
        ...player,
        lastSeen: serverTimestamp(),
      },
    });
  }

  async removePlayer(room, player) {
    const playerRef = ref(this.db, `games/${room}/players/${player.id}`);
    return remove(playerRef);
  }

  async keepPlayerAlive(roomId, id) {
    this.keepPlayerAliveInterval = setInterval(() => {
      const playerRef = ref(this.db, `games/${roomId}/players/${id}`);
      return update(playerRef, { lastSeen: serverTimestamp() });
    }, 1000);
  }

  unkeepPlayerAlive() {
    console.log('unkeeping player alive', this.keepPlayerAliveInterval);
    if (this.keepPlayerAliveInterval) {
      clearInterval(this.keepPlayerAliveInterval);
    }
  }
}

export default GameRepository;
