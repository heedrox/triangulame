class GameEngine {
  constructor(ui) {
    this.ui = ui;
  }

  start() {
    this.ui.showWelcomeScreen();
  }
}

export default GameEngine;
