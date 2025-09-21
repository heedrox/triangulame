# Triangles - Juego de Números y Formas

**Un juego multijugador en tiempo real donde la velocidad y precisión son clave.**

Triangles es un juego competitivo donde los jugadores deben hacer clic en formas geométricas (rectángulos y triángulos) en orden numérico secuencial lo más rápido posible. El tablero se genera dinámicamente dividiendo un rectángulo base en múltiples formas, cada una numerada del 1 al N, creando un desafío único en cada partida.

## 🎮 Cómo se Juega

1. **Únete a una sala** con tu nombre y código de sala
2. **Espera a otros jugadores** (multijugador en tiempo real)
3. **Encuentra y haz clic** en las formas numeradas del 1 al N en orden
4. **Compite por el mejor tiempo** - el jugador más rápido gana
5. **Sistema de combos** - haz clic rápido (< 1.5s) para activar combos de 3+ números

## ✨ Características

- **Multijugador en tiempo real** con Firebase
- **Generación procedural** de tableros únicos cada partida
- **Sistema de combos** que recompensa la velocidad
- **Múltiples rondas** con dificultad creciente
- **Interfaz responsive** que funciona en móvil y escritorio
- **Soporte PWA** para iOS y Android

## 🛠 Tecnología

Construido con tecnologías web modernas para máximo rendimiento:

- **Phaser 3.90.0** - Motor de juegos 2D para renderizado y física
- **Vite 6** - Build tool ultrarrápido con HMR
- **Firebase 9** - Backend en tiempo real para multijugador
- **Node.js 20** - Runtime moderno con ES modules
- **Jest 29** - Testing framework con 96.4% cobertura

## 🚀 Ideas Futuras
- ✅ Share easily games [DONE]
- 📊 Show progress of other users  
- ❌ Penalization if users touch wrong number
- 🎯 Combos provide you things to fail
- 🔄 If you leave a game in half, the room is available
- 🐛 Fix user not being able to click "CONTINUE" if other player is not in room
- 🐛 Fix sometimes user does not show in room until time is passed


## Requirements

[Node.js 20+](https://nodejs.org) is required to install dependencies and run scripts via `npm`. Use `nvm use` to automatically switch to the correct version.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm start` / `npm run dev` | Start development server with hot reload |
| `npm run build` | Build project for production with optimizations |
| `npm run preview` | Preview production build locally |
| `npm test` | Run test suite with Jest |
| `npm run lint` | Run ESLint code quality checks |


### Vite

The project uses [Vite](https://vite.dev/) for fast development and optimized production builds. You can customize the build by modifying `vite.config.js`. Vite provides excellent ES module support, fast HMR, and optimized bundling out of the box.

## Deploying Code

After you run the `npm run build` command, your code will be built into optimized files in the `dist/` directory with automatic asset hashing for cache busting. 

If you put the contents of the `dist` folder in a publicly-accessible location (say something like `http://mycoolserver.com`), you should be able to open `http://mycoolserver.com/index.html` and play your game.

# Thanks to

https://freesound.org/people/joshuaempyre/sounds/251461/
https://freesound.org/people/Mrthenoronha/sounds/518306/ // need to donate

