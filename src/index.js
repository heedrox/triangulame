import Phaser from 'phaser';
import RectanglesCreator from "./rectangles-creator";

class MyGame extends Phaser.Scene {
  preload() {
    this.rectangles = new RectanglesCreator().build(52);
  }

  create() {
    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.lineStyle(10, 0xffffff, 1);
    const X_FACTOR = this.game.canvas.width / 100;
    const Y_FACTOR = this.game.canvas.height / 100;

    this.rectangles.forEach((rectangle) => {
      /*const polygon = new Phaser.Geom.Polygon([
        rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR,
        rectangle.p1.x * X_FACTOR, rectangle.p1.y * Y_FACTOR,
        rectangle.p3.x * X_FACTOR, rectangle.p3.y * Y_FACTOR,
        rectangle.p2.x * X_FACTOR, rectangle.p2.y * Y_FACTOR
      ]);
      graphics.fillStyle(0xaaaa00, 1);
      graphics.fillPoints(polygon.points, true);*/
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
  backgroundColor: '#cccc00',
  autoCenter: 1,
  parent: 'phaser-triangles',
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
  scene: MyGame,
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
