const LEVEL_LAYOUTS = {
  1: ["G", "G", "R", "G", "R", "R", "G", "R", "G", "G"],
  2: ["G", "G", "W", "G", "W", "W", "G", "W", "G", "G"],
  3: ["G", "W", "R", "G", "R", "W", "G", "W", "R", "G"],
  4: ["G", "W", "R", "W", "G", "G", "R", "W", "R", "G"],
  5: ["G", "W", "R", "R", "W", "W", "R", "R", "W", "G"],
};

const LANE_STYLES = {
  G: {
    base: 0x8fd694,
    alt: 0x77c87e,
    accent: 0xb7e4a6,
    border: 0x5da565,
  },
  W: {
    base: 0x2f8fcb,
    alt: 0x2277ac,
    accent: 0x7ad7f0,
    border: 0x14557f,
  },
  R: {
    base: 0x505861,
    alt: 0x3f4650,
    accent: 0xbcc2c9,
    border: 0x292e35,
  },
};

const OLIVE_TEXTURES = {
  default: "oliveOverjoyed",
  chef: "oliveHatChef",
  jester: "oliveHatJester",
  propeller: "oliveHatPropeller",
  wizard: "oliveHatWizard",
};

class PhilippinesScene extends Phaser.Scene {
  constructor() {
    super("PhilippinesScene");
  }

  init(data) {
    this.currentLevel = data.level || 1;
    this.maxLevel = 5;
    this.levelConfig = {
      1: { ingredient: "Pork", color: 0xf28a8a, needed: 3 },
      2: { ingredient: "Onions", color: 0xf8f4e8, needed: 4 },
      3: { ingredient: "Carrots", color: 0xffa24d, needed: 5 },
      4: { ingredient: "Cabbage", color: 0xffdf8a, needed: 6 },
      5: { ingredient: "Spring Roll Wrappers", color: 0x7fd98c, needed: 7 },
    };

    this.palette = {
      bgTop: 0xdfeee4,
      bgBottom: 0xe8efe3,
      sun: 0xf2ecc0,
      mountain: 0xb9ccb5,
      mountainShadow: 0x99b59a,
      uiPanel: 0xf6f4eb,
      uiBorder: 0x9fad95,
      uiText: "#5b351d",
      uiAccent: 0xc9d4c0,
      shadow: 0x000000,
      coin: 0xe3c254,
      coinInner: 0xf1e5a4,
      overlay: 0x222620,
      win: "#2f9e44",
      lose: "#d94841",
      buttonFill: 0xf1efe4,
      buttonBorder: 0x97a38b,
      buttonText: "#5a5143",
      buttonHover: 0xe3eadb,
    };
  }

  preload() {
    this.load.image("oliveOverjoyed", "assets/olive_overjoyed.PNG");
    this.load.image("oliveHatChef", "assets/olive_hat_chef.PNG");
    this.load.image("oliveHatJester", "assets/olive_hat_jester.PNG");
    this.load.image("oliveHatPropeller", "assets/olive_hat_propeller.PNG");
    this.load.image("oliveHatWizard", "assets/olive_hat_wizard.PNG");
    this.load.image("itemcabbage", "assets/philippines/philippines_cabbage.PNG");
    this.load.image("itemcarrots", "assets/philippines/philippines_carrots.PNG");
    this.load.image("itemonion", "assets/philippines/philippines_onion.PNG");
    this.load.image("itempork", "assets/philippines/philippines_pork.PNG");
    this.load.image("itemwrappers", "assets/philippines/philippines_wrappers.PNG");
    this.load.image("vehcar", "assets/philippines/car.PNG");
    this.load.image("vehtricycle", "assets/philippines/tricycle.PNG");
    this.load.image("vehjeepney", "assets/philippines/jeepney.PNG");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.TOP_UI_HEIGHT = 96;
    this.ROWS = 10;
    this.GRID_SIZE = Math.floor((height - this.TOP_UI_HEIGHT) / this.ROWS);
    this.gameWidth = width;

    this.rowLayout = [...LEVEL_LAYOUTS[this.currentLevel]].reverse();
    this.config = this.levelConfig[this.currentLevel];
    this.collected = 0;
    this.canMove = true;
    this.isMoving = false;
    this.isEnding = false;
    this.obstacles = [];
    this.ingredients = [];
    this.playerOnLog = null;
    this.waterDecor = [];

    this.createBackdrop();

    this.gameContainer = this.add.container(0, this.TOP_UI_HEIGHT);

    this.createBoard();
    this.createPlayer();
    this.createLevelObjects();
    this.gameContainer.bringToTop(this.player);
    this.createUI();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MapScene"));
  }

