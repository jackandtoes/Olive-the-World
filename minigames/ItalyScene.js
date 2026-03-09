class ItalyScene extends Phaser.Scene {
 constructor() {
   super("ItalyScene");
 }


 preload() {
   this.load.image('bent', 'assets/pasta_corner_new.png');
   this.load.image('straight', 'assets/straight_pasta.png');
   this.load.image('crossed', 'assets/crossed_pasta.png');
   this.load.image('t_shape', 'assets/t-shaped_pasta.png');
 }


 create() {
   const width = this.scale.width;
   const height = this.scale.height;


   this.add.rectangle(width/2, height/2, width, height, 0xf5deb3);
   this.pointerCountAll = 40;
   this.pointerText = this.add.text(20, 20, "Clicks Left: 40", {
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


   this.drawGrid();
   this.addPipes();
   this.add.text(pointer_count)
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


   let bentX = [2,2,3,6,2,1,4,3,5,3];
   let bentY = [4,5,3,4,0,6,4,5,5,7];


   for (let i = 0; i < bentX.length; i++) {
     this.createPipe(bentX[i], bentY[i], 'bent');
   }


   let straightX = [1,2,2,2,1,3,6,3,5,4];
   let straightY = [4,1,3,2,0,4,7,6,6,7];


   for (let i = 0; i < straightX.length; i++) {
     this.createPipe(straightX[i], straightY[i], 'straight');
   }


   let crossedX = [2];
   let crossedY = [7];


   for (let i=0; i < crossedX.length; i++) {
     this.createPipe(crossedX[i], crossedY[i], 'crossed')
   }


   let t_shapeX = [4,7,5,4];
   let t_shapeY = [2,1,7,5];


   for (let i=0; i < t_shapeX.length; i++) {
     this.createPipe(t_shapeX[i], t_shapeY[i], 't_shape')
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
   this.checkWin();

   pipe.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);
   let pointer_count = 0;
   pipe.on("pointerdown", () => {
     if(this.pointerCountAll > 0){
       tile.rotationIndex = (tile.rotationIndex + 1) % 4;
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
 ) 
 {
   this.pointerText.setText("YOU WIN!");
   this.add.rectangle(400, 300, 400, 300, 0x6666ff);
   this.add.text(300, 300, "You passed this level!");
   this.pointerCountAll = 0;
   console.log(pasta_3.rotationIndex)
 }
 console.log(pasta_10.rotationIndex);
}


}
