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

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.ROWS = 20;
    this.GAME_ROWS = 19;
    this.GRID_SIZE = 30;
    this.gameWidth = width;
    this.gameHeight = this.ROWS * this.GRID_SIZE;
    this.offsetX = (width - this.gameWidth) / 2;
    this.offsetY = (height - this.gameHeight) / 2;
    this.add.rectangle(width/2, height/2, width, height, 0x87ceeb);
    this.gameContainer = this.add.container(this.offsetX, this.offsetY);

    this.config = this.levelConfig[this.currentLevel];
    this.collected = 0;
    this.createBoard();    
    this.createPlayer();    
    this.obstacles = [];
    this.ingredients = [];
    this.createLevelObjects();
    this.gameContainer.bringToTop(this.player);
    this.createUI();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.canMove = true;
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MapScene");
    });
  }

  createBoard() {
    const safeRows = [0, 4, 8, 12, 16];
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < Math.ceil(this.gameWidth / this.GRID_SIZE); col++) {
        const x = col * this.GRID_SIZE;
        const y = row * this.GRID_SIZE;
        // determine row type
        let color;
        if (row === this.ROWS - 1) {
          color = 0x90ee90; // bottom spawn row is always grass
        } else if (safeRows.includes(row)) {
          color = 0x90ee90; // grass is safe
        } else if (row % 3 === 1) {
          color = 0x696969; // road
        } else {
          color = 0x4a90e2; // anything that's not grass or road is water
        }
        const tile = this.add.rectangle(x, y, this.GRID_SIZE - 2, this.GRID_SIZE - 2, color);
        tile.setOrigin(0, 0);
        this.gameContainer.add(tile);
      }
    }    
    this.safeRows = safeRows;
  }

  createPlayer() {
    const startX = (Math.ceil(this.gameWidth / this.GRID_SIZE) / 2) * this.GRID_SIZE;
    const startY = (this.ROWS - 1) * this.GRID_SIZE; // bottom row
   
    this.player = this.add.circle(startX + this.GRID_SIZE/2, startY + this.GRID_SIZE/2,
                                   this.GRID_SIZE/2 - 4, 0x556b2f);
    this.player.setDepth(1000); // olive should always be seen
    this.gameContainer.add(this.player);
   
    this.playerGridX = Math.floor(startX / this.GRID_SIZE);
    this.playerGridY = this.ROWS - 1;
    this.playerOnLog = null; // track which log olive is on
  }

  createLevelObjects() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
   
    // make vehicles & logs for game rows only (exclude spawn row)
    for (let row = 1; row < this.GAME_ROWS; row++) {
      // skip safe grass rows
      if (this.safeRows.includes(row)) {
        continue;
      }
      const isRoad = row % 3 === 1; // determine if this row is road or water
      if (isRoad) { // spawn vehicles on road
        const direction = row % 2 === 0 ? 1 : -1;
        this.createVehicleLane(row, direction);
      } else { // spawn logs on water
        const direction = row % 2 === 0 ? 1 : -1;
        this.createWaterLane(row, direction);
      }
    }
    this.spawnIngredients();
  }

  createVehicleLane(row, direction) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const numVehicles = Phaser.Math.Between(2, 4);
    const spacing = Math.floor(cols / numVehicles);
   
    for (let i = 0; i < numVehicles; i++) {
      const col = (i * spacing + Phaser.Math.Between(0, spacing - 1)) % cols;
      const vehicle = this.createVehicle(col, row, direction);
      this.obstacles.push(vehicle);
    }
  }

  createVehicle(col, row, direction) {
    const x = col * this.GRID_SIZE + this.GRID_SIZE/2;
    const y = row * this.GRID_SIZE + this.GRID_SIZE/2;
    // random vehicle type, swap placeholders later
    const types = [
      { width: 2, height: 1, color: 0xff00ff, name: "jeepney" },
      { width: 1.5, height: 1, color: 0xffff00, name: "tricycle" },
      { width: 1, height: 1, color: 0xff0000, name: "car" }
    ];
    const type = Phaser.Math.RND.pick(types);
    const vehicle = this.add.rectangle(x, y, this.GRID_SIZE * type.width - 4,
                                       this.GRID_SIZE * type.height - 4, type.color);
    this.gameContainer.add(vehicle);
   
    return {
      sprite: vehicle,
      gridX: col,
      gridY: row,
      direction: direction,
      speed: 1.2,
      width: type.width,
      type: type.name
    };
  }

  createWaterLane(row, direction) {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    const numLogs = Phaser.Math.Between(3, 5);
    const spacing = Math.floor(cols / numLogs);
   
    for (let i = 0; i < numLogs; i++) {
      const col = (i * spacing + Phaser.Math.Between(0, spacing - 1)) % cols;
      const log = this.createLog(col, row, direction);
      this.obstacles.push(log);
    }
  }

  createLog(col, row, direction) {
    const x = col * this.GRID_SIZE + this.GRID_SIZE/2;
    const y = row * this.GRID_SIZE + this.GRID_SIZE/2;
    const logWidth = Phaser.Math.Between(2, 4);

    const log = this.add.rectangle(x, y, this.GRID_SIZE * logWidth - 4, this.GRID_SIZE - 4, 0x8b4513);
    this.gameContainer.add(log);

    return {
      sprite: log,
      gridX: col,
      gridY: row,
      direction: direction,
      speed: 1.5,
      width: logWidth,
      type: "log",
      isSafe: true
    };
  }

  spawnIngredients() {
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);
    let spawned = 0;
   
    while (spawned < this.config.needed + 2) {
      const col = Phaser.Math.Between(0, cols - 1);
      const row = Phaser.Math.Between(2, this.GAME_ROWS - 2); // spawn in game area only
     
      // check if position is already occupied
      const occupied = this.ingredients.some(ing =>
        ing.gridX === col && ing.gridY === row
      );
     
      if (!occupied) {
        const x = col * this.GRID_SIZE + this.GRID_SIZE/2;
        const y = row * this.GRID_SIZE + this.GRID_SIZE/2;
       
        const ingredient = this.add.star(x, y, 5, this.GRID_SIZE/4, this.GRID_SIZE/2 - 4,
                                        this.config.color);
        ingredient.setDepth(500); // above the board/background, below the player
        this.gameContainer.add(ingredient);
       
        this.ingredients.push({
          sprite: ingredient,
          gridX: col,
          gridY: row,
          collected: false
        });
       
        spawned++;
      }
    }
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

    // directions
    this.add.text(width/2, 20, "Use arrow keys to move", {
      fontSize: "20px",
      fill: "#000",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
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
    this.obstacles.forEach(obstacle => {
      obstacle.gridX += obstacle.direction * obstacle.speed * delta / 1000;      
      if (obstacle.direction > 0 && obstacle.gridX > cols + obstacle.width) {
        obstacle.gridX = -obstacle.width;
      } else if (obstacle.direction < 0 && obstacle.gridX < -obstacle.width) {
        obstacle.gridX = cols + obstacle.width;
      }      
      obstacle.sprite.x = obstacle.gridX * this.GRID_SIZE + this.GRID_SIZE/2;
    });
  }

  movePlayerWithLog(delta) {
    if (this.playerOnLog && !this.canMove) return;
   
    const log = this.playerOnLog;
    const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);    
    this.playerGridX += log.direction * log.speed * delta / 1000; // move olive based on log position    
    this.player.x = this.playerGridX * this.GRID_SIZE + this.GRID_SIZE/2;
    // check if olive fell off the log (moved outside log bounds)
    const logLeft = log.gridX - log.width/2;
    const logRight = log.gridX + log.width/2;

    // death menu
    if (this.playerGridX < logLeft || this.playerGridX > logRight) {
      this.die("Fell off the log!");
      return;
    }    
    if (this.playerGridX < -0.5 || this.playerGridX > cols - 0.5) {
      this.die("Pushed off screen!");
    }
  }

  handleInput() {
    if (!this.canMove) return;
    let moved = false;
    let newX = this.playerGridX;
    let newY = this.playerGridY;
   
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      newY--;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      newY++;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      newX--;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      newX++;
      moved = true;
    }
   
    if (moved) {
      const cols = Math.ceil(this.gameWidth / this.GRID_SIZE);      
      if (newX >= 0 && newX < cols && newY >= 0 && newY < this.ROWS) {
        this.playerGridX = newX;
        this.playerGridY = newY;
       
        this.canMove = false;
        this.tweens.add({
          targets: this.player,
          x: newX * this.GRID_SIZE + this.GRID_SIZE/2,
          y: newY * this.GRID_SIZE + this.GRID_SIZE/2,
          duration: 150,
          onComplete: () => {
            this.canMove = true;
            this.checkWinCondition();
          }
        });
      }
    }
  }

  checkCollisions() {
    const playerRow = this.playerGridY;
   
    // bottom spawn row or safe grass rows, no hazards
    if (playerRow === this.ROWS - 1 || this.safeRows.includes(playerRow)) {
      this.playerOnLog = null; // Not on a log
    } else if (playerRow < this.GAME_ROWS) {
      // in game area, check hazards
      const isRoad = playerRow % 3 === 1;
     
      if (!isRoad) {
        // water row, must be on a log
        const log = this.obstacles.find(obstacle => {
          if (obstacle.type === "log" && obstacle.gridY === playerRow) {
            const logLeft = obstacle.gridX - obstacle.width/2;
            const logRight = obstacle.gridX + obstacle.width/2;
            return this.playerGridX >= logLeft && this.playerGridX <= logRight;
          }
          return false;
        });
       
        if (log) {
          this.playerOnLog = log; // olive is on this log
        } else {
          this.playerOnLog = null;
          this.die("Fell in water!");
          return;
        }
      } else {
        // road row, check vehicle collisions
        this.playerOnLog = null; // not on a log
       
        this.obstacles.forEach(obstacle => {
          if (obstacle.type !== "log" && obstacle.gridY === playerRow) {
            const obstacleLeft = obstacle.gridX - obstacle.width/2;
            const obstacleRight = obstacle.gridX + obstacle.width/2;
           
            if (this.playerGridX >= obstacleLeft && this.playerGridX <= obstacleRight) {
              this.die("Hit by vehicle!");
            }
          }
        });
      }
    }
   
    // check ingredient collection
    this.ingredients.forEach(ingredient => {
      if (!ingredient.collected) {
        const distance = Phaser.Math.Distance.Between(
          this.playerGridX, this.playerGridY,
          ingredient.gridX, ingredient.gridY
        );
       
        if (distance < 0.4) {
          ingredient.collected = true;
          ingredient.sprite.destroy();
          this.collected++;
          this.ingredientText.setText(`${this.config.ingredient}: ${this.collected}/${this.config.needed}`);
        }
      }
    });
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

  showGameOver(message) {
    const width = this.scale.width;
    const height = this.scale.height;
    const bg = this.add.rectangle(width/2, height/2, 500, 350, 0x000000, 0.9);
   
    this.add.text(width/2, height/2 - 100, "Game Over!", {
      fontSize: "48px",
      fill: "#ff0000"
    }).setOrigin(0.5);
    this.add.text(width/2, height/2 - 40, message, {
      fontSize: "24px",
      fill: "#ffffff"
    }).setOrigin(0.5);
    this.add.text(width/2, height/2 + 10, `${this.config.ingredient} Collected: ${this.collected}/${this.config.needed}`, {
      fontSize: "20px",
      fill: "#ffff00"
    }).setOrigin(0.5);
   
    const retryBtn = this.add.text(width/2, height/2 + 80, "Retry Level", {
      fontSize: "28px",
      fill: "#00ff00"
    }).setOrigin(0.5).setInteractive();
    retryBtn.on("pointerdown", () => {
      this.scene.restart({ level: this.currentLevel });
    });

    const mapBtn = this.add.text(width/2, height/2 + 130, "Back to Map", {
      fontSize: "28px",
      fill: "#ffff00"
    }).setOrigin(0.5).setInteractive();
    mapBtn.on("pointerdown", () => {
      this.scene.start("MapScene");
    });
  }

  showLevelComplete() {
    const width = this.scale.width;
    const height = this.scale.height;
    const bg = this.add.rectangle(width/2, height/2, 500, 350, 0x000000, 0.9);
   
    this.add.text(width/2, height/2 - 100, "Level Complete!", {
      fontSize: "48px",
      fill: "#00ff00"
    }).setOrigin(0.5);
    this.add.text(width/2, height/2 - 30, `${this.config.ingredient} collected!`, {
      fontSize: "28px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    const nextBtn = this.add.text(width/2, height/2 + 50, "Next Level", {
      fontSize: "32px",
      fill: "#00ff00"
    }).setOrigin(0.5).setInteractive();
    nextBtn.on("pointerdown", () => {
      this.scene.restart({ level: this.currentLevel + 1 });
    });

    const mapBtn = this.add.text(width/2, height/2 + 110, "Back to Map", {
      fontSize: "28px",
      fill: "#ffff00"
    }).setOrigin(0.5).setInteractive();
    mapBtn.on("pointerdown", () => {
      this.scene.start("MapScene");
    });
  }

  showVictory() {
    const width = this.scale.width;
    const height = this.scale.height;
    const bg = this.add.rectangle(width/2, height/2, 500, 400, 0x000000, 0.9);
   
    this.add.text(width/2, height/2 - 120, "Victory!", {
      fontSize: "56px",
      fill: "#ffd700"
    }).setOrigin(0.5);
    this.add.text(width/2, height/2 - 40, "All Lumpia Ingredients Collected!", {
      fontSize: "28px",
      fill: "#ffffff"
    }).setOrigin(0.5);
    this.add.text(width/2, height/2 + 10, "You completed all 5 levels!", {
      fontSize: "24px",
      fill: "#00ff00"
    }).setOrigin(0.5);
   
    const playAgainBtn = this.add.text(width/2, height/2 + 80, "Play Again", {
      fontSize: "28px",
      fill: "#00ff00"
    }).setOrigin(0.5).setInteractive();
    playAgainBtn.on("pointerdown", () => {
      this.scene.restart({ level: 1 });
    });

    const mapBtn = this.add.text(width/2, height/2 + 130, "Back to Map", {
      fontSize: "28px",
      fill: "#ffff00"
    }).setOrigin(0.5).setInteractive();
    mapBtn.on("pointerdown", () => {
      this.scene.start("MapScene");
    });
  }
}