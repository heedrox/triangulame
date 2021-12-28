import Phaser from 'phaser';
import RectanglesCreator from "./rectangles-creator";

class MyGame extends Phaser.Scene {
  preload() {
    console.log(this);
    this.rectangles = new RectanglesCreator().build(100);
    console.log(this.rectangles)
  }

  create() {
    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.lineStyle(2, 0x00aa00);
    const X_FACTOR = this.game.canvas.width / 100;
    const Y_FACTOR = this.game.canvas.height / 100;

    this.rectangles.forEach((rectangle) => {
      graphics.beginPath();
      graphics.moveTo(rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR);
      graphics.lineTo(rectangle.p1.x * X_FACTOR, rectangle.p1.y * Y_FACTOR);
      graphics.lineTo(rectangle.p3.x * X_FACTOR, rectangle.p3.y * Y_FACTOR);
      graphics.lineTo(rectangle.p2.x * X_FACTOR, rectangle.p2.y * Y_FACTOR);
      graphics.closePath();
      graphics.strokePath();
    })
  }
}

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  autoCenter: 1,
  parent: 'phaser-triangles',
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
  scene: MyGame,
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