  createBackdrop() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, this.palette.bgBottom);
    this.add.rectangle(width / 2, height * 0.22, width, height * 0.44, this.palette.bgTop, 1);
    this.add.rectangle(width / 2, this.TOP_UI_HEIGHT / 2, width, this.TOP_UI_HEIGHT, 0xf5f4ec, 0.98)
      .setStrokeStyle(0, 0x000000, 0);
    this.add.rectangle(width / 2, this.TOP_UI_HEIGHT - 2, width, 4, this.palette.uiAccent, 0.95);
    this.add.circle(width * 0.14, this.TOP_UI_HEIGHT + 86, 42, this.palette.sun, 0.9);

    const mountainBack = this.add.ellipse(width * 0.34, height * 0.38, width * 0.76, height * 0.24, this.palette.mountain, 1);
    const mountainFront = this.add.ellipse(width * 0.72, height * 0.45, width * 0.74, height * 0.24, this.palette.mountainShadow, 1);
    const shoreline = this.add.ellipse(width / 2, height - 16, width * 0.86, 42, 0xffffff, 0.08);

    this.tweens.add({
      targets: [mountainBack, mountainFront, shoreline],
      alpha: { from: 0.94, to: 1 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  createBoard() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);

    for (let row = 0; row < this.ROWS; row++) {
      const laneType = this.rowLayout[row];
      const style = LANE_STYLES[laneType];
      const y = row * this.GRID_SIZE;

      const lane = this.add.rectangle(
        this.gameWidth / 2,
        y + this.GRID_SIZE / 2,
        this.gameWidth,
        this.GRID_SIZE,
        style.base
      ).setStrokeStyle(1, style.border, 0.18);
      this.gameContainer.add(lane);

      for (let col = 0; col < cols; col++) {
        const x = col * this.GRID_SIZE;

        if (laneType === "G") {
          const patch = this.add.rectangle(
            x + this.GRID_SIZE / 2,
            y + this.GRID_SIZE / 2,
            this.GRID_SIZE - 6,
            this.GRID_SIZE - 6,
            col % 2 === row % 2 ? style.alt : style.base,
            0.28
          ).setStrokeStyle(1, style.border, 0.08);
          this.gameContainer.add(patch);
        }

        if (laneType === "W") {
          const wave = this.add.ellipse(
            x + this.GRID_SIZE / 2,
            y + this.GRID_SIZE * 0.35,
            this.GRID_SIZE * 0.74,
            8,
            style.accent,
            0.14
          );
          const wave2 = this.add.ellipse(
            x + this.GRID_SIZE * 0.34,
            y + this.GRID_SIZE * 0.72,
            this.GRID_SIZE * 0.52,
            6,
            0xffffff,
            0.09
          );
          this.gameContainer.add([wave, wave2]);
          this.waterDecor.push({ shape: wave, baseX: wave.x, drift: 8 + (row % 3) * 2 });
          this.waterDecor.push({ shape: wave2, baseX: wave2.x, drift: 5 + (col % 3) * 2 });
        }

        if (laneType === "R" && col % 2 === 0) {
          const stripe = this.add.rectangle(
            x + this.GRID_SIZE / 2,
            y + this.GRID_SIZE / 2,
            this.GRID_SIZE * 0.42,
            6,
            style.accent,
            0.9
          );
          this.gameContainer.add(stripe);
        }
      }
    }
  }

  createPlayer() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const startCol = Math.floor(cols / 2);
    const startRow = this.ROWS - 1;
    const x = startCol * this.GRID_SIZE + this.GRID_SIZE / 2;
    const y = startRow * this.GRID_SIZE + this.GRID_SIZE / 2;
    const equippedHat = this.registry.get("equippedItems")?.hat;
    const textureKey = OLIVE_TEXTURES[equippedHat] || OLIVE_TEXTURES.default;

    const shadow = this.add.ellipse(0, 12, this.GRID_SIZE * 0.65, 14, this.palette.shadow, 0.16);
    const sprite = this.add.image(0, -2, textureKey);
    const spriteScale = (this.GRID_SIZE + 4) / sprite.texture.getSourceImage().height;
    sprite.setScale(spriteScale);
    this.playerSprite = sprite;

    this.player = this.add.container(x, y, [
      shadow,
      sprite,
    ]).setDepth(1000);

    this.gameContainer.add(this.player);

    this.playerGridX = startCol;
    this.playerGridY = startRow;

    this.tweens.add({
      targets: sprite,
      y: { from: -3, to: -1 },
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  createLevelObjects() {
    for (let row = 1; row < this.ROWS - 1; row++) {
      const type = this.rowLayout[row];
      if (type === "G") continue;

      const direction = row % 2 === 0 ? 1 : -1;
      if (type === "R") this.createVehicleLane(row, direction);
      if (type === "W") this.createWaterLane(row, direction);
    }

    this.spawnIngredients();
  }

  createVehicleLane(row, direction) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const vehicleTypes = [
      { width: 2, body: 0xf4b000, trim: 0xbd4b3e, roof: 0xffe082, name: "jeepney", speed: 1.25 },
      { width: 1.5, body: 0x6c63ff, trim: 0xf4d35e, roof: 0xa29bfe, name: "tricycle", speed: 1.5 },
      { width: 1, body: 0xf25f5c, trim: 0xffffff, roof: 0xff9b85, name: "car", speed: 1.7 },
    ];

    const GAP = 3;
    const numVehicles = Phaser.Math.Between(2, 4);
    let cursor = direction > 0 ? -2 : cols + 2;

    for (let i = 0; i < numVehicles; i++) {
      const type = Phaser.Math.RND.pick(vehicleTypes);
      const col = direction > 0 ? cursor - type.width / 2 : cursor + type.width / 2;
      this.obstacles.push(this.createVehicle(col, row, direction, type));
      cursor += direction > 0 ? -(type.width + GAP) : type.width + GAP;
    }
  }

  createVehicle(col, row, direction, type) {
    const x = col * this.GRID_SIZE + this.GRID_SIZE / 2;
    const y = row * this.GRID_SIZE + this.GRID_SIZE / 2;

    const textureMap = {
      car: "vehcar",
      tricycle: "vehtricycle",
      jeepney: "vehjeepney",
    };

    const key = textureMap[type.name];

    const sprite = this.add.image(0, 0, key);
    const scale = (this.GRID_SIZE * type.width) / sprite.width;
    sprite.setScale(scale);

    const depthMap = {
      car: 700,
      jeepney: 750,
      tricycle: 800,
    };

    if (direction > 0) {
      sprite.setFlipX(true);
    } else {
      sprite.setFlipX(false);
    }
    const shadow = this.add.ellipse(0, 12, sprite.displayWidth * 0.8, 8, 0x000000, 0.15);

    const container = this.add.container(x, y, [shadow, sprite]).setDepth(depthMap[type.name]);
    this.gameContainer.add(container);

    return {
      sprite: container,
      gridX: col,
      gridY: row,
      direction,
      speed: type.speed,
      width: type.width,
      type: type.name,
    };
  }

  createWaterLane(row, direction) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const numLogs = Phaser.Math.Between(3, 4);
    const GAP = 3;

    let cursor = direction > 0 ? -2 : cols + 2;

    for (let i = 0; i < numLogs; i++) {
      const logWidth = Phaser.Math.Between(2, 4);
      const col = direction > 0 ? cursor - logWidth / 2 : cursor + logWidth / 2;
      this.obstacles.push(this.createLog(col, row, direction, logWidth));
      cursor += direction > 0 ? -(logWidth + GAP) : logWidth + GAP;
    }
  }

  createLog(col, row, direction, logWidth) {
    const x = col * this.GRID_SIZE + this.GRID_SIZE / 2;
    const y = row * this.GRID_SIZE + this.GRID_SIZE / 2;
    const widthPx = this.GRID_SIZE * logWidth - 4;
    const heightPx = this.GRID_SIZE + 4;

    const ripple = this.add.ellipse(0, 10, widthPx * 0.94, 12, 0xffffff, 0.08);
    const shadow = this.add.ellipse(0, 12, widthPx * 0.9, 8, 0x12344b, 0.12);
    const body = this.add.rectangle(0, 0, widthPx, heightPx * 0.72, 0x8f5a34)
      .setStrokeStyle(1, 0x5a341e, 0.2);
    const seamLeft = this.add.rectangle(-widthPx * 0.28, 0, 2, heightPx * 0.48, 0x6a3f22, 0.3);
    const seamRight = this.add.rectangle(widthPx * 0.2, 0, 2, heightPx * 0.48, 0x6a3f22, 0.3);

    const container = this.add.container(x, y, [
      ripple,
      shadow,
      body,
      seamLeft,
      seamRight,
    ]);
    this.gameContainer.add(container);

    return {
      sprite: container,
      gridX: col,
      gridY: row,
      direction,
      speed: 1.5,
      width: logWidth,
      type: "log",
      isSafe: true,
    };
  }

  createIngredientVisual(x, y) {
    const textureMap = {
      "Pork": "itempork",
      "Onions": "itemonion",
      "Carrots": "itemcarrots",
      "Cabbage": "itemcabbage",
      "Spring Roll Wrappers": "itemwrappers",
    };
    const key = textureMap[this.config.ingredient];
    const sprite = this.add.image(0, 0, key);
    const scale = (this.GRID_SIZE * 0.7) / sprite.texture.getSourceImage().width;
    sprite.setScale(scale);

    const shadow = this.add.ellipse(0, 10, this.GRID_SIZE * 0.5, 10, 0x000000, 0.15);
    return this.add.container(x, y, [shadow, sprite]).setDepth(500);
  }

  spawnCoin() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    let col;
    let row;

    do {
      col = Phaser.Math.Between(1, cols - 2);
      row = Phaser.Math.Between(1, this.ROWS - 2);
    } while (
      this.rowLayout[row] === "W" ||
      this.ingredients.some((ing) => !ing.collected && ing.gridX === col && ing.gridY === row)
    );

    const x = col * this.GRID_SIZE + this.GRID_SIZE / 2;
    const y = row * this.GRID_SIZE + this.GRID_SIZE / 2;
    const glow = this.add.circle(0, 0, this.GRID_SIZE / 2 - 2, this.palette.coin, 0.08);
    const outer = this.add.circle(0, 0, this.GRID_SIZE / 3, this.palette.coin);
    const inner = this.add.circle(0, 0, this.GRID_SIZE / 4.3, this.palette.coinInner);
    const shine = this.add.circle(-5, -5, 4, 0xffffff, 0.85);

    this.coin = this.add.container(x, y, [glow, outer, inner, shine]).setDepth(600);
    this.gameContainer.add(this.coin);

    this.tweens.add({
      targets: this.coin,
      y: y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.coinGridX = col;
    this.coinGridY = row;
    this.coinCollected = false;
  }

  spawnIngredients() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    let spawned = 0;
    const target = this.config.needed + 2;

    while (spawned < target) {
      const col = Phaser.Math.Between(0, cols - 1);
      const row = Phaser.Math.Between(1, this.ROWS - 2);

      const occupied = this.ingredients.some((ing) => ing.gridX === col && ing.gridY === row);
      if (occupied) continue;

      const x = col * this.GRID_SIZE + this.GRID_SIZE / 2;
      const y = row * this.GRID_SIZE + this.GRID_SIZE / 2;
      const sprite = this.createIngredientVisual(x, y);

      this.gameContainer.add(sprite);

      this.tweens.add({
        targets: sprite,
        scale: { from: 0.95, to: 1.05 },
        duration: 800 + spawned * 35,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });

      this.ingredients.push({ sprite, gridX: col, gridY: row, collected: false });
      spawned += 1;
    }

    this.spawnCoin();
  }

  createPanel(x, y, width, height, alpha = 0.94) {
    const shadow = this.add.rectangle(x + 3, y + 3, width, height, 0x7f8a78, 0.12);
    const bg = this.add.rectangle(x, y, width, height, this.palette.uiPanel, alpha)
      .setStrokeStyle(3, this.palette.uiBorder, 0.9);
    return this.add.container(0, 0, [shadow, bg]);
  }

  createUI() {
    const width = this.scale.width;
    const midY = this.TOP_UI_HEIGHT / 2;

    this.levelPanel = this.createPanel(110, midY, 178, 48);
    this.levelText = this.add.text(110, midY, `Level ${this.currentLevel}`, {
      fontSize: "24px",
      color: this.palette.uiText,
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.ingredientPanel = this.createPanel(width / 2, midY, 340, 50);
    this.ingredientText = this.add.text(
      width / 2,
      midY,
      `${this.config.ingredient}: ${this.collected}/${this.config.needed}`,
      {
        fontSize: "22px",
        color: this.palette.uiText,
        fontStyle: "bold",
      }
    ).setOrigin(0.5);

    this.coinPanel = this.createPanel(width - 108, midY, 182, 48);
    this.coinText = this.add.text(width - 108, midY, `Coins: ${this.registry.get("currency") || 0}`, {
      fontSize: "22px",
      color: this.palette.uiText,
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.hintText = this.add.text(width / 2, 16, "ESC to return to map", {
      fontSize: "15px",
      color: "#6d4a2e",
      backgroundColor: "#fff5e800",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0.7).setAlpha(0.88);
  }

  update(time, delta) {
    this.animateWater(time);
    this.updateObstacles(delta);
    this.handleInput();
    this.gameContainer.sort("depth");

    if (this.isMoving) {
      return;
    }

    this.checkCollisions();

    if (this.playerOnLog) {
      this.movePlayerWithLog(delta);
    }
  }

  animateWater(time) {
    this.waterDecor.forEach((wave, index) => {
      wave.shape.x = wave.baseX + Math.sin(time * 0.0018 + index * 0.7) * wave.drift;
    });
  }

  updateObstacles(delta) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);

    this.obstacles.forEach((obs) => {
      obs.gridX += (obs.direction * obs.speed * delta) / 1000;

      if (obs.direction > 0 && obs.gridX > cols + obs.width) obs.gridX = -obs.width;
      if (obs.direction < 0 && obs.gridX < -obs.width) obs.gridX = cols + obs.width;

      obs.sprite.x = obs.gridX * this.GRID_SIZE + this.GRID_SIZE / 2;
    });
  }

  movePlayerWithLog(delta) {
    const log = this.playerOnLog;
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);

    this.playerGridX += (log.direction * log.speed * delta) / 1000;
    this.player.x = this.playerGridX * this.GRID_SIZE + this.GRID_SIZE / 2;

    const logLeft = log.gridX - log.width / 2;
    const logRight = log.gridX + log.width / 2;

    if (this.playerGridX < logLeft || this.playerGridX > logRight) {
      this.die("Fell off the log!");
      return;
    }

    if (this.playerGridX < 0 || this.playerGridX > cols - 1) {
      this.die("Pushed off screen!");
    }
  }

  handleInput() {
    if (!this.canMove) return;

    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    let moved = false;
    let newX = this.playerGridX;
    let newY = this.playerGridY;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      newX = Math.round(this.playerGridX);
      newY = this.playerGridY - 1;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      newX = Math.round(this.playerGridX);
      newY = this.playerGridY + 1;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      newX = Math.round(this.playerGridX) - 1;
      newY = this.playerGridY;
      this.playerSprite.setFlipX(true);
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      newX = Math.round(this.playerGridX) + 1;
      newY = this.playerGridY;
      this.playerSprite.setFlipX(false);
      moved = true;
    }

    if (moved && newX >= 0 && newX < cols && newY >= 0 && newY < this.ROWS) {
      this.canMove = false;
      this.isMoving = true;
      this.playerOnLog = null;

      this.tweens.add({
        targets: this.player,
        scaleX: 1.05,
        scaleY: 0.95,
        duration: 70,
        yoyo: true,
        ease: "Sine.Out",
      });

      this.tweens.add({
        targets: this.player,
        x: newX * this.GRID_SIZE + this.GRID_SIZE / 2,
        y: newY * this.GRID_SIZE + this.GRID_SIZE / 2,
        duration: 150,
        ease: "Cubic.Out",
        onComplete: () => {
          this.playerGridX = newX;
          this.playerGridY = newY;
          this.isMoving = false;
          this.canMove = true;
          this.checkCollisions();
          this.checkWinCondition();
        },
      });
    }
  }

  collectIngredient(ing) {
    ing.collected = true;
    this.tweens.add({
      targets: ing.sprite,
      y: ing.sprite.y - 16,
      alpha: 0,
      scale: 1.2,
      duration: 180,
      onComplete: () => ing.sprite.destroy(),
    });

    this.collected += 1;
    this.ingredientText.setText(`${this.config.ingredient}: ${this.collected}/${this.config.needed}`);
  }

  collectCoin() {
    this.coinCollected = true;
    this.tweens.killTweensOf(this.coin);
    this.tweens.add({
      targets: this.coin,
      alpha: 0,
      scale: 1.3,
      y: this.coin.y - 18,
      duration: 200,
      onComplete: () => this.coin.destroy(),
    });

    const current = this.registry.get("currency") || 0;
    this.registry.set("currency", current + 1);
    this.coinText.setText(`Coins: ${current + 1}`);
    this.tweens.add({
      targets: this.coinText,
      scale: 1.08,
      yoyo: true,
      duration: 150,
    });
  }

  checkCollisions() {
    const row = this.playerGridY;
    const type = this.rowLayout[row];

    if (type === "G") {
      this.playerOnLog = null;
    } else if (type === "W") {
      const log = this.obstacles.find((obs) => {
        if (obs.type !== "log" || obs.gridY !== row) return false;
        return this.playerGridX >= obs.gridX - obs.width / 2 && this.playerGridX <= obs.gridX + obs.width / 2;
      });

      if (log) {
        this.playerOnLog = log;
      } else {
        this.playerOnLog = null;
        this.die("Fell in water!");
        return;
      }
    } else if (type === "R") {
      this.playerOnLog = null;
      for (const obs of this.obstacles) {
        if (obs.type === "log" || obs.gridY !== row) continue;
        if (this.playerGridX >= obs.gridX - obs.width / 2 && this.playerGridX <= obs.gridX + obs.width / 2) {
          this.die("Hit by vehicle!");
          return;
        }
      }
    }

    this.ingredients.forEach((ing) => {
      if (ing.collected) return;

      const dist = Phaser.Math.Distance.Between(
        this.playerGridX,
        this.playerGridY,
        ing.gridX,
        ing.gridY
      );

      if (dist < 0.6) {
        this.collectIngredient(ing);
      }
    });

    if (!this.coinCollected) {
      const coinDist = Phaser.Math.Distance.Between(
        this.playerGridX,
        this.playerGridY,
        this.coinGridX,
        this.coinGridY
      );

      if (coinDist < 0.6) {
        this.collectCoin();
      }
    }
  }

  checkWinCondition() {
    if (this.playerGridY === 0) {
      if (this.collected >= this.config.needed) {
        this.levelComplete();
      } else {
        this.die(`Need more ${this.config.ingredient}!`);
      }
    }
  }

  die(message) {
    if (this.isEnding) return;
    this.isEnding = true;
    this.canMove = false;
    this.isMoving = false;
    this.playerOnLog = null;

    this.tweens.add({
      targets: this.player,
      angle: 8,
      alpha: 0.82,
      duration: 140,
      yoyo: true,
    });

    this.time.delayedCall(300, () => {
      this.showGameOver(message);
    });
  }

  levelComplete() {
    if (this.isEnding) return;
    this.isEnding = true;
    this.canMove = false;
    this.isMoving = false;
    this.playerOnLog = null;

    this.tweens.add({
      targets: this.player,
      y: this.player.y - 12,
      duration: 170,
      yoyo: true,
      repeat: 1,
      ease: "Sine.Out",
    });

    if (this.currentLevel >= this.maxLevel) {
      this.showVictory();
    } else {
      this.showLevelComplete();
    }
  }

  _overlay() {
    const { width, height } = this.scale;
    const fade = this.add.rectangle(width / 2, height / 2, width, height, this.palette.overlay, 0.38);
    const panelShadow = this.add.rectangle(width / 2 + 6, height / 2 + 8, 530, 380, 0x5e685d, 0.14);
    const panel = this.add.rectangle(width / 2, height / 2, 530, 380, 0xf6f4eb, 0.98)
      .setStrokeStyle(3, this.palette.uiBorder, 1);
    const accent = this.add.rectangle(width / 2, height / 2 - 140, 440, 6, this.palette.uiAccent, 0.95);
    return { width, height, fade, panelShadow, panel, accent };
  }

  _button(x, y, label, cb, depth = 30) {
    const shadow = this.add.rectangle(x + 3, y + 4, 190, 44, 0x7e4a2c, 0.2);
    const bg = this.add.rectangle(x, y, 190, 44, this.palette.buttonFill)
      .setStrokeStyle(3, this.palette.buttonBorder, 0.95)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);
    const text = this.add.text(x, y, label, {
      fontSize: "24px",
      color: this.palette.buttonText,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(depth + 1).setInteractive({ useHandCursor: true });
    shadow.setDepth(depth - 1);

    const activateHover = () => {
      bg.setFillStyle(this.palette.buttonHover, 1);
      text.setScale(1.03);
    };

    const deactivateHover = () => {
      bg.setFillStyle(this.palette.buttonFill, 1);
      text.setScale(1);
    };

    bg.on("pointerover", activateHover);
    text.on("pointerover", activateHover);

    bg.on("pointerout", deactivateHover);
    text.on("pointerout", deactivateHover);

    bg.on("pointerdown", cb);
    text.on("pointerdown", cb);

    return this.add.container(0, 0, [shadow, bg, text]).setDepth(depth);
  }

  showGameOver(message) {
    const { width, height } = this._overlay();
    this.add.text(width / 2, height / 2 - 108, "Game Over", {
      fontSize: "46px",
      color: this.palette.lose,
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 48, message, {
      fontSize: "24px",
      color: "#6b3b21",
      align: "center",
      wordWrap: { width: 390 },
    }).setOrigin(0.5);
    this.add.text(
      width / 2,
      height / 2 + 4,
      `${this.config.ingredient}: ${this.collected}/${this.config.needed}`,
      {
        fontSize: "22px",
        color: "#7a4a30",
        fontStyle: "bold",
      }
    ).setOrigin(0.5);

    this._button(width / 2, height / 2 + 78, "Retry Level", () => this.scene.restart({ level: this.currentLevel }));
    this._button(width / 2, height / 2 + 132, "Back to Map", () => this.scene.start("MapScene"));
  }

  showLevelComplete() {
    const { width, height } = this._overlay();
    this.add.text(width / 2, height / 2 - 112, "Level Complete", {
      fontSize: "44px",
      color: this.palette.win,
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 46, `${this.config.ingredient} collected!`, {
      fontSize: "28px",
      color: "#6b3b21",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 2, "Olive is ready for the next stop.", {
      fontSize: "21px",
      color: "#82553a",
    }).setOrigin(0.5);
    this._button(width / 2, height / 2 + 78, "Next Level", () => this.scene.restart({ level: this.currentLevel + 1 }));
    this._button(width / 2, height / 2 + 132, "Back to Map", () => this.scene.start("MapScene"));
  }

  showVictory() {
    const wins = this.registry.get('wins');
    wins.philippines = true;
    this.registry.set('wins', wins);
    const { width, height } = this._overlay();
    this.add.text(width / 2, height / 2 - 108, "Victory!", {
      fontSize: "46px",
      color: this.palette.win,
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 48, "All ingredients collected!", {
      fontSize: "24px",
      color: "#6b3b21",
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 4, "You completed all 5 Philippines levels.", {
      fontSize: "22px",
      color: "#82553a",
    }).setOrigin(0.5);
    this._button(width / 2, height / 2 + 78, "Play Again", () => this.scene.restart({ level: 1 }));
    this._button(width / 2, height / 2 + 132, "Back to Map", () => this.scene.start("MapScene"));
  }
}
