<a href="https://abagames.github.io/crisp-game-lib-11-games/?survivor"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/survivor/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?chargebeam"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/chargebeam/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?pillars3d"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/pillars3d/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?thunder"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/thunder/screenshot.gif" width="25%" loading="lazy"></a>

# crisp-game-lib

<a href="https://abagames.github.io/crisp-game-lib-11-games/?growth"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/growth/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?cardq"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/cardq/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?flipo"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/flipo/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?shiny"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/shiny/screenshot.gif" width="25%" loading="lazy"></a>

English | [日本語](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md)

`crisp-game-lib` is a JavaScript library for creating browser games quickly and easily.

- [Step-by-step guide on creating a game using the crisp-game-lib](https://abagames.github.io/literate-diff-viewer/pinclimb/index.html)

- [Reference of crisp-game-lib](https://abagames.github.io/crisp-game-lib/ref_document/modules.html)

## Sample games and sample codes

Sample games are listed on [my browser games page](http://www.asahi-net.or.jp/~cs8k-cyu/browser.html). Click `Play` to play the game in your browser (PC or mobile).

Sample code for each game is `main.js` in each directory in the [crisp-game-lib-games/docs directory](https://github.com/abagames/crisp-game-lib-games/tree/main/docs).

## Getting started

1. Download [docs/getting_started/index.html](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/getting_started/index.html).

1. Open `index.html` in a text editor and write the code of your game in the `<script>` element.

1. Open `index.html` in a browser and play the game.

1. You can publish the game by putting `index.html` on your web server.

## Write your own game (with the help of IntelliSense and Live Reload)

1. Clone or [download](https://github.com/abagames/crisp-game-lib/archive/refs/heads/master.zip) this repository.

1. `npm install`

1. Copy the `docs/_template` directory and rename it to `docs/[your own game name]`.

1. Open `docs/[your own game name]/main.js` with the editor ([VSCode](https://code.visualstudio.com/) is recommended) and write your own game code.

1. `npm run watch_games`

1. Open the URL `http://localhost:4000?[your own game name]` with a browser to play the game. The page is live-reloaded when the code is rewritten.

## Publish your own game

1. Place `main.js`, [docs/bundle.js](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/bundle.js), and [docs/index.html](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/index.html) on the webserver in the following directory structure.

   ```
   ┝ [games root directory (any name)]
      ┝ [your own game name]
      │  └ main.js
      ┝ bundle.js
      └ index.html
   ```

1. Open the URL `[Address of games root directory]/index.html?[your own game name]` with a browser.

## Use with a bundler

If you want to build a game using a bundler (e.g. [Vite](https://vitejs.dev/)), do the following.

1. `npm install crisp-game-lib` at your project directory.

1. Copy [docs/\_template_bundler/index.html](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/_template_bundler/index.html) and [docs/\_template_bundler/main.js](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/_template_bundler/main.js) to your project directory.

1. Write game code in `main.js`.

1. Build with the bundler.

If you want to describe the game using TypeScript, rename `main.js` to `main.ts`.

## Function introduction demo

- Drawing ([DEMO](https://abagames.github.io/crisp-game-lib/?ref_drawing))

[![ref_drawing screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/ref_drawing/screenshot.gif)](https://abagames.github.io/crisp-game-lib/?ref_drawing)

- Collision ([DEMO](https://abagames.github.io/crisp-game-lib/?ref_collision))

[![ref_collision screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/ref_collision/screenshot.gif)](https://abagames.github.io/crisp-game-lib/?ref_collision)

- Input ([DEMO](https://abagames.github.io/crisp-game-lib/?ref_input))

- Sound ([DEMO](https://abagames.github.io/crisp-game-lib/?ref_sound))

## Related articles

- [Kenta Cho’s “Crisp Game Lib” Games](https://terrysfreegameoftheweek.com/kento-chos-crisp-game-lib-games/), written by [Terry Cavanagh](https://twitter.com/terrycavanagh), known as the developer of [Super Hexagon](https://store.steampowered.com/app/221640/Super_Hexagon/) and [VVVVVV](https://store.steampowered.com/app/70300/VVVVVV/)

- [Guide to getting started with CrispGameLib](https://github.com/JunoNgx/crisp-game-lib-tutorial), written by [Juno Nguyen](https://twitter.com/JunoNgx)

- [crisp-game-lib, a game library for creating mini-games with minimal effort](https://dev.to/abagames/crisp-game-lib-a-game-library-for-creating-mini-games-with-minimal-effort-3816)

## Tips

- By drawing with `color("transparent")`, you can get the result of collision detection without drawing any shape on the screen.
- The collision detection is based on the drawing history of the shape. Therefore, even if a drawn shape is overwritten with a background-colored shape, the collision detection in that area will not disappear.
- The base value for the random seed for sound generation is generated from the `title` and `description` strings. If you want to use `seed` in `options` to adjust the generated sound, it is better to do so after the `title` and `description` are fixed.
- To improve the performance of the game, do the following (mainly for mobile devices):
  - Use `simple` or `dark` theme. Do not specify a theme that uses pixi.js (`pixel`, `shape`, `shapeDark`, `crt`) in options. WebGL post-effects may worsen performance.
  - Minimize drawing bars, lines, or arcs. They are drawn as a combination of many rectangles and are highly detrimental to the collision detection process.
- If you want to create a game that can be played comfortably on a mobile device, I recommend that you adopt one of the following three control methods.
  - One-button
  - Slide operation left or right direction only
  - Tapping on a specific place on the screen
- For more information on how to create a one-button game, please refer to the following article I wrote: [How to realize various actions in a one-button game](https://dev.to/abagames/how-to-realize-various-actions-in-a-one-button-game-fak)
- The [sounds-some-sounds library](https://github.com/abagames/sounds-some-sounds) can be used to play music. To play music written in MML, use the `sss.playMml()` function.
