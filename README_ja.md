<a href="https://abagames.github.io/crisp-game-lib-11-games/?survivor"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/survivor/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?chargebeam"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/chargebeam/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?pillars3d"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/pillars3d/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?thunder"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/thunder/screenshot.gif" width="25%" loading="lazy"></a>

# crisp-game-lib

<a href="https://abagames.github.io/crisp-game-lib-11-games/?growth"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/growth/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?cardq"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/cardq/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?flipo"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/flipo/screenshot.gif" width="25%" loading="lazy"></a><a href="https://abagames.github.io/crisp-game-lib-11-games/?shiny"><img src="https://github.com/abagames/crisp-game-lib-11-games/raw/main/docs/shiny/screenshot.gif" width="25%" loading="lazy"></a>

[English](https://github.com/abagames/crisp-game-lib/blob/master/README.md) | 日本語

`crisp-game-lib`はブラウザゲームを素早く簡単に作るための JavaScript ライブラリです。

- [crisp-game-lib を使ったゲームの作り方をステップバイステップで説明](https://abagames.github.io/literate-diff-viewer/pinclimb/index.html?lang=ja)

- [crisp-game-lib のリファレンス](https://abagames.github.io/crisp-game-lib/ref_document/modules.html)

## サンプルゲームとサンプルコード

サンプルゲームについては、[私のブラウザゲームページ](http://www.asahi-net.or.jp/~cs8k-cyu/browser.html)に一覧があります。`Play`ボタンを押すことで、ブラウザ上で遊べます（PC、スマホ、タブレット対応）。

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

## 機能紹介デモ

- 描画 ([デモ](https://abagames.github.io/crisp-game-lib/?ref_drawing))

[![ref_drawing screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/ref_drawing/screenshot.gif)](https://abagames.github.io/crisp-game-lib/?ref_drawing)

- 衝突判定 ([デモ](https://abagames.github.io/crisp-game-lib/?ref_collision))

[![ref_collision screenshot](https://github.com/abagames/crisp-game-lib-games/raw/main/docs/ref_collision/screenshot.gif)](https://abagames.github.io/crisp-game-lib/?ref_collision)

- 入力判定 ([デモ](https://abagames.github.io/crisp-game-lib/?ref_input))

- 音 ([デモ](https://abagames.github.io/crisp-game-lib/?ref_sound))

## 関連記事

- [Super Hexagon](https://store.steampowered.com/app/221640/Super_Hexagon/)や[VVVVVV](https://store.steampowered.com/app/70300/VVVVVV/)の開発者である[Terry Cavanagh](https://twitter.com/terrycavanagh)の[crisp-game-lib に関する記事（英語）](https://terrysfreegameoftheweek.com/kento-chos-crisp-game-lib-games/)も参照ください

- [Juno Nguyen](https://twitter.com/JunoNgx)のチュートリアル記事、[Guide to getting started with CrispGameLib（英語）](https://github.com/JunoNgx/crisp-game-lib-tutorial)には、`crisp-game-lib`を使ってゲームを作るために、どのようなコードを書けばよいか、どのようにデータを持つべきか、などの有益な情報があります

- `crisp-game-lib`を使うための準備の詳細については、[@cat2151](https://twitter.com/cat2151)による[crisp-game-lib でゲームをつくるための手順](https://qiita.com/cat2151/items/851aa4923bebd125fcd7)も参照ください

- [残りゲーム制作体力 10%な人のためのずぼらゲームライブラリ crisp-game-lib](https://aba.hatenablog.com/entry/2021/04/02/204732)

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
