/* =========================
   GAME LOGIC (NOT A SCENE)
========================= */
class ItalyLogic {
  constructor(width, height){
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
    map[height-1][width-1].type = 'E';

    return map;
  }

  getTileAtPos(x, y){
    return this.tileMapData[y][x];
  }
}


/* =========================
   PHASER SCENE
========================= */
class ItalyScene extends Phaser.Scene {

  constructor(){
    super("ItalyScene");
  }

  preload() {
    this.load.image('bent', 'assets/pasta_corner_new.png');
    this.load.image('straight', 'assets/straight_pasta.png');
  }

  create(){
    this.tileSize = 50;

    // create logic object (NOT a scene)
    this.gameLogic = new ItalyLogic(8,8);

    this.drawGrid();
    this.addPipes();
  }

  /* ---------- GRID ---------- */
  drawGrid(){

    if(this.tilesGroup) this.tilesGroup.clear(true, true);

    this.tilesGroup = this.add.group();
    const data = this.gameLogic.tileMapData;

    for(let y=0; y<data.length; y++){
      for(let x=0; x<data[y].length; x++){

        const tile = data[y][x];

        let color = 0x666666;
        if(tile.type === 'S') color = 0x00ff00;
        if(tile.type === 'E') color = 0xff0000;
        if(tile.isLit) color = 0xffff00;

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

  /* ---------- PIPES ---------- */
  addPipes(){

    const data = this.gameLogic.tileMapData;

    /* ---- Bent pipes ---- */
    let x_stuff=[2,2,3,6,2,1];
    let y_stuff=[4,5,3,4,0,6];

    for(let i = 0; i<x_stuff.length; i++){

      let x= x_stuff[i];
      let y= y_stuff[i];
      const tile = data[y][x];

      const img = this.add.image(
        x*this.tileSize + this.tileSize/2,
        y*this.tileSize + this.tileSize/2,
        'bent'
      );

      img.setDisplaySize(this.tileSize-4, this.tileSize-4);
      img.setInteractive();

      img.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);

      img.on('pointerdown', () => {

        tile.rotationIndex = (tile.rotationIndex + 1) % 4;

        this.tweens.add({
          targets: img,
          rotation: Phaser.Math.DegToRad(tile.rotationIndex * 90),
          duration: 300
        });

        this.add.text(
          x*this.tileSize + this.tileSize/2,
          y*this.tileSize + this.tileSize/2,
          tile.rotationIndex.toString(),
          { fontSize: '16px', color: '#ffffff' }
        );
      });
    }

    /* ---- Straight pipes ---- */
    let x_stuff1=[1,2,2,2,1,3];
    let y_stuff2=[4,1,3,2,0,4];

    for(let i = 0; i<x_stuff1.length; i++){

      let x= x_stuff1[i];
      let y= y_stuff2[i];
      const tile = data[y][x];

      const img = this.add.image(
        x*this.tileSize + this.tileSize/2,
        y*this.tileSize + this.tileSize/2,
        'straight'
      );

      img.setDisplaySize(this.tileSize-4, this.tileSize-4);
      img.setInteractive();

      img.rotation = Phaser.Math.DegToRad(tile.rotationIndex * 90);

      img.on('pointerdown', () => {

        tile.rotationIndex = (tile.rotationIndex + 1) % 4;

        this.tweens.add({
          targets: img,
          rotation: Phaser.Math.DegToRad(tile.rotationIndex * 90),
          duration: 300
        });

        this.add.text(
          x*this.tileSize + this.tileSize/2,
          y*this.tileSize + this.tileSize/2,
          tile.rotationIndex.toString(),
          { fontSize: '16px', color: '#ffffff' }
        );
      });
    }
  }
}


/* =========================
   GAME CONFIG
========================= */
const config = {
  type: Phaser.AUTO,
  width: 8 * 50,
  height: 8 * 50,
  backgroundColor: "#222222",
  scene: [ItalyScene]
};

new Phaser.Game(config);
