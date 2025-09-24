import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';
import fullscreen from '../../assets/welcome/fullscreen.png';

class JoinScene extends Phaser.Scene {
  constructor (i18n) {
    super({
      key: SCENE_KEYS.JOIN_SCENE,
    });
    this.i18n = i18n;
    this.form = null;
  }

  init (data) {
    this.oncomplete = data.oncomplete;
    this.previousName = data.previousName;
    this.previousRoom = data.previousRoom;
    this.checkValidity = data.checkValidity;
  }

  preload () {
    this.load.image('fullscreen', fullscreen);
  }

  create() {
    this.createCyberBackground();
    this.form = this.addForm();
    this.addStartButton();
    // this.addFullScreenButton();
  }

  createCyberBackground() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.createGradientBackground(w, h);
    this.createRadialGlows(w, h);
    this.createAnimatedGrid(w, h);
    this.createFloatingParticles(w, h);
  }

  createGradientBackground(w, h) {
    const backgroundGraphics = this.add.graphics();
    backgroundGraphics.fillGradientStyle(0x0f0f23, 0x0f0f23, 0x16213e, 0x1a1a2e, 1);
    backgroundGraphics.fillRect(0, 0, w, h);

    const overlayGraphics = this.add.graphics();
    overlayGraphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f0f23, 0x1a1a2e, 0.7);
    overlayGraphics.fillRect(0, 0, w, h);
    overlayGraphics.setBlendMode(Phaser.BlendModes.OVERLAY);
  }

  createRadialGlows(w, h) {
    this.drawTriangleGlow(w * 0.2, h * 0.5, w * 0.2, 0, 0x00f5ff);
    this.drawTriangleGlow(w * 0.8, h * 0.2, w * 0.15, Math.PI / 3, 0xff0080);
    this.drawTriangleGlow(w * 0.4, h * 0.8, w * 0.18, -Math.PI / 4, 0x39ff14);
  }

  drawTriangleGlow(centerX, centerY, size, rotation, color) {
    const numLayers = 6;
    for (let i = 0; i < numLayers; i++) {
      const graphics = this.add.graphics();
      const layerSize = size * (1 + i * 0.4);
      const layerAlpha = 0.3 - (i * 0.04);
      graphics.fillStyle(color, layerAlpha);
      graphics.setBlendMode(Phaser.BlendModes.ADD);
      const angle1 = rotation;
      const angle2 = rotation + (2 * Math.PI / 3);
      const angle3 = rotation + (4 * Math.PI / 3);
      const x1 = centerX + Math.cos(angle1) * layerSize;
      const y1 = centerY + Math.sin(angle1) * layerSize;
      const x2 = centerX + Math.cos(angle2) * layerSize;
      const y2 = centerY + Math.sin(angle2) * layerSize;
      const x3 = centerX + Math.cos(angle3) * layerSize;
      const y3 = centerY + Math.sin(angle3) * layerSize;
      graphics.beginPath();
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
      graphics.lineTo(x3, y3);
      graphics.closePath();
      graphics.fillPath();
    }
  }

  createAnimatedGrid(w, h) {
    const gridSize = 50;
    const texKey = `grid-${gridSize}`;
    if (!this.textures.exists(texKey)) {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      const tile = 256;
      gfx.clear();
      gfx.lineStyle(1, 0x00f5ff, 0.1);
      for (let x = 0; x <= tile; x += gridSize) { gfx.lineBetween(x, 0, x, tile); }
      for (let y = 0; y <= tile; y += gridSize) { gfx.lineBetween(0, y, tile, y); }
      gfx.generateTexture(texKey, tile, tile);
      gfx.destroy();
    }
    const tileSprite = this.add.tileSprite(0, 0, w + gridSize, h + gridSize, texKey).setOrigin(0, 0);
    this.gridTileSprite = tileSprite;
  }

  createFloatingParticles(w, h) {
    const colors = [0x00f5ff, 0xff0080, 0x39ff14, 0xffff00];
    const particles = [];
    const isMobile = !!window.navigator.userAgent.match(/Mobile|Android|iPhone/i);
    const count = isMobile ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const g = this.add.graphics();
      const color = colors[i % colors.length];
      const size = Phaser.Math.Between(2, 4);
      g.fillStyle(color, 0.8);
      g.beginPath();
      g.moveTo(0, -size);
      g.lineTo(-size, size);
      g.lineTo(size, size);
      g.closePath();
      g.fillPath();
      const speed = Phaser.Math.FloatBetween(isMobile ? 30 : 40, isMobile ? 55 : 70);
      const rotationSpeed = Phaser.Math.FloatBetween(0.3, 0.6);
      const startDelay = Phaser.Math.Between(0, 1500);
      const particle = { node: g, speed, rotationSpeed, alive: false, startDelay };
      particles.push(particle);
    }
    this.particles = particles;
    this.particles.forEach((p) => { this.time.delayedCall(p.startDelay, () => { this.resetParticle(p, w, h); }); });
  }

  resetParticle(p, w, h) {
    p.node.x = Phaser.Math.Between(0, w);
    p.node.y = h + 50;
    p.node.alpha = 0;
    p.node.rotation = 0;
    const isMobile = !!window.navigator.userAgent.match(/Mobile|Android|iPhone/i);
    const fastChance = 0.3;
    let durationMs;
    if (Math.random() < fastChance) { durationMs = Phaser.Math.Between(isMobile ? 1000 : 900, isMobile ? 1500 : 1400); }
    else { durationMs = Phaser.Math.Between(isMobile ? 3200 : 2800, isMobile ? 7000 : 6000); }
    const distance = h + 100;
    p.speed = distance / (durationMs / 1000);
    p.alive = true;
  }

  update(time, delta) {
    if (this.particles && this.particles.length) {
      const h = this.cameras.main.height;
      this.particles.forEach((p) => {
        if (!p.alive) return;
        const dy = (p.speed * (delta || 16)) / 1000;
        p.node.y -= dy;
        if (p.node.alpha < 1) { p.node.alpha = Math.min(1, p.node.alpha + 0.02); }
        p.node.rotation += p.rotationSpeed * ((delta || 16) / 1000);
        if (p.node.y < -50) { this.resetParticle(p, this.cameras.main.width, h); }
      });
    }
  }

  addForm() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const formHtml = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .cyber-form { font-family: 'Orbitron', 'Courier New', monospace; text-align: center; position: relative; height: 100%; overflow-y: auto; padding-bottom: 120px; }
        .cyber-title { font-size: 6vw; font-weight: 900; text-align: center; margin-bottom: 4vh; margin-top: 2vh; color: #00f5ff; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 5px #000,0 0 10px #000,0 0 15px #000,0 0 20px #000,0 0 10px #00f5ff,0 0 20px #00f5ff,0 0 30px #00f5ff,0 0 40px #00f5ff; }
        .form-group { margin-bottom: 3vh; position: relative; }
        .form-label { display: block; font-size: 4.5vw; font-weight: 700; margin-bottom: 2vh; color: #39ff14; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 3px #000,0 0 6px #000,0 0 10px #000,0 0 15px #000,0 0 5px #39ff14,0 0 10px #39ff14,0 0 15px #39ff14,0 0 20px #39ff14; }
        .input-container { position: relative; background: linear-gradient(45deg, #00f5ff, #ff0080, #39ff14, #ffff00); padding: 3px; border-radius: 12px; box-shadow: 0 0 20px rgba(0, 245, 255, 0.3); margin: 0 auto; width: 70%; }
        .cyber-input { width: 100%; padding: 3vw; font-size: 5vw; font-family: 'Orbitron', monospace; font-weight: 700; background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95)); border: none; border-radius: 9px; color: #00f5ff; text-align: center; box-shadow: 0 0 25px rgba(0, 245, 255, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.7); box-sizing: border-box; }
        .form-info { font-size: 3vw; color: #39ff14; margin-top: 3vh; text-align: center; font-style: italic; line-height: 1.4; background: rgba(0, 0, 0, 0.8); padding: 2vh; border-radius: 8px; border: 1px solid rgba(57, 255, 20, 0.2); box-shadow: 0 0 10px rgba(57, 255, 20, 0.1); width: 85%; margin-left: auto; margin-right: auto; }
        </style>
        <div class="cyber-form">
            <h1 class="cyber-title">TRIANGLES</h1>
            <div class="form-group">
                <label class="form-label">Gamertag:</label>
                <div class="input-container">
                    <input type="text" class="cyber-input" autocomplete="off" placeholder="${this.i18n.get('name')}" id="name">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Sala de batalla:</label>
                <div class="input-container">
                    <input type="text" class="cyber-input" autocomplete="off" placeholder="${this.i18n.get('room')}" id="room" maxlength="12">
                </div>
                <div class="form-info">${this.i18n.get('room-info')}</div>
            </div>
        </div>`;

    this.form = this.add.dom(w / 2, h / 2 - 40).createFromHTML(formHtml, 'form');
    this.form.setVisible(true);
    this.form.setDepth(1);
    this.form.setOrigin(0.5, 0.5);
    this.form.setAlpha(0);
    this.add.tween({ targets: this.form, alpha: 1, duration: 1000, ease: 'Power2' });
    if (this.previousName) this.form.getChildByID('name').value = this.previousName;
    if (this.previousRoom) this.form.getChildByID('room').value = this.previousRoom;

    const roomInput = this.form.getChildByID('room');
    if (roomInput) {
      const sanitize = (value) => value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 12);
      roomInput.value = sanitize(roomInput.value || '');
      roomInput.addEventListener('input', (e) => {
        const target = e.target;
        const start = target.selectionStart;
        const before = target.value;
        const after = sanitize(before);
        if (before !== after) {
          target.value = after;
          const newPos = Math.min(after.length, (start || after.length));
          try { target.setSelectionRange(newPos, newPos); } catch (_) {}
        }
      });
    }
    return this.form;
  }

  addFullScreenButton () {
    if (!this.scale.isFullscreen) {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      const image = this.add
        .image(w - (w / 15), (h / 20), 'fullscreen')
        .setDisplaySize(w / 10, w / 10)
        .setInteractive()
        .on('pointerdown', this.setFullScreen, this);
      this.add.tween({ targets: [image], scale: image.scale + 0.1, ease: 'Sine.easeInOut', duration: 1000, repeatDelay: 1000, repeat: -1, yoyo: true });
    }
  }

  setFullScreen () {
    if (!this.scale.isFullscreen) {
      try { this.scale.startFullscreen(); setTimeout(() => this.scene.restart(), 1000); } catch (e) { console.error(e); }
    }
  }

  addStartButton () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const buttonHtml = `
        <style>
        .cyber-footer-button { background: linear-gradient(45deg, #ff0080, #00f5ff); border: none; padding: 20px; font-size: 5vw; font-family: 'Orbitron', monospace; font-weight: 900; color: #000; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 2px; overflow: hidden; border-radius: 8px; box-shadow: 0 0 30px rgba(0, 245, 255, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3); width: 90vw; max-width: 500px; }
        </style>
        <button class="cyber-footer-button" id="startButton">${this.i18n.get('start')}</button>`;
    this.startButtonElement = this.add.dom(w / 2, h - 60).createFromHTML(buttonHtml);
    this.startButtonElement.setOrigin(0.5, 0.5);
    this.startButtonElement.setDepth(100);
    this.startButtonElement.addListener('click');
    this.startButtonElement.on('click', (event) => { if (event.target.id === 'startButton') { this.clickStart(); } });
  }

  async clickStart () {
    const name = this.form.getChildByID('name').value.trim();
    const room = this.form.getChildByID('room').value.trim().toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 12);
    if (name !== '' && room !== '') {
      const isValid = await this.checkValidity(room);
      if (isValid) {
        this.scene.stop();
        this.oncomplete({ name, room });
      } else {
        this.showRoomNotAvailable();
      }
    }
  }

  showRoomNotAvailable () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const errorHtml = `
        <style>
        .cyber-error { font-family: 'Orbitron', 'Courier New', monospace; font-size: 4vw; font-weight: 700; color: #ff0080; text-align: center; text-transform: uppercase; letter-spacing: 1px; background: rgba(0, 0, 0, 0.9); padding: 3vh; border-radius: 8px; border: 2px solid #ff0080; box-shadow: 0 0 30px rgba(255, 0, 128, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.7); }
        </style>
        <div class="cyber-error">🚫 SALA NO DISPONIBLE<br>INTENTA CON OTRA</div>`;
    const errorElement = this.add.dom(w / 2, h + 100).createFromHTML(errorHtml);
    errorElement.setOrigin(0.5, 0.5);
    errorElement.setDepth(2);
    this.add.tween({ targets: [errorElement], duration: 1000, y: h * 0.75, ease: 'Power2' });
    this.add.tween({ targets: [errorElement], duration: 2000, delay: 2000, alpha: 0, ease: 'Power2', onComplete: () => { errorElement.destroy(); } });
  }
}

export default JoinScene;


