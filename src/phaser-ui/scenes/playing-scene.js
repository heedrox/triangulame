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

// Neon palette (cian, magenta, lima, amarillo)
const NEON_PALETTE = [0x00f5ff, 0xff0080, 0x39ff14, 0xffff00];

const djb2 = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    hash &= 0xffffffff; // force 32-bit
  }
  return Math.abs(hash);
};

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

    // Deterministic offset based on total rectangles
    this.neonOffset = djb2(String(this.totalGoal)) % NEON_PALETTE.length;

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
    this.addCyberBackground();
    this.addFloatingParticles();
    this.graphics = this.buildGraphics();

    this.paintScreen();

    this.input.on('pointerdown', (pointer) => {
      this.checkRectanglePressed(pointer);
    });

    this.playMusic();
  }

  addCyberBackground () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Create grid texture (50x50 px with 1px lines)
    const gridSize = 50;
    const gridGfx = this.make.graphics({ x: 0, y: 0, add: false });
    gridGfx.fillStyle(0x0f0f23, 1);
    gridGfx.fillRect(0, 0, gridSize, gridSize);
    gridGfx.lineStyle(1, 0x00f5ff, 0.12);
    // horizontal line
    gridGfx.beginPath();
    gridGfx.moveTo(0, 0.5);
    gridGfx.lineTo(gridSize, 0.5);
    gridGfx.strokePath();
    // vertical line
    gridGfx.beginPath();
    gridGfx.moveTo(0.5, 0);
    gridGfx.lineTo(0.5, gridSize);
    gridGfx.strokePath();
    gridGfx.generateTexture('neon-grid', gridSize, gridSize);
    gridGfx.destroy();

    // TileSprite grid
    this.grid = this.add.tileSprite(0, 0, w, h, 'neon-grid').setOrigin(0, 0);
    this.grid.setScrollFactor(0, 0);
    this.grid.setDepth(-10);

    // Radial/linear background approximation using semi-transparent overlays
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, w, h);
    bg.fillStyle(0x00f5ff, 0.05);
    bg.fillRect(0, 0, w * 0.6, h * 0.6);
    bg.fillStyle(0xff0080, 0.05);
    bg.fillRect(w * 0.4, 0, w * 0.6, h * 0.4);
    bg.fillStyle(0x39ff14, 0.05);
    bg.fillRect(0, h * 0.5, w * 0.5, h * 0.5);
    bg.setDepth(-9);

    // Vignette borders
    const vignette = this.add.graphics();
    const edge = Math.max(20, Math.round(Math.min(w, h) * 0.035));
    vignette.fillStyle(0x000000, 0.35);
    // top
    vignette.fillRect(0, 0, w, edge);
    // bottom
    vignette.fillRect(0, h - edge, w, edge);
    // left
    vignette.fillRect(0, 0, edge, h);
    // right
    vignette.fillRect(w - edge, 0, edge, h);
    vignette.setDepth(-8);
  }

  addFloatingParticles () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Create tiny white dot texture if not exists
    if (!this.textures.exists('particle-dot')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(2, 2, 2);
      g.generateTexture('particle-dot', 4, 4);
      g.destroy();
    }

    const colors = [0x00f5ff, 0xff0080, 0x39ff14, 0xffff00];
    const isMobile = !!window.navigator.userAgent.match(/Mobile|Android|iPhone/i);
    const maxPerTick = isMobile ? 1 : 2;
    const delayMs = isMobile ? 260 : 180;
    const spawnOne = () => {
      const x = Math.random() * w;
      const tint = colors[(Math.random() * colors.length) | 0];
      const sprite = this.add.image(x, -10, 'particle-dot');
      sprite.setDepth(-5);
      sprite.setTint(tint);
      sprite.setAlpha(0.5);
      const driftX = (Math.random() - 0.5) * (isMobile ? 14 : 24);
      // 30% rápidas (~1-1.4s), resto más largas
      const fast = Math.random() < 0.3;
      const duration = fast
        ? (isMobile ? 1000 : 900) + Math.random() * (isMobile ? 500 : 500)
        : (isMobile ? 3800 : 4400) + Math.random() * (isMobile ? 1800 : 2600);
      this.tweens.add({
        targets: sprite,
        x: x + driftX,
        y: h + 10,
        alpha: 0,
        duration,
        ease: 'Sine.easeInOut',
        onComplete: () => sprite.destroy(),
      });
    };

    this.particleTimer = this.time.addEvent({
      delay: delayMs,
      loop: true,
      callback: () => {
        const count = 1 + (Math.random() < 0.3 ? (maxPerTick - 1) : 0);
        for (let i = 0; i < count; i++) spawnOne();
      },
    });
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
      if (this.particleTimer) {
        this.particleTimer.remove(false);
        this.particleTimer = null;
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
    // Compute neon color deterministically per rectangle id
    const colorIndex = (rectangle.id + this.neonOffset) % NEON_PALETTE.length;
    const neonColor = NEON_PALETTE[colorIndex];

    // Fill pass (solid neon, higher opacity)
    this.graphics.fillStyle(neonColor, 0.7);
    this.graphics.beginPath();
    this.graphics.moveTo(rectangle.p0.x * this.xFactor, rectangle.p0.y * this.yFactor);
    this.graphics.lineTo(rectangle.p1.x * this.xFactor, rectangle.p1.y * this.yFactor);
    this.graphics.lineTo(rectangle.p3.x * this.xFactor, rectangle.p3.y * this.yFactor);
    this.graphics.lineTo(rectangle.p2.x * this.xFactor, rectangle.p2.y * this.yFactor);
    this.graphics.closePath();
    this.graphics.fillPath();

    // Glow pass (thicker, stronger neon)
    const glowWidth = Math.round(this.cameras.main.width / 70);
    this.graphics.lineStyle(glowWidth, neonColor, 0.65);
    this.graphics.beginPath();
    this.graphics.moveTo(rectangle.p0.x * this.xFactor, rectangle.p0.y * this.yFactor);
    this.graphics.lineTo(rectangle.p1.x * this.xFactor, rectangle.p1.y * this.yFactor);
    this.graphics.lineTo(rectangle.p3.x * this.xFactor, rectangle.p3.y * this.yFactor);
    this.graphics.lineTo(rectangle.p2.x * this.xFactor, rectangle.p2.y * this.yFactor);
    this.graphics.closePath();
    this.graphics.strokePath();

    // Core neon pass (thin, sharp neon outline)
    const coreWidth = Math.round(this.cameras.main.width / 120);
    this.graphics.lineStyle(coreWidth, neonColor, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(rectangle.p0.x * this.xFactor, rectangle.p0.y * this.yFactor);
    this.graphics.lineTo(rectangle.p1.x * this.xFactor, rectangle.p1.y * this.yFactor);
    this.graphics.lineTo(rectangle.p3.x * this.xFactor, rectangle.p3.y * this.yFactor);
    this.graphics.lineTo(rectangle.p2.x * this.xFactor, rectangle.p2.y * this.yFactor);
    this.graphics.closePath();
    this.graphics.strokePath();

    // (vibración desactivada)
  }

  addTextToRectangle (rectangle) {
    const textPosition = getTextPosition(rectangle, this.xFactor, this.yFactor);
    const colorIndex = (rectangle.id + this.neonOffset) % NEON_PALETTE.length;
    const neonColor = NEON_PALETTE[colorIndex];
    // Back glow text to add subtle neon halo while keeping number dark
    const glowText = this.add.text(textPosition.x, textPosition.y, rectangle.id, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '25vw',
      color: '#ffffff',
      stroke: `#${neonColor.toString(16).padStart(6, '0')}`,
      strokeThickness: 14,
      align: 'center',
    });
    glowText.setOrigin(0.5);
    glowText.setAlpha(0.4);
    glowText.setScale(1.02, 1.02);

    const text = this.add.text(textPosition.x, textPosition.y, rectangle.id, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '25vw',
      color: '#0a0a0a',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    });
    text.setOrigin(0.5);
    // Dark number with a neon halo behind
    const textStretch = getStretch(text.getBounds(), rectangle, this.xFactor, this.yFactor);
    text.setScale(textStretch.x, textStretch.y);
    glowText.setScale(textStretch.x * 1.02, textStretch.y * 1.02);

    // Pulse effect for numbers (subtle)
    const baseX = textStretch.x;
    const baseY = textStretch.y;
    const delay = Math.random() * 800;
    this.add.tween({
      targets: text,
      scaleX: baseX * 1.02,
      scaleY: baseY * 1.02,
      duration: 1600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay,
    });
    this.add.tween({
      targets: glowText,
      scaleX: baseX * 1.06,
      scaleY: baseY * 1.06,
      alpha: 0.6,
      duration: 1600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay,
    });
    text.setData('glowText', glowText);
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
    // Match neon color to the rectangle id shown in text
    const rectId = Number(text.text);
    const colorIndex = (rectId + this.neonOffset) % NEON_PALETTE.length;
    const neonColor = NEON_PALETTE[colorIndex];

    const poly = new Phaser.GameObjects.Polygon(
      this,
      0,
      0,
      polygon.points,
      neonColor,
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
      neonColor,
      1,
    );
    const bounds2 = newPoly.getBounds();
    newPoly.setOrigin(0.5);
    newPoly.setX(newPoly.x + bounds2.width / 2);
    newPoly.setY(newPoly.y + bounds2.height / 2);
    this.add.existing(newPoly);
    this.graphics.fillStyle(0x000000);
    this.graphics.fillPoints(polygon.points, true);
    // Asegurar que no queden tweens de "pulso" activos sobre los textos
    const glowText = text.getData && text.getData('glowText');
    this.tweens.killTweensOf(text);
    if (glowText) this.tweens.killTweensOf(glowText);

    text.setDepth(1);
    const targets = glowText ? [newPoly, text, glowText] : [newPoly, text];

    // Animación de salida y destrucción segura de los objetos
    this.tweens.add({
      targets,
      angle: 360 * 3 * COMBO_SECS,
      ease: 'Linear',
      duration: COMBO_SECS * 1000,
      repeat: 0,
      scale: 0,
      onComplete: () => {
        // Destruir objetos para evitar restos visuales y consumo innecesario
        if (glowText && glowText.destroy) glowText.destroy();
        if (text && text.destroy) text.destroy();
        if (newPoly && newPoly.destroy) newPoly.destroy();
      },
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
    this.graphics.fillStyle(this.currentColor(), 0.85);
    this.graphics.fillRect(leftX, topY, splitSizeX - 1 * VH, h * 0.075 - 2 * VH);
    // subtle glow border
    this.graphics.lineStyle(Math.round(this.cameras.main.width / 200), 0x00f5ff, 0.5);
    this.graphics.strokeRect(leftX, topY, splitSizeX - 1 * VH, h * 0.075 - 2 * VH);
    this.goalText = this.add.text(w - splitSizeX / 2, h * (0.955), this.goalId, {
      fontFamily: 'Orbitron, monospace',
      fontSize: splitSizeX * 0.2,
      color: '#ffffff',
      stroke: '#00f5ff',
      strokeThickness: 6,
      align: 'center',
    });
    this.goalText.setShadow(0, 0, '#ffffff', 6, false, true);
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
      fontFamily: 'Orbitron, monospace',
      fontSize: '6vh',
      color: '#ffffff',
      align: 'center',
      stroke: '#ff0080',
      strokeThickness: 10,
    });
    comboText.setOrigin(0.5);
    comboText.setShadow(0, 0, '#ffffff', 10, false, true);
    this.add.tween({
      targets: comboText,
      alpha: 0,
      start: { scale: 0 },
      scale: 10,
      duration: 1500,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });
    this.cameras.main.shake(120, 0.002);
    this.sound.add(COMBO_THEME, {
      volume: 1,
      loop: false,
    }).play();
  }

  update () {
    // Fondo fijo: no mover grid
  }
}

export default PlayingScene;
