class GameEngine {
  constructor(ui) {
    this.ui = ui;
  }

  async start() {
    this.ui.start();
    const { room } = await this.ui.getNameAndRoom();
    this.ui.playGame({ room });
  }
}

export default GameEngine;
