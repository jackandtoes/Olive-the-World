class ItalyScene extends Phaser.Scene {
  constructor(width, height){
    super('ItalyScene'); 
    this.width = width;
    this.height = height;
    this.tileMapData = this.generateTilemap(width, height);
  }
  generateTilemap(width, height){
    const map = [];
    for(let y=0; y<height; y++){
      const row = [];
      for(let x=0; x<width; x++){
        row.push({
          type: '0',       
          isLit: false,
          rotationIndex: 0 
        });
      }
      map.push(row);
    }
    map[0][0].type = 'S';
    map[height-1][width-1].type = 'E'; // end
    return map;
  }

  getTileAtPos(x, y){
    return this.tileMapData[y][x];
  }

  preload() {
    this.load.image('bent', 'assets/pasta_corner_new.png');
    this.load.image('straight', 'assets/straight_pasta.png');
  }
  create(){
    this.tileSize = 50;
    this.gameLogic = new ItalyScene(8,8);
    this.drawGrid();
    this.addPipes();
  }

  drawGrid(){
    if(this.tilesGroup) this.tilesGroup.clear(true, true);

    this.tilesGroup = this.add.group();
    const data = this.gameLogic.tileMapData;

    for(let y=0; y<data.length; y++){
      for(let x=0; x<data[y].length; x++){
        const tile = data[y][x];


        let color = 0x666666; // normal
        if(tile.type === 'S') color = 0x00ff00; // start
        if(tile.type === 'E') color = 0xff0000; // end
        if(tile.isLit) color = 0xffff00; // lit

        const rect = this.add.rectangle(
          x*this.tileSize + this.tileSize/2,
          y*this.tileSize + this.tileSize/2,
          this.tileSize-2,
          this.tileSize-2,
          color
        );

        rect.setStrokeStyle(1, 0xffffff);

        this.tilesGroup.add(rect);
      }
  
    }
  }

  addPipes(){
    this.tilesGroup = this.add.group();
    const data = this.gameLogic.tileMapData;

    let x_stuff=[2,2,3,6,2,1]
    let y_stuff=[4,5,3,4,0,6]

    for(let i = 0; i<x_stuff.length; i++){
      let x= x_stuff[i];
      let y = y_stuff[i];
      const tile = data[y][x];

          const rect = this.add.image(
            x*this.tileSize + this.tileSize/2,
            y*this.tileSize + this.tileSize/2,
           'bent'
          );

          rect.setDisplaySize(this.tileSize - 4, this.tileSize - 4);
          rect.setInteractive();
          rect.setInteractive();

          rect.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);

          rect.on('pointerdown', () => {
            tile.rotationIndex = (tile.rotationIndex + 1) % 4;
            this.tweens.add({
              targets: rect,
              rotation: Phaser.Math.DegToRad(tile.rotationIndex * 90),
              duration: 300
            });
            const rotationText = this.add.text(
            x*this.tileSize + this.tileSize/2,
            y*this.tileSize + this.tileSize/2,
            tile.rotationIndex.toString(), 
            { fontSize: '16px', color: '#ffffff' }
  );
          });


          this.tilesGroup.add(rect);
   }

    let x_stuff1=[1,2,2,2,1,3]
    let y_stuff2=[4,1,3,2,0,4]

    for(let i = 0; i<x_stuff.length; i++){
      let x= x_stuff1[i];
      let y = y_stuff2[i];
      const tile = data[y][x];

          const rect = this.add.image(
            x*this.tileSize + this.tileSize/2,
            y*this.tileSize + this.tileSize/2,
           'straight'
          );

          rect.setDisplaySize(this.tileSize - 4, this.tileSize - 4); // scale to fit tile
          rect.setInteractive();
          rect.setInteractive();

          rect.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);

          rect.on('pointerdown', () => {
            tile.rotationIndex = (tile.rotationIndex + 1) % 4;
            this.tweens.add({
              targets: rect,
              rotation: Phaser.Math.DegToRad(tile.rotationIndex * 90),
              duration: 300
            });
            const rotationText = this.add.text(
            x*this.tileSize + this.tileSize/2,
            y*this.tileSize + this.tileSize/2,
            tile.rotationIndex.toString(), 
            { fontSize: '16px', color: '#ffffff' }
  );
          });


          this.tilesGroup.add(rect);
   }
  }
  


}

const config = {
  type: Phaser.AUTO,
  width: 8*50,
  height: 8*50,
  backgroundColor: "#222222",
  scene: [ItalyScene]
};



new Phaser.Game(config);
