class ItalyScene extends Phaser.Scene {
 constructor() {
   super("ItalyScene");
 }


 preload() {
   this.load.image('bent', 'assets/italy/pasta_corner_new.png');
   this.load.image('straight', 'assets/italy/straight_pasta.png');
   this.load.image('crossed', 'assets/italy/crossed_pasta.png');
   this.load.image('t_shape', 'assets/italy/t-shaped_pasta.png');
 }


 create(data) {

  if (data.level) {
    this.level = data.level;
  } else {
    this.level = 1;
  }
  
   const width = this.scale.width;
   const height = this.scale.height;
   this.hasWon = false;
   this.outOfClicksShown = false;
   this.palette = {
    bg: 0xf2d6a2,
    bgAccent: 0xe5b56a,
    panel: 0xfff4dd,
    panelBorder: 0xb87433,
    board: 0xf7e7c4,
    boardShadow: 0xd59b56,
    tile: 0x8b6a4b,
    tileAlt: 0x7a5c40,
    start: 0x5ea04f,
    end: 0xc84f3f,
    text: "#4d2f1b",
    button: 0x7c2d12,
    buttonDisabled: 0x6d6257
   };
  if (this.level === undefined) {
  this.level = 1;
}

   this.add.rectangle(width/2, height/2, width, height, this.palette.bg);
   this.add.circle(110, 90, 78, this.palette.bgAccent, 0.22);
   this.add.circle(width - 95, 105, 88, this.palette.bgAccent, 0.18);
   this.add.ellipse(width / 2, height - 24, width * 0.72, 72, this.palette.bgAccent, 0.2);


this.levelText = this.add.text(width - 138, 22, "Level " + this.level, {
  fontSize: "24px",
  color: this.palette.text,
  fontStyle: "bold",
  backgroundColor: "#fff4dd",
  padding: { x: 12, y: 8 }
});
   if(this.level === 1){
    this.pointerCountAll = 30;
   }
   if(this.level === 2){
    this.pointerCountAll = 40;
   }
   if(this.level === 3){
    this.pointerCountAll = 50;
   }
   if(this.level === 4){
    this.pointerCountAll = 60;
   }
   if(this.level === 5){
    this.pointerCountAll = 70;
   }
   this.startingClicks = this.pointerCountAll;
   this.pointerText = this.add.text(20, 20, "Clicks: " + this.pointerCountAll , {
     fontSize: "24px",
     color: this.palette.text,
     fontStyle: "bold",
     backgroundColor: "#fff4dd",
     padding: { x: 12, y: 8 }
   });
   
   this.GRID_SIZE = 50;
   this.COLS = 8;
   this.ROWS = 8;
   this.tileMapData = this.generateTilemap(this.COLS, this.ROWS);
   this.pastaSprites = [];
   this.pastaSpritesByCoord = {};


   this.boardContainer = this.add.container(
     (width - this.COLS * this.GRID_SIZE) / 2,
     (height - this.ROWS * this.GRID_SIZE) / 2
   );

this.levelLayouts = {
  1: {
  bentX: [0,3,3,5,5,7,1,6],
  bentY: [5,5,6,6,2,2,1,7],

  straightX: [0,0,0,0,1,2,4,5,5,5,6,7,7,7,7,2,4,6],
  straightY: [1,2,3,4,5,5,6,5,4,3,2,3,4,5,6,1,3,6],

  crossedX: [4,3],
  crossedY: [4,1],

  tX: [2,6,1],
  tY: [6,0,6]
},
  2: {
  bentX: [1,1,3,3,4,4,6,6,2,7],
  bentY: [0,4,2,4,2,5,5,7,0,4],

  straightX: [1,1,1,2,3,4,4,5,6,2,5,7],
  straightY: [1,2,3,4,3,3,4,5,6,2,2,6],

  crossedX: [7,5],
  crossedY: [5,1],

  tX: [0,6,3],
  tY: [6,3,6]
},

3: {
  bentX: [2,2,3,6,2,1,4,3,5,3,0,6],
  bentY: [4,5,3,4,0,6,4,5,5,7,1,6],

  straightX: [1,2,2,2,1,3,6,3,5,4,4,5],
  straightY: [4,1,3,2,0,4,7,6,6,7,0,3],

  crossedX: [2,1],
  crossedY: [7,7],

  tX: [4,7,5,4,6],
  tY: [2,1,7,5,5]
},

4: {
  bentX: [0,2,2,2,2,3,4,4,4,6,6,1,7],
  bentY: [2,0,3,4,6,3,2,6,7,4,0,1,3],

  straightX: [0,1,2,2,3,3,3,4,4,5,5,5,6,6,6,6,1,5],
  straightY: [1,2,1,5,1,4,6,0,3,0,4,7,1,2,3,7,4,6],

  crossedX: [2,3],
  crossedY: [2,2],

  tX: [3,4,0],
  tY: [0,4,7]

},

5: {
  bentX: [1,0,0,1,1,3,4,4,5,5,5,5,6,6,7],
  bentY: [0,2,5,2,6,3,3,6,1,2,3,6,2,6,1],

  straightX: [1,1,3,3,4,5,6,6,6,6,7,7,7,7,7],
  straightY: [1,3,4,5,5,5,1,3,4,5,2,3,4,5,6],

  crossedX: [1],
  crossedY: [5],

  tX: [0,0,1,2,2,2,2,3,4,5],
  tY: [3,4,4,3,4,5,6,6,4,4]
},

};

  const boardX = (width - this.COLS * this.GRID_SIZE) / 2;
  const boardY = (height - this.ROWS * this.GRID_SIZE) / 2;
  const boardWidth = this.COLS * this.GRID_SIZE;
  const resetX = boardX + boardWidth / 2;
  const resetY = boardY + this.ROWS * this.GRID_SIZE + 42;

  const reset_button = this.add.rectangle(resetX, resetY, 112, 42, this.palette.button)
    .setStrokeStyle(2, this.palette.panelBorder)
    .setInteractive({ useHandCursor: true });
  const reset_text = this.add.text(resetX, resetY, "Reset", {
    color: "#fff8ee",
    fontSize: "18px",
    fontStyle: "bold"
  }).setOrigin(0.5);

  reset_button.on("pointerdown", () => {
    const clicksUsed = this.startingClicks - this.pointerCountAll;
    if (clicksUsed < 5) {
      this.scene.restart({ level: this.level });
    }
  });

  this.reset_button = reset_button;
  this.reset_text = reset_text;
  this.boardContainer.setDepth(2);
  this.drawGrid();
   this.addPipes();
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


       let color = (x + y) % 2 === 0 ? this.palette.tile : this.palette.tileAlt;
       if (tile.type === "S") color = this.palette.start;
       if (tile.type === "E") color = this.palette.end;

       const shadow = this.add.rectangle(
         x * this.GRID_SIZE + 2,
         y * this.GRID_SIZE + 3,
         this.GRID_SIZE - 4,
         this.GRID_SIZE - 4,
         this.palette.boardShadow,
         0.32
       ).setOrigin(0);


       const rect = this.add.rectangle(
         x * this.GRID_SIZE,
         y * this.GRID_SIZE,
         this.GRID_SIZE - 4,
         this.GRID_SIZE - 4,
         color
       ).setOrigin(0).setStrokeStyle(2, 0xf7e7c4, 0.3);


       this.boardContainer.add(shadow);
       this.boardContainer.add(rect);
     }
   }
 }


 addPipes() {

const level = this.levelLayouts[this.level];

for (let i = 0; i < level.bentX.length; i++) {
  this.createPipe(level.bentX[i], level.bentY[i], 'bent');
}

for (let i = 0; i < level.straightX.length; i++) {
  this.createPipe(level.straightX[i], level.straightY[i], 'straight');
}

for (let i = 0; i < level.crossedX.length; i++) {
  this.createPipe(level.crossedX[i], level.crossedY[i], 'crossed');
}

for (let i = 0; i < level.tX.length; i++) {
  this.createPipe(level.tX[i], level.tY[i], 't_shape');
}

}

 createPipe(gridX, gridY, textureKey, rotationIndex) {
   const tile = this.tileMapData[gridY][gridX];

   tile.rotationIndex = Phaser.Math.Between(0, 3);

   const pipe = this.add.image(
     gridX * this.GRID_SIZE + this.GRID_SIZE/2,
     gridY * this.GRID_SIZE + this.GRID_SIZE/2,
     textureKey
   );


   pipe.setDisplaySize(
   this.GRID_SIZE - 4,
   this.GRID_SIZE - 4);
   pipe.setInteractive({ useHandCursor: true });
   const baseScaleX = pipe.scaleX;
   const baseScaleY = pipe.scaleY;

pipe.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);
pipe.on("pointerdown", () => {
  if(this.pointerCountAll > 0){
    tile.rotationIndex = (tile.rotationIndex + 1) % 4;
    
    this.pointerCountAll -= 1;
    this.pointerText.setText("Clicks: " + this.pointerCountAll);
    this.tweens.add({
      targets: pipe,
      rotation: pipe.rotation + Phaser.Math.DegToRad(90),
      duration: 180,
      ease: "Cubic.Out"
    });
    this.tweens.add({
      targets: pipe,
      scaleX: baseScaleX * 1.05,
      scaleY: baseScaleY * 1.05,
      yoyo: true,
      duration: 90
    });

    const clicksUsed = this.startingClicks - this.pointerCountAll;
    if (clicksUsed >= 5) {
      this.reset_button.setFillStyle(this.palette.buttonDisabled);
      this.reset_text.setColor("#d8d0c8");
    }
    this.checkWin();
  } 
  else if (this.pointerCountAll == 0){
    if(this.outOfClicksShown) return;
    this.outOfClicksShown = true;
    const popup = this.add.rectangle(400, 300, 320, 170, 0x2b140c, 0.94)
      .setStrokeStyle(3, this.palette.panelBorder)
      .setDepth(20);
    this.add.text(400, 266, "You have run out of clicks!", {
      fontSize: "20px",
      color: "#fff4dd",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(21);
    this.add.text(400, 305, "Restart", {
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#7c2d12",
      padding: { x: 18, y: 8 }
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.outOfClicksShown = false;
        popup.destroy();
        this.scene.restart({ level: 1 });
      });
  }
});

pipe.on("pointerover", () => {
  if (!this.hasWon) {
    pipe.setScale(baseScaleX * 1.04, baseScaleY * 1.04);
  }
});

pipe.on("pointerout", () => {
  pipe.setScale(baseScaleX, baseScaleY);
});
this.boardContainer.add(pipe);
this.pastaSprites.push(pipe);
this.pastaSpritesByCoord[`${gridX},${gridY}`] = pipe;
pipe.tileData = tile;
}

 getWinningAnimationCoords() {
  const winningCoords = {
    1: [[0,1],[0,2],[0,3],[0,4],[1,5],[2,5],[4,6],[5,3],[5,4],[5,5],[6,2],[7,3],[7,4],[7,5],[7,6],[0,5],[3,5],[3,6],[5,6],[5,2],[7,2]],
    2: [[1,0],[1,4],[3,2],[3,4],[4,2],[4,5],[6,5],[6,7],[1,1],[1,2],[1,3],[2,4],[3,3],[4,3],[4,4],[5,5],[6,6]],
    3: [[1,0],[2,0],[2,1],[2,2],[2,3],[2,4],[3,4],[4,4],[3,5],[4,5],[5,5],[3,6],[5,6],[3,7],[4,7],[5,7],[6,7]],
    4: [[0,2],[2,0],[2,3],[2,4],[2,6],[3,3],[4,2],[4,6],[4,7],[6,4],[6,0],[0,1],[1,2],[2,1],[2,5],[3,1],[3,4],[3,6],[4,0],[4,3],[5,0],[5,4],[5,7],[6,1],[6,2],[6,3],[6,7],[3,0],[4,4],[2,2],[3,2]],
    5: [[1,0],[0,2],[0,5],[1,2],[1,6],[3,3],[4,3],[4,6],[5,1],[5,2],[5,3],[5,6],[6,2],[6,6],[7,1],[1,1],[1,3],[3,4],[3,5],[4,5],[5,5],[6,1],[6,3],[6,4],[6,5],[7,2],[7,3],[7,4],[7,5],[7,6],[1,5],[0,3],[0,4],[1,4],[2,3],[2,4],[2,5],[2,6],[3,6],[4,4],[5,4]]
  };

  return winningCoords[this.level] || [];
 }

 playSauceFillAnimation(coords, onComplete) {
  const targetPasta = coords
    .map(([x, y]) => this.pastaSpritesByCoord[`${x},${y}`])
    .filter(Boolean);

  if (!targetPasta.length) {
    if (onComplete) onComplete();
    return;
  }

  let completed = 0;

  targetPasta.forEach((pipe, index) => {
    const sauce = this.add.image(pipe.x, pipe.y, pipe.texture.key);
    sauce.setDisplaySize(pipe.displayWidth, pipe.displayHeight);
    sauce.setRotation(Phaser.Math.DegToRad(pipe.tileData.rotationIndex * 90));
    sauce.setTint(0xc63f2f);
    sauce.setAlpha(0.92);
    sauce.setCrop(0, sauce.height, sauce.width, 0);
    this.boardContainer.add(sauce);

    const fillState = { progress: 0 };

    this.tweens.add({
      targets: fillState,
      progress: 1,
      delay: index * 40,
      duration: 320,
      ease: "Sine.Out",
      onUpdate: () => {
        const cropHeight = sauce.height * fillState.progress;
        const cropY = sauce.height - cropHeight;
        sauce.setCrop(0, cropY, sauce.width, cropHeight);
      },
      onComplete: () => {
        completed += 1;
        if (completed === targetPasta.length && onComplete) {
          onComplete();
        }
      }
    });
  });
 }

 showWinPopup() {
  this.pointerText.setText("YOU WIN!");

  const next_button = this.add.rectangle(400, 350, 300, 170, 0x2b140c, 0.94)
    .setStrokeStyle(3, this.palette.panelBorder)
    .setInteractive({ useHandCursor: true })
    .setDepth(20);
  this.add.text(400, 292, "You passed\nthis level!", {
    fontSize: "28px",
    color: "#fff4dd",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(21);
  this.add.text(400, 360, "Next Level", {
    fontSize: "30px",
    color: "#ffffff",
    backgroundColor: "#7c2d12",
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setDepth(21);

  next_button.on("pointerdown", () => {
    this.nextLevel();
  });
 }
	checkWin() {

  if (this.hasWon) {
    return;
  }
  if (this.level === 1) {

    const pasta_1 = this.tileMapData[1][0];
    const pasta_2 = this.tileMapData[2][0];
    const pasta_3 = this.tileMapData[3][0];
    const pasta_4 = this.tileMapData[4][0];
    const pasta_5 = this.tileMapData[5][1];
    const pasta_6 = this.tileMapData[5][2];
    const pasta_7 = this.tileMapData[6][4];
    const pasta_8 = this.tileMapData[3][5];
    const pasta_9 = this.tileMapData[4][5];
    const pasta_10 = this.tileMapData[5][5];
    const pasta_11 = this.tileMapData[2][6];
    const pasta_12 = this.tileMapData[3][7];
    const pasta_13 = this.tileMapData[4][7];
    const pasta_14 = this.tileMapData[5][7];
    const pasta_15 = this.tileMapData[6][7];

    const pasta_16 = this.tileMapData[5][0];
    const pasta_17 = this.tileMapData[5][3];
    const pasta_18 = this.tileMapData[6][3];
    const pasta_19 = this.tileMapData[6][5];
    const pasta_20 = this.tileMapData[2][5];
    const pasta_21 = this.tileMapData[2][7];

    if (
      pasta_1.rotationIndex % 2 != 0 &&
      pasta_2.rotationIndex % 2 != 0 &&
      pasta_3.rotationIndex  % 2 != 0 &&
      pasta_4.rotationIndex % 2 != 0 &&
      pasta_5.rotationIndex % 2 == 0 &&
      pasta_6.rotationIndex % 2 == 0 &&
      pasta_7.rotationIndex % 2 == 0 &&
      pasta_8.rotationIndex % 2 != 0 &&
      pasta_9.rotationIndex % 2 != 0 &&
      pasta_10.rotationIndex % 2 != 0 &&
      pasta_11.rotationIndex % 2 == 0 &&
      pasta_12.rotationIndex % 2 != 0 &&
      pasta_13.rotationIndex % 2 != 0 &&
      pasta_14.rotationIndex % 2 != 0 &&
      pasta_15.rotationIndex % 2 != 0 &&
      
      pasta_16.rotationIndex == 3 &&
      pasta_17.rotationIndex == 1 &&
      pasta_18.rotationIndex == 3 &&
      pasta_19.rotationIndex == 2 &&
      pasta_20.rotationIndex == 0 &&
      pasta_21.rotationIndex == 1
    ) {

      this.hasWon = true;
      this.playSauceFillAnimation(this.getWinningAnimationCoords(), () => this.showWinPopup());

    }

  }
  if (this.level === 2) {

    const pasta_1 = this.tileMapData[0][1];
    const pasta_2 = this.tileMapData[4][1];
    const pasta_3 = this.tileMapData[2][3];
    const pasta_4 = this.tileMapData[4][3];
    const pasta_5 = this.tileMapData[2][4];
    const pasta_6 = this.tileMapData[5][4];
    const pasta_7 = this.tileMapData[5][6];
    const pasta_8 = this.tileMapData[7][6];

    const pasta_9 = this.tileMapData[1][1];
    const pasta_10 = this.tileMapData[2][1];
    const pasta_11 = this.tileMapData[3][1];
    const pasta_12 = this.tileMapData[4][2];
    const pasta_13 = this.tileMapData[3][3];
    const pasta_14 = this.tileMapData[3][4];
    const pasta_15 = this.tileMapData[4][4];
    const pasta_16 = this.tileMapData[5][5];
    const pasta_17 = this.tileMapData[6][6];

    if (
      pasta_1.rotationIndex == 1 &&
      pasta_2.rotationIndex == 3 &&
      pasta_3.rotationIndex == 0 &&
      pasta_4.rotationIndex == 2 &&
      pasta_5.rotationIndex == 1 &&
      pasta_6.rotationIndex == 3 &&
      pasta_7.rotationIndex == 1 &&
      pasta_8.rotationIndex == 3 &&

      pasta_9.rotationIndex % 2 != 0 &&
      pasta_10.rotationIndex % 2 != 0 &&
      pasta_11.rotationIndex % 2 != 0 &&
      pasta_12.rotationIndex % 2 == 0 &&
      pasta_13.rotationIndex % 2 != 0 &&
      pasta_14.rotationIndex % 2 != 0 &&
      pasta_15.rotationIndex % 2 != 0 &&
      pasta_16.rotationIndex % 2 == 0 &&
      pasta_17.rotationIndex % 2 != 0
    ) {

      this.hasWon = true;
      this.playSauceFillAnimation(this.getWinningAnimationCoords(), () => this.showWinPopup());

    }

  }
  if (this.level === 3) {

    const pasta_1 = this.tileMapData[0][1];
    const pasta_2 = this.tileMapData[0][2];
    const pasta_3 = this.tileMapData[1][2];
    const pasta_4 = this.tileMapData[2][2];
    const pasta_5 = this.tileMapData[3][2];
    const pasta_6 = this.tileMapData[4][2];

    const pasta_7 = this.tileMapData[4][3];
    const pasta_8 = this.tileMapData[4][4];
    const pasta_9 = this.tileMapData[5][3];
    const pasta_10 = this.tileMapData[5][4];
    const pasta_11 = this.tileMapData[5][5];

    const pasta_12 = this.tileMapData[6][3];
    const pasta_13 = this.tileMapData[6][5];
    const pasta_14 = this.tileMapData[7][3];
    const pasta_15 = this.tileMapData[7][4];
    const pasta_16 = this.tileMapData[7][5];
    const pasta_17 = this.tileMapData[7][6];

    if (
      pasta_1.rotationIndex % 2 == 0 &&
      pasta_2.rotationIndex == 1 &&
      pasta_3.rotationIndex % 2 != 0 &&
      pasta_4.rotationIndex % 2 != 0 &&
      pasta_5.rotationIndex % 2 != 0 &&
      pasta_6.rotationIndex == 3 &&
      pasta_7.rotationIndex % 2 == 0 &&
      pasta_8.rotationIndex == 1 &&
      pasta_9.rotationIndex == 0 &&
      pasta_10.rotationIndex == 2 &&
      pasta_11.rotationIndex == 1 &&
      pasta_12.rotationIndex % 2 != 0 &&
      pasta_13.rotationIndex % 2 != 0 &&
      pasta_14.rotationIndex == 3 &&
      pasta_15.rotationIndex % 2 == 0 &&
      pasta_16.rotationIndex == 2 &&
      pasta_17.rotationIndex % 2 == 0
    ) {

      this.hasWon = true;
      this.playSauceFillAnimation(this.getWinningAnimationCoords(), () => this.showWinPopup());

    }

  }

    if (this.level === 4) {

const pasta_1 = this.tileMapData[2][0];
const pasta_2 = this.tileMapData[0][2];
const pasta_3 = this.tileMapData[3][2];
const pasta_4 = this.tileMapData[4][2];
const pasta_5 = this.tileMapData[6][2];
const pasta_6 = this.tileMapData[3][3];
const pasta_7 = this.tileMapData[2][4];
const pasta_8 = this.tileMapData[6][4];
const pasta_9 = this.tileMapData[7][4];
const pasta_10 = this.tileMapData[4][6];
const pasta_11 = this.tileMapData[0][6];

const pasta_12 = this.tileMapData[1][0];
const pasta_13 = this.tileMapData[2][1];
const pasta_14 = this.tileMapData[1][2];
const pasta_15 = this.tileMapData[5][2];
const pasta_16 = this.tileMapData[1][3];
const pasta_17 = this.tileMapData[4][3];
const pasta_18 = this.tileMapData[6][3];
const pasta_19 = this.tileMapData[0][4];
const pasta_20 = this.tileMapData[3][4];
const pasta_21 = this.tileMapData[0][5];
const pasta_22 = this.tileMapData[4][5];
const pasta_23 = this.tileMapData[7][5];
const pasta_24 = this.tileMapData[1][6];
const pasta_25 = this.tileMapData[2][6];
const pasta_26 = this.tileMapData[3][6];
const pasta_27 = this.tileMapData[7][6];

const pasta_30 = this.tileMapData[0][3];
const pasta_31 = this.tileMapData[4][4];

  if (
  pasta_1.rotationIndex == 3 &&
  pasta_2.rotationIndex == 0 &&
  pasta_3.rotationIndex == 3 &&
  pasta_4.rotationIndex == 0 &&
  pasta_5.rotationIndex == 3 &&
  pasta_6.rotationIndex == 2 &&
  pasta_7.rotationIndex == 1 &&
  pasta_8.rotationIndex == 1 &&
  pasta_9.rotationIndex == 3 &&
  pasta_10.rotationIndex == 2 &&
  pasta_11.rotationIndex == 1 &&

  pasta_12.rotationIndex % 2 != 0 &&
  pasta_13.rotationIndex % 2 == 0 &&
  pasta_14.rotationIndex % 2 != 0 &&
  pasta_15.rotationIndex % 2 != 0 &&
  pasta_16.rotationIndex % 2 != 0 &&
  pasta_17.rotationIndex % 2 == 0 &&
  pasta_18.rotationIndex % 2 == 0 &&
  pasta_19.rotationIndex % 2 == 0 &&
  pasta_20.rotationIndex % 2 != 0 &&
  pasta_21.rotationIndex % 2 == 0 &&
  pasta_22.rotationIndex % 2 == 0 &&
  pasta_23.rotationIndex % 2 == 0 &&
  pasta_24.rotationIndex % 2 != 0 &&
  pasta_25.rotationIndex % 2 != 0 &&
  pasta_26.rotationIndex % 2 != 0 &&
  pasta_27.rotationIndex % 2 == 0 &&

  pasta_30.rotationIndex == 0 &&
  pasta_31.rotationIndex == 2
    ) {

      this.hasWon = true;
      this.playSauceFillAnimation(this.getWinningAnimationCoords(), () => this.showWinPopup());

    }
  
  }
  if (this.level === 5) {

const pasta_1 = this.tileMapData[0][1];
const pasta_2 = this.tileMapData[2][0];
const pasta_3 = this.tileMapData[5][0];
const pasta_4 = this.tileMapData[2][1];
const pasta_5 = this.tileMapData[6][1];
const pasta_6 = this.tileMapData[3][3];
const pasta_7 = this.tileMapData[3][4];
const pasta_8 = this.tileMapData[6][4];
const pasta_9 = this.tileMapData[1][5];
const pasta_10 = this.tileMapData[2][5];
const pasta_11 = this.tileMapData[3][5];
const pasta_12 = this.tileMapData[6][5];
const pasta_13 = this.tileMapData[2][6];
const pasta_14 = this.tileMapData[6][6];
const pasta_15 = this.tileMapData[1][7];

const pasta_16 = this.tileMapData[1][1];
const pasta_17 = this.tileMapData[3][1];
const pasta_18 = this.tileMapData[4][3];
const pasta_19 = this.tileMapData[5][3];
const pasta_20 = this.tileMapData[5][4];
const pasta_21 = this.tileMapData[5][5];
const pasta_22 = this.tileMapData[1][6];
const pasta_23 = this.tileMapData[3][6];
const pasta_24 = this.tileMapData[4][6];
const pasta_25 = this.tileMapData[5][6];
const pasta_26 = this.tileMapData[2][7];
const pasta_27 = this.tileMapData[3][7];
const pasta_28 = this.tileMapData[4][7];
const pasta_29 = this.tileMapData[5][7];
const pasta_30 = this.tileMapData[6][7];

const pasta_31 = this.tileMapData[5][1];

const pasta_32 = this.tileMapData[3][0];
const pasta_33 = this.tileMapData[4][0];
const pasta_34 = this.tileMapData[4][1];
const pasta_35 = this.tileMapData[3][2];
const pasta_36 = this.tileMapData[4][2];
const pasta_37 = this.tileMapData[5][2];
const pasta_38 = this.tileMapData[6][2];
const pasta_39 = this.tileMapData[6][3];
const pasta_40 = this.tileMapData[4][4];
const pasta_41 = this.tileMapData[4][5];


  if (
  pasta_1.rotationIndex == 1 &&
  pasta_2.rotationIndex == 0 &&
  pasta_3.rotationIndex == 3 &&
  pasta_4.rotationIndex == 2 &&
  pasta_5.rotationIndex == 3 &&
  pasta_6.rotationIndex == 1 &&
  pasta_7.rotationIndex == 0 &&
  pasta_8.rotationIndex == 2 &&
  pasta_9.rotationIndex == 0 &&
  pasta_10.rotationIndex == 3 &&
  pasta_11.rotationIndex == 1 &&
  pasta_12.rotationIndex == 3 &&
  pasta_13.rotationIndex == 1 &&
  pasta_14.rotationIndex == 2 &&
  pasta_15.rotationIndex == 1 &&

  pasta_16.rotationIndex % 2 != 0 &&
  pasta_17.rotationIndex % 2 == 0 &&
  pasta_18.rotationIndex % 2 != 0 &&
  pasta_19.rotationIndex % 2 != 0 &&
  pasta_20.rotationIndex % 2 != 0 &&
  pasta_21.rotationIndex % 2 != 0 &&
  pasta_22.rotationIndex % 2 == 0 &&
  pasta_23.rotationIndex % 2 != 0 &&
  pasta_24.rotationIndex % 2 != 0 &&
  pasta_25.rotationIndex % 2 != 0 &&
  pasta_26.rotationIndex % 2 != 0 &&
  pasta_27.rotationIndex % 2 != 0 &&
  pasta_28.rotationIndex % 2 != 0 &&
  pasta_29.rotationIndex % 2 != 0 &&
  pasta_30.rotationIndex % 2 != 0 &&

  pasta_32.rotationIndex == 3 &&
  pasta_33.rotationIndex == 3 &&
  pasta_34.rotationIndex == 0 &&
  pasta_35.rotationIndex == 0 &&
  pasta_36.rotationIndex == 1 &&
  pasta_37.rotationIndex == 1 &&
  pasta_38.rotationIndex == 2 &&
  pasta_39.rotationIndex == 2 &&
  pasta_40.rotationIndex == 3 &&
  pasta_41.rotationIndex == 1

    ) {

      this.hasWon = true;
      this.playSauceFillAnimation(this.getWinningAnimationCoords(), () => this.showWinPopup());

    }
  
  }
  }

nextLevel() {

  if (this.level < 5) {
    this.level += 1;
    this.scene.restart({ level: this.level });
  } 
  else {
    this.scene.restart({ level: 1 }); 
  }

}

}
