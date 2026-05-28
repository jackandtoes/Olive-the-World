class MexicoCutscene extends Phaser.Scene {
  constructor() {
    super("MexicoCutscene");
  }

  preload() {
    this.load.image("oliveBoat", "assets/mexico/cutscene/olive_boat.png");
    this.load.image("oliveMexicoWalking", "assets/mexico/cutscene/olive_mexico_walking.png");
    this.load.image("oliveAvocadoChef", "assets/mexico/cutscene/avocado_chef.png");
    this.load.audio("mexican_music", "assets/mexico/cutscene/mexican_music.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const seenCutscenes = this.registry.get("seenCutscenes") || {};
    seenCutscenes.mexico = true;
    this.registry.set("seenCutscenes", seenCutscenes);
    this.slides = ["oliveBoat", "oliveMexicoWalking", "oliveAvocadoChef"];
    this.dialogueLines = [
      "", 
      "",
      "Mijo! \n GUACK-A-MOLE"
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
    this.startMexicanMusic();

    this.cutsceneCaption = this.add.text(width / 2, height - 44, "Click or press SPACE to continue", {
      fontSize: "22px",
      fill: "#ffbd3a",
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
   startMexicanMusic() {
     let mexicanMusic = this.sound.get("mexican_music");
     if (!mexicanMusic) {
       mexicanMusic = this.sound.add("mexican_music", { volume: 0.55, loop: true });
     }
     if (!mexicanMusic.isPlaying) {
       mexicanMusic.play();
     }
   }

   stopMexicanMusic() {
     this.sound.stopByKey("mexican_music");
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
      this.scene.start("MexicoScene");
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

class MexicoScene extends Phaser.Scene {
    constructor() {
        super('MexicoScene');
        this.score = 0;
        this.timeLeft = 120;
        this.levelDuration = 120;
        this.gameOver = false;
        this.pinatas = [];
        this.chiles = [];
        this.goldenPinatas = [];
        this.confettiPool = [];
        this.coinPool = [];
        this.explosionPool = [];
        this.backgroundClouds = [];
        this.backgroundBirds = [];
    }

    preload() {
        this.load.image('pinata', 'assets/mexico/mexico_minigame_pinata.png');
        this.load.image('goldenPinata', 'assets/mexico/mexico_minigame_goldenPinata.png');
        this.load.image('chile', 'assets/mexico/mexico_minigame_chile.png');
    }
    
    create() {
        this.startMexicanMusic();
        // RESET STATE: Important because the scene is reused
        this.score = 0;
        this.timeLeft = this.levelDuration;
        this.gameOver = false;
        this.pinatas = [];
        this.chiles = [];
        this.goldenPinatas = [];
        this.backgroundClouds = [];
        this.backgroundBirds = [];

        // Use Phaser's scale system, not window.innerWidth
        const width = this.scale.width;
        const height = this.scale.height;

        // Background sky and soft haze
        this.add.rectangle(width / 2, height / 2, width, height, 0x8fd7ff).setDepth(-20);
        this.add.circle(width * 0.84, height * 0.14, 48, 0xfff3b0, 0.92).setDepth(-19);
        this.add.circle(width * 0.84, height * 0.14, 72, 0xffe17a, 0.16).setDepth(-21);

        // Drifting clouds
        this.createBackgroundCloud(width * 0.16, height * 0.18, 0.95, 18, 0xfff8ef, 1.1);
        this.createBackgroundCloud(width * 0.43, height * 0.12, 1.15, 12, 0xfff4e5, 0.8);
        this.createBackgroundCloud(width * 0.73, height * 0.22, 0.82, 14, 0xfffbf5, 1.6);
        this.createBackgroundCloud(width * 0.02, height * 0.30, 0.72, 9, 0xfff0d8, 0.5);

        // Birds gliding in the far background
        this.createBackgroundBird(-40, height * 0.24, 0.9, 24, 0.9);
        this.createBackgroundBird(width * 0.20, height * 0.16, 0.75, 18, 1.4);
        this.createBackgroundBird(width * 0.62, height * 0.20, 0.8, 21, 0.4);
        this.backgroundTicker = 0;

        // UI Text
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.timerText = this.add.text(10, 50, `Time: ${this.timeLeft}`, { fontSize: '24px', fill: '#fff' });

        // Exit instructions
        this.add.text(width - 10, 10, 'Press ESC to Quit', { fontSize: '16px', fill: '#fff' })
            .setOrigin(1, 0);

        // Listen for ESC key to return to map
        this.input.keyboard.on('keydown-ESC', () => {
            this.stopMexicanMusic();
            this.scene.start('MapScene');
        });

        // Initialize dynamic spawn tracking (spawn rate increases as game progresses)
        this.lastPinataSpawnTime = 0;
        this.lastChileSpawnTime = 0;
        this.lastGoldenPinataSpawnTime = 0;
        this.pinataSpawnInterval = 2000;  // Starting interval in ms
        this.chileSpawnInterval = 4000;   // Starting interval in ms
        this.goldenPinataSpawnInterval = 7000;  // Starting interval in ms

        // Countdown event for the level timer (ticks every second)
        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onSecondTick,
            callbackScope: this,
            loop: true
        });
        this.initConfettiPool();
        this.initCoinPool();
        this.initExplosionPool();
        this.spawnPinata();
    }

    createBackgroundCloud(x, y, scale = 1, speed = 2, color = 0xffffff, drift = 1) {
        const cloud = this.add.graphics();
        cloud.fillStyle(color, 0.9);
        cloud.fillEllipse(0, 0, 82 * scale, 26 * scale);
        cloud.fillEllipse(22 * scale, -10 * scale, 52 * scale, 18 * scale);
        cloud.fillEllipse(-18 * scale, -8 * scale, 40 * scale, 14 * scale);
        cloud.fillEllipse(34 * scale, 4 * scale, 30 * scale, 12 * scale);
        cloud.setPosition(x, y);
        cloud.setDepth(-18);

        this.backgroundClouds.push({
            el: cloud,
            baseY: y,
            speed,
            drift
        });

        return cloud;
    }

    createBackgroundBird(x, y, scale = 1, speed = 5, drift = 1) {
        const bird = this.add.graphics();
        bird.lineStyle(3, 0x5d4b36, 0.55);
        bird.beginPath();
        bird.moveTo(-12 * scale, 0);
        bird.lineTo(-3 * scale, -6 * scale);
        bird.lineTo(0, -2 * scale);
        bird.lineTo(3 * scale, -6 * scale);
        bird.lineTo(12 * scale, 0);
        bird.strokePath();
        bird.setPosition(x, y);
        bird.setDepth(-17);

        this.backgroundBirds.push({
            el: bird,
            baseY: y,
            speed,
            drift,
            scale
        });

        return bird;
    }
    startMexicanMusic() {
    let mexicanMusic = this.sound.get("mexican_music");
    if (!mexicanMusic) {
      mexicanMusic = this.sound.add("mexican_music", { volume: 0.55, loop: true });
    }
    if (!mexicanMusic.isPlaying) {
      mexicanMusic.play();
    }
   }

    stopMexicanMusic() {
     this.sound.stopByKey("mexican_music");
   }

    initConfettiPool(poolSize = 24) {
        this.confettiPool = [];

        for (let i = 0; i < poolSize; i++) {
            const piece = this.add.rectangle(-100, -100, 8, 14, 0xffffff);
            piece.setVisible(false);
            piece.setActive(false);
            this.confettiPool.push(piece);
        }
    }

    initCoinPool(poolSize = 16) {
        this.coinPool = [];

        for (let i = 0; i < poolSize; i++) {
            const coin = this.add.circle(-100, -100, 10, 0xffd34d);
            coin.setStrokeStyle(2, 0xb8860b);
            coin.setVisible(false);
            coin.setActive(false);
            this.coinPool.push(coin);
        }
    }

    initExplosionPool(poolSize = 12) {
        this.explosionPool = [];

        for (let i = 0; i < poolSize; i++) {
            const puff = this.add.circle(-100, -100, 6, 0xff9f1c);
            puff.setVisible(false);
            puff.setActive(false);
            this.explosionPool.push(puff);
        }
    }

    spawnPinata() {
        if (this.gameOver) return;

        const width = this.scale.width;
        const height = this.scale.height;

        // Use game width, not window width
        const startX = Phaser.Math.Between(40, width - 40);
        const endX = Phaser.Math.Between(width - 40, 40);
        // Adjust peak for 600px height
        const peakY = Phaser.Math.Between(height * 0.3, height * 0.5); 
        const startY = height + 50; // Start just below screen

        const pinata = this.add.image(startX, startY, 'pinata');
        pinata.setScale(90 / pinata.width, 90 / pinata.height);
        pinata.setInteractive();
        pinata.on('pointerdown', () => this.onPinataClicked(pinata));

        const pinataData = {
            el: pinata,
            startX,
            endX,
            startY,
            peakY,
            startTime: Date.now(),
            duration: 3000,
            clicked: false,
            angle: Phaser.Math.Between(-3, 3) // Random initial angle for rotation
        };

        this.pinatas.push(pinataData);
    }

    spawnChile() {
        if (this.gameOver) return;

        const width = this.scale.width;
        const height = this.scale.height;

        // Use game width, not window width
        const startX = Phaser.Math.Between(40, width - 40);
        const endX = Phaser.Math.Between(width - 40, 40);
        // Adjust peak for 600px height
        const peakY = Phaser.Math.Between(height * 0.3, height * 0.5); 
        const startY = height + 50; // Start just below screen

        const chile = this.add.image(startX, startY, 'chile');
        chile.setScale(105 / chile.width, 105 / chile.height); // Scale to 90x90
        chile.setInteractive();
        chile.on('pointerdown', () => this.onChileClicked(chile));

        const chileData = {
            el: chile,
            startX,
            endX,
            startY,
            peakY,
            startTime: Date.now(),
            duration: 3000,
            clicked: false,
            angle: Phaser.Math.Between(-3, 3)
        };

        this.chiles.push(chileData);
    }

    spawnGoldenPinata() {
        if (this.gameOver) return;

        const width = this.scale.width;
        const height = this.scale.height;

        // Use game width, not window width
        const startX = Phaser.Math.Between(40, width - 40);
        const endX = Phaser.Math.Between(width - 40, 40);
        // Adjust peak for 600px height
        const peakY = Phaser.Math.Between(height * 0.3, height * 0.5); 
        const startY = height + 50; // Start just below screen

        const goldenPinata = this.add.image(startX, startY, 'goldenPinata');
        goldenPinata.setScale(80 / goldenPinata.width, 80 / goldenPinata.height); // Scale to 90x90
        goldenPinata.setInteractive();
        goldenPinata.on('pointerdown', () => this.onGoldenPinataClicked(goldenPinata));

        const goldenPinataData = {
            el: goldenPinata,
            startX,
            endX,
            startY,
            peakY,
            startTime: Date.now(),
            duration: 3000,
            clicked: false,
            angle: Phaser.Math.Between(-3, 3)
        };

        this.goldenPinatas.push(goldenPinataData);
    }

    createConfettiBurst(x, y, palette = [0xff4d4d, 0xffc94d, 0x4dd2ff, 0x8aff4d, 0xff7ad9]) {
        const pieces = 12;

        for (let i = 0; i < pieces; i++) {
            let confetti = this.confettiPool.find(piece => !piece.active);

            if (!confetti) {
                confetti = this.add.rectangle(-100, -100, 8, 14, 0xffffff);
                confetti.setVisible(false);
                confetti.setActive(false);
                this.confettiPool.push(confetti);
            }

            const color = Phaser.Utils.Array.GetRandom(palette);
            const width = Phaser.Math.Between(6, 10);
            const height = Phaser.Math.Between(10, 16);

            confetti.setFillStyle(color);
            confetti.setSize(width, height);
            confetti.setPosition(x, y);
            confetti.setAlpha(1);
            confetti.setScale(1);
            confetti.setAngle(0);
            confetti.setVisible(true);
            confetti.setActive(true);

            if (confetti._burstTween) {
                confetti._burstTween.stop();
                confetti._burstTween = null;
            }

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(50, 140);
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance - Phaser.Math.Between(20, 70);
            const spin = Phaser.Math.Between(-360, 360);

            confetti._burstTween = this.tweens.add({
                targets: confetti,
                x: x + offsetX,
                y: y + offsetY,
                angle: spin,
                alpha: 0,
                scaleX: Phaser.Math.FloatBetween(0.4, 1),
                scaleY: Phaser.Math.FloatBetween(0.4, 1),
                duration: Phaser.Math.Between(450, 700),
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    confetti.setVisible(false);
                    confetti.setActive(false);
                    confetti.setAlpha(1);
                    confetti.setScale(1);
                    confetti.setAngle(0);
                    confetti.setPosition(-100, -100);
                    confetti._burstTween = null;
                }
            });
        }
    }

    createCoinBurst(x, y) {
        const pieces = 7;

        for (let i = 0; i < pieces; i++) {
            let coin = this.coinPool.find(piece => !piece.active);

            if (!coin) {
                coin = this.add.circle(-100, -100, 10, 0xffd34d);
                coin.setStrokeStyle(2, 0xb8860b);
                coin.setVisible(false);
                coin.setActive(false);
                this.coinPool.push(coin);
            }

            const radius = Phaser.Math.Between(8, 13);
            coin.setRadius(radius);
            coin.setFillStyle(Phaser.Math.RND.pick([0xffd34d, 0xffe66d, 0xffc93d]));
            coin.setStrokeStyle(2, 0xb8860b);
            coin.setPosition(x, y);
            coin.setAlpha(1);
            coin.setScale(1);
            coin.setAngle(0);
            coin.setVisible(true);
            coin.setActive(true);

            if (coin._burstTween) {
                coin._burstTween.stop();
                coin._burstTween = null;
            }

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(40, 110);
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance - Phaser.Math.Between(25, 75);
            const spin = Phaser.Math.Between(360, 1080);

            coin._burstTween = this.tweens.add({
                targets: coin,
                x: x + offsetX,
                y: y + offsetY,
                angle: spin,
                alpha: 0,
                scaleX: Phaser.Math.FloatBetween(0.85, 1.25),
                scaleY: Phaser.Math.FloatBetween(0.85, 1.25),
                duration: Phaser.Math.Between(500, 800),
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    coin.setVisible(false);
                    coin.setActive(false);
                    coin.setAlpha(1);
                    coin.setScale(1);
                    coin.setAngle(0);
                    coin.setPosition(-100, -100);
                    coin._burstTween = null;
                }
            });
        }
    }

    createChileExplosion(x, y) {
        const pieces = 12;
        const palette = [0xff3b30, 0xff6b35, 0xff9f1c, 0xffffff];

        for (let i = 0; i < pieces; i++) {
            let puff = this.explosionPool.find(piece => !piece.active);

            if (!puff) {
                puff = this.add.circle(-100, -100, 6, 0xff9f1c);
                puff.setVisible(false);
                puff.setActive(false);
                this.explosionPool.push(puff);
            }

            const radius = Phaser.Math.Between(8, 12);
            puff.setRadius(radius);
            puff.setFillStyle(Phaser.Utils.Array.GetRandom(palette));
            puff.setPosition(x, y);
            puff.setAlpha(0.95);
            puff.setScale(1);
            puff.setAngle(0);
            puff.setVisible(true);
            puff.setActive(true);

            if (puff._burstTween) {
                puff._burstTween.stop();
                puff._burstTween = null;
            }

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(25, 65);
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance - Phaser.Math.Between(30, 50);
            const spin = Phaser.Math.Between(-180, 180);

            puff._burstTween = this.tweens.add({
                targets: puff,
                x: x + offsetX,
                y: y + offsetY,
                angle: spin,
                alpha: 0,
                scaleX: Phaser.Math.FloatBetween(0.6, 1.1),
                scaleY: Phaser.Math.FloatBetween(0.6, 1.1),
                duration: Phaser.Math.Between(220, 380),
                ease: 'Quad.easeOut',
                onComplete: () => {
                    puff.setVisible(false);
                    puff.setActive(false);
                    puff.setAlpha(1);
                    puff.setScale(1);
                    puff.setAngle(0);
                    puff.setPosition(-100, -100);
                    puff._burstTween = null;
                }
            });
        }
    }

    onPinataClicked(pinataEl) {
        if (this.gameOver) return;

        const index = this.pinatas.findIndex(p => p.el === pinataEl);
        if (index !== -1 && !this.pinatas[index].clicked) {
            this.pinatas[index].clicked = true;
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);

            this.createConfettiBurst(pinataEl.x, pinataEl.y);
            pinataEl.destroy();
            this.pinatas.splice(index, 1);

            const plusText = this.add.text(pinataEl.x, pinataEl.y, '+10', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
            this.tweens.add({
                targets: plusText,
                y: pinataEl.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => plusText.destroy()
            });

        }
    }

    onChileClicked(chileEl) {
        if (this.gameOver) return;

        const index = this.chiles.findIndex(p => p.el === chileEl);
        if (index !== -1 && !this.chiles[index].clicked) {
            this.chiles[index].clicked = true;
            this.score -= 20;
            this.scoreText.setText('Score: ' + this.score);

            this.createChileExplosion(chileEl.x, chileEl.y);
            chileEl.destroy();
            this.chiles.splice(index, 1);

            const minusText = this.add.text(chileEl.x, chileEl.y, '-30', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
            this.tweens.add({
                targets: minusText,
                y: chileEl.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => minusText.destroy()
            });
        }
    }

    onGoldenPinataClicked(goldenPinataEl) {
        if (this.gameOver) return;

        const index = this.goldenPinatas.findIndex(p => p.el === goldenPinataEl);
        if (index !== -1 && !this.goldenPinatas[index].clicked) {
            this.goldenPinatas[index].clicked = true;
            this.score += 50; 
            this.scoreText.setText('Score: ' + this.score);

            this.createCoinBurst(goldenPinataEl.x, goldenPinataEl.y);
            goldenPinataEl.destroy();
            this.goldenPinatas.splice(index, 1);

            const plusText = this.add.text(goldenPinataEl.x, goldenPinataEl.y, '+50', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
            this.tweens.add({
                targets: plusText,
                y: goldenPinataEl.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => plusText.destroy()
            });

            const current = this.registry.get('currency') || 0;
            this.registry.set('currency', current + 1);
        }
    }

    update(time, delta) {
        if (this.gameOver) return;

        const now = Date.now();
        const elapsedGameTime = this.levelDuration - this.timeLeft;
        this.updateBackground(delta);

        // Spawn piñatas with decreasing interval
        if (now - this.lastPinataSpawnTime > this.pinataSpawnInterval && !this.gameOver) {
            this.spawnPinata();
            this.lastPinataSpawnTime = now;
            // Decrease spawn interval by 5ms per second elapsed (minimum 600ms)
            this.pinataSpawnInterval = Math.max(650, 2000 - (elapsedGameTime * 20));
        }

        // Spawn chiles with decreasing interval (only after 20 seconds)
        if (elapsedGameTime >= 20 && now - this.lastChileSpawnTime > this.chileSpawnInterval && !this.gameOver) {
            this.spawnChile();
            this.lastChileSpawnTime = now;
            this.chileSpawnInterval = Math.max(800, 4000 - (elapsedGameTime * 20));
        }

        // Spawn golden pinatas with decreasing interval (only after 35 seconds)
        if (elapsedGameTime >= 35 && now - this.lastGoldenPinataSpawnTime > this.goldenPinataSpawnInterval && !this.gameOver) {
            this.spawnGoldenPinata();
            this.lastGoldenPinataSpawnTime = now;
            this.goldenPinataSpawnInterval = Math.max(5000, 5000 - (elapsedGameTime * 15));
        }

        for (let i = this.pinatas.length - 1; i >= 0; i--) {
            const pinataData = this.pinatas[i];
            
            pinataData.el.angle += pinataData.angle; // Rotate the pinata for visual effect

            if (pinataData.clicked) continue;

            const elapsed = now - pinataData.startTime;
            const t = elapsed / pinataData.duration;

            if (t > 1) {
                // Pinata missed: simply remove the pinata (no lives in timer mode)
                pinataData.el.destroy();
                this.pinatas.splice(i, 1);
            } else {
                // Parabolic movement
                const x = pinataData.startX + (pinataData.endX - pinataData.startX) * t;
                const y = pinataData.startY - (4 * t * (1 - t)) * (pinataData.startY - pinataData.peakY);
                pinataData.el.setPosition(x, y);
            }
        }

        for (let i = this.chiles.length - 1; i >= 0; i--) {
            const chileData = this.chiles[i];

            if (chileData.clicked) continue;

            chileData.el.angle += chileData.angle;

            const elapsed = now - chileData.startTime;
            const t = elapsed / chileData.duration;

            if (t > 1) {
                // Chile missed: simply remove the chile (no lives in timer mode)
                chileData.el.destroy();
                this.chiles.splice(i, 1);
            } else {
                // Parabolic movement
                const x = chileData.startX + (chileData.endX - chileData.startX) * t;
                const y = chileData.startY - (4 * t * (1 - t)) * (chileData.startY - chileData.peakY);
                chileData.el.setPosition(x, y);
            }
        }

        for (let i = this.goldenPinatas.length - 1; i >= 0; i--) {
            const goldenPinataData = this.goldenPinatas[i];

            if (goldenPinataData.clicked) continue;

            goldenPinataData.el.angle += goldenPinataData.angle;

            const elapsed = now - goldenPinataData.startTime;
            const t = elapsed / goldenPinataData.duration;

            if (t > 1) {
                // Golden pinata missed: simply remove the golden pinata (no lives in timer mode)
                goldenPinataData.el.destroy();
                this.goldenPinatas.splice(i, 1);
            } else {
                // Parabolic movement
                const x = goldenPinataData.startX + (goldenPinataData.endX - goldenPinataData.startX) * t;
                const y = goldenPinataData.startY - (4 * t * (1 - t)) * (goldenPinataData.startY - goldenPinataData.peakY);
                goldenPinataData.el.setPosition(x, y);
            }
        } 

    }

    updateBackground(delta = 16.67) {
        const width = this.scale.width;
        this.backgroundTicker += delta / 1000;

        for (const cloud of this.backgroundClouds) {
            cloud.el.x -= cloud.speed * (delta / 1000);
            cloud.el.y = cloud.baseY + Math.sin((this.backgroundTicker * 0.8) + cloud.drift) * 5;

            if (cloud.el.x < -140) {
                cloud.el.x = width + 140;
                cloud.baseY = Phaser.Math.Between(this.scale.height * 0.08, this.scale.height * 0.34);
            }
        }

        for (const bird of this.backgroundBirds) {
            bird.el.x += bird.speed * (delta / 1000);
            bird.el.y = bird.baseY + Math.sin((this.backgroundTicker * 1.6) + bird.drift) * 4;
            bird.el.rotation = Math.sin((this.backgroundTicker * 2.2) + bird.drift) * 0.06;

            if (bird.el.x > width + 50) {
                bird.el.x = -50;
                bird.baseY = Phaser.Math.Between(this.scale.height * 0.10, this.scale.height * 0.32);
            }
        }
    }

    onSecondTick() {
        if (this.gameOver) return;
        this.timeLeft -= 1;
        this.timerText.setText(`Time: ${this.timeLeft}`);
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameOver = true;
        if (this.countdownEvent) this.countdownEvent.remove();
        const width = this.scale.width;
        const height = this.scale.height;

            if (this.score >= 1500) {
                this.add.rectangle(width/2, height/2, 400, 400, 0x000000, 0.8);
                this.add.text(width/2, height/2 - 40, 'YOU WIN!', 
                    { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
                this.add.text(width/2, height/2 + 20, `Final Score: ${this.score}`, 
                    { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
                const backButton = this.add.text(width/2, height/2 + 70, 'Return to Map', 
                    { fontSize: '24px', fill: '#00ff00' })
                    .setOrigin(0.5)
                    .setInteractive();
                backButton.on('pointerdown', () => {
                    this.scene.start('MapScene');
                    this.stopMexicanMusic();
                });
                const playButton = this.add.text(width/2, height/2 + 120, 'Play Again', 
                    { fontSize: '24px', fill: '#00ff00' })
                    .setOrigin(0.5)
                    .setInteractive();
                playButton.on('pointerdown', () => {
                    playButtonClickSfx(this);
                    this.scene.start('MexicoScene');
                });
                const wins = this.registry.get('wins');
                wins.mexico = true;
                this.registry.set('wins', wins);
            }
            else {
                this.add.rectangle(width/2, height/2, 400, 400, 0x000000, 0.8);
                this.add.text(width/2, height/2 - 40, 'YOU LOSE', 
                    { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
                this.add.text(width/2, height/2 + 20, `Final Score: ${this.score}`, 
                    { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
                const backButton = this.add.text(width/2, height/2 + 70, 'Return to Map', 
                    { fontSize: '24px', fill: '#00ff00' })
                    .setOrigin(0.5)
                    .setInteractive();
                backButton.on('pointerdown', () => {
                    this.scene.start('MapScene');
                    this.stopMexicanMusic();
                });
                const playButton = this.add.text(width/2, height/2 + 120, 'Play Again', 
                    { fontSize: '24px', fill: '#00ff00' })
                    .setOrigin(0.5)
                    .setInteractive();
                playButton.on('pointerdown', () => {
                    playButtonClickSfx(this);
                    this.scene.start('MexicoScene');
                });
            }
        
    }
}
