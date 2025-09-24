import GameRepository from './game-repository';
import { db } from './app';

class FirebaseRepository {
  constructor () {
    this.game = new GameRepository(db);
  }
}

export default FirebaseRepository;
