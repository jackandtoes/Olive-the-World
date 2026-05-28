class EgyptCutscene extends Phaser.Scene {
  constructor() {
    super("EgyptCutscene");
  }

  preload() {
    this.load.image("olivePyramid", "assets/egypt/cutscene/olive_pyramids.png");
    this.load.image("oliveEgyptRest", "assets/egypt/cutscene/olive_falafel_rest.png");
    this.load.image("oliveChickpeaChef", "assets/egypt/cutscene/chickpea_chef.png");
    this.load.audio("egypt_music", "assets/egypt/cutscene/egypt_music.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const seenCutscenes = this.registry.get("seenCutscenes") || {};
    seenCutscenes.egypt = true;
    this.registry.set("seenCutscenes", seenCutscenes);
    this.slides = ["olivePyramid", "oliveEgyptRest", "oliveChickpeaChef"];
    this.dialogueLines = [
      "",
      "",
      "Habibi, do you want to make falafel? \n First you have to dodge them!"
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
    this.startEgyptMusic();

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
  startEgyptMusic() {
    let egyptMusic = this.sound.get("egypt_music");
    if (!egyptMusic) {
      egyptMusic = this.sound.add("egypt_music", { volume: 0.55, loop: true });
    }
    if (!egyptMusic.isPlaying) {
      egyptMusic.play();
    }
  }

  stopEgyptMusic() {
    this.sound.stopByKey("egypt_music");
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
        this.scene.start("EgyptScene");
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

class EgyptScene extends Phaser.Scene {
  constructor() {
    super("EgyptScene");
  }

  preload() {
    // Generate all assets procedurally using graphics
    this.generateAssets();
    this.load.image('oliveOverjoyed', 'assets/olive_overjoyed.PNG');
    this.load.image('oliveHatChef', 'assets/olive_hat_chef.PNG');
    this.load.image('oliveHatJester', 'assets/olive_hat_jester.PNG');
    this.load.image('oliveHatPropeller', 'assets/olive_hat_propeller.PNG');
    this.load.image('oliveHatWizard', 'assets/olive_hat_wizard.PNG');
    this.load.audio('egypt_music', 'assets/egypt/egypt_music.mp3');
  }

  generateAssets() {
    // We'll use Phaser Graphics to draw everything in create()
  }

  create(data) {
    this.startEgyptMusic();
    const width = this.scale.width;
    const height = this.scale.height;


    this.palette = {
      bg: 0xfaf0cf,
      skyAccent: 0xf4c95d,
      dune: 0xd8b06b,
      ground: 0x7a4e22,
      obstacle: 0xbe8a3f,
      obstacleDark: 0x8d622b,
      cactus: 0x4f8b3a,
      cactusDark: 0x356327,
      falafel: 0x8a5a27,
      falafelDark: 0x5f3b17,
      cloud: 0xf7ebcf,
      text: "#5a3b1d",
      score: "#5a3b1d",
      shadow: 0xc79a57,
      highlight: 0xf0cc8b,
    };

    this.GROUND_Y = height - 80;
    this.UPPER_PLATFORM_Y = this.GROUND_Y - 135;
    this.gameStarted = false;
    this.gameOver = false;
    this.score = 0;
    this.hiScore = data.hiScore || 0;
    this.speed = 6;
    this.frameCount = 0;
    this.jumpCount = 0; // for double jump
    this.dinoY = this.GROUND_Y;
    // Sky background
    this.add.rectangle(width / 2, height / 2, width, height, this.palette.bg);
    this.add.circle(width - 90, 90, 46, this.palette.skyAccent, 0.6);
    this.add.ellipse(width / 2, this.GROUND_Y - 18, width * 0.9, 90, this.palette.dune, 0.82);
    this.add.ellipse(width / 2, this.GROUND_Y + 12, width, 70, 0xc58f4d, 0.95);
    this.createBackdropPyramids(width);

    // Ground line
    this.groundLine = this.add.rectangle(width / 2, this.GROUND_Y + 2, width, 4, this.palette.ground);
    this.upperLaneGuide = this.add.rectangle(width / 2, this.UPPER_PLATFORM_Y + 8, width * 0.42, 2, 0xc59a5d, 0.2);

    // Desert haze (decorative)
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      const cloud = this.createCloud(
        Phaser.Math.Between(80, width - 80),
        Phaser.Math.Between(40, 120)
      );
      this.clouds.push(cloud);
    }
    // Runner
    this.dino = this.createDino();
    this.dinoX = 80;
    this.dinoY = this.GROUND_Y;
    this.dino.setPosition(this.dinoX, this.dinoY);

    // Physics state
    this.dinoVY = 0;
    this.isOnGround = true;
    this.GRAVITY = 1.1;
    this.JUMP_FORCE = -18;

    // Leg animation
    this.legFrame = 0;
    this.legTimer = 0;

    // Obstacles pool
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.obstacleInterval = 90;

    // Elevated platform pool
    this.platforms = [];
    this.platformTimer = 0;
    this.platformInterval = 220;
    this.currentPlatform = null;

    // Pterodactyls
    this.pteros = [];
    this.pteroTimer = 0;
    this.pteroInterval = 300;

    // Score display
    this.scoreText = this.add.text(width - 20, 20, "HI " + this.padScore(this.hiScore) + "  00000", {
      fontSize: "22px",
      fontFamily: "monospace",
      color: this.palette.score,
      fontStyle: "bold"
    }).setOrigin(1, 0);

    // Start message
    this.startMsg = this.add.text(width / 2, this.GROUND_Y - 80, "PRESS SPACE OR TAP TO START", {
      fontSize: "18px",
      fontFamily: "monospace",
      color: this.palette.text,
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Blink animation for start message
    this.tweens.add({
      targets: this.startMsg,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Game over group (hidden initially)
    this.gameOverGroup = this.add.container(width / 2, this.GROUND_Y - 60);
    this.gameOverGroup.setVisible(false);

    const goBox = this.add.rectangle(0, 0, 360, 90, this.palette.bg)
      .setStrokeStyle(3, this.palette.ground);
    const goText = this.add.text(0, -18, "GAME OVER", {
      fontSize: "26px",
      fontFamily: "monospace",
      color: this.palette.text,
      fontStyle: "bold"
    }).setOrigin(0.5);
    const restartText = this.add.text(0, 20, "PRESS SPACE OR TAP TO RESTART", {
      fontSize: "12px",
      fontFamily: "monospace",
      color: this.palette.text
    }).setOrigin(0.5);
    this.gameOverGroup.add([goBox, goText, restartText]);

    // Input
    this.input.keyboard.on("keydown-SPACE", () => this.handleJump());
    this.input.keyboard.on("keydown-UP", () => this.handleJump());
    this.input.on("pointerdown", () => this.handleJump());

    // ESC to map
    this.input.keyboard.on("keydown-ESC", () => this.returnToMap());

  }

  startEgyptMusic() {
    let egyptMusic = this.sound.get("egypt_music");
    if (!egyptMusic) {
      egyptMusic = this.sound.add("egypt_music", { volume: 0.55, loop: true });
    }
    if (!egyptMusic.isPlaying) {
      egyptMusic.play();
    }
  }

  stopEgyptMusic() {
    this.sound.stopByKey("egypt_music");
  }

  returnToMap() {
    this.stopEgyptMusic();
    this.scene.start("MapScene");
  }

  padScore(n) {
    return String(n).padStart(5, "0");
  }

  handleJump() {
    if (this.gameOver) {
      playButtonClickSfx(this);
      this.restartGame();
      return;
    }
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startMsg.setVisible(false);
    }
    if (this.isOnGround) {
      this.dinoVY = this.JUMP_FORCE;
      this.isOnGround = false;
      this.jumpCount = 1;
    } else if (this.jumpCount < 2) {
      // Double jump
      this.dinoVY = this.JUMP_FORCE * 0.85;
      this.jumpCount = 2;
    }
  }

  restartGame() {
    const hiScore = Math.max(this.score, this.hiScore);
    this.scene.restart({ hiScore });
  }

  createBackdropPyramids(width) {
    const g = this.add.graphics();
    g.fillStyle(0xd7ae63, 0.7);
    g.fillTriangle(width - 280, this.GROUND_Y, width - 220, this.GROUND_Y - 110, width - 160, this.GROUND_Y);
    g.fillStyle(0xc79953, 0.82);
    g.fillTriangle(width - 190, this.GROUND_Y, width - 110, this.GROUND_Y - 150, width - 30, this.GROUND_Y);
    g.fillStyle(0xbe8f4c, 0.6);
    g.fillTriangle(40, this.GROUND_Y, 110, this.GROUND_Y - 95, 180, this.GROUND_Y);
    g.setDepth(0);
  }

  // ─── Asset Creation ───────────────────────────────────────────────────────

  createDino() {
    const equippedHat = (this.registry.get('equippedItems') || { hat: null }).hat;
    const oliveTextureByHat = {
      chef: 'oliveHatChef',
      jester: 'oliveHatJester',
      propeller: 'oliveHatPropeller',
      wizard: 'oliveHatWizard'
    };
    const oliveTexture = oliveTextureByHat[equippedHat] || 'oliveOverjoyed';
    const olive = this.add.image(0, 0, oliveTexture);
    olive.setDisplaySize(64, 64);
    olive.setOrigin(0.5, 1); // 👈 important
    olive.setDepth(5);
    olive.baseScaleX = olive.scaleX;
    olive.baseScaleY = olive.scaleY;
    this.drawDinoShape(olive, 0, 0, 0);
    return olive;
  }

  drawDinoShape(g, x, y, legFrame) {
    g.clearTint();
    g.setAngle(legFrame === 0 ? -4 : 4);
    g.setScale(g.baseScaleX, g.baseScaleY);
    g.setPosition(x, y);
  }

  drawDinoJump(g, x, y) {
    g.clearTint();
    g.setAngle(-12);
    g.setScale(g.baseScaleX * 0.97, g.baseScaleY * 0.97);
    g.setPosition(x, y);
  }

  drawDinoDead(g, x, y) {
    g.setTint(0xd86a5e);
    g.setAngle(90);
    g.setScale(g.baseScaleX, g.baseScaleY);
    g.setPosition(x, y);
  }

  createCloud(cx, cy) {
    const g = this.add.graphics();
    g.fillStyle(this.palette.cloud);
    g.fillEllipse(cx, cy, 74, 16);
    g.fillEllipse(cx + 18, cy - 8, 50, 16);
    g.fillEllipse(cx - 12, cy - 6, 38, 14);
    g.setDepth(1);
    g.cloudX = cx;
    g.cloudY = cy;
    return g;
  }

  moveCloud(cloud, cx, cy) {
    cloud.clear();
    cloud.fillStyle(this.palette.cloud);
    cloud.fillEllipse(cx, cy, 74, 16);
    cloud.fillEllipse(cx + 18, cy - 8, 50, 16);
    cloud.fillEllipse(cx - 12, cy - 6, 38, 14);
    cloud.cloudX = cx;
    cloud.cloudY = cy;
  }

  createCactus(x) {
    const g = this.add.graphics();
    const type = Phaser.Math.Between(0, 2);
    g.fillStyle(0x7b5127);
    if (type === 0) {
      // Slim palm
      g.fillRect(x + 10, this.GROUND_Y - 50, 10, 50);
      g.fillStyle(0x9d6a37);
      g.fillRect(x + 13, this.GROUND_Y - 50, 3, 50);
      g.fillStyle(this.palette.cactus);
      g.fillTriangle(x + 15, this.GROUND_Y - 58, x - 2, this.GROUND_Y - 44, x + 10, this.GROUND_Y - 32);
      g.fillTriangle(x + 15, this.GROUND_Y - 58, x + 32, this.GROUND_Y - 44, x + 20, this.GROUND_Y - 32);
      g.fillTriangle(x + 15, this.GROUND_Y - 58, x - 6, this.GROUND_Y - 56, x + 8, this.GROUND_Y - 46);
      g.fillTriangle(x + 15, this.GROUND_Y - 58, x + 36, this.GROUND_Y - 56, x + 22, this.GROUND_Y - 46);
    } else if (type === 1) {
      // Twin palms
      g.fillStyle(0x7b5127);
      g.fillRect(x + 8, this.GROUND_Y - 40, 8, 40);
      g.fillRect(x + 28, this.GROUND_Y - 46, 9, 46);
      g.fillStyle(0x9d6a37);
      g.fillRect(x + 10, this.GROUND_Y - 40, 2, 40);
      g.fillRect(x + 31, this.GROUND_Y - 46, 2, 46);
      g.fillStyle(this.palette.cactus);
      g.fillTriangle(x + 12, this.GROUND_Y - 47, x - 2, this.GROUND_Y - 37, x + 8, this.GROUND_Y - 27);
      g.fillTriangle(x + 12, this.GROUND_Y - 47, x + 26, this.GROUND_Y - 37, x + 16, this.GROUND_Y - 27);
      g.fillTriangle(x + 33, this.GROUND_Y - 54, x + 18, this.GROUND_Y - 43, x + 28, this.GROUND_Y - 31);
      g.fillTriangle(x + 33, this.GROUND_Y - 54, x + 47, this.GROUND_Y - 43, x + 37, this.GROUND_Y - 31);
    } else {
      // Palm cluster
      for (let i = 0; i < 3; i++) {
        const ox = x + i * 18;
        g.fillStyle(0x7b5127);
        g.fillRect(ox + 5, this.GROUND_Y - 30, 6, 30);
        g.fillStyle(0x9d6a37);
        g.fillRect(ox + 7, this.GROUND_Y - 30, 2, 30);
        g.fillStyle(this.palette.cactus);
        g.fillTriangle(ox + 8, this.GROUND_Y - 36, ox - 2, this.GROUND_Y - 28, ox + 6, this.GROUND_Y - 20);
        g.fillTriangle(ox + 8, this.GROUND_Y - 36, ox + 18, this.GROUND_Y - 28, ox + 10, this.GROUND_Y - 20);
      }
    }
    g.setDepth(4);
    g.obstacleX = x;
    g.obstacleType = "cactus";
    // Hitbox: center, half-width, half-height
    g.hitW = type === 1 ? 26 : type === 2 ? 30 : 18;
    g.hitH = type === 1 ? 40 : type === 2 ? 32 : 32;
    g.hitOffsetX = type === 1 ? 18 : type === 2 ? 22 : 14;
    g.hitOffsetY = -g.hitH / 2;
    return g;
  }

  createPyramid(x) {
    const g = this.add.graphics();
    const size = Phaser.Math.Between(0, 1);
    const width = size === 0 ? 48 : 62;
    const height = size === 0 ? 34 : 46;
    const left = x - width / 2;
    const right = x + width / 2;
    const apexY = this.GROUND_Y - height;

    g.fillStyle(this.palette.obstacle);
    g.fillTriangle(left, this.GROUND_Y, x, apexY, right, this.GROUND_Y);
    g.fillStyle(this.palette.highlight, 0.55);
    g.fillTriangle(x, apexY, right, this.GROUND_Y, x + width * 0.1, this.GROUND_Y);

    g.lineStyle(2, this.palette.obstacleDark, 0.4);
    for (let i = 1; i <= 3; i++) {
      const lineY = apexY + (height / 4) * i;
      const inset = (width / 8) * i;
      g.beginPath();
      g.moveTo(left + inset, lineY);
      g.lineTo(right - inset, lineY);
      g.strokePath();
    }

    g.setDepth(4);
    g.obstacleX = x;
    g.obstacleType = "pyramid";
    g.hitW = width - 10;
    g.hitH = height;
    g.hitOffsetX = 0;
    g.hitOffsetY = -height / 2;
    return g;
  }

  createFalafel(x) {
    const g = this.add.graphics();
    g.setDepth(4);
    g.obstacleX = x;
    g.obstacleType = "falafel";
    g.rollAngle = 0;
    g.hitW = 24;
    g.hitH = 24;
    g.hitOffsetX = 0;
    g.hitOffsetY = -12;
    this.drawFalafel(g, x, this.GROUND_Y - 12, 0);
    return g;
  }

  drawFalafel(g, x, y, angle) {
    g.clear();
    g.fillStyle(this.palette.falafel);
    g.fillCircle(x, y, 12);
    g.fillStyle(this.palette.falafelDark);
    g.fillCircle(x - 4, y - 3, 2);
    g.fillCircle(x + 3, y + 1, 2);
    g.fillCircle(x + 1, y - 5, 1.8);
    g.lineStyle(2, this.palette.highlight, 0.7);
    g.beginPath();
    g.arc(x, y, 8, angle, angle + Math.PI / 1.6);
    g.strokePath();
    g.beginPath();
    g.arc(x, y, 5, angle + Math.PI, angle + Math.PI + Math.PI / 1.8);
    g.strokePath();
  }

  createGroundObstacle(x) {
    const roll = Phaser.Math.Between(0, 99);
    if (roll < 25) return this.createPyramid(x);
    if (roll < 45) return this.createFalafel(x);
    return this.createCactus(x);
  }

  createUpperPlatform(x) {
    const g = this.add.graphics();
    const width = Phaser.Math.Between(150, 240);
    const height = 18;
    const topY = this.UPPER_PLATFORM_Y + Phaser.Math.Between(-34, 30);
    const hazardRoll = Phaser.Math.Between(0, 99);
    const hazardType = hazardRoll < 35 ? "scarab" : hazardRoll < 60 ? "urn" : null;
    const hazardOffsetX = hazardType ? Phaser.Math.Between(36, width - 36) : null;

    g.fillStyle(0x8f6b3d);
    g.fillRect(x, topY, width, height);
    g.fillStyle(0xcba66b);
    g.fillRect(x, topY, width, 5);
    g.fillStyle(0x6d4f2b);
    g.fillRect(x + 20, topY + height, 10, 28);
    g.fillRect(x + width - 30, topY + height, 10, 28);
    g.lineStyle(2, 0xe4c48c, 0.35);
    g.beginPath();
    g.moveTo(x + 10, topY + 9);
    g.lineTo(x + width - 10, topY + 9);
    g.strokePath();

    if (hazardType === "scarab") {
      const hx = x + hazardOffsetX;
      const hy = topY - 8;
      g.fillStyle(0x1f5660);
      g.fillEllipse(hx, hy, 18, 12);
      g.fillStyle(0x143a40);
      g.fillCircle(hx, hy - 5, 4);
      g.lineStyle(2, 0x143a40, 0.9);
      g.beginPath();
      g.moveTo(hx - 6, hy + 1);
      g.lineTo(hx - 12, hy + 6);
      g.moveTo(hx + 6, hy + 1);
      g.lineTo(hx + 12, hy + 6);
      g.strokePath();
    } else if (hazardType === "urn") {
      const hx = x + hazardOffsetX;
      const hy = topY - 15;
      g.fillStyle(0x91552b);
      g.fillRect(hx - 7, hy + 4, 14, 16);
      g.fillRect(hx - 10, hy + 8, 4, 8);
      g.fillRect(hx + 6, hy + 8, 4, 8);
      g.fillStyle(0xc78c54);
      g.fillRect(hx - 5, hy + 6, 2, 12);
    }

    g.setDepth(3);
    g.platformX = x;
    g.platformY = topY;
    g.platformWidth = width;
    g.platformHeight = height;
    g.hazardType = hazardType;
    g.hazardOffsetX = hazardOffsetX;
    g.hazardY = topY - 8;
    g.hazardHitW = hazardType === "scarab" ? 18 : hazardType === "urn" ? 16 : 0;
    g.hazardHitH = hazardType === "scarab" ? 12 : hazardType === "urn" ? 20 : 0;
    g.hazardHitOffsetY = hazardType === "scarab" ? -8 : hazardType === "urn" ? -10 : 0;
    return g;
  }

  findSupportingPlatform(previousY, nextY) {
    for (const platform of this.platforms) {
      const platformLeft = platform.platformX;
      const platformRight = platform.platformX + platform.platformWidth;
      const playerLeft = this.dinoX - 10;
      const playerRight = this.dinoX + 10;
      const horizontalOverlap = playerRight > platformLeft && playerLeft < platformRight;

      if (!horizontalOverlap) continue;
      if (this.dinoVY < 0) continue;

      if (previousY <= platform.platformY && nextY >= platform.platformY) {
        return platform;
      }
    }

    return null;
  }

  isStillOnPlatform(platform) {
    if (!platform) return false;
    const playerLeft = this.dinoX - 8;
    const playerRight = this.dinoX + 8;
    return playerRight > platform.platformX && playerLeft < platform.platformX + platform.platformWidth;
  }

  moveCactus(g, x) {
    g.x = x - g.obstacleX;
    g.obstacleX = x;
  }

  createPtero(x, y) {
    const g = this.add.graphics();
    g.fillStyle(this.palette.obstacle);
    // Wings up
    g.fillRect(x - 20, y - 8, 16, 6);
    g.fillRect(x + 4, y - 8, 16, 6);
    g.fillRect(x - 6, y - 4, 12, 8);
    g.fillRect(x + 4, y - 2, 8, 4); // beak
    g.setDepth(4);
    g.obstacleX = x;
    g.obstacleY = y;
    g.obstacleType = "ptero";
    g.wingFrame = 0;
    g.hitW = 30;
    g.hitH = 14;
    return g;
  }

  createFlyingFalafel(x, y) {
    const g = this.add.graphics();
    g.setDepth(4);
    g.obstacleX = x;
    g.obstacleY = y;
    g.obstacleType = "flyingFalafel";
    g.rollAngle = 0;
    g.hitW = 22;
    g.hitH = 22;
    this.drawFalafel(g, x, y, 0);
    return g;
  }

  drawPtero(g, x, y, wingFrame) {
    g.clear();
    g.fillStyle(this.palette.obstacle);
    if (wingFrame === 0) {
      // Wings up
      g.fillRect(x - 22, y - 10, 18, 6);
      g.fillRect(x + 4, y - 10, 18, 6);
      g.fillRect(x - 6, y - 4, 12, 10);
      g.fillRect(x + 4, y - 2, 10, 4);
    } else {
      // Wings down
      g.fillRect(x - 22, y, 18, 6);
      g.fillRect(x + 4, y, 18, 6);
      g.fillRect(x - 6, y - 6, 12, 10);
      g.fillRect(x + 4, y - 4, 10, 4);
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update() {
    if (!this.gameStarted || this.gameOver) {
      // Idle leg animation even before start
      if (!this.gameOver) {
        this.legTimer++;
        if (this.legTimer % 14 === 0) this.legFrame = 1 - this.legFrame;
        this.drawDinoShape(this.dino, 0, 0, this.legFrame);
        this.dino.setPosition(this.dinoX, this.dinoY);
      }
      return;
    }

    this.frameCount++;

    // Speed ramp
    this.speed = 6 + Math.floor(this.score / 100) * 0.5;
    if (this.speed > 18) this.speed = 18;

    // Score
    if (this.frameCount % 6 === 0) {
      this.score++;
      if (this.score > this.hiScore) this.hiScore = this.score;
      this.scoreText.setText("HI " + this.padScore(this.hiScore) + "  " + this.padScore(this.score));
    }


    // Clouds
    for (const cloud of this.clouds) {
      const nx = cloud.cloudX - 1.2;
      const ny = cloud.cloudY;
      if (cloud.cloudX + 70 < 0) {
        this.moveCloud(cloud, this.scale.width + 60, Phaser.Math.Between(30, 100));
      } else {
        this.moveCloud(cloud, nx, ny);
      }
    }

    const previousY = this.dinoY;

    // Gravity + jump
    this.dinoVY += this.GRAVITY;
    this.dinoY += this.dinoVY;
    const landingPlatform = this.findSupportingPlatform(previousY, this.dinoY);
    if (landingPlatform) {
      this.dinoY = landingPlatform.platformY;
      this.dinoVY = 0;
      this.isOnGround = true;
      this.currentPlatform = landingPlatform;
      this.jumpCount = 0;
    } else if (this.dinoY >= this.GROUND_Y) {
      this.dinoY = this.GROUND_Y;
      this.dinoVY = 0;
      this.isOnGround = true;
      this.currentPlatform = null;
      this.jumpCount = 0;
    } else {
      this.isOnGround = false;
      if (this.currentPlatform && !this.isStillOnPlatform(this.currentPlatform)) {
        this.currentPlatform = null;
      }
    }

    // Leg animation (only on ground)
    if (this.isOnGround) {
      this.legTimer++;
      const legSpeed = Math.max(4, 12 - Math.floor(this.speed));
      if (this.legTimer % legSpeed === 0) this.legFrame = 1 - this.legFrame;
      this.drawDinoShape(this.dino, 0, 0, this.legFrame);
    } else {
      this.drawDinoJump(this.dino, 0, 0);
    }
    this.dino.setPosition(this.dinoX, this.dinoY);

    // Spawn obstacles
    this.obstacleTimer++;
    const minInterval = Math.max(40, 90 - Math.floor(this.score / 100) * 5);
    if (this.obstacleTimer >= minInterval + Phaser.Math.Between(0, 40)) {
      this.obstacleTimer = 0;
      const obstacle = this.createGroundObstacle(this.scale.width + 20);
      this.obstacles.push(obstacle);
    }

    // Spawn elevated platforms after the run gets going
    if (this.score >= 80) {
      this.platformTimer++;
      if (this.platformTimer >= this.platformInterval + Phaser.Math.Between(0, 80)) {
        this.platformTimer = 0;
        this.platformInterval = Math.max(130, 220 - Math.floor(this.score / 200) * 10);
        const platform = this.createUpperPlatform(this.scale.width + Phaser.Math.Between(20, 90));
        this.platforms.push(platform);
      }
    }

    // Move obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.obstacleX -= this.speed;
      if (obs.obstacleType === "falafel") {
        obs.rollAngle += this.speed * 0.08;
        this.drawFalafel(obs, obs.obstacleX, this.GROUND_Y - 12, obs.rollAngle);
      } else {
        obs.x -= this.speed;
      }
      if (obs.obstacleX + 60 < 0) {
        obs.destroy();
        this.obstacles.splice(i, 1);
      }
    }

    // Move elevated platforms
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const platform = this.platforms[i];
      platform.x -= this.speed;
      platform.platformX -= this.speed;

      if (this.currentPlatform === platform && !this.isStillOnPlatform(platform)) {
        this.currentPlatform = null;
        this.isOnGround = false;
      }

      if (platform.platformX + platform.platformWidth < 0) {
        if (this.currentPlatform === platform) {
          this.currentPlatform = null;
          this.isOnGround = false;
        }
        platform.destroy();
        this.platforms.splice(i, 1);
      }
    }

    // Spawn pterodactyls after score 200
    if (this.score >= 200) {
      this.pteroTimer++;
      if (this.pteroTimer >= this.pteroInterval + Phaser.Math.Between(0, 80)) {
        this.pteroTimer = 0;
        this.pteroInterval = Math.max(180, 300 - Math.floor(this.score / 200) * 20);
        const heights = [this.GROUND_Y - 50, this.GROUND_Y - 90, this.GROUND_Y - 130];
        const py = heights[Phaser.Math.Between(0, heights.length - 1)];
        const airObstacle = Phaser.Math.Between(0, 99) < 45
          ? this.createFlyingFalafel(this.scale.width + 20, py)
          : this.createPtero(this.scale.width + 20, py);
        this.pteros.push(airObstacle);
      }
    }

    // Move pteros
    for (let i = this.pteros.length - 1; i >= 0; i--) {
      const p = this.pteros[i];
      p.obstacleX -= this.speed;
      p.x = p.obstacleX - (this.scale.width + 20) + (this.scale.width + 20);
      // Actually use x directly
      p.x -= 0; // position set via drawPtero with offset

      // Recalc actual draw position
      const drawX = p.obstacleX;
      const drawY = p.obstacleY;

      if (p.obstacleType === "flyingFalafel") {
        p.rollAngle += this.speed * 0.1;
        this.drawFalafel(p, drawX, drawY, p.rollAngle);
      } else {
        // Wing flap
        if (this.frameCount % 18 === 0) p.wingFrame = 1 - p.wingFrame;
        this.drawPtero(p, 0, 0, p.wingFrame);
        p.setPosition(drawX, drawY);
      }

      if (drawX + 40 < 0) {
        p.destroy();
        this.pteros.splice(i, 1);
      }
    }
    // Collision detection
    this.checkCollisions();
  }

  checkCollisions() {
    // Dino hitbox: centered at (dinoX, dinoY - 20), half-extents ~14x20
    const dx = this.dinoX;
    const dy = this.dinoY - 20;
    const dHW = 12;
    const dHH = 18;

    for (const obs of this.obstacles) {
      const ox = obs.obstacleX + obs.hitOffsetX;
      const oy = this.GROUND_Y + obs.hitOffsetY;
      const oHW = obs.hitW / 2;
      const oHH = obs.hitH / 2;
      if (
        Math.abs(dx - ox) < dHW + oHW &&
        Math.abs(dy - oy) < dHH + oHH
      ) {
        this.triggerGameOver();
        return;
      }
    }

    for (const p of this.pteros) {
      const ox = p.obstacleX;
      const oy = p.obstacleY;
      if (
        Math.abs(dx - ox) < dHW + 14 &&
        Math.abs(dy - oy) < dHH + 7
      ) {
        this.triggerGameOver();
        return;
      }
    }

    for (const platform of this.platforms) {
      if (!platform.hazardType) continue;

      const ox = platform.platformX + platform.hazardOffsetX;
      const oy = platform.platformY + platform.hazardHitOffsetY;
      const oHW = platform.hazardHitW / 2;
      const oHH = platform.hazardHitH / 2;

      if (
        Math.abs(dx - ox) < dHW + oHW &&
        Math.abs(dy - oy) < dHH + oHH
      ) {
        this.triggerGameOver();
        return;
      }
    }
  }

  addCoin(amount) {
    let current = this.registry.get('currency');

    if (current === undefined || current === null) {
      current = 0;
    }

    current += amount;
    this.registry.set('currency', current);

  }
  rewardCoins() {
    if (this.score >= 200) {
      this.addCoin(Math.floor(this.score / 200));
    }
  }
  triggerGameOver() {
    this.gameOver = true;

    // Draw dead dino
    this.drawDinoDead(this.dino, 0, 0);
    this.dino.setPosition(this.dinoX, this.dinoY);

    // Flash red
    this.cameras.main.flash(300, 255, 50, 50, false);

    // Show game over popup
    this.gameOverGroup.setVisible(true);
    this.gameOverGroup.setPosition(this.scale.width / 2, this.GROUND_Y - 70);

    // Update score display
    this.scoreText.setText("HI " + this.padScore(this.hiScore) + "  " + this.padScore(this.score));
    this.rewardCoins();
  }
}
