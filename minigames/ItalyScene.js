class ItalyScene extends Phaser.Scene {
  constructor() {
    super("ItalyScene");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.rectangle(width/2, height/2, width, height, 0xf5deb3);

    // Grid settings
    this.GRID_SIZE = 50;
    this.COLS = 8;
    this.ROWS = 8;

    // Create tile data
    this.tileMapData = this.generateTilemap(this.COLS, this.ROWS);

    // Group for everything in board
    this.boardContainer = this.add.container(
      (width - this.COLS * this.GRID_SIZE) / 2,
      (height - this.ROWS * this.GRID_SIZE) / 2
    );

    this.drawGrid();
    this.addPipes();

    // ESC to return to map
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MapScene");
    });
  }

  generateTilemap(width, height) {
    const map = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push({
          type: "0",
          isLit: false,
          rotationIndex: 0
        });
      }
      map.push(row);
    }

    map[0][0].type = "S";
    map[height - 1][width - 1].type = "E";
    return map;
  }

  drawGrid() {
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        const tile = this.tileMapData[y][x];

        let color = 0x666666;
        if (tile.type === "S") color = 0x00ff00;
        if (tile.type === "E") color = 0xff0000;

        const rect = this.add.rectangle(
          x * this.GRID_SIZE,
          y * this.GRID_SIZE,
          this.GRID_SIZE - 2,
          this.GRID_SIZE - 2,
          color
        ).setOrigin(0);

        this.boardContainer.add(rect);
      }
    }
  }

  addPipes() {
    // Bent pipes
    let bentX = [2,2,3,6,2,1];
    let bentY = [4,5,3,4,0,6];

    for (let i = 0; i < bentX.length; i++) {
      this.createPipe(bentX[i], bentY[i], 0xffa500);
    }

    // Straight pipes
    let straightX = [1,2,2,2,1,3];
    let straightY = [4,1,3,2,0,4];

    for (let i = 0; i < straightX.length; i++) {
      this.createPipe(straightX[i], straightY[i], 0xffffff);
    }
  }

  createPipe(gridX, gridY, color) {
    const tile = this.tileMapData[gridY][gridX];

    const pipe = this.add.rectangle(
      gridX * this.GRID_SIZE + this.GRID_SIZE/2,
      gridY * this.GRID_SIZE + this.GRID_SIZE/2,
      this.GRID_SIZE - 10,
      this.GRID_SIZE - 10,
      color
    );

    pipe.setInteractive();

    pipe.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);

    pipe.on("pointerdown", () => {
      tile.rotationIndex = (tile.rotationIndex + 1) % 4;

      this.tweens.add({
        targets: pipe,
        rotation: Phaser.Math.DegToRad(tile.rotationIndex * 90),
        duration: 200
      });
    });

    this.boardContainer.add(pipe);
  }
}
