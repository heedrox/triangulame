import Phaser from 'phaser';
import SCENE_KEYS from './constants/scene-keys';
import fullscreen from '../../assets/welcome/fullscreen.png';

class WelcomeScene extends Phaser.Scene {
  constructor(i18n) {
    super({
      key: SCENE_KEYS.WELCOME_SCENE,
    });
    this.i18n = i18n;
    this.form = null;
  }

  init(data) {
    this.oncomplete = data.oncomplete;
    this.previousName = data.previousName;
    this.previousRoom = data.previousRoom;
    this.checkValidity = data.checkValidity;
  }

  preload() {
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
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x00f5ff, 0.1);

    // Create vertical lines
    for (let x = 0; x <= w + gridSize; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, h + gridSize);
    }

    // Create horizontal lines
    for (let y = 0; y <= h + gridSize; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(w + gridSize, y);
    }

    gridGraphics.strokePath();

    // Animate the grid
    this.tweens.add({
      targets: gridGraphics,
      x: -gridSize,
      y: -gridSize,
      duration: 20000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  createFloatingParticles(w, h) {
    const colors = [0x00f5ff, 0xff0080, 0x39ff14, 0xffff00];
    const particles = [];

    // Create 12 triangle particles
    for (let i = 0; i < 12; i++) {
      const particle = this.add.graphics();
      const color = colors[i % colors.length];
      const size = Phaser.Math.Between(2, 4);
      
      particle.fillStyle(color, 0.8);
      
      // Draw small triangle
      particle.beginPath();
      particle.moveTo(0, -size);
      particle.lineTo(-size, size);
      particle.lineTo(size, size);
      particle.closePath();
      particle.fillPath();
      
      // Random starting position
      particle.x = Phaser.Math.Between(0, w);
      particle.y = h + 50;
      
      particles.push(particle);

      // Animate particle floating up
      const delay = Phaser.Math.Between(0, 6000);
      const duration = Phaser.Math.Between(4000, 8000);

      this.time.delayedCall(delay, () => {
        this.animateParticle(particle, w, h, duration);
      });
    }

    this.particles = particles;
  }

  animateParticle(particle, w, h, duration) {
    // Reset particle position
    particle.x = Phaser.Math.Between(0, w);
    particle.y = h + 50;
    particle.alpha = 0;

    // Create floating animation
    this.tweens.add({
      targets: particle,
      y: -50,
      alpha: 1,
      duration: duration,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Restart animation
        const newDuration = Phaser.Math.Between(4000, 8000);
        this.animateParticle(particle, w, h, newDuration);
      }
    });

    // Add rotation
    this.tweens.add({
      targets: particle,
      rotation: Math.PI * 2,
      duration: duration,
      ease: 'Linear'
    });

    // Add fade out at the end
    this.tweens.add({
      targets: particle,
      alpha: 0,
      duration: 1000,
      delay: duration - 1000,
      ease: 'Sine.easeIn'
    });

    // Add fade in at the beginning
    this.tweens.add({
      targets: particle,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Sine.easeOut'
    });
  }

  addForm() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const formHtml = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .cyber-form {
            font-family: 'Orbitron', 'Courier New', monospace;
            text-align: center;
            position: relative;
            height: 100%;
            overflow-y: auto;
            padding-bottom: 120px; /* Espacio para el footer */
        }
        
        /* Scrollbar personalizado para el tema cyber */
        .cyber-form::-webkit-scrollbar {
            width: 8px;
        }
        
        .cyber-form::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
        }
        
        .cyber-form::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #00f5ff, #ff0080);
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }
        
        .cyber-form::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #ff0080, #39ff14);
            box-shadow: 0 0 15px rgba(255, 0, 128, 0.7);
        }
        
        .cyber-title {
            font-size: 6vw;
            font-weight: 900;
            text-align: center;
            margin-bottom: 4vh;
            margin-top: 2vh;
            color: #00f5ff;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 
                0 0 5px #000,
                0 0 10px #000,
                0 0 15px #000,
                0 0 20px #000,
                0 0 10px #00f5ff,
                0 0 20px #00f5ff,
                0 0 30px #00f5ff,
                0 0 40px #00f5ff;
            animation: titlePulse 3s ease-in-out infinite alternate;
        }
        
        @keyframes titlePulse {
            0% { 
                text-shadow: 
                    0 0 5px #000,
                    0 0 10px #000,
                    0 0 15px #000,
                    0 0 20px #000,
                    0 0 10px #00f5ff,
                    0 0 20px #00f5ff,
                    0 0 30px #00f5ff,
                    0 0 40px #00f5ff;
            }
            100% { 
                text-shadow: 
                    0 0 8px #000,
                    0 0 15px #000,
                    0 0 20px #000,
                    0 0 25px #000,
                    0 0 15px #00f5ff,
                    0 0 25px #00f5ff,
                    0 0 35px #00f5ff,
                    0 0 45px #00f5ff,
                    0 0 55px #00f5ff;
            }
        }
        
        .form-group {
            margin-bottom: 3vh;
            position: relative;
        }
        
        .form-label {
            display: block;
            font-size: 4.5vw;
            font-weight: 700;
            margin-bottom: 2vh;
            color: #39ff14;
            text-transform: uppercase;
            letter-spacing: 2px;
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
        
        .input-container {
            position: relative;
            background: linear-gradient(45deg, #00f5ff, #ff0080, #39ff14, #ffff00);
            padding: 3px;
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
            animation: inputGlow 3s ease-in-out infinite alternate;
            margin: 0 auto;
            width: 70%;
        }
        
        @keyframes inputGlow {
            0% { 
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
            }
            50% { 
                box-shadow: 0 0 25px rgba(255, 0, 128, 0.4);
            }
            100% { 
                box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
            }
        }
        
        .cyber-input {
            width: 100%;
            padding: 3vw;
            font-size: 5vw;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
            border: none;
            border-radius: 9px;
            color: #00f5ff;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 
                0 0 25px rgba(0, 245, 255, 0.3),
                inset 0 0 30px rgba(0, 0, 0, 0.7);
            box-sizing: border-box;
        }
        
        .cyber-input:focus {
            outline: none;
            color: #ff0080;
            box-shadow: 
                0 0 40px rgba(255, 0, 128, 0.6),
                inset 0 0 30px rgba(0, 0, 0, 0.7);
            transform: scale(1.03);
            text-shadow: 0 0 10px #ff0080;
        }
        
        .cyber-input::placeholder {
            color: rgba(0, 245, 255, 0.5);
        }
        
        .form-info {
            font-size: 3vw;
            color: #39ff14;
            margin-top: 3vh;
            text-align: center;
            font-style: italic;
            line-height: 1.4;
            background: rgba(0, 0, 0, 0.8);
            padding: 2vh;
            border-radius: 8px;
            border: 1px solid rgba(57, 255, 20, 0.2);
            box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);
            width: 85%;
            margin-left: auto;
            margin-right: auto;
        }
        
        @media (max-width: 768px) {
            .cyber-title { font-size: 8vw; margin-bottom: 3vh; margin-top: 1vh; }
            .form-label { font-size: 5.5vw; }
            .cyber-input { font-size: 6vw; padding: 4vw; }
            .form-info { font-size: 3.5vw; }
            .form-group { margin-bottom: 2.5vh; }
        }
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
                    <input type="text" class="cyber-input" autocomplete="off" placeholder="${this.i18n.get('room')}" id="room">
                </div>
                <div class="form-info">
                    ${this.i18n.get('room-info')}
                </div>
            </div>
        </div>`;

    this.form = this.add.dom(w / 2, h / 2 - 40).createFromHTML(formHtml, 'form');
    this.form.setVisible(true);
    this.form.setDepth(1);
    this.form.setOrigin(0.5, 0.5);
    
    // Animación de entrada más sutil
    this.form.setAlpha(0);
    this.add.tween({
      targets: this.form,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });
    if (this.previousName) this.form.getChildByID('name').value = this.previousName;
    if (this.previousRoom) this.form.getChildByID('room').value = this.previousRoom;
    return this.form;
  }

  addFullScreenButton() {
    if (!this.scale.isFullscreen) {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      const image = this.add
      .image(w - (w/15), (h/20), 'fullscreen')
      .setDisplaySize(w/10, w/10)
      .setInteractive()
      .on('pointerdown', this.setFullScreen, this);
  
      this.add.tween({
        targets: [image],
        scale: image.scale + 0.1,
        ease: 'Sine.easeInOut',
        duration: 1000,
        repeatDelay: 1000,
        repeat: -1,
        yoyo: true,
      });
    }
  }

  setFullScreen() {
    if (!this.scale.isFullscreen) {
      try {
        this.scale.startFullscreen();
        setTimeout(() => this.scene.restart(), 1000);
      } catch (e) {
        console.error(e);
      }
    }
  }

  addStartButton() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Create cyber button using DOM element positioned at bottom
    const buttonHtml = `
        <style>
        .cyber-footer-button {
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
        
        .cyber-footer-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        
        .cyber-footer-button:hover::before {
            left: 100%;
        }
        
        .cyber-footer-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
                0 0 50px rgba(0, 245, 255, 0.8),
                0 10px 25px rgba(0, 0, 0, 0.5);
        }
        
        .cyber-footer-button:active {
            transform: translateY(0) scale(0.98);
        }
        
        @media (max-width: 768px) {
            .cyber-footer-button {
                font-size: 6vw;
                padding: 18px;
            }
        }
        
        @media (max-height: 600px) {
            .cyber-footer-button {
                font-size: 4vw;
                padding: 15px;
            }
        }
        </style>
        
        <button class="cyber-footer-button" id="startButton">
            ${this.i18n.get('start')}
        </button>`;

    // Position button at bottom of screen using Phaser coordinates
    this.startButtonElement = this.add.dom(w / 2, h - 60).createFromHTML(buttonHtml);
    this.startButtonElement.setOrigin(0.5, 0.5);
    this.startButtonElement.setDepth(100);

    // Add click event
    this.startButtonElement.addListener('click');
    this.startButtonElement.on('click', (event) => {
      if (event.target.id === 'startButton') {
        this.clickStart();
      }
    });
  }

  async clickStart() {
    const name = this.form.getChildByID('name').value.trim();
    const room = this.form.getChildByID('room').value.trim();
    if (name !== '' && room !== '') {
      const isValid = await this.checkValidity(room);
      if (isValid) {
        this.scene.stop();
        this.oncomplete({
          name,
          room,
        });
      } else {
        this.showRoomNotAvailable();
      }
    }
  }

  showRoomNotAvailable() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Create cyber error message using DOM element
    const errorHtml = `
        <style>
        .cyber-error {
            font-family: 'Orbitron', 'Courier New', monospace;
            font-size: 4vw;
            font-weight: 700;
            color: #ff0080;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: rgba(0, 0, 0, 0.9);
            padding: 3vh;
            border-radius: 8px;
            border: 2px solid #ff0080;
            box-shadow: 
                0 0 30px rgba(255, 0, 128, 0.5),
                inset 0 0 20px rgba(0, 0, 0, 0.7);
            text-shadow: 
                0 0 5px #000,
                0 0 10px #ff0080,
                0 0 15px #ff0080,
                0 0 20px #ff0080;
            animation: errorPulse 1s ease-in-out infinite alternate;
        }
        
        @keyframes errorPulse {
            0% { 
                box-shadow: 
                    0 0 30px rgba(255, 0, 128, 0.5),
                    inset 0 0 20px rgba(0, 0, 0, 0.7);
            }
            100% { 
                box-shadow: 
                    0 0 40px rgba(255, 0, 128, 0.8),
                    inset 0 0 20px rgba(0, 0, 0, 0.7);
            }
        }
        
        @media (max-width: 768px) {
            .cyber-error { font-size: 5vw; }
        }
        </style>
        
        <div class="cyber-error">
            🚫 SALA NO DISPONIBLE<br>
            INTENTA CON OTRA
        </div>`;

    const errorElement = this.add.dom(w / 2, h + 100).createFromHTML(errorHtml);
    errorElement.setOrigin(0.5, 0.5);
    errorElement.setDepth(2);

    this.add.tween({
      targets: [errorElement],
      duration: 1000,
      y: h * 0.75,
      ease: 'Power2',
    });
    this.add.tween({
      targets: [errorElement],
      duration: 2000,
      delay: 2000,
      alpha: 0,
      ease: 'Power2',
      onComplete: () => {
        errorElement.destroy();
      }
    });
  }
}

export default WelcomeScene;
