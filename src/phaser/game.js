import Phaser from 'phaser';
import RectanglesCreator from '../domain/rectangles-creator';

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
  init() {
    this.xFactor = this.game.canvas.width / 100;
    this.yFactor = (this.game.canvas.height * 0.85) / 100;
    this.goalId = 1;
    this.rectangles = new RectanglesCreator().build(64);
    this.polygons = this.rectangles.map((r) => new Phaser.Geom.Polygon([
      r.p0.x * this.xFactor, r.p0.y * this.yFactor,
      r.p1.x * this.xFactor, r.p1.y * this.yFactor,
      r.p3.x * this.xFactor, r.p3.y * this.yFactor,
      r.p2.x * this.xFactor, r.p2.y * this.yFactor,
    ]));
    this.texts = Array(this.rectangles.length).fill(null);
  }

  create() {
    const graphics = this.buildGraphics();

    this.rectangles.forEach((rectangle, nr) => {
      this.addRectangle(graphics, rectangle);
      this.texts[nr] = this.addTextToRectangle(rectangle);
    });

    this.input.on('pointerup', (pointer) => {
      this.checkRectanglePressed(graphics, pointer);
    });
  }

  buildGraphics() {
    const graphics = this.add.graphics({
      x: 0,
      y: 0,
    });
    graphics.lineStyle(12, 0xffffff, 1);
    return graphics;
  }

  addRectangle(graphics, rectangle) {
    graphics.beginPath();
    graphics.moveTo(rectangle.p0.x * this.xFactor, rectangle.p0.y * this.yFactor);
    graphics.lineTo(rectangle.p1.x * this.xFactor, rectangle.p1.y * this.yFactor);
    graphics.lineTo(rectangle.p3.x * this.xFactor, rectangle.p3.y * this.yFactor);
    graphics.lineTo(rectangle.p2.x * this.xFactor, rectangle.p2.y * this.yFactor);
    graphics.closePath();
    graphics.strokePath();
  }

  addTextToRectangle(rectangle) {
    const textPosition = getTextPosition(rectangle, this.xFactor, this.yFactor);
    const text = this.add.text(textPosition.x, textPosition.y, rectangle.id, {
      fontFamily: 'Arial',
      fontSize: '200px',
      color: '#000000',
    });
    text.setOrigin(0.5);
    const textStretch = getStretch(text.getBounds(), rectangle, this.xFactor, this.yFactor);
    text.setScale(textStretch.x, textStretch.y);
    return text;
  }

  checkRectanglePressed(graphics, pointer) {
    this.polygons.forEach((polygon, nr) => {
      if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
        if (this.rectangles[nr].id === this.goalId) {
          this.goalId += 1;
          this.removeRectangle(graphics, polygon, this.texts[nr]);
        }
      }
    });
  }

  removeRectangle(graphics, polygon, text) {
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
    text.setDepth(1);
    this.tweens.add({
      targets: [newPoly, text],
      angle: 720 + 360,
      ease: 'Linear',
      duration: 1000,
      repeat: 0,
      scale: 0,
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

const start = () => {
// eslint-disable-next-line no-unused-vars
  const game = new Phaser.Game(config);
};

export default { start };
