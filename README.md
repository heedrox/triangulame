# Triangles APP (pending better name)

A game based on Phaser 3 Webpack Project Template

A Phaser 3 project template with ES6 support via [Babel 7](https://babeljs.io/) and [Vite 6](https://vite.dev/) that includes hot-reloading for development and production-ready builds.

This has been updated for Phaser 3.90.0 version and Node.js 20.

Loading images via JavaScript module `import` is also supported, although not recommended.

## Ideas
- Share easily games [DONE]
- Show progress of other users
- Penalization if users touch wrong number
- Combos provide you things to fail
- If you leave a game in half, the room is available
- Fix user not being able to click "CONTINUE" if other player is not in room
- Fix sometimes user does not show in room until time is passed


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

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm start`.

After starting the development server with `npm start`, you can edit any files in the `src` folder and webpack will automatically recompile and reload your server (available at `http://localhost:8080` by default).

## Customizing the Template

### Babel

You can write modern ES6+ JavaScript and Babel will transpile it to a version of JavaScript that you want your project to support. The targeted browsers are set in the `.babelrc` file and the default currently targets all browsers with total usage over "0.25%" but excludes IE11 and Opera Mini.

 ```
"browsers": [
  ">0.25%",
  "not ie 11",
  "not op_mini all"
]
 ```

### Vite

The project uses [Vite](https://vite.dev/) for fast development and optimized production builds. You can customize the build by modifying `vite.config.js`. Vite provides excellent ES module support, fast HMR, and optimized bundling out of the box.

## Deploying Code

After you run the `npm run build` command, your code will be built into optimized files in the `dist/` directory with automatic asset hashing for cache busting. 

If you put the contents of the `dist` folder in a publicly-accessible location (say something like `http://mycoolserver.com`), you should be able to open `http://mycoolserver.com/index.html` and play your game.

# Thanks to

https://freesound.org/people/joshuaempyre/sounds/251461/
https://freesound.org/people/Mrthenoronha/sounds/518306/ // need to donate

