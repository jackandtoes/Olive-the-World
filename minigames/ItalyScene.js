class ItalyCutscene extends Phaser.Scene {
  constructor() {
    super("ItalyCutscene");
  }

  preload() {
    this.load.image("oliveCountryside", "assets/italy/cutscene/italian_countryside.png");
    this.load.image("oliveItalianHouse", "assets/italy/cutscene/italian_house.png");
    this.load.image("oliveTomatoChef", "assets/italy/cutscene/italian_tomato_chef.png");
    this.load.audio("italian_music", "assets/italy/cutscene/italian_music.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const seenCutscenes = this.registry.get("seenCutscenes") || {};
    seenCutscenes.italy = true;
    this.registry.set("seenCutscenes", seenCutscenes);
    this.slides = ["oliveCountryside", "oliveItalianHouse", "oliveTomatoChef"];
    this.dialogueLines = [
      "", 
      "",
      "Mama mia... you want to learn how to make pasta!\n That's amore - let's go!"
    ];

    this.cutsceneIndex = 0;
    this.isTransitioningSlide = false;
    this.isTyping = false;
    this.currentTypingTimer = null;
    this.fullText = "";

    this.add.rectangle(width / 2, height / 2, width, height, 0x130e0b);

    this.cutsceneImage = this.add.image(width / 2, height / 2, this.slides[0]).setAlpha(0);
    this._fitCutsceneImage(this.cutsceneImage, width, height);
    this.cutsceneDialogue();
    this.startItalyMusic();

    this.cutsceneCaption = this.add.text(width / 2, height - 44, "Click or press SPACE to continue", {
      fontSize: "22px",
      fill: "#fff4dd",
      backgroundColor: "#5a341d",
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5);

    this.cutsceneProgress = this.add.text(width / 2, 36, `1 / ${this.slides.length}`, {
      fontSize: "24px",
      fill: "#fff4dd"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.cutsceneImage,
      alpha: 1,
      duration: 450,
      ease: "Sine.easeOut"
    });

    this.input.on("pointerdown", () => this.advanceCutscene());
    this.input.keyboard.on("keydown-SPACE", () => this.advanceCutscene());
    this.input.keyboard.on("keydown-ENTER", () => this.advanceCutscene());

  }
    startItalyMusic() {
    let italyMusic = this.sound.get("italian_music");
    if (!italyMusic) {
      italyMusic = this.sound.add("italian_music", { volume: 0.55, loop: true });
    }
    if (!italyMusic.isPlaying) {
      italyMusic.play();
    }
  }

  stopItalyMusic() {
    this.sound.stopByKey("italian_music");
  }

  cutsceneDialogue() {
    const dialogueText = this.dialogueLines[this.cutsceneIndex] || "";

    if (!this.dialogueText) {
      this.dialogueText = this.add.text(
        this.scale.width / 2,
        this.scale.height - 100,
        "",
        {
          fontSize: "24px",
          fill: "#fff4dd",
          align: "center",
          wordWrap: { width: this.scale.width - 80 }
        }
      ).setOrigin(0.5);
    }

    this.animateText(this.dialogueText, dialogueText, 20);
  }

  _fitCutsceneImage(image, width, height) {
    const scale = Math.min((width - 80) / image.width, (height - 120) / image.height);
    image.setScale(scale);
  }

advanceCutscene() {
  if (this.isTransitioningSlide) return;

  // 👉 if still typing, finish instantly instead of advancing
  if (this.isTyping) {
    if (this.currentTypingTimer) {
      this.currentTypingTimer.remove(false);
      this.currentTypingTimer = null;
    }
    this.dialogueText.setText(this.fullText);
    this.isTyping = false;
    return;
  }

  const nextIndex = this.cutsceneIndex + 1;

  if (nextIndex >= this.slides.length) {
    this.isTransitioningSlide = true;
    this.cameras.main.fadeOut(350, 19, 14, 11);
    this.time.delayedCall(360, () => {
      this.scene.start("ItalyScene");
    });
    return;
  }

  this.isTransitioningSlide = true;
  this.tweens.add({
    targets: this.cutsceneImage,
    alpha: 0,
    duration: 260,
    ease: "Sine.easeInOut",
    onComplete: () => {
      this.cutsceneIndex = nextIndex;
      this.cutsceneImage.setTexture(this.slides[this.cutsceneIndex]);
      this._fitCutsceneImage(this.cutsceneImage, this.scale.width, this.scale.height);
      this.cutsceneProgress.setText(`${this.cutsceneIndex + 1} / ${this.slides.length}`);
      this.cutsceneDialogue();

      this.tweens.add({
        targets: this.cutsceneImage,
        alpha: 1,
        duration: 320,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.isTransitioningSlide = false;
        }
      });
    }
  });
}

  animateText(target, message, speedInMs = 50) {
    if (this.currentTypingTimer) {
      this.currentTypingTimer.remove(false);
      this.currentTypingTimer = null;
    }

    this.fullText = message;

    if (!message) {
      target.setText("");
      this.isTyping = false;
      return;
    }

    const invisibleMessage = message.replace(/[^\s]/g, " ");
    target.setText("");

    let visibleText = "";
    this.isTyping = true;

    this.currentTypingTimer = this.time.addEvent({
      delay: speedInMs,
      loop: true,
      callback: () => {
        if (visibleText.length >= message.length) {
          target.setText(message);
          this.currentTypingTimer.remove(false);
          this.currentTypingTimer = null;
          this.isTyping = false;
          return;
        }

        visibleText += message[visibleText.length];
        const invisiblePart = invisibleMessage.substring(visibleText.length);
        target.setText(visibleText + invisiblePart);
      },
    });
  }
}

class ItalyScene extends Phaser.Scene {
 constructor() {
   super("ItalyScene");
 }


 preload() {
   this.load.image('bent', 'assets/italy/pasta_corner_new.png');
   this.load.image('straight', 'assets/italy/straight_pasta.png');
   this.load.image('crossed', 'assets/italy/crossed_pasta.png');
   this.load.image('t_shape', 'assets/italy/t-shaped_pasta.png');
   this.load.image('olive_mascot', 'assets/olive_favicon.png');
   this.load.audio("italian_music", "assets/italy/cutscene/italian_music.mp3");
 }


	 create(data) {
	  this.startItalyMusic();
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
    uiBorder: 0x9fad95,
    uiAccent: 0xc9d4c0,
    overlay: 0x222620,
    win: "#2f9e44",
    lose: "#d94841",
    buttonFill: 0xf1efe4,
    buttonBorder: 0x97a38b,
    buttonText: "#5a5143",
    buttonHover: 0xe3eadb,
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
   this.coinText = this.add.text(20, 50, `Coins: ${this.registry.get('currency')}`,
  {
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

  this.createCheerOlive(boardX, boardY);

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
      this.stopItalyMusic();
	     this.scene.start("MapScene");
	   });
  
  
	 }

   startItalyMusic() {
    let italyMusic = this.sound.get("italian_music");
    if (!italyMusic) {
      italyMusic = this.sound.add("italian_music", { volume: 0.55, loop: true });
    }
    if (!italyMusic.isPlaying) {
      italyMusic.play();
    }
   }

  stopItalyMusic() {
    this.sound.stopByKey("italian_music");
  }

  createCheerOlive(boardX, boardY) {
  const mascotX = boardX - 82;
  const mascotY = boardY + 210;
  const shadow = this.add.ellipse(mascotX, mascotY + 52, 58, 16, 0xb98547, 0.28).setDepth(2);
  const olive = this.add.image(mascotX, mascotY, 'olive_mascot').setDepth(3);
  olive.setDisplaySize(82, 82);

  this.tweens.add({
    targets: olive,
    y: mascotY - 6,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut"
  });

  const cheersByLevel = {
    1: "You got this!",
    2: "Twist that pasta!",
    3: "Mamma mia!",
    4: "Almost there!",
    5: "Final plate!"
  };

  const cheerBubble = this.add.text(mascotX - 20, mascotY - 82, cheersByLevel[this.level] || "You got this!", {
    fontSize: "17px",
    color: "#5a341c",
    fontStyle: "bold",
    backgroundColor: "#fff4dd",
    padding: { x: 10, y: 7 }
  }).setOrigin(0.5).setDepth(3);

  this.tweens.add({
    targets: cheerBubble,
    alpha: 0,
    delay: 2800,
    duration: 700,
    ease: "Sine.Out"
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
    this.checkTotalWin();
  } 
  else if (this.pointerCountAll == 0){
    if(this.outOfClicksShown) return;
    this.outOfClicksShown = true;
    const { width, height, depth } = this._overlay();
    this.add.text(width / 2, height / 2 - 108, "Game Over", {
      fontSize: "46px",
      color: this.palette.lose,
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(depth + 4);
    this.add.text(width / 2, height / 2 - 19, "You have run out of clicks!", {
      fontSize: "24px",
      color: "#6b3b21"
    }).setOrigin(0.5).setDepth(depth + 4);
    // this.add.text(width / 2, height / 2 + 2, "Try this pasta path again.", {
    //   fontSize: "21px",
    //   color: "#82553a"
    // }).setOrigin(0.5).setDepth(depth + 4);
    this._button(width / 2, height / 2 + 78, "Retry Level", () => {
        this.outOfClicksShown = false;
        this.scene.restart({ level: this.level });
      }, depth + 5);
    this._button(width / 2, height / 2 + 132, "Back to Map", () => {
      this.stopItalyMusic();
      this.scene.start("MapScene");
    }, depth + 5);
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

  const { width, height, depth } = this._overlay();
  this.add.text(width / 2, height / 2 - 112, "Level Complete", {
    fontSize: "46px",
    color: this.palette.win,
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(depth + 4);
  this.add.text(width / 2, height / 2 - 19, "You passed this level!", {
    fontSize: "24px",
    color: "#6b3b21"
  }).setOrigin(0.5).setDepth(depth + 4);
  // this.add.text(width / 2, height / 2 + 2, "Olive is ready for the next plate.", {
  //   fontSize: "21px",
  //   color: "#82553a"
  // }).setOrigin(0.5).setDepth(depth + 4);
  this.addCoin(1);
  this._button(width / 2, height / 2 + 78, "Next Level", () => this.nextLevel(), depth + 5);
  this._button(width / 2, height / 2 + 132, "Back to Map", () => {
    this.stopItalyMusic();
    this.scene.start("MapScene");
  }, depth + 5);
 }

 showTotalWinPopup() {
  this.pointerText.setText("YOU WIN!");

  const { width, height, depth } = this._overlay();
  this.add.text(width / 2, height / 2 - 108, "Victory!", {
    fontSize: "46px",
    color: this.palette.win,
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(depth + 4);
  this.add.text(width / 2, height / 2 - 19, "You completed all 5 Italy levels.", {
    fontSize: "22px",
    color: "#82553a"
	  }).setOrigin(0.5).setDepth(depth + 4);
	
  this._button(width / 2, height / 2 + 78, "Play Again", () => this.scene.restart({ level: 1 }), depth + 5);
  this._button(width / 2, height / 2 + 132, "Back to Map", () => {
    this.stopItalyMusic();
	    this.scene.start("MapScene");
	  }, depth + 5);
	 }

  _overlay() {
    const { width, height } = this.scale;
    const depth = 1000;

    const fade = this.add.rectangle(width / 2, height / 2, width, height, this.palette.overlay, 0.38)
      .setDepth(depth);
    const panelShadow = this.add.rectangle(width / 2 + 6, height / 2 + 8, 530, 380, 0x5e685d, 0.14)
      .setDepth(depth + 1);
    const panel = this.add.rectangle(width / 2, height / 2, 530, 380, 0xf6f4eb, 0.98)
      .setStrokeStyle(3, this.palette.uiBorder, 1)
      .setDepth(depth + 2);
    // const accent = this.add.rectangle(width / 2, height / 2 - 140, 440, 6, this.palette.uiAccent, 0.95)
    //   .setDepth(depth + 3);

    return { width, height, depth, fade, panelShadow, panel };
  }

  _button(x, y, label, cb, depth = 30) {
    const shadow = this.add.rectangle(x + 3, y + 4, 190, 44, 0x7e4a2c, 0.2).setDepth(depth - 1);
    const bg = this.add.rectangle(x, y, 190, 44, this.palette.buttonFill)
      .setStrokeStyle(3, this.palette.buttonBorder, 0.95)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);
    const text = this.add.text(x, y, label, {
      fontSize: "24px",
      color: this.palette.buttonText,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(depth + 1).setInteractive({ useHandCursor: true });

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
    const handleClick = () => {
      playButtonClickSfx(this);
      cb();
    };

    bg.on("pointerdown", handleClick);
    text.on("pointerdown", handleClick);

    return this.add.container(0, 0, [shadow, bg, text]).setDepth(depth);
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

      this.addCoin()
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
  }

checkTotalWin() {
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
      this.playSauceFillAnimation(this.getWinningAnimationCoords(), () => this.showTotalWinPopup());
      const wins = this.registry.get('wins');
      wins.italy = true;
      this.registry.set('wins', wins);


    }
  
  }
}

addCoin(amount = 1) {
  let current = this.registry.get('currency');

  if (current === undefined || current === null) {
    current = 0;
  }

  current += amount;

  this.registry.set('currency', current);

  console.log("Coins updated to:", current); // DEBUG

  if (this.coinText) {
    this.coinText.setText(`Coins: ${current}`);
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
