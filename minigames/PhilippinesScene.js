const LEVEL_LAYOUTS = {
  1: ['G', 'G', 'R', 'G', 'R', 'R', 'G', 'R', 'G', 'G'],
  2: ['G', 'G', 'W', 'G', 'W', 'W', 'G', 'W', 'G', 'G'],
  3: ['G', 'W', 'R', 'G', 'R', 'W', 'G', 'W', 'R', 'G'],
  4: ['G', 'W', 'R', 'W', 'G', 'G', 'R', 'W', 'R', 'G'],
  5: ['G', 'W', 'R', 'R', 'W', 'W', 'R', 'R', 'W', 'G'],
};

const ROW_COLORS = {
  G: 0x90ee90,
  W: 0x4a90e2,
  R: 0x696969,
};

class PhilippinesScene extends Phaser.Scene {
  constructor() {
    super("PhilippinesScene");
  }

  init(data) { // levels
    this.currentLevel = data.level || 1;
    this.maxLevel = 5;
    this.levelConfig = {
      1: { ingredient: "Pork", color: 0xff6b6b, needed: 3 },
      2: { ingredient: "Water Chestnuts", color: 0xf9f9f9, needed: 4 },
      3: { ingredient: "Carrots", color: 0xff8c42, needed: 5 },
      4: { ingredient: "Spring Roll Wrapper", color: 0xffd93d, needed: 6 },
      5: { ingredient: "Green Onions", color: 0x6bcf7f, needed: 7 }
    };
  }

  preload() {
    this.load.image('log2', 'assets/philippines/log2.png');
    this.load.image('log3', 'assets/philippines/log3.png');
    this.load.image('log4', 'assets/philippines/log4.png');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.ROWS = 10;
    this.GRID_SIZE = Math.floor(height / this.ROWS);
    this.gameWidth = width;

    this.rowLayout = [...LEVEL_LAYOUTS[this.currentLevel]].reverse();

    this.config = this.levelConfig[this.currentLevel];
    this.collected = 0;
    this.canMove = true;
    this.obstacles = [];
    this.ingredients = [];
    this.playerOnLog = null;

    this.gameContainer = this.add.container(0, 0);

    this.createBoard();
    this.createPlayer();
    this.createLevelObjects();
    this.gameContainer.bringToTop(this.player);
    this.createUI();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MapScene'));
  }

