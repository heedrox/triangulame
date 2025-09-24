import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';
import eventsCenter from '../events-center';
import shareButton from '../../assets/players/share.svg';
import PLAYERS_COLORS from './constants/players-colors';

const IMAGES = {
  SHARE: 'share',
};
class PlayersScene extends Phaser.Scene {
  constructor (i18n) {
    super({
      key: SCENE_KEYS.PLAYERS_SCENE,
    });
    this.i18n = i18n;
    this.eventsCenter = eventsCenter;
    this.texts = [];
    this.sortedPlayers = [];
    this.onClickStart = null;
  }

  init (data) {
    const updatePlayersFn = (eventData) => this.updatePlayers(eventData.players, eventData.myId);
    this.room = data.room;
    this.onClickStart = data.onClickStart;
    this.numGame = data.numGame;
    this.eventsCenter.on('players.updated', updatePlayersFn);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.eventsCenter.off('players.updated', updatePlayersFn);
    });
  }

  preload () {
    this.load.image(IMAGES.SHARE, shareButton);
  }

  create() {
    this.createCyberBackground();
    this.addRoomName();
    this.texts = this.createRectanglesForNames();
    this.addStartButton();
    this.addShareButton();
    this.addNumGame();
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
    this.particles.forEach((p) => this.time.delayedCall(p.startDelay, () => this.resetParticle(p, w, h)));
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

  addRoomName() {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 10;
    
    // Create cyberpunk room name using DOM element
    const roomHtml = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .cyber-room-name {
            font-family: 'Orbitron', 'Courier New', monospace;
            font-size: 6vw;
            font-weight: 900;
            color: #ffff00;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-align: center;
            margin-bottom: 2vh;
            text-shadow: 
                0 0 5px #000,
                0 0 10px #000,
                0 0 15px #000,
                0 0 20px #000,
                0 0 10px #ffff00,
                0 0 20px #ffff00,
                0 0 30px #ffff00,
                0 0 40px #ffff00;
            animation: roomNameGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes roomNameGlow {
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
            }
        }
        
        @media (max-width: 768px) {
            .cyber-room-name { font-size: 10vw; }
        }
        </style>
        
        <div class="cyber-room-name">${this.room}</div>`;

    const roomElement = this.add.dom(x, y).createFromHTML(roomHtml);
    roomElement.setOrigin(0.5, 0.5);
    roomElement.setDepth(10);
  }

  addNumGame () {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 10 + (0.04 * this.cameras.main.height);
    
    // Create cyberpunk game info using DOM element
    const gameInfoHtml = `
        <style>
        .cyber-game-info {
            font-family: 'Orbitron', 'Courier New', monospace;
            font-size: 3.5vw;
            font-weight: 700;
            color: #39ff14;
            text-align: center;
            letter-spacing: 2px;
            margin-bottom: 3vh;
            text-shadow: 
                0 0 3px #000,
                0 0 6px #000,
                0 0 10px #000,
                0 0 15px #000,
                0 0 5px #39ff14,
                0 0 10px #39ff14,
                0 0 15px #39ff14,
                0 0 20px #39ff14;
        }
        
        @media (max-width: 768px) {
            .cyber-game-info { font-size: 5vw; }
        }
        </style>
        
        <div class="cyber-game-info">${this.i18n.get('game-number', { numRectangles: this.numGame * 2 + 12 })}</div>`;

    const gameInfoElement = this.add.dom(x, y).createFromHTML(gameInfoHtml);
    gameInfoElement.setOrigin(0.5, 0.5);
    gameInfoElement.setDepth(10);
  }

  createRectanglesForNames () {
    const texts = [];
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    // Layout en filas (uno por fila) - expandido a 8 jugadores
    const cardWidth = w * 0.8;
    const cardHeight = h * 0.06; // Reducido ligeramente para acomodar más jugadores
    const startY = h * 0.22; // Iniciar un poco más arriba
    const spacing = h * 0.08; // Reducido el espaciado para 8 jugadores
    
    // Guardar dimensiones y posición del slot 8 (índice 7) para el botón INVITAR
    this.cardWidthPx = cardWidth;
    this.cardHeightPx = cardHeight;
    this.inviteSlotX = w / 2;
    this.inviteSlotY = startY + spacing * 7;

    // Crear 8 slots de jugadores
    for (let i = 0; i < 8; i++) {
      texts.push(this.createRectangle(w / 2, startY + spacing * i, cardWidth, cardHeight, i));
    }
    
    return texts;
  }

  createRectangle(x, y, w, h, n) {
    // Create cyberpunk player card using DOM element
    const cardHtml = `
        <style>
        .cyber-player-card {
            position: relative;
            width: ${w}px;
            height: ${h}px;
            padding: 15px 25px;
            border-radius: 12px;
            text-align: center;
            font-size: 3.5vw;
            font-family: 'Orbitron', 'Courier New', monospace;
            font-weight: 700;
            min-height: ${h}px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: white;
            border: 2px solid;
            box-sizing: border-box;
            text-shadow: 
                0 0 2px #000,
                0 0 4px #000;
            margin: 0 auto;
        }

        .cyber-player-card.player-0 {
            background: linear-gradient(135deg, #00f5ff, #0099cc);
            border-color: #00f5ff;
            box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);
        }

        .cyber-player-card.player-1 {
            background: linear-gradient(135deg, #ff0080, #cc0066);
            border-color: #ff0080;
            box-shadow: 0 0 30px rgba(255, 0, 128, 0.3);
        }

        .cyber-player-card.player-2 {
            background: linear-gradient(135deg, #39ff14, #2ecc40);
            border-color: #39ff14;
            box-shadow: 0 0 30px rgba(57, 255, 20, 0.3);
        }

        .cyber-player-card.player-3 {
            background: linear-gradient(135deg, #ffff00, #cccc00);
            border-color: #ffff00;
            box-shadow: 0 0 30px rgba(255, 255, 0, 0.3);
        }

        .cyber-player-card.player-4 {
            background: linear-gradient(135deg, #ff6600, #cc5500);
            border-color: #ff6600;
            box-shadow: 0 0 30px rgba(255, 102, 0, 0.3);
        }

        .cyber-player-card.player-5 {
            background: linear-gradient(135deg, #00cccc, #00aaaa);
            border-color: #00cccc;
            box-shadow: 0 0 30px rgba(0, 204, 204, 0.3);
        }

        .cyber-player-card.player-6 {
            background: linear-gradient(135deg, #6600cc, #5500aa);
            border-color: #6600cc;
            box-shadow: 0 0 30px rgba(102, 0, 204, 0.3);
        }

        .cyber-player-card.player-7 {
            background: linear-gradient(135deg, #cccc00, #aaaa00);
            border-color: #cccc00;
            box-shadow: 0 0 30px rgba(204, 204, 0, 0.3);
        }

        .cyber-player-card:hover {
            transform: translateY(-5px) scale(1.05);
        }

        .cyber-player-card.empty {
            opacity: 0.3;
            color: #666;
            background: linear-gradient(135deg, #333, #555);
            border-color: #666;
            box-shadow: 0 0 10px rgba(102, 102, 102, 0.2);
        }
        
        @media (max-width: 768px) {
            .cyber-player-card { font-size: 5vw; }
        }
        </style>
        
        <div class="cyber-player-card player-${n}" id="player-card-${n}">
            ESPERANDO...
        </div>`;

    const cardElement = this.add.dom(x, y).createFromHTML(cardHtml);
    cardElement.setOrigin(0.5, 0.5);
    cardElement.setDepth(5);

    return {
      setText: (text) => {
        const cardDiv = cardElement.node.querySelector(`#player-card-${n}`);
        if (cardDiv) {
          if (text === '') {
            cardDiv.textContent = 'ESPERANDO...';
            cardDiv.classList.add('empty');
          } else {
            cardDiv.textContent = text.toUpperCase();
            cardDiv.classList.remove('empty');
          }
        }
      }
    };
  }

  updatePlayers (players, myId) {
     const sortedPlayers = Object.values(players).sort((a, b) => a.id.localeCompare(b.id));
     this.sortedPlayers = sortedPlayers;
     sortedPlayers.forEach((player, idx) => {
       if (this.texts[idx]) {
         this.texts[idx].setText(player.name);
       }
     });
     // Actualizar slots vacíos para 8 jugadores
     const restToEmpty = Array(8 - sortedPlayers.length).fill(null).map((_, idx) => 8 - idx - 1);
     restToEmpty.forEach((idxEmpty) => {
       if (this.texts[idxEmpty]) {
         this.texts[idxEmpty].setText('');
       }
     });
     this.updateStartOrWarnTextVisibility(myId);

    // Mostrar/ocultar y anclar botón INVITAR al slot 8
    if (this.shareButtonElement) {
      const hasEightPlayers = sortedPlayers.length === 8;
      if (hasEightPlayers) {
        this.shareButtonElement.setVisible(false);
      } else {
        this.shareButtonElement.setVisible(true);
        if (this.inviteSlotX && this.inviteSlotY) {
          this.shareButtonElement.setPosition(this.inviteSlotX, this.inviteSlotY);
        }
      }
    }
  }

  addStartButton () {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Create cyberpunk start button as footer
    const startButtonHtml = `
        <style>
        .cyber-start-button {
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
        }
        
        .cyber-start-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .cyber-start-button:hover::before {
            left: 100%;
        }
        
        .cyber-start-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
                0 0 50px rgba(0, 245, 255, 0.8),
                0 10px 25px rgba(0, 0, 0, 0.5);
        }
        
        .cyber-start-button:active {
            transform: translateY(0) scale(0.98);
        }
        
        @media (max-width: 768px) {
            .cyber-start-button {
                font-size: 6vw;
                padding: 18px;
            }
        }
        
        @media (max-height: 600px) {
            .cyber-start-button {
                font-size: 4vw;
                padding: 15px;
            }
        }
        </style>
        
        <button class="cyber-start-button" id="cyberStartButton">
            INICIAR MATCH
        </button>`;

    this.startButtonElement = this.add.dom(w / 2, h - 60).createFromHTML(startButtonHtml);
    this.startButtonElement.setOrigin(0.5, 0.5);
    this.startButtonElement.setDepth(100);
    this.startButtonElement.setVisible(false);

    // Add click event
    this.startButtonElement.addListener('click');
    this.startButtonElement.on('click', (event) => {
      if (event.target.id === 'cyberStartButton') {
        this.clickStart();
      }
    });

    // Create footer waiting text (shown to non-host players)
    const warnTextHtml = `
        <style>
        .cyber-warn-text {
            font-family: 'Orbitron', 'Courier New', monospace;
            font-size: 3.5vw;
            font-weight: 700;
            color: #39ff14;
            text-align: center;
            letter-spacing: 1px;
            line-height: 1.3;
            font-style: italic;
            background: rgba(0, 0, 0, 0.8);
            padding: 2vh;
            border-radius: 8px;
            border: 1px solid rgba(57, 255, 20, 0.2);
            box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);
            width: 90vw;
            max-width: 500px;
        }
        
        @media (max-width: 768px) {
            .cyber-warn-text { font-size: 4.5vw; }
        }
        </style>
        
        <div class="cyber-warn-text" id="cyberWarnText">
            ${this.i18n.get('start-only-main-player', { mainPlayer: this.getMainPlayer().name })}
        </div>`;

    this.warnTextElement = this.add.dom(w / 2, h - 60).createFromHTML(warnTextHtml);
    this.warnTextElement.setOrigin(0.5, 0.5);
    this.warnTextElement.setDepth(100);
    this.warnTextElement.setVisible(false);

    this.updateStartOrWarnTextVisibility('');
  }

  addShareButton () {
     const w = this.cameras.main.width;
     const h = this.cameras.main.height;
 
     // Create cyberpunk share button using DOM element
     const shareButtonHtml = `
         <style>
         .cyber-share-button {
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid #39ff14;
            color: #39ff14;
            font-size: 3.5vw;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${this.cardWidthPx || w * 0.8}px;
            height: ${this.cardHeightPx || h * 0.06}px;
        }
        
        .cyber-share-button:hover {
            background: rgba(57, 255, 20, 0.1);
            box-shadow: 0 0 30px rgba(57, 255, 20, 0.5);
        }
        
        @media (max-width: 768px) {
            .cyber-share-button {
                font-size: 5vw;
            }
        }
        </style>
        
        <button class="cyber-share-button" id="cyberShareButton">
            🎯 INVITAR JUGADORES
        </button>`;
 
    this.shareButtonElement = this.add.dom(this.inviteSlotX || (w / 2), this.inviteSlotY || (h - 100)).createFromHTML(shareButtonHtml);
    this.shareButtonElement.setOrigin(0.5, 0.5);
    this.shareButtonElement.setDepth(6);
 
    // Add click event
    this.shareButtonElement.addListener('click');
    this.shareButtonElement.on('click', async (event) => {
      if (event.target.id === 'cyberShareButton') {
        const url = `${window.location.origin}?room=${this.room}`;
        await navigator.clipboard.writeText(`Únete a mi match: ${url}`);
        alert(this.i18n.get('copied-to-clipboard'));
      }
    });

    // Visibilidad inicial según número de jugadores
    const hasEightPlayers = (this.sortedPlayers || []).length === 8;
    this.shareButtonElement.setVisible(!hasEightPlayers);
  }

  getMainPlayer () {
    if (this.sortedPlayers && this.sortedPlayers.length >= 1) {
      return this.sortedPlayers[0];
    }
    return { name: '' };
  }

  updateStartOrWarnTextVisibility(myId) {
    if (this.warnTextElement && this.startButtonElement) {
      const wVisible = this.sortedPlayers.length >= 1 && this.sortedPlayers[0].id !== myId;
      const bVisible = this.sortedPlayers.length >= 2 && this.sortedPlayers[0].id === myId;
      
      this.warnTextElement.setVisible(wVisible);
      this.startButtonElement.setVisible(bVisible);
      
      // Update warning text content
      if (wVisible) {
        const warnDiv = this.warnTextElement.node.querySelector('#cyberWarnText');
        if (warnDiv) {
          warnDiv.textContent = this.i18n.get('start-only-main-player', { mainPlayer: this.getMainPlayer().name });
        }
      }
    }
  }

  clickStart () {
    this.onClickStart();
  }
}

export default PlayersScene;
