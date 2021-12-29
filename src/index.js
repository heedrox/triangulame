import Phaser from 'phaser';
import RectanglesCreator from './rectangles-creator';

const getFontSize = (r, xf, yf) => {
  const topX = r.p1.x - r.p0.x;
  const leftY = r.p2.y - r.p0.y;
  const bottomX = r.p3.x - r.p0.x;
  const rightY = r.p3.y - r.p1.y;

  const values = [topX, leftY, bottomX, rightY].filter((v) => v > 0);
  const min = Math.min(...values);
  const isX = min === topX || min === bottomX;
  return isX ? min * xf : min * yf;
};

class MyGame extends Phaser.Scene {
  preload() {
    this.rectangles = new RectanglesCreator().build(64);
  }

  create() {
    const graphics = this.add.graphics({
      x: 0,
      y: 0,
    });
    graphics.lineStyle(10, 0xffffff, 1);
    const X_FACTOR = this.game.canvas.width / 100;
    const Y_FACTOR = this.game.canvas.height / 100;

    this.rectangles.forEach((rectangle) => {
      /* const polygon = new Phaser.Geom.Polygon([
        rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR,
        rectangle.p1.x * X_FACTOR, rectangle.p1.y * Y_FACTOR,
        rectangle.p3.x * X_FACTOR, rectangle.p3.y * Y_FACTOR,
        rectangle.p2.x * X_FACTOR, rectangle.p2.y * Y_FACTOR
      ]);
      graphics.fillStyle(0xaaaa00, 1);
      graphics.fillPoints(polygon.points, true); */
      graphics.beginPath();
      graphics.moveTo(rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR);
      graphics.lineTo(rectangle.p1.x * X_FACTOR, rectangle.p1.y * Y_FACTOR);
      graphics.lineTo(rectangle.p3.x * X_FACTOR, rectangle.p3.y * Y_FACTOR);
      graphics.lineTo(rectangle.p2.x * X_FACTOR, rectangle.p2.y * Y_FACTOR);
      graphics.closePath();
      graphics.strokePath();

      this.add.text(rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR, rectangle.id, {
        fontFamily: 'Verdana, "Times New Roman", Tahoma, serif',
        fontSize: getFontSize(rectangle, X_FACTOR, Y_FACTOR),
        color: '#000000',
      });

      this.input.on('pointerup', (pointer) => {
        const polygon = new Phaser.Geom.Polygon([
          rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR,
          rectangle.p1.x * X_FACTOR, rectangle.p1.y * Y_FACTOR,
          rectangle.p3.x * X_FACTOR, rectangle.p3.y * Y_FACTOR,
          rectangle.p2.x * X_FACTOR, rectangle.p2.y * Y_FACTOR,
        ]);

        if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
          console.log('in square ', rectangle.id);
        }
        graphics.fillPoints(polygon.points, true);
      });
    });
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
