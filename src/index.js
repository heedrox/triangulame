import Phaser from 'phaser';
import RectanglesCreator from './rectangles-creator';

const getFontSize = (r, xf, yf) => {
  const topX = r.p1.x - r.p0.x;
  const leftY = r.p2.y - r.p0.y;
  const bottomX = r.p3.x - r.p2.x;
  const rightY = r.p3.y - r.p1.y;

  const values = [topX, leftY, bottomX, rightY].filter((v) => v > 0);
  const min = Math.min(...values);
  const isX = min === topX || min === bottomX;
  return isX ? min * xf * 0.7 : min * yf * 0.7;
};

const getTextPosition = (r, xf, yf) => {
  const type = r.getType();

  if (['SQUARE', 'RECTANGLE'].includes(type)) {
    const sizeX = Math.min(r.p1.x - r.p0.x, r.p3.x - r.p2.x);
    const sizeY = Math.min(r.p2.y - r.p0.y, r.p3.y - r.p1.y);

    const posX = Math.max(r.p0.x, r.p2.x);

    return { x: (posX + (sizeX * 0.15)) * xf, y: (r.p0.y + (sizeY * 0.15)) * yf };
  }

  const paddingX = Math.max(r.p1.x - r.p0.x, r.p3.x - r.p2.x) * 0.4;
  const paddingY = Math.min(r.p2.y - r.p0.y, r.p3.y - r.p1.y) * 0.6;

  if (type === 'TRIANGLE-LTR-T') {
    return { x: (r.p0.x + paddingX + (r.id < 10 ? 1.5 : 0)) * xf, y: (r.p0.y + 1) * yf };
  }
  if (type === 'TRIANGLE-LTR-B') {
    return { x: (r.p0.x + 1 + (r.id < 10 ? 1.5 : 0)) * xf, y: (r.p0.y + paddingY) * yf };
  }
  if (type === 'TRIANGLE-RTL-T') {
    return { x: (r.p0.x + 1 + (r.id < 10 ? 1.5 : 0)) * xf, y: (r.p0.y + 1) * yf };
  }
  if (type === 'TRIANGLE-RTL-B') {
    return { x: (r.p2.x + paddingX + (r.id < 10 ? 1.5 : 0)) * xf, y: (r.p0.y + paddingY) * yf };
  }

  return { x: 0, y: 0 };
};

const getStretch = (textBounds, r, xf, yf) => {
  const textX = textBounds.width / 0.7;
  const textY = textBounds.height / 0.7;

  const type = r.getType();

  if (['SQUARE', 'RECTANGLE'].includes(type)) {
    const sizeX = Math.min(r.p1.x - r.p0.x, r.p3.x - r.p2.x) * xf;
    const sizeY = Math.min(r.p2.y - r.p0.y, r.p3.y - r.p1.y) * yf;

    console.log('sizeX', sizeX);
    return {
      x: sizeX / textX,
      y: sizeY / textY,
    };
  }

  return {
    x: 0.25,
    y: 0.25,
  };
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
    const Y_FACTOR = (this.game.canvas.height * 0.85) / 100;

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

      const textPosition = getTextPosition(rectangle, X_FACTOR, Y_FACTOR);

      const text = this.add.text(textPosition.x, textPosition.y, rectangle.id, {
        fontFamily: 'Arial',
        fontSize: '200px',
        color: '#000000',
      });
      const textStretch = getStretch(text.getBounds(), rectangle, X_FACTOR, Y_FACTOR);
      text.setScale(textStretch.x, textStretch.y);

      /* this.input.on('pointerup', (pointer) => {
        const polygon = new Phaser.Geom.Polygon([
          rectangle.p0.x * X_FACTOR, rectangle.p0.y * Y_FACTOR,
          rectangle.p1.x * X_FACTOR, rectangle.p1.y * Y_FACTOR,
          rectangle.p3.x * X_FACTOR, rectangle.p3.y * Y_FACTOR,
          rectangle.p2.x * X_FACTOR, rectangle.p2.y * Y_FACTOR,
        ]);

        if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
          console.log('in square ', rectangle.id, rectangle);
        }
        graphics.fillPoints(polygon.points, true);
      }); */
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
