<a href="https://abagames.github.io/crisp-game-lib-games/?survivor"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/survivor/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?chargebeam"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/chargebeam/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?pillars3d"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/pillars3d/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?slalom"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/slalom/screenshot.gif" width="25%" loading="lazy"></a>

<h1 align="center">crisp-game-lib</h1>

<a href="https://abagames.github.io/crisp-game-lib-games/?doshin"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/doshin/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?cardq"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/cardq/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?earock"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/earock/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?shiny"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/shiny/screenshot.gif" width="25%" loading="lazy"></a>

[English](https://github.com/abagames/crisp-game-lib/blob/master/README.md) | 日本語

`crisp-game-lib`はブラウザゲームを素早く簡単に作るための JavaScript ライブラリです。私は[2014 年に 50 のミニゲーム](http://www.asahi-net.or.jp/~cs8k-cyu/blog/2014/12/12/games-in-2014/)と, それらを作るための Haxe ライブラリ[mgl](https://github.com/abagames/mgl)および CoffeeScript ライブラリ[mgl.coffee](https://github.com/abagames/mgl.coffee)を作りました。その後もミニゲームおよびゲーム開発ライブラリの作成を続け、その経験を元に、レトロなアーケードゲームのようなミニゲームを作るための、最小限の機能を持ったライブラリとして`crisp-game-lib`を作りました。

`crisp-game-lib`は良く[ドッグフーディング](https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%83%E3%82%B0%E3%83%95%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0)されていて、[1 年間で 111 のゲーム](https://github.com/abagames/111-one-button-games-in-2021/blob/main/README.md)をこのライブラリを使って制作しました。`title`、`description`、および 1 秒に 60 回呼び出される`update`関数を、一つの JavaScript ファイルに書くだけで、PC やスマホで動作するブラウザゲームが作れます。ミニゲーム制作に必要な、四角や線、円弧、テキスト、ドット絵の
[描画機能](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E6%8F%8F%E7%94%BB-%E3%83%87%E3%83%A2) 、描画機能と一体化した[衝突判定機能](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E8%A1%9D%E7%AA%81%E5%88%A4%E5%AE%9A-%E3%83%87%E3%83%A2)、マウスやタッチパネルをサポートする[入力判定機能](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E5%85%A5%E5%8A%9B%E5%88%A4%E5%AE%9A-%E3%83%87%E3%83%A2)、音の名前を指定するだけで鳴らせる[効果音機能](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E5%8A%B9%E6%9E%9C%E9%9F%B3-%E3%83%87%E3%83%A2)を持っています。加えて、ゲームをジューシーにするための機能として、[オプション](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3)で`isPlayingBgm`を`true`に設定するだけで自動生成される BGM、`isReplayEnabled`を`true`にすることで有効になるリプレイ、`theme`を指定することでゲーム画面をレトロな CRT スタイルやドット絵風に変えられるテーマがあります。また、`characters`配列でドット絵を簡単にを定義できます。

また、[TypeScript の型定義](https://github.com/abagames/crisp-game-lib/blob/master/docs/bundle.d.ts)があるので、[VSCode](https://code.visualstudio.com/)などのエディタでコード補完の恩恵を受けることができます。どのようなコードを書く必要があるかについては、後述の[サンプルコード](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%B3%E3%83%BC%E3%83%89)や[リファレンス](https://github.com/abagames/crisp-game-lib/blob/master/README_ja.md#%E3%83%AA%E3%83%95%E3%82%A1%E3%83%AC%E3%83%B3%E3%82%B9)を参照ください。

[Super Hexagon](https://store.steampowered.com/app/221640/Super_Hexagon/)や[VVVVVV](https://store.steampowered.com/app/70300/VVVVVV/)の開発者である[Terry Cavanagh](https://twitter.com/terrycavanagh)の[crisp-game-lib に関する記事（英語）](https://terrysfreegameoftheweek.com/kento-chos-crisp-game-lib-games/)も参照ください。

また、[Juno Nguyen](https://twitter.com/JunoNgx)のチュートリアル記事、[Guide to getting start with CrispGameLib（英語）](https://github.com/JunoNgx/crisp-game-lib-tutorial)には、`crisp-game-lib`を使ってゲームを作るために、どのようなコードを書けばよいか、どのようにデータを持つべきか、などの有益な情報があります。

`crisp-game-lib`を使うための準備の詳細については、[@cat2151](https://twitter.com/cat2151)による[crisp-game-lib でゲームをつくるための手順](https://qiita.com/cat2151/items/851aa4923bebd125fcd7)も参照ください。

## デモ (画像をクリックすれば遊べます)

<a href="https://abagames.github.io/crisp-game-lib-games/?cywall"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/cywall/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?lland"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/lland/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?bamboo"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/bamboo/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?subjump"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/subjump/screenshot.gif" width="25%" loading="lazy"></a>

<a href="https://abagames.github.io/crisp-game-lib-games/?grenadier"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/grenadier/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?catep"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/catep/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?zoneb"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/zoneb/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?laserfortress"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/laserfortress/screenshot.gif" width="25%" loading="lazy"></a>

<a href="https://abagames.github.io/crisp-game-lib-games/?pressm"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/pressm/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?rebirth"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/rebirth/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?numberball"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/numberball/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-games/?arcfire"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/arcfire/screenshot.gif" width="25%" loading="lazy"></a>

他のゲームについては、私の[ブラウザゲームページ](http://www.asahi-net.or.jp/~cs8k-cyu/browser.html)に一覧があります。

## サンプルコード

[![pinclimb screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/pinclimb/screenshot.gif)](https://abagames.github.io/crisp-game-lib-games/?pinclimb)

```javascript
// ゲームタイトルを'title'に書きます。
title = "PIN CLIMB";

// 'description'はタイトル画面に表示される説明文です。
description = `
[Hold] Stretch
`;

// ドット絵を定義したい場合はここに記述します。
characters = [];

// ゲームオプションを指定します。
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  // 'seed'の値を変えることで、異なる効果音やBGMが生成できます。
  seed: 400,
};

// （必須ではありませんが）変数の型を指定するとコード補完やエラー検出に役立ちます。
/** @type {{angle: number, length: number, pin: Vector}} */
let cord;
/** @type {Vector[]} */
let pins;
let nextPinDist;
const cordLength = 7;

// 'update()'は毎フレームごとに呼び出されます（1秒間に60回）。
function update() {
  // 'ticks'はゲーム開始からのフレーム数を表します。
  if (!ticks) {
    // ここで初期化を行います。 (ticks === 0)
    pins = [vec(50, 0)]; // 'vec()'は2Dベクタを生成します。
    nextPinDist = 10;
    cord = { angle: 0, length: cordLength, pin: pins[0] };
  }
  // 'difficulty'はゲームの難度を表します。
  // ゲーム開始時は1で、1分ごとに1ずつ増加します。
  let scr = difficulty * 0.02;
  if (cord.pin.y < 80) {
    scr += (80 - cord.pin.y) * 0.1;
  }
  // 'input.isJustPressed'はボタンが押された瞬間にtrueになります。
  if (input.isJustPressed) {
    // 'play()'は効果音を鳴らします。
    play("select");
  }
  // 'input.isPressed'はボタンが押されている間trueになります。
  if (input.isPressed) {
    cord.length += difficulty;
  } else {
    cord.length += (cordLength - cord.length) * 0.1;
  }
  cord.angle += difficulty * 0.05;
  // 第1引数と第2引数の座標をつなぐ線を書きます。
  line(cord.pin, vec(cord.pin).addWithAngle(cord.angle, cord.length));
  if (cord.pin.y > 98) {
    play("explosion");
    // 'end()'を呼ぶことでゲームが終わります。 (Game Over)
    end();
  }
  let nextPin;
  // 'remove()'は第1引数の配列の要素を、順番に第2引数の関数の引数に渡し実行します。
  // 関数がtrueを返した場合、配列から引数の要素が削除されます。
  remove(pins, (p) => {
    p.y += scr;
    // 箱を描画し、それが黒の四角や線と衝突しているか判定します。
    if (box(p, 3).isColliding.rect.black && p !== cord.pin) {
      nextPin = p;
    }
    return p.y > 102;
  });
  if (nextPin != null) {
    play("powerUp");
    // スコアを加算します。
    // 第2引数に座標を指定することで、加算されたスコアが画面に表示されます。
    addScore(ceil(cord.pin.distanceTo(nextPin)), nextPin);
    cord.pin = nextPin;
    cord.length = cordLength;
  }
  nextPinDist -= scr;
  while (nextPinDist < 0) {
    // 'rnd()'はランダムな値を返します。
    pins.push(vec(rnd(10, 90), -2 - nextPinDist));
    nextPinDist += rnd(5, 15);
  }
}
```

## その他のサンプルコード

各ゲームのサンプルコードは、[crisp-game-lib-games/docs](https://github.com/abagames/crisp-game-lib-games/tree/main/docs)内の各ディレクトリの`main.js`です。

## 始め方

1. [docs/getting_started/index.html](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/getting_started/index.html)をダウンロードします。

1. `index.html`をテキストエディタで開き、`<script>`エレメントにあなたのゲームのコードを書きます。

1. `index.html`をブラウザで開き、ゲームを遊びます。

1. `index.html`をあなたの Web サーバに置くことで、あなたのゲームを公開することもできます。

## ゲームの書き方（コード補完と自動リロード付きで）

1. このリポジトリをクローン、もしくは[ダウンロード](https://github.com/abagames/crisp-game-lib/archive/refs/heads/master.zip)します。

1. `npm install`

1. `docs/_template`ディレクトリをコピーし`docs/[あなたのゲームの名前]`にリネームします。

1. `docs/[あなたのゲームの名前]/main.js`をエディタで開き（[VSCode](https://code.visualstudio.com/)を推奨）、あなたのゲームのコードを書きます。

1. `npm run watch_games`

1. `http://localhost:4000?[あなたのゲームの名前]`の URL をブラウザで開くとゲームで遊べます。このページはコードを書き直すと自動的にリロードされます。

## ゲームの公開

1. `main.js`、[docs/bundle.js](https://github.com/abagames/crisp-game-lib/blob/master/docs/bundle.js)、[docs/index.html](https://github.com/abagames/crisp-game-lib/blob/master/docs/index.html)を、Web サーバに下記のディレクトリ構成で配置します。

   ```
   ┝ [ゲームのルートディレクトリ（任意の名前）]
      ┝ [あなたのゲームの名前]
      │  └ main.js
      ┝ bundle.js
      └ index.html
   ```

1. `[ゲームのルートディレクトリのアドレス]/index.html?[あなたのゲームの名前]`の URL をブラウザで開きます。

## バンドラーを使う

ゲームをバンドラー（例 [Vite](https://ja.vitejs.dev/)）を使ってビルドしたい場合は、以下のようにして下さい。

1. `npm install crisp-game-lib`をプロジェクトのディレクトリで実行する。

1. [docs/\_template_bundler/index.html](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/_template_bundler/index.html)と[docs/\_template_bundler/main.js](https://raw.githubusercontent.com/abagames/crisp-game-lib/master/docs/_template_bundler/main.js)をプロジェクトのディレクトリにコピーする。

1. ゲームのコードを`main.js`に記述する。

1. バンドラーを使ってビルドする。

TypeScript を使いたい場合は、`main.js`を`main.ts`にリネームして下さい。

## リファレンス

### 描画 ([デモ](https://abagames.github.io/crisp-game-lib-games/?ref_drawing))

[![ref_drawing screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/ref_drawing/screenshot.gif)](https://abagames.github.io/crisp-game-lib-games/?ref_drawing)

```javascript
function update() {
  // 描画色を指定する。
  // color(colorName : "transparent" | "white" |
  // "black" | "red" | "green" | "blue" |
  // "yellow" | "purple" | "cyan" |
  // "light_black" | "light_red" | "light_green" | "light_blue" |
  // "light_yellow" | "light_purple" | "light_cyan");
  color("red");
  // 箱を描画する。
  // box(x, y, width, height?);
  // box(pos, size);
  box(20, 20, 15, 20);
  // 四角を描画する。
  // rect(x, y, width, height?);
  // rect(pos, size);
  rect(70, 20, 20, 25);
  // 棒を描画する。
  // bar(x, y, length, thickness, rotate, centerPosRatio?);
  // bar(pos, length, thickness, rotate, centerPosRatio?);
  bar(20, 70, 18, 5, 0.7, 0.5);
  // 線を描画する。
  // line(x1, y1, x2, y2, thickness);
  // line(p1, p2, thickness);
  line(70, 70, 90, 80);
  // 円弧を描画する。
  // arc(x, y, radius, thickness?, angleFrom?, angleTo?);
  // arc(pos, radius, thickness?, angleFrom?, angleTo?);
  arc(30, 60, 20, 5, 0.1, 1.5);
  // テキストを描画する。
  // text(string, x, y, options?);
  // text(string, p, options?);
  text("a", 10, 20);
  // 定義したドット絵を描画する。
  // char(string, x, y, options?);
  // char(string, p, options?);
  char("a", 30, 40);
}
```

`char()`を呼び出す前に色を指定するとドット絵の色が変えられます。`color("black")`で配列で定義された色で描画します。

```javascript
// ドット絵全体を青色にする。
color("blue");
char("a", 10, 10);

// 配列で定義された色で描画する。
color("black");
char("a", 10, 10);
```

### 衝突判定 ([デモ](https://abagames.github.io/crisp-game-lib-games/?ref_collision))

[![ref_collision screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/ref_collision/screenshot.gif)](https://abagames.github.io/crisp-game-lib-games/?ref_collision)

```javascript
function update() {
  color("purple");
  box(50, 50, 20, 10);
  color("green");
  // 描画した形がrect/text/charに衝突しているかを判定する。
  // [描画関数].isColliding => {
  //   rect.[color]: boolean;
  //   text.[char]: boolean;
  //   char.[char]: boolean;
  // }
  // もし箱が紫の四角に衝突していたら...
  if (box(input.pos, 5, 5).isColliding.rect.purple) {
    end();
  }
}
```

衝突判定対象の形は判定の前に描画されている必要があります。双方向での衝突判定を行う場合は、下記のように複数回の衝突判定を行う必要があります。（[ゲーム`S LANES`](https://abagames.github.io/crisp-game-lib-games/?slanes)のコードにコメントを追加したもの）

```javascript
shots.forEach((s) => {
  // 弾をアップデートする。

  // 弾の形・衝突判定を描画する。
  char("d", s.pos);
});

remove(enemies, (e) => {
  // 敵をアップデートする。

  // 敵が弾に当たっているかを判定する。
  if (char("b", e.pos).isColliding.char.d) {
    play("powerUp");
    particle(e.pos);
    coins.push({ pos: e.pos, laneIndex: e.laneIndex });
    return true;
  }
});

remove(shots, (s) => {
  // 弾が的に当たっているかを判定する。
  return s.pos.x > 103 || char("d", s.pos).isColliding.char.b;
});
```

`remove()`関数については、上記`PIN CLIMB`のサンプルコードを参照ください。

### 入力判定 ([デモ](https://abagames.github.io/crisp-game-lib-games/?ref_input))

```javascript
function update() {
  // 'input'変数は入力状態を返します。
  // input => {
  //   pos: Vector;
  //   isPressed: boolean;
  //   isJustPressed: boolean;
  //   isJustReleased: boolean;
  // }
  color(input.isPressed ? "red" : "blue");
  box(input.pos, 10, 10);
}
```

### 効果音 ([デモ](https://abagames.github.io/crisp-game-lib-games/?ref_sound))

```javascript
function update() {
  // 効果音を鳴らします。
  // play(type: "coin" | "laser" | "explosion" | "powerUp" |
  // "hit" | "jump" | "select" | "lucky");
  play("coin");
}
```

### その他の変数や関数

```typescript
// ゲームの経過フレーム数（60 ticks = 1秒）
let ticks: number;
// ゲーム難度（1から始まり1分間に1増加）
let difficulty: number;
// ゲームスコア
let score: number;

// スコアを増加させる
function addScore(value: number);
function addScore(value: number, x: number, y: number);
function addScore(value: number, pos: VectorLike);

// パーティクルを出現させる
function particle(
  x: number,
  y: number,
  count?: number,
  speed?: number,
  angle?: number,
  angleWidth?: number
);
function particle(
  pos: VectorLike,
  count?: number,
  speed?: number,
  angle?: number,
  angleWidth?: number
);

// ゲームを終了させる (Game Over)
function end(): void;

// 乱数を返す
function rnd(lowOrHigh?: number, high?: number);
// 整数の乱数を返す
function rndi(lowOrHigh?: number, high?: number);
// 正および負の乱数を返す
function rnds(lowOrHigh?: number, high?: number);

// 2Dベクタを返す
function vec(x?: number | VectorLike, y?: number): Vector;

class Vector {
  x: number;
  y: number;
  constructor(x?: number | VectorLike, y?: number);
  set(x?: number | VectorLike, y?: number): this;
  add(x?: number | VectorLike, y?: number): this;
  sub(x?: number | VectorLike, y?: number): this;
  mul(v: number): this;
  div(v: number): this;
  clamp(xLow: number, xHigh: number, yLow: number, yHigh: number): this;
  wrap(xLow: number, xHigh: number, yLow: number, yHigh: number): this;
  addWithAngle(angle: number, length: number): this;
  swapXy(): this;
  normalize(): this;
  rotate(angle: number): this;
  angleTo(x?: number | VectorLike, y?: number): number;
  distanceTo(x?: number | VectorLike, y?: number): number;
  isInRect(x: number, y: number, width: number, height: number): boolean;
  equals(other: VectorLike): boolean;
  floor(): this;
  round(): this;
  ceil(): this;
  length: number;
  angle: number;
}

interface VectorLike {
  x: number;
  y: number;
}

const PI: number;
function abs(v: number): number;
function sin(v: number): number;
function cos(v: number): number;
function atan2(y: number, x: number): number;
function pow(b: number, e: number): number;
function sqrt(v: number): number;
function floor(v: number): number;
function round(v: number): number;
function ceil(v: number): number;
function clamp(v: number, low?: number, high?: number): number;
function wrap(v: number, low: number, high: number): number;
function range(v: number): number[];
function times<T>(count: number, func: (index: number) => T): T[];
function remove<T>(array: T[], func: (v: T, index?: number) => any): T[];
function addWithCharCode(char: string, offset: number): string;
```

### オプション

```javascript
// ゲームの名前を'title'に書きます。
title = "CHARGE BEAM";

// 'description'はタイトル画面に表示されます。
description = `
[Tap]     Shot
[Hold]    Charge
[Release] Fire
`;

// ドット絵のキャラクタを定義します。
// それぞれの文字はドットの色を表します。
// (l: 黒, r: 赤, g: 緑, b: 青
//  y: 黄色, p: 紫, c: 水色
//  L: 淡い黒, R: 淡い赤, G: 淡い緑, B: 淡い青
//  Y: 淡い黄色, P: 淡い紫, C: 淡い水色)
// キャラクタは'a'から割り当てられます。
// 'char("a", 0, 0);' は最初の配列に定義されたキャラクタを描画します。
characters = [
  `
rllbb
lllccb
llyl b
`,
  `
  r rr
rrrrrr
  grr
  grr
rrrrrr
  r rr
`,
  `
 LLLL
LyyyyL
LyyyyL
LyyyyL
LyyyyL
 LLLL
`,
  `
   bbb
  bccb
bbllcb
bcllcb
  bccb
   bbb
`,
  `
l llll
l llll
`,
];

// ゲームオプションを設定する。
// options = {
//   viewSize?: { x: number; y: number }; // 画面サイズを指定
//   theme?: "simple" | "pixel" | "shape" | "shapeDark" | "crt" | "dark";
//    // 見た目のテーマを選択
//   isPlayingBgm?: boolean; // BGMを鳴らす
//   isReplayEnabled?: boolean; // リプレイを有効にする
//   seed?: number; // 音を生成する際のランダムシードを指定する
//
//   isCapturing?: boolean; // 'c'キーを押すと画面をキャプチャする
//   isCapturingGameCanvasOnly?: boolean; // キャプチャ画面の左右のマージンを無くす
//   captureCanvasScale?: number; // キャプチャ画面のスケールを指定する
//   isDrawingParticleFront?: boolean; // パーティクルを画面手前に表示する
//   isDrawingScoreFront?: boolean; // 加算したスコアを画面手前に表示する
//   isShowingScore?: boolean; // スコアとハイスコアを表示する
//   isMinifying?: boolean; // 最小化されたコードをコンソールに表示する
// };
options = {
  viewSize: { x: 200, y: 60 },
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};
```

## Tips

- `color("transparent")`で描画することで、形を描画することなく衝突判定を行うことができます。
- 衝突判定は描画履歴に基づいて行われます。ですので、形が背景色で上書きされたとしても、その形の衝突判定は消えません。
- 音の生成に使われるランダムシードの基本値は、`title`と`description`の文字列を元に計算されます。オプションの`seed`を使った生成される音の調整は、`title`と`description`を決定した後に行った方が良いです。
- ゲームのパフォーマンスを改善するためには、下記を実施ください（主にモバイルデバイス向け）：
  - `simple`もしくは`dark`テーマを使いましょう。pixi.js を使うテーマ（`pixel`, `shape`, `shapeDark`, `crt`）は、WebGL のポストエフェクトの影響でパフォーマンスが低下する場合があります。
  - 棒、ライン、円弧の描画は最小限にしましょう。これらは四角の組み合わせで描画されるため、衝突判定処理に負荷がかかります。
- モバイルデバイスで快適に遊べるゲームを作るためには、下記の操作方法を採用することをお勧めします。
  - ワンボタン
  - 左右へのスライド操作
  - 画面上のタップ
- ワンボタンゲームをどのように作れば良いかについては、次の記事も参照ください：[ワンボタンゲームをたくさん作ったので、その作り方をおさらいしたい](https://aba.hatenablog.com/entry/2021/08/08/195706)
- [sounds-some-sounds ライブラリ](https://github.com/abagames/sounds-some-sounds)を使って音楽を再生できます。MML で記述された音声を再生するには、`sss.playMml()` 関数を使います。
