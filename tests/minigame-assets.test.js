const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.join(__dirname, "..");

const context = {
  console,
  window: {}
};

const configCode = fs.readFileSync(path.join(projectRoot, "config.js"), "utf8");
vm.runInNewContext(
  configCode + "\nthis.ASSET_MANIFEST = ASSET_MANIFEST; this.SUB_GAME_MANIFEST = SUB_GAME_MANIFEST; this.SUB_GAMES = SUB_GAMES;",
  context,
  { filename: "config.js" }
);

assert.ok(context.ASSET_MANIFEST.minigames, "minigame asset manifest exists");
assert.ok(context.ASSET_MANIFEST.minigames.brickBreaker.assets.ballDefault, "brickBreaker ball asset is registered");
assert.ok(context.ASSET_MANIFEST.minigames.brickBreaker.assets.bricks.stim, "brickBreaker stim brick asset is registered");
assert.ok(context.ASSET_MANIFEST.minigames.sideShooter.assets.player.base, "sideShooter player asset is registered");
assert.ok(context.ASSET_MANIFEST.minigames.sideShooter.assets.enemies.tank, "sideShooter tank asset is registered");

let receivedAssets = null;
context.window.TestSubGame = class {
  constructor(initialDopamine, options, minigameAssets) {
    this.initialDopamine = initialDopamine;
    this.options = options;
    receivedAssets = minigameAssets;
  }
};
context.SUB_GAME_MANIFEST.testGame = {
  title: "Test",
  className: "TestSubGame"
};

const gameCode = fs.readFileSync(path.join(projectRoot, "game.js"), "utf8");
vm.runInNewContext(gameCode + "\nthis.Game = Game;", context, { filename: "game.js" });

const game = Object.create(context.Game.prototype);
game.assets = {
  minigames: {
    testGame: {
      sprite: "loaded-image"
    }
  }
};
game.state = {
  dopamine: 61,
  selectedSubGame: "testGame",
  selectedSubGameOptions: {
    maxTurns: 3
  }
};
game.playSubGameBgm = () => {};
game.createMinigameTutorial = () => null;

game.startSelectedSubGame();

assert.deepStrictEqual(receivedAssets, { sprite: "loaded-image" }, "selected minigame assets are passed into subgame");
assert.strictEqual(game.subGame.initialDopamine, 61, "current dopamine is still passed into subgame");
assert.strictEqual(game.subGame.options.maxTurns, 3, "playable options are still passed into subgame");

console.log("minigame-assets tests passed");
