import {
  get, ref, set, onValue, update, remove, serverTimestamp,
} from 'firebase/database';
import Game from '../domain/game/game';

const _clean = (obj) => JSON.parse(JSON.stringify(obj));

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
    return set(gameRef, _clean(room));
  }

  async update(roomId, game) {
    const updates = {};
    Object.keys(game).forEach((key) => {
      updates[`games/${roomId}/${key}`] = game[key];
    });
    return update(ref(this.db), updates);
  }

  async addGameResult(roomId, { numGame, player }) {
    const gameResultRef = ref(this.db, `games/${roomId}/results/${numGame}`);
    return set(gameResultRef, {
      player,
    });

  }

  watch(room, callback) {
    const pathRef = ref(this.db, `games/${room}`);
    onValue(pathRef, (snapshot) => callback(snapshot.val()));
  }

  async addPlayer(room, player) {
    const playersRef = ref(this.db, `games/${room}/players/${player.id}`);
    return update(playersRef, {
      id: player.id,
      name: player.name,
      lastSeen: serverTimestamp(),
    });
  }

  async removePlayer(room, player) {
    const playerRef = ref(this.db, `games/${room}/players/${player.id}`);
    return remove(playerRef);
  }

  async keepPlayerAlive(roomId, player) {
    this.keepPlayerAliveInterval = setInterval(() => {
      const playerRef = ref(this.db, `games/${roomId}/players/${player.id}`);
      return update(playerRef, {
        id: player.id,
        name: player.name,
        lastSeen: serverTimestamp(),
      });
    }, 5000);
  }

  unkeepPlayerAlive() {
    if (this.keepPlayerAliveInterval) {
      clearInterval(this.keepPlayerAliveInterval);
    }
  }
}

export default GameRepository;
