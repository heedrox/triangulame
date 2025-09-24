import Phaser from 'phaser';
import ingameOgg from '../../assets/audio/ingame.ogg';
import ingameMp3 from '../../assets/audio/ingame.mp3';
import comboOgg from '../../assets/audio/combo.ogg';
import comboMp3 from '../../assets/audio/combo.mp3';
import SCENE_KEYS from './constants/scene-keys';
import Rectangle from '../../domain/rectangle/rectangle';
import ComboCheck from '../../domain/combo-check/combo-check';
import PLAYERS_COLORS from './constants/players-colors';
import eventsCenter from '../events-center';

const BACKGROUND_PIECE = 0xcccc00;
const INGAME_THEME = 'INGAME_THEME';
const COMBO_THEME = 'COMBO_THEME';
const COMBO_SECS = 1.5;

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

const buildRectangleWithId = (r) => {
  const rect = new Rectangle(r.p0, r.p1, r.p2, r.p3);
  rect.setId(r.id);
  return rect;
};

class PlayingScene extends Phaser.Scene {
  constructor (i18n) {
    super({
      key: SCENE_KEYS.PLAYING_SCENE,
    });
    this.i18n = i18n;
    this.eventsCenter = eventsCenter;
  }

  init ({
    rectangles, playerId, players, onFinish, onGoalUpdate,
  }) {
    this.rectangles = rectangles.map(buildRectangleWithId);
    this.playerId = playerId;
    this.onFinish = onFinish;
    const sortedPlayers = Object.values(players).sort((a, b) => a.id.localeCompare(b.id));
    this.sortedPlayers = sortedPlayers;
    this.onGoalUpdate = onGoalUpdate;

    this.xFactor = this.game.canvas.width / 100;
    this.yFactor = (this.game.canvas.height * 0.85) / 100;
    this.goalId = 1;

    this.totalGoal = this.rectangles.length;

    this.polygons = this.rectangles.map((r) => new Phaser.Geom.Polygon([
      r.p0.x * this.xFactor, r.p0.y * this.yFactor,
      r.p1.x * this.xFactor, r.p1.y * this.yFactor,
      r.p3.x * this.xFactor, r.p3.y * this.yFactor,
      r.p2.x * this.xFactor, r.p2.y * this.yFactor,
    ]));
    this.texts = Array(this.rectangles.length).fill(null);

    this.combo = new ComboCheck();

    const updateGoalsFn = ({ goals }) => this.updateGoals({ goals });
    this.eventsCenter.on('goals.updated', updateGoalsFn);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.eventsCenter.off('goals.updated', updateGoalsFn);
    });
  }

  preload () {
    this.showWaitingScreen();
    this.load.audio(INGAME_THEME, [
      ingameOgg,
      ingameMp3,
    ]);
    this.load.audio(COMBO_THEME, [
      comboOgg,
      comboMp3,
    ]);
  }

  create () {
    this.loadingText.destroy();
    this.graphics = this.buildGraphics();

    this.paintScreen();

    this.input.on('pointerdown', (pointer) => {
      this.checkRectanglePressed(pointer);
    });

    this.playMusic();
  }

  showWaitingScreen () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.loadingText = this.make.text({
      x: w / 2,
      y: h / 2 - 50,
      text: ['El show está a', 'punto de comenzar.', 'Por favor, espera ...'].join('\n'),
      style: {
        font: '4vh monospace',
        fill: '#000000',
        align: 'center',
      },
    });
    this.loadingText.setOrigin(0.5, 0.5);
  }

  playMusic () {
    this.music = this.sound.add(INGAME_THEME, {
      volume: 0.25,
      loop: true,
    });
    this.music.play();
    this.events.on('shutdown', () => {
      if (this.music) {
        this.music.stop();
      }
    }, this);
  }

  paintScreen () {
    this.rectangles.forEach((rectangle, nr) => {
      this.addRectangle(rectangle);
      this.texts[nr] = this.addTextToRectangle(rectangle);
    });

    this.paintBottom();
  }

  buildGraphics () {
    const graphics = this.add.graphics({
      x: 0,
      y: 0,
    });
    graphics.lineStyle(Math.round(this.cameras.main.width / 120), 0xffffff, 1);
    return graphics;
  }

  addRectangle (rectangle) {
    this.graphics.beginPath();
    this.graphics.moveTo(rectangle.p0.x * this.xFactor, rectangle.p0.y * this.yFactor);
    this.graphics.lineTo(rectangle.p1.x * this.xFactor, rectangle.p1.y * this.yFactor);
    this.graphics.lineTo(rectangle.p3.x * this.xFactor, rectangle.p3.y * this.yFactor);
    this.graphics.lineTo(rectangle.p2.x * this.xFactor, rectangle.p2.y * this.yFactor);
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  addTextToRectangle (rectangle) {
    const textPosition = getTextPosition(rectangle, this.xFactor, this.yFactor);
    const text = this.add.text(textPosition.x, textPosition.y, rectangle.id, {
      fontFamily: 'Arial',
      fontSize: '25vw',
      color: '#000000',
    });
    text.setOrigin(0.5);
    const textStretch = getStretch(text.getBounds(), rectangle, this.xFactor, this.yFactor);
    text.setScale(textStretch.x, textStretch.y);
    return text;
  }

  currentColor () {
    return this.colorOfPlayer(this.playerId);
  }

  colorOfPlayer (playerId) {
    for (let i = 0; i < this.sortedPlayers.length; i++) {
      const player = this.sortedPlayers[i];
      if (player.id === playerId) {
        return PLAYERS_COLORS[i];
      }
    }
    return 0;
  }

  checkRectanglePressed (pointer) {
    this.polygons.forEach((polygon, nr) => {
      if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
        if (this.rectangles[nr].id === this.goalId) {
          if (this.goalId === 1) {
            this.startTimer();
          }
          this.checkCombo();
          if (this.onGoalUpdate) {
            this.onGoalUpdate(this.goalId);
          }
          this.goalId += 1;
          this.updateGoal();
          this.removeRectangle(polygon, this.texts[nr]);
          this.checkEnd();
        }
      }
    });
  }

  removeRectangle (polygon, text) {
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
    this.graphics.fillStyle(0x000000);
    this.graphics.fillPoints(polygon.points, true);
    text.setDepth(1);
    this.tweens.add({
      targets: [newPoly, text],
      angle: 360 * 3 * COMBO_SECS,
      ease: 'Linear',
      duration: COMBO_SECS * 1000,
      repeat: 0,
      scale: 0,
    });
  }

  paintBottom () {
    const h = this.cameras.main.height;
    const w = this.cameras.main.width;
    const VH = h / 100;
    this.graphics.fillStyle(0xFFFFFF, 1);
    this.graphics.fillRect(0, h * 0.85, w, h * 0.15);
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRoundedRect(1 * VH, h * 0.85 + 2 * VH, w - 2 * VH, h * 0.15 - 4 * VH, 0);
    this.graphics.fillStyle(0x000000, 1);
    this.paintGoal();
    this.paintProgress();
  }

  paintGoal () {
    const h = this.cameras.main.height;
    const w = this.cameras.main.width;
    const VH = h / 100;
    const splitSizeX = w * 0.25;
    const leftX = w - splitSizeX;
    const topY = h * (0.925);
    this.graphics.fillStyle(this.currentColor(), 1);
    this.graphics.fillRect(leftX, topY, splitSizeX - 1 * VH, h * 0.075 - 2 * VH);
    this.goalText = this.add.text(w - splitSizeX / 2, h * (0.955), this.goalId, {
      fontFamily: 'Arial',
      fontSize: splitSizeX * 0.2,
      color: '#000000',
    }).setShadow(2, 2, '#ffffff', 2, false, true);
    this.goalText.setOrigin(0.5);
    this.add.tween({
      targets: [this.goalText],
      scale: 1.5,
      ease: 'Bounce.easeOut',
      duration: 1000,
      repeatDelay: 1000,
      repeat: -1,
      yoyo: true,
    });
  }

  paintProgressForPlayer (numPlayer, playerGoal) {
    const h = this.cameras.main.height;
    const w = this.cameras.main.width;
    const VH = h / 100;
    const splitSizeX = w * 0.25;
    const leftX = w - splitSizeX;
    const topYAll = h * (0.85) + 2 * VH;
    const height = (((0.925 - 0.85) * h) - 2 * VH) / 4;
    const topYPlayer = topYAll + (height) * numPlayer;
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(leftX, topYPlayer, (splitSizeX - 1 * VH), height);
    this.graphics.fillStyle(PLAYERS_COLORS[numPlayer], 0.4);
    this.graphics.fillRect(leftX, topYPlayer, (splitSizeX - 1 * VH), height);

    if (playerGoal) {
      const currentProgress = playerGoal / this.totalGoal;
      this.graphics.fillStyle(PLAYERS_COLORS[numPlayer], 1);
      this.graphics.fillRect(leftX, topYPlayer, (splitSizeX - 1 * VH) * currentProgress, height);
    }
  }

  paintProgress () {
    for (let i = 0; i < 4; i++) {
      const player = this.sortedPlayers[i];
      this.paintProgressForPlayer(i, player && player.id && this.playersGoals ? this.playersGoals[player.id] : null);
    }
  }

  updateGoals ({ goals }) {
    this.playersGoals = goals;
    this.paintProgress();
  }

  updateGoal () {
    this.goalText.setText(this.goalId);
    this.paintProgress();
  }

  checkEnd () {
    if (this.goalId > this.totalGoal) {
      this.onFinish(this.getTotalSeconds());
    }
  }

  startTimer () {
    this.startDate = new Date();
  }

  getTotalSeconds () {
    const endDate = new Date();
    const diff = endDate.getTime() - this.startDate.getTime();
    return Math.round(diff / 1000);
  }

  checkCombo () {
    const comboTimes = this.combo.checkCombo();
    if (comboTimes > 0) {
      this.showCombo(comboTimes);
    }
  }

  showCombo (number) {
    const comboText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, `COMBO\nx${number}`, {
      font: '4vh monospace',
      fill: '#000000',
      align: 'center',
      stroke: '#ffffff',
      strokeThickness: 10,
    });
    comboText.setOrigin(0.5);
    this.add.tween({
      targets: comboText,
      alpha: 0,
      start: { scale: 0 },
      scale: 10,
      duration: 1500,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });
    this.sound.add(COMBO_THEME, {
      volume: 1,
      loop: false,
    }).play();
  }
}

export default PlayingScene;
