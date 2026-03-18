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
  if (this.level === undefined) {
  this.level = 1;
}

this.levelText = this.add.text(650, 20, "Level: " + this.level, {
  fontSize: "24px",
  color: "#000"
});

   this.add.rectangle(width/2, height/2, width, height, 0xf5deb3);
   if(this.level === 1){
    this.pointerCountAll = 40;
   }
   if(this.level === 2){
    this.pointerCountAll = 50;
   }
   this.pointerText = this.add.text(20, 20, "Clicks:" + this.pointerCountAll , {
     fontSize: "24px",
     color: "#000"
   });
   this.GRID_SIZE = 50;
   this.COLS = 8;
   this.ROWS = 8;
   this.tileMapData = this.generateTilemap(this.COLS, this.ROWS);


   this.boardContainer = this.add.container(
     (width - this.COLS * this.GRID_SIZE) / 2,
     (height - this.ROWS * this.GRID_SIZE) / 2
   );

this.levelLayouts = {

1: {
  bentX: [2,2,3,6,2,1,4,3,5,3],
  bentY: [4,5,3,4,0,6,4,5,5,7],

  straightX: [1,2,2,2,1,3,6,3,5,4],
  straightY: [4,1,3,2,0,4,7,6,6,7],

  crossedX: [2],
  crossedY: [7],

  tX: [4,7,5,4],
  tY: [2,1,7,5]
},

2: {
  bentX: [0,2,2,2,2,3,4,4,4,6,6],
  bentY: [2,0,3,4,6,3,2,6,7,4,0],

  straightX: [0,1,2,2,3,3,3,4,4,5,5,5,6,6,6,6],
  straightY: [1,2,1,5,1,4,6,0,3,0,4,7,1,2,3,7],

  crossedX: [2,3],
  crossedY: [2,2],

  tX: [3,4],
  tY: [0,4],

},

3: {
  bentX: [1,2,3,4,5],
  bentY: [5,4,3,2,1],

  straightX: [2,4,6],
  straightY: [2,4,6],

  crossedX: [3],
  crossedY: [6],

  tX: [5],
  tY: [3]
},

4: {
  bentX: [2,4,6],
  bentY: [2,4,6],

  straightX: [1,3,5,7],
  straightY: [3,3,3,3],

  crossedX: [4],
  crossedY: [5],

  tX: [3,6],
  tY: [6,1]
},

5: {
  bentX: [1,2,3,4,5,6],
  bentY: [6,5,4,3,2,1],

  straightX: [2,3,4,5],
  straightY: [1,2,3,4],

  crossedX: [4],
  crossedY: [4],

  tX: [2,6],
  tY: [6,2]
}

};
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
   this.GRID_SIZE,
   this.GRID_SIZE);
   pipe.setInteractive();
// Add this after pipe.setInteractive();
const rotationText = this.add.text(
  pipe.x, 
  pipe.y, 
  tile.rotationIndex, // show the rotationIndex
  { fontSize: "18px", color: "#ffffff", fontStyle: "bold" }
).setOrigin(0.5);

// Keep a reference so we can update it when rotated
pipe.rotationText = rotationText;
   pipe.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);
   let pointer_count = 0;
   pipe.on("pointerdown", () => {
     if(this.pointerCountAll > 0){
       tile.rotationIndex = (tile.rotationIndex + 1) % 4;
       pipe.rotationText.setText(tile.rotationIndex);
       pointer_count += 1;
       
       this.pointerCountAll -= 1;
       this.pointerText.setText("Clicks: " + this.pointerCountAll);
       this.tweens.add({
       targets: pipe,
       rotation: pipe.rotation + Phaser.Math.DegToRad(90),
       duration: 200
   });
	this.checkWin();
 }
   });


   this.boardContainer.add(pipe);
 }
	checkWin() {

  if (this.hasWon) {
    return;
  }

  if (this.level === 1) {

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

      this.pointerText.setText("YOU WIN!");

      this.add.rectangle(400, 300, 400, 300, 0x6666ff);
      this.add.text(300, 300, "You passed this level!");

      const next_button = this.add.rectangle(400, 350, 200, 80, 0x000000)
        .setInteractive({ useHandCursor: true });

      this.add.text(340, 335, "Next Level", {
        fontSize: "24px",
        color: "#ffffff"
      });

      next_button.on("pointerdown", () => {
        this.nextLevel();
      });

    }

  }

    if (this.level === 2) {

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
console.log(pasta_1.rotationIndex);

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

      this.pointerText.setText("YOU WIN!");

      this.add.rectangle(400, 300, 400, 300, 0x6666ff);
      this.add.text(300, 300, "You passed this level!");

      const next_button = this.add.rectangle(400, 350, 200, 80, 0x000000)
        .setInteractive({ useHandCursor: true });

      this.add.text(340, 335, "Next Level", {
        fontSize: "24px",
        color: "#ffffff"
      });

      next_button.on("pointerdown", () => {
        this.nextLevel();
      });

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
