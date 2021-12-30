import Phaser from 'phaser';
import RectanglesCreator from './rectangles-creator';

const BACKGROUND_PIECE = 0xcccc00;

const getTextPosition = (r, xf, yf) => {
  const type = r.getType();

  if (['SQUARE', 'RECTANGLE'].includes(type)) {
    const sizeX = Math.min(r.p1.x - r.p0.x, r.p3.x - r.p2.x);
    const sizeY = Math.min(r.p2.y - r.p0.y, r.p3.y - r.p1.y);

    const posX = Math.max(r.p0.x, r.p2.x);

    return {
      x: (posX + (sizeX * 0.5)) * xf,
      y: (r.p0.y + (sizeY * 0.5)) * yf,
    };
  }

  const paddingX = Math.max(r.p1.x - r.p0.x, r.p3.x - r.p2.x) * 0.66;
  const paddingY = Math.min(r.p2.y - r.p0.y, r.p3.y - r.p1.y) * 0.8;

  if (type === 'TRIANGLE-LTR-T') {
    return {
      x: (r.p0.x + paddingX + (r.id < 10 ? 0.75 : 0)) * xf,
      y: (r.p0.y + 3) * yf,
    };
  }
  if (type === 'TRIANGLE-LTR-B') {
    return {
      x: (r.p0.x + 4 + (r.id < 10 ? 0.75 : 0)) * xf,
      y: (r.p0.y + paddingY) * yf,
    };
  }
  if (type === 'TRIANGLE-RTL-T') {
    return {
      x: (r.p0.x + 4 + (r.id < 10 ? 0.75 : 0)) * xf,
      y: (r.p0.y + 3) * yf,
    };
  }
  if (type === 'TRIANGLE-RTL-B') {
    return {
      x: (r.p2.x + paddingX + (r.id < 10 ? 0.75 : 0)) * xf,
      y: (r.p0.y + paddingY) * yf,
    };
  }

  return {
    x: 0,
    y: 0,
  };
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

    this.texts = Array(this.rectangles.length).fill(null);
    this.rectangles.forEach((rectangle, nr) => {
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
      text.setOrigin(0.5);
      const textStretch = getStretch(text.getBounds(), rectangle, X_FACTOR, Y_FACTOR);
      text.setScale(textStretch.x, textStretch.y);
      this.texts[nr] = text;
    });
    const polygons = this.rectangles.map((r) => new Phaser.Geom.Polygon([
      r.p0.x * X_FACTOR, r.p0.y * Y_FACTOR,
      r.p1.x * X_FACTOR, r.p1.y * Y_FACTOR,
      r.p3.x * X_FACTOR, r.p3.y * Y_FACTOR,
      r.p2.x * X_FACTOR, r.p2.y * Y_FACTOR,
    ]));

    this.input.on('pointerup', (pointer) => {
      polygons.forEach((polygon, nr) => {
        if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
          console.log('in square ', this.rectangles[nr].id);
          const poly = new Phaser.GameObjects.Polygon(
            this,
            0,
            0,
            polygon.points,
            BACKGROUND_PIECE,
            1,
          );
          const bounds = poly.getBounds();
          poly.setOrigin(0.5);
          poly.setX(bounds.width / 2);
          poly.setY(bounds.height / 2);
          console.log(poly.x, poly.y);
          console.log(polygon.points);
          const minx = Math.min(...polygon.points.map((p) => p.x));
          const miny = Math.min(...polygon.points.map((p) => p.y));
          const newPoints = polygon.points.map((p) => ({
            x: p.x - minx,
            y: p.y - miny,
          }));
          const newPoly = new Phaser.GameObjects.Polygon(
            this,
            minx,
            miny,
            newPoints,
            BACKGROUND_PIECE,
            1,
          );
          const bounds2 = newPoly.getBounds();
          newPoly.setOrigin(0.5);
          newPoly.setX(newPoly.x + bounds2.width / 2);
          newPoly.setY(newPoly.y + bounds2.height / 2);
          this.add.existing(newPoly);
          graphics.fillStyle(0x000000);
          graphics.fillPoints(polygon.points, true);
          this.texts[nr].setDepth(1);
          this.tweens.add({
            targets: [newPoly, this.texts[nr]],
            angle: 720 + 360,
            ease: 'Linear',
            duration: 1000,
            repeat: 0,
            scale: 0,
          });
          // graphics.fillPoints(polygon.points, true);
        }
      });
    });
  }
}

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  backgroundColor: BACKGROUND_PIECE,
  autoCenter: 1,
  parent: 'phaser-triangles',
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
  scene: MyGame,
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
