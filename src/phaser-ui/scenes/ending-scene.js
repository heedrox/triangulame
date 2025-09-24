import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';

const ENDING_GAME_NUMBER = 10;

class EndingScene extends Phaser.Scene {
  constructor (i18n) {
    super(SCENE_KEYS.ENDING_SCENE);
    this.i18n = i18n;
  }

  init (data) {
    this.game = data.game;
    this.onRestart = data.onRestart;
    this.onEnd = data.onEnd;
  }

  create () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    // Crear fondo cyberpunk
    this.createCyberBackground();
    
    // Añadir elementos con animaciones escalonadas
    this.time.delayedCall(200, () => this.addWinner(w, h));
    this.time.delayedCall(400, () => this.addSummary(w, h));
    this.time.delayedCall(800, () => {
      if (this.game.numGame < ENDING_GAME_NUMBER) {
        this.addRestartButton(w, h);
      } else {
        this.addEndButton(w, h);
      }
    });
  }

  createCyberBackground() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Create base background with simulated gradient
    this.createGradientBackground(w, h);

    // Add radial gradient spots for neon effect
    this.createRadialGlows(w, h);

    // Create animated grid
    this.createAnimatedGrid(w, h);

    // Create floating particles
    this.createFloatingParticles(w, h);
  }

  createGradientBackground(w, h) {
    // Create a simpler gradient background using fillGradientStyle
    const backgroundGraphics = this.add.graphics();
    
    // Use Phaser's built-in gradient support
    backgroundGraphics.fillGradientStyle(0x0f0f23, 0x0f0f23, 0x16213e, 0x1a1a2e, 1);
    backgroundGraphics.fillRect(0, 0, w, h);

    // Add a second layer for more depth
    const overlayGraphics = this.add.graphics();
    overlayGraphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f0f23, 0x1a1a2e, 0.7);
    overlayGraphics.fillRect(0, 0, w, h);
    overlayGraphics.setBlendMode(Phaser.BlendModes.OVERLAY);
  }

  createRadialGlows(w, h) {
    // Cyan triangle glow at 20% 50%
    this.drawTriangleGlow(w * 0.2, h * 0.5, w * 0.2, 0, 0x00f5ff);

    // Magenta triangle glow at 80% 20% (rotated)
    this.drawTriangleGlow(w * 0.8, h * 0.2, w * 0.15, Math.PI / 3, 0xff0080);

    // Green triangle glow at 40% 80% (different rotation)
    this.drawTriangleGlow(w * 0.4, h * 0.8, w * 0.18, -Math.PI / 4, 0x39ff14);
  }

  drawTriangleGlow(centerX, centerY, size, rotation, color) {
    // Create multiple triangle layers for glow effect
    const numLayers = 6;
    
    for (let i = 0; i < numLayers; i++) {
      const graphics = this.add.graphics();
      const layerSize = size * (1 + i * 0.4);
      const layerAlpha = 0.3 - (i * 0.04); // Start with higher alpha
      
      graphics.fillStyle(color, layerAlpha);
      graphics.setBlendMode(Phaser.BlendModes.ADD);
      
      // Calculate triangle points
      const angle1 = rotation;
      const angle2 = rotation + (2 * Math.PI / 3);
      const angle3 = rotation + (4 * Math.PI / 3);
      
      const x1 = centerX + Math.cos(angle1) * layerSize;
      const y1 = centerY + Math.sin(angle1) * layerSize;
      const x2 = centerX + Math.cos(angle2) * layerSize;
      const y2 = centerY + Math.sin(angle2) * layerSize;
      const x3 = centerX + Math.cos(angle3) * layerSize;
      const y3 = centerY + Math.sin(angle3) * layerSize;
      
      // Draw triangle
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
      for (let x = 0; x <= tile; x += gridSize) {
        gfx.lineBetween(x, 0, x, tile);
      }
      for (let y = 0; y <= tile; y += gridSize) {
        gfx.lineBetween(0, y, tile, y);
      }
      gfx.generateTexture(texKey, tile, tile);
      gfx.destroy();
    }
    const tileSprite = this.add.tileSprite(0, 0, w + gridSize, h + gridSize, texKey).setOrigin(0, 0);
    this.gridTileSprite = tileSprite;
  }

  createFloatingParticles(w, h) {
    const colors = [0x00f5ff, 0xff0080, 0x39ff14, 0xffff00];
    const particles = [];
    const count = window.navigator.userAgent.match(/Mobile|Android|iPhone/i) ? 6 : 12;

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

      const speed = Phaser.Math.FloatBetween(20, 40);
      const rotationSpeed = Phaser.Math.FloatBetween(0.3, 0.6);
      const startDelay = Phaser.Math.Between(0, 1500);

      const particle = { node: g, speed, rotationSpeed, alive: false, startDelay };
      particles.push(particle);
    }

    this.particles = particles;
    this.particles.forEach((p) => {
      this.time.delayedCall(p.startDelay, () => this.resetParticle(p, w, h));
    });
  }

  resetParticle(p, w, h) {
    p.node.x = Phaser.Math.Between(0, w);
    p.node.y = h + 50;
    p.node.alpha = 0;
    p.node.rotation = 0;
    p.alive = true;
  }

  update(time, delta) {
    // Fondo fijo: no mover grid
    if (this.particles && this.particles.length) {
      const h = this.cameras.main.height;
      this.particles.forEach((p) => {
        if (!p.alive) return;
        const dy = (p.speed * (delta || 16)) / 1000;
        p.node.y -= dy;
        if (p.node.alpha < 1) p.node.alpha = Math.min(1, p.node.alpha + 0.02);
        p.node.rotation += p.rotationSpeed * ((delta || 16) / 1000);
        if (p.node.y < -50) this.resetParticle(p, this.cameras.main.width, h);
      });
    }
  }

  addRestartButton (w, h) {
    // Create cyberpunk restart button using DOM element
    const restartButtonHtml = `
        <style>
        .cyber-restart-button {
            background: linear-gradient(45deg, #ff0080, #00f5ff);
            border: none;
            padding: 20px;
            font-size: 5vw;
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            color: #000;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 
                0 0 30px rgba(0, 245, 255, 0.5),
                0 5px 15px rgba(0, 0, 0, 0.3);
            width: 90vw;
            max-width: 500px;
            position: relative;
        }
        
        .cyber-restart-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .cyber-restart-button:hover::before {
            left: 100%;
        }
        
        .cyber-restart-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
                0 0 50px rgba(0, 245, 255, 0.8),
                0 10px 25px rgba(0, 0, 0, 0.5);
        }
        
        .cyber-restart-button:active {
            transform: translateY(0) scale(0.98);
        }
        
        @media (max-width: 768px) {
            .cyber-restart-button {
                font-size: 6vw;
                padding: 18px;
            }
        }
        
        @media (max-height: 600px) {
            .cyber-restart-button {
                font-size: 4vw;
                padding: 15px;
            }
        }
        </style>
        
        <button class="cyber-restart-button" id="cyberRestartButton">
            🔄 CONTINUAR MATCH
        </button>`;

    const restartButtonElement = this.add.dom(w / 2, 3 / 4 * h).createFromHTML(restartButtonHtml);
    restartButtonElement.setOrigin(0.5, 0.5);
    restartButtonElement.setDepth(100);
    restartButtonElement.setAlpha(0);
    restartButtonElement.setScale(0.8);

    // Add click event
    restartButtonElement.addListener('click');
    restartButtonElement.on('click', (event) => {
      if (event.target.id === 'cyberRestartButton') {
        this.scene.stop();
        this.onRestart();
      }
    });

    // Animate entrance
    this.add.tween({
      targets: restartButtonElement,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });
  }

  addEndButton (w, h) {
    // Create cyberpunk end button using DOM element
    const endButtonHtml = `
        <style>
        .cyber-end-button {
            background: linear-gradient(45deg, #ff3300, #ff6600);
            border: none;
            padding: 20px;
            font-size: 5vw;
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 
                0 0 30px rgba(255, 51, 0, 0.5),
                0 5px 15px rgba(0, 0, 0, 0.3);
            width: 90vw;
            max-width: 500px;
            position: relative;
            text-shadow: 0 0 5px #000;
        }
        
        .cyber-end-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .cyber-end-button:hover::before {
            left: 100%;
        }
        
        .cyber-end-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
                0 0 50px rgba(255, 51, 0, 0.8),
                0 10px 25px rgba(0, 0, 0, 0.5);
            background: linear-gradient(45deg, #ff4400, #ff7700);
        }
        
        .cyber-end-button:active {
            transform: translateY(0) scale(0.98);
        }
        
        @media (max-width: 768px) {
            .cyber-end-button {
                font-size: 6vw;
                padding: 18px;
            }
        }
        
        @media (max-height: 600px) {
            .cyber-end-button {
                font-size: 4vw;
                padding: 15px;
            }
        }
        </style>
        
        <button class="cyber-end-button" id="cyberEndButton">
            🏁 TERMINAR PARTIDA
        </button>`;

    const endButtonElement = this.add.dom(w / 2, 3 / 4 * h).createFromHTML(endButtonHtml);
    endButtonElement.setOrigin(0.5, 0.5);
    endButtonElement.setDepth(100);
    endButtonElement.setAlpha(0);
    endButtonElement.setScale(0.8);

    // Add click event
    endButtonElement.addListener('click');
    endButtonElement.on('click', async (event) => {
      if (event.target.id === 'cyberEndButton') {
        this.scene.stop();
        await this.onEnd();
        window.location.reload();
      }
    });

    // Animate entrance
    this.add.tween({
      targets: endButtonElement,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });
  }

  addWinner (w, h) {
    // Create cyberpunk winner text using DOM element
    const winnerHtml = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .cyber-winner {
            font-family: 'Orbitron', 'Courier New', monospace;
            font-size: 6vw;
            font-weight: 900;
            color: #ffff00;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 3px;
            line-height: 1.2;
            text-shadow: 
                0 0 5px #000,
                0 0 10px #000,
                0 0 15px #000,
                0 0 20px #000,
                0 0 10px #ffff00,
                0 0 20px #ffff00,
                0 0 30px #ffff00,
                0 0 40px #ffff00;
            animation: winnerGlow 2s ease-in-out infinite alternate;
            background: rgba(0, 0, 0, 0.8);
            padding: 3vh;
            border-radius: 12px;
            border: 2px solid #ffff00;
            box-shadow: 
                0 0 30px rgba(255, 255, 0, 0.3),
                inset 0 0 20px rgba(0, 0, 0, 0.7);
        }
        
        @keyframes winnerGlow {
            0% { 
                text-shadow: 
                    0 0 5px #000,
                    0 0 10px #000,
                    0 0 15px #000,
                    0 0 20px #000,
                    0 0 10px #ffff00,
                    0 0 20px #ffff00,
                    0 0 30px #ffff00,
                    0 0 40px #ffff00;
                box-shadow: 
                    0 0 30px rgba(255, 255, 0, 0.3),
                    inset 0 0 20px rgba(0, 0, 0, 0.7);
            }
            100% { 
                text-shadow: 
                    0 0 8px #000,
                    0 0 15px #000,
                    0 0 20px #000,
                    0 0 25px #000,
                    0 0 15px #ffff00,
                    0 0 25px #ffff00,
                    0 0 35px #ffff00,
                    0 0 45px #ffff00,
                    0 0 55px #ffff00;
                box-shadow: 
                    0 0 40px rgba(255, 255, 0, 0.6),
                    inset 0 0 20px rgba(0, 0, 0, 0.7);
            }
        }
        
        .winner-name {
            color: #00f5ff;
            font-size: 1.2em;
            margin-top: 1vh;
        }
        
        .winner-time {
            color: #39ff14;
            font-size: 0.8em;
            margin-top: 0.5vh;
            font-weight: 700;
        }
        
        @media (max-width: 768px) {
            .cyber-winner { font-size: 8vw; padding: 2vh; }
        }
        </style>
        
        <div class="cyber-winner">
            🏆 GANADOR
            <div class="winner-name">${this.game.winner.toUpperCase()}</div>
            <div class="winner-time">⏱️ TIEMPO: ${this.game.winnerSecs} s.</div>
        </div>`;

    const winnerElement = this.add.dom(w / 2, h / 3).createFromHTML(winnerHtml);
    winnerElement.setOrigin(0.5, 0.5);
    winnerElement.setDepth(10);
    winnerElement.setAlpha(0);
    winnerElement.setScale(0.8);

    // Animate entrance
    this.add.tween({
      targets: winnerElement,
      alpha: 1,
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut',
    });
  }

  addSummary (w, h) {
    const summary = this.game.getSummary();
    const colors = ['#00f5ff', '#ff0080', '#39ff14', '#ffff00', '#ff6600', '#00cccc', '#6600cc', '#cccc00'];
    
    // Create cyberpunk results summary using DOM element
    const summaryHtml = `
        <style>
        .cyber-summary {
            font-family: 'Orbitron', 'Courier New', monospace;
            text-align: center;
            max-width: 90vw;
            margin: 0 auto;
        }
        
        .summary-title {
            font-size: 4vw;
            font-weight: 900;
            color: #00f5ff;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 3vh;
            text-shadow: 
                0 0 5px #000,
                0 0 10px #000,
                0 0 15px #000,
                0 0 20px #000,
                0 0 10px #00f5ff,
                0 0 20px #00f5ff,
                0 0 30px #00f5ff;
        }
        
        .player-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2vh 3vw;
            margin: 1vh auto;
            border-radius: 12px;
            font-size: 3.5vw;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 
                0 0 2px #000,
                0 0 4px #000;
            border: 2px solid;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            max-width: 80vw;
            transition: all 0.3s ease;
        }
        
        .player-result:hover {
            transform: translateY(-3px) scale(1.02);
        }
        
        .player-name {
            flex: 1;
            text-align: left;
        }
        
        .player-time {
            flex: 1;
            text-align: right;
            font-weight: 900;
        }
        
        .player-result.color-0 {
            background: linear-gradient(135deg, #00f5ff, #0099cc);
            border-color: #00f5ff;
            color: white;
            box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);
        }
        
        .player-result.color-1 {
            background: linear-gradient(135deg, #ff0080, #cc0066);
            border-color: #ff0080;
            color: white;
            box-shadow: 0 0 30px rgba(255, 0, 128, 0.3);
        }
        
        .player-result.color-2 {
            background: linear-gradient(135deg, #39ff14, #2ecc40);
            border-color: #39ff14;
            color: white;
            box-shadow: 0 0 30px rgba(57, 255, 20, 0.3);
        }
        
        .player-result.color-3 {
            background: linear-gradient(135deg, #ffff00, #cccc00);
            border-color: #ffff00;
            color: black;
            box-shadow: 0 0 30px rgba(255, 255, 0, 0.3);
        }
        
        .player-result.color-4 {
            background: linear-gradient(135deg, #ff6600, #cc5500);
            border-color: #ff6600;
            color: white;
            box-shadow: 0 0 30px rgba(255, 102, 0, 0.3);
        }
        
        .player-result.color-5 {
            background: linear-gradient(135deg, #00cccc, #00aaaa);
            border-color: #00cccc;
            color: white;
            box-shadow: 0 0 30px rgba(0, 204, 204, 0.3);
        }
        
        .player-result.color-6 {
            background: linear-gradient(135deg, #6600cc, #5500aa);
            border-color: #6600cc;
            color: white;
            box-shadow: 0 0 30px rgba(102, 0, 204, 0.3);
        }
        
        .player-result.color-7 {
            background: linear-gradient(135deg, #cccc00, #aaaa00);
            border-color: #cccc00;
            color: black;
            box-shadow: 0 0 30px rgba(204, 204, 0, 0.3);
        }
        
        @media (max-width: 768px) {
            .summary-title { font-size: 5vw; }
            .player-result { font-size: 4.5vw; padding: 1.5vh 2vw; }
        }
        </style>
        
        <div class="cyber-summary">
            <div class="summary-title">📊 RANKING</div>
            ${summary.map((s, index) => `
                <div class="player-result color-${index % 8}">
                    <div class="player-name">${s.player.toUpperCase()}</div>
                    <div class="player-time">${s.secs}</div>
                </div>
            `).join('')}
        </div>`;

    const summaryElement = this.add.dom(w / 2, h / 2 + 50).createFromHTML(summaryHtml);
    summaryElement.setOrigin(0.5, 0.5);
    summaryElement.setDepth(10);
    summaryElement.setAlpha(0);
    summaryElement.setScale(0.9);

    // Animate entrance with staggered effect for each player
    this.add.tween({
      targets: summaryElement,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });

    // Add individual card animations with delay
    const playerCards = summaryElement.node.querySelectorAll('.player-result');
    playerCards.forEach((card, index) => {
      const delay = 100 * index;
      setTimeout(() => {
        card.style.animation = 'slideInUp 0.5s ease-out forwards';
      }, delay);
    });

    // Add CSS animation for individual cards
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default EndingScene;
