import { v4 as uuidv4 } from 'uuid';

const buildPlayerIdIfNotExists = (localDb) => {
  const id = localDb.getItem('uuid');
  if (id) return id;
  localDb.setItem('uuid', uuidv4());
  return localDb.getItem('uuid');
};

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static fromCache(localDb, name) {
    const id = buildPlayerIdIfNotExists(localDb);
    return new Player(id, name);
  }
}

export default Player;