  createBoard() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    for (let row = 0; row < this.ROWS; row++) {
      const color = ROW_COLORS[this.rowLayout[row]];
      for (let col = 0; col < cols; col++) {
        const tile = this.add.rectangle(
          col * this.GRID_SIZE,
          row * this.GRID_SIZE,
          this.GRID_SIZE, this.GRID_SIZE,
          color
        ).setOrigin(0, 0);
        this.gameContainer.add(tile);
      }
    }
  }

  createPlayer() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const startCol = Math.floor(cols / 2);
    const startRow = this.ROWS - 1; // bottom row

    this.player = this.add.circle(
      startCol * this.GRID_SIZE + this.GRID_SIZE / 2,
      startRow * this.GRID_SIZE + this.GRID_SIZE / 2,
      this.GRID_SIZE / 2 - 4,
      0x556b2f
    ).setDepth(1000);
    this.gameContainer.add(this.player);

    this.playerGridX = startCol;
    this.playerGridY = startRow;
  }

  createLevelObjects() {
    for (let row = 1; row < this.ROWS - 1; row++) {
      const type = this.rowLayout[row];
      if (type === 'G') continue;
      const direction = row % 2 === 0 ? 1 : -1;
      if (type === 'R') this.createVehicleLane(row, direction);
      if (type === 'W') this.createWaterLane(row, direction);
    }
    this.spawnIngredients();
  }

  createVehicleLane(row, direction) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const vehicleTypes = [
      { width: 2, color: 0xff00ff, name: 'jeepney' },
      { width: 1.5, color: 0xffff00, name: 'tricycle' },
      { width: 1, color: 0xff0000, name: 'car' },
    ];

    const GAP = 3;
    const numVehicles = Phaser.Math.Between(2, 4);
    let cursor = direction > 0 ? -2 : cols + 2;

    for (let i = 0; i < numVehicles; i++) {
      const type = Phaser.Math.RND.pick(vehicleTypes);
      const col = direction > 0 ? cursor - type.width / 2 : cursor + type.width / 2;
      this.obstacles.push(this.createVehicle(col, row, direction, type));
      cursor += direction > 0 ? -(type.width + GAP) : (type.width + GAP);
    }
  }

  createVehicle(col, row, direction, type) {
    const sprite = this.add.rectangle(
      col * this.GRID_SIZE + this.GRID_SIZE / 2,
      row * this.GRID_SIZE + this.GRID_SIZE / 2,
      this.GRID_SIZE * type.width - 4,
      this.GRID_SIZE - 4,
      type.color
    );
    this.gameContainer.add(sprite);

    return { sprite, gridX: col, gridY: row, direction, speed: 1.2, width: type.width, type: type.name };
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
      cursor += direction > 0 ? -(logWidth + GAP) : (logWidth + GAP);
    }
  }


  createLog(col, row, direction, logWidth) {
    const sprite = this.add.image(
      col * this.GRID_SIZE + this.GRID_SIZE / 2,
      row * this.GRID_SIZE + this.GRID_SIZE / 2,
      `log${logWidth}`
    );
    sprite.setDisplaySize(this.GRID_SIZE * logWidth - 4, this.GRID_SIZE - 4);
    this.gameContainer.add(sprite);

    return { sprite, gridX: col, gridY: row, direction, speed: 1.5, width: logWidth, type: 'log', isSafe: true };
  }

  spawnCoin() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    let col, row;
    do {
      col = Phaser.Math.Between(1, cols - 2);
      row = Phaser.Math.Between(1, this.ROWS - 2);
    } while (this.rowLayout[row] === 'W'); // don't spawn on water

    this.coin = this.add.circle(
      col * this.GRID_SIZE + this.GRID_SIZE / 2,
      row * this.GRID_SIZE + this.GRID_SIZE / 2,
      this.GRID_SIZE / 3,
      0xffd700
    ).setDepth(600);
    this.gameContainer.add(this.coin);
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
      const row = Phaser.Math.Between(1, this.ROWS - 2); // spawn in game area only

      // check if position is already occupied
      const occupied = this.ingredients.some(ing =>
        ing.gridX === col && ing.gridY === row
      );

      if (occupied) continue;

      const sprite = this.add.star(
        col * this.GRID_SIZE + this.GRID_SIZE / 2,
        row * this.GRID_SIZE + this.GRID_SIZE / 2,
        5, this.GRID_SIZE / 4, this.GRID_SIZE / 2 - 4,
        this.config.color
      ).setDepth(500);
      this.gameContainer.add(sprite);

      this.ingredients.push({ sprite, gridX: col, gridY: row, collected: false });
      spawned++;
    }
    this.spawnCoin();
  }

  createUI() {
    const width = this.scale.width;

    // level indicator
    this.levelText = this.add.text(20, 20, `Level ${this.currentLevel}`, {
      fontSize: "28px",
      fill: "#000",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 5 }
    });

    // ingredient counter
    this.ingredientText = this.add.text(20, 60,
      `${this.config.ingredient}: ${this.collected}/${this.config.needed}`, {
      fontSize: "24px",
      fill: "#000",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 5 }
    });

    this.coinText = this.add.text(width - 20, 20,
      `Coins: ${this.registry.get('currency') || 0}`, {
      fontSize: "24px", fill: "#000",
      backgroundColor: "#fffbe6",
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);

  }

  update(time, delta) {
    this.updateObstacles(delta);
    this.handleInput();
    this.checkCollisions();
    if (this.playerOnLog) { // move olive with log if on one
      this.movePlayerWithLog(delta);
    }
  }

  updateObstacles(delta) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    this.obstacles.forEach(obs => {
      obs.gridX += obs.direction * obs.speed * delta / 1000;
      if (obs.direction > 0 && obs.gridX > cols + obs.width) obs.gridX = -obs.width;
      if (obs.direction < 0 && obs.gridX < -obs.width) obs.gridX = cols + obs.width;
      obs.sprite.x = obs.gridX * this.GRID_SIZE + this.GRID_SIZE / 2;
    });
  }

  movePlayerWithLog(delta) {
    const log = this.playerOnLog;
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);

    this.playerGridX += log.direction * log.speed * delta / 1000; // move olive based on log position    
    this.player.x = this.playerGridX * this.GRID_SIZE + this.GRID_SIZE / 2;
    // check if olive fell off the log (moved outside log bounds)
    const logLeft = log.gridX - log.width / 2;
    const logRight = log.gridX + log.width / 2;

    // death menu
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
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      newX = Math.round(this.playerGridX) + 1;
      newY = this.playerGridY;
      moved = true;
    }

    if (moved && newX >= 0 && newX < cols && newY >= 0 && newY < this.ROWS) {
      const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
      this.playerGridX = newX;
      this.playerGridY = newY;
      this.canMove = false;
      this.tweens.add({
        targets: this.player,
        x: newX * this.GRID_SIZE + this.GRID_SIZE / 2,
        y: newY * this.GRID_SIZE + this.GRID_SIZE / 2,
        duration: 150,
        onComplete: () => {
          this.canMove = true;
          this.checkWinCondition();
        },
      });
    }
  }

  checkCollisions() {

    const row = this.playerGridY;
    const type = this.rowLayout[row];
    if (type === 'G') {
      this.playerOnLog = null;

    } else if (type === 'W') {
      const log = this.obstacles.find(obs => {
        if (obs.type !== 'log' || obs.gridY !== row) return false;
        return this.playerGridX >= obs.gridX - obs.width / 2 &&
          this.playerGridX <= obs.gridX + obs.width / 2;
      });
      if (log) {
        this.playerOnLog = log;
      } else {
        this.playerOnLog = null;
        this.die('Fell in water!');
        return;
      }

    } else if (type === 'R') {
      this.playerOnLog = null;
      for (const obs of this.obstacles) {
        if (obs.type === 'log' || obs.gridY !== row) continue;
        if (this.playerGridX >= obs.gridX - obs.width / 2 &&
          this.playerGridX <= obs.gridX + obs.width / 2) {
          this.die('Hit by vehicle!');
          return;
        }
      }
    }

    this.ingredients.forEach(ing => {
      if (ing.collected) return;
      const dist = Phaser.Math.Distance.Between(
        this.playerGridX, this.playerGridY,
        ing.gridX, ing.gridY
      );
      if (dist < 0.6) {
        ing.collected = true;
        ing.sprite.destroy();
        this.collected++;
        this.ingredientText.setText(`${this.config.ingredient}: ${this.collected}/${this.config.needed}`);
      }
    });

    if (!this.coinCollected) {
      const coinDist = Phaser.Math.Distance.Between(
        this.playerGridX, this.playerGridY,
        this.coinGridX, this.coinGridY
      );
      if (coinDist < 0.6) {
        this.coinCollected = true;
        this.coin.destroy();
        const current = this.registry.get('currency') || 0;
        this.registry.set('currency', current + 1);
        this.coinText.setText(`Coins: ${current + 1}`);
      }
    }
  }

  checkWinCondition() { // reached top row (row 0)
    if (this.playerGridY === 0) {
      if (this.collected >= this.config.needed) {
        this.levelComplete();
      } else {
        this.die(`Need ${this.config.needed - this.collected} more ${this.config.ingredient}!`);
      }
    }
  }

  die(message) {
    this.canMove = false;
    this.playerOnLog = null;

    this.time.delayedCall(300, () => {
      this.showGameOver(message);
    });
  }

  levelComplete() {
    this.canMove = false;
    this.playerOnLog = null;

    if (this.currentLevel >= this.maxLevel) {
      this.showVictory();
    } else {
      this.showLevelComplete();
    }
  }

  _overlay() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 520, 380, 0x000000, 0.9);
    return { width, height };
  }

  _button(x, y, label, color, cb) {
    const btn = this.add.text(x, y, label, { fontSize: '28px', fill: color })
      .setOrigin(0.5).setInteractive();
    btn.on('pointerdown', cb);
    return btn;
  }

  showGameOver(message) {
    const { width, height } = this._overlay();
    this.add.text(width / 2, height / 2 - 110, 'Game Over!', {
      fontSize: '48px', fill: '#ff0000'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 50, message, {
      fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2,
      `${this.config.ingredient}: ${this.collected}/${this.config.needed}`,
      { fontSize: '20px', fill: '#ffffff' }
    ).setOrigin(0.5);
    this._button(width / 2, height / 2 + 70, 'Retry Level', '#ffffff', () => this.scene.restart({ level: this.currentLevel }));
    this._button(width / 2, height / 2 + 120, 'Back to Map', '#ffffff', () => this.scene.start('MapScene'));
  }

  showLevelComplete() {
    const { width, height } = this._overlay();
    this.add.text(width / 2, height / 2 - 110, 'Level Complete!', {
      fontSize: '44px',
      fill: '#00ff00'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 50, `${this.config.ingredient} collected!`, {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this._button(width / 2, height / 2 + 40, 'Next Level', '#ffffff', () => this.scene.restart({ level: this.currentLevel + 1 }));
    this._button(width / 2, height / 2 + 95, 'Back to Map', '#ffffff', () => this.scene.start('MapScene'));
  }

  showVictory() {
    const { width, height } = this._overlay();
    this.add.text(width / 2, height / 2 - 120, 'Victory!', {
      fontSize: '56px',
      fill: '#00ff00'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 50, 'All Ingredients Collected!', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, 'You completed all 5 levels!', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this._button(width / 2, height / 2 + 70, 'Play Again', '#ffffff', () => this.scene.restart({ level: 1 }));
    this._button(width / 2, height / 2 + 120, 'Back to Map', '#ffffff', () => this.scene.start('MapScene'));
  }
}