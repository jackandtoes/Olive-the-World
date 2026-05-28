const HAT_CATALOG = [
  { key: "chef", texture: "hatChef", oliveTexture: "oliveHatChef", label: "Chef Hat", price: 2, displayWidth: 74, displayHeight: 74, storeDisplayWidth: 90, storeDisplayHeight: 90 },
  { key: "jester", texture: "hatJester", oliveTexture: "oliveHatJester", label: "Jester Hat", price: 3, displayWidth: 74, displayHeight: 74, storeDisplayWidth: 74, storeDisplayHeight: 74 },
  { key: "propeller", texture: "hatPropeller", oliveTexture: "oliveHatPropeller", label: "Propeller Hat", price: 4, displayWidth: 78, displayHeight: 78, storeDisplayWidth: 92, storeDisplayHeight: 92 },
  { key: "wizard", texture: "hatWizard", oliveTexture: "oliveHatWizard", label: "Wizard Hat", price: 5, displayWidth: 74, displayHeight: 74, storeDisplayWidth: 74, storeDisplayHeight: 74 }
];

const MAP_OLIVE_TARGET_HEIGHT = 38;
let backgroundMusic = null;

function startBackgroundMusic(scene) {
  if (!backgroundMusic) {
    backgroundMusic = scene.sound.add("background_music", { volume: 0.55, loop: true });
  }

  if (!backgroundMusic.isPlaying) {
    backgroundMusic.play();
  }
}

function stopBackgroundMusic() {
  if (backgroundMusic && backgroundMusic.isPlaying) {
    backgroundMusic.stop();
  }
}

// ===============================
// START SCENE
// ===============================
class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("homeBg", "assets/background.png");
    this.load.image("homeLogo", "assets/olive_main_logo.png");
    this.load.image("startBtn", "assets/start_button.png");
    this.load.image("settingsbutton", "assets/settingsbutton.png");
    this.load.image("oliveFarmhouse", "assets/cutscene/olive_farmhouse.png");
    this.load.image("oliveBirthday", "assets/cutscene/olive_birthday.png");
    this.load.image("philip_token", "assets/badges/badge_philippines.png");
    this.load.image("italy_token", "assets/badges/badge_italy.png");
    this.load.image("mexico_token", "assets/badges/badge_mexico.png");
    this.load.image("egypt_token", "assets/badges/badge_egypt.png");
    this.load.image("india_token", "assets/badges/badge_india.png");
    this.load.image("brazil_token", "assets/badges/badge_brazil.png");
    this.load.image("hatChef", "assets/hats/hat_chef.PNG");
    this.load.image("hatJester", "assets/hats/hat_jester.PNG");
    this.load.image("hatPropeller", "assets/hats/hat_propeller.PNG");
    this.load.image("hatWizard", "assets/hats/hat_wizard.PNG");
    this.load.audio("birthday_song", "assets/cutscene/olive_birthday_song.MP3");
    this.load.image("oliveParents", "assets/cutscene/olive_parents.png");
    this.load.image("oliveConfession1", "assets/cutscene/olive_confession1.png");
    this.load.image("oliveConfession2", "assets/cutscene/olive_confession2.png");
    this.load.image("oliveConfession3", "assets/cutscene/olive_confession3.png");
    this.load.image("oliveConcernedParents", "assets/cutscene/concerned_olive_parents.png");
    this.load.image("oliveDetermined", "assets/cutscene/olive_determined.png");
    this.load.audio("background_music", "assets/background_music.mp3");
  }

  create() {

    const width = this.scale.width;
    const height = this.scale.height;

    // Start background music for the start scene
    startBackgroundMusic(this);

    // Adds background 
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a140f).setDepth(-30);

    const backdrop = this.add.image(width / 2, height / 2 + 10, "homeBg");
    const bgScale = Math.max(width / backdrop.width, height / backdrop.height) * 1.04;
    backdrop.setScale(bgScale);
    backdrop.setAlpha(1);
    backdrop.setDepth(0);

    const warmGlow = this.add.circle(width * 0.78, height * 0.18, 260, 0xffd98a, 0.18)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-6);
    const coolGlow = this.add.circle(width * 0.16, height * 0.84, 230, 0x8fd3ff, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-6);

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.14).setDepth(-5);
    this.add.rectangle(width / 2, height / 2, width, height, 0x7a5a2a, 0.08).setDepth(-4);
    this._createSparkles(width, height);

    const buttonShadow = this.add.ellipse(width / 2, height * 0.81 + 18, 320, 62, 0x000000, 0.28)
      .setDepth(7);
    buttonShadow.setAlpha(0);
    
    const startButton = this.add.image(width / 2, height * 0.81, "startBtn")
      .setInteractive({ useHandCursor: true })
      .setDepth(8);
    
    const buttonScale = Math.min(0.62, (width * 0.44) / startButton.width);
    startButton.setScale(buttonScale);
    startButton.setAlpha(0);
    startButton.y += 12;

    const startGame = () => this.scene.start("IntroCutscene");
    startButton.on("pointerdown", startGame);
    this.input.keyboard.once("keydown-SPACE", startGame);

    startButton.on("pointerover", () => {
      this.tweens.add({
        targets: startButton,
        scaleX: buttonScale * 1.05,
        scaleY: buttonScale * 1.05,
        duration: 140,
        ease: "Sine.easeOut"
      });
      this.tweens.add({
        targets: buttonShadow,
        scaleX: 1.06,
        scaleY: 1.06,
        alpha: 0.35,
        duration: 140,
        ease: "Sine.easeOut"
      });
    });

    startButton.on("pointerout", () => {
      this.tweens.add({
        targets: startButton,
        scaleX: buttonScale,
        scaleY: buttonScale,
        duration: 140,
        ease: "Sine.easeOut"
      });
      this.tweens.add({
        targets: buttonShadow,
        scaleX: 1,
        scaleY: 1,
        alpha: 0.28,
        duration: 140,
        ease: "Sine.easeOut"
      });
    });

    this.tweens.add({
      targets: backdrop,
      y: backdrop.y + 8,
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: [warmGlow, coolGlow],
      scaleX: { from: 1, to: 1.08 },
      scaleY: { from: 1, to: 1.08 },
      alpha: { from: 0.1, to: 0.22 },
      duration: 3600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: startButton,
      y: startButton.y - 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: [buttonShadow, startButton],
      alpha: 1,
      duration: 520,
      delay: 560,
      ease: "Sine.easeOut"
    });

    //Settings Button
    const settingsButton = this.add.image(750, 550, "settingsbutton")
      .setOrigin(0.5)
      .setScale(0.08)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(30);
    settingsButton.on("pointerdown", () => {
      this.scene.start("Settings", { returnTo: "StartScene" });
    });

    settingsButton.on("pointerover", () => {
      this.tweens.add({
        targets: settingsButton,
        scaleX: 0.08 * 1.06,
        scaleY: 0.08 * 1.06,
        duration: 140,
        ease: "Sine.easeOut"
      });
    });

    settingsButton.on("pointerout", () => {
      this.tweens.add({
        targets: settingsButton,
        scaleX: 0.08,
        scaleY: 0.08,
        duration: 140,
        ease: "Sine.easeOut",
      });
    });

  }

animateText(target, speedInMs = 25) {
  const message = target.text;
  const invisibleMessage = message.replace(/[^ ]/g, " ");

  target.text = "";

  let visibleText = "";
  this.isTyping = true;

  return new Promise((resolve) => {
    const timer = this.time.addEvent({
      delay: speedInMs,
      loop: true,
      callback: () => {
        if (target.text === message) {
          timer.destroy();
          this.isTyping = false;
          return resolve();
        }

        visibleText += message[visibleText.length];
        const invisiblePart = invisibleMessage.substring(visibleText.length);
        target.text = visibleText + invisiblePart;
      },
    });

    this.currentTypingTimer = timer;
    this.fullText = message;
  });
}
  _createSparkles(width, height) {
    const palette = [0xfff2b2, 0xffffff, 0x9fe7ff, 0xffc57a];

    for (let i = 0; i < 14; i++) {
      const sparkle = this.add.star(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(20, height - 120),
        4,
        Phaser.Math.Between(2, 4),
        Phaser.Math.Between(5, 9),
        Phaser.Utils.Array.GetRandom(palette)
      );
      sparkle.setAlpha(Phaser.Math.FloatBetween(0.2, 0.65));
      sparkle.setDepth(-2);
      sparkle.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: sparkle,
        scaleX: Phaser.Math.FloatBetween(0.75, 1.15),
        scaleY: Phaser.Math.FloatBetween(0.75, 1.15),
        alpha: Phaser.Math.FloatBetween(0.15, 0.85),
        angle: Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(1400, 2800),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1800),
        ease: "Sine.easeInOut"
      });
    }
  }
}

class IntroCutscene extends Phaser.Scene {
  constructor() {
    super("IntroCutscene");
  }

  create() {
    startBackgroundMusic(this);

    const width = this.scale.width;
    const height = this.scale.height;
    this.slides = ["oliveFarmhouse", "oliveBirthday", "oliveParents", "oliveConfession1", "oliveConfession2", "oliveConfession3", "oliveConcernedParents", "oliveDetermined"];
    this.dialogueLines = [
      "", 
      "",
      "... happy birthday to you ...",
      "Mama, papa, I want to leave this town",
      "I want to see the world!\n I'm done with this small lil' town.",
      "I want to experience what all olives should!\n I want to travel the world as a world class chef",
      "Oh, baby — that’s a big step to make! But if you are confident then—",
      "I won’t let you down!"
    ];

    this.cutsceneIndex = 0;
    this.isTransitioningSlide = false;
    this.birthdaySong = null;
    this.isTyping = false;
    this.currentTypingTimer = null;
    this.fullText = "";

    this.add.rectangle(width / 2, height / 2, width, height, 0x130e0b);

    this.cutsceneImage = this.add.image(width / 2, height / 2, this.slides[0]).setAlpha(0);
    this._fitCutsceneImage(this.cutsceneImage, width, height);
    this.cutsceneDialogue();

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

    this.skipButton = this.add.text(width - 28, 28, "Skip", {
      fontSize: "22px",
      fill: "#fff4dd",
      backgroundColor: "#5a341d",
      padding: { x: 12, y: 8 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.skipButton.on("pointerdown", () => this.skipCutscene());

    this.tweens.add({
      targets: this.cutsceneImage,
      alpha: 1,
      duration: 450,
      ease: "Sine.easeOut",
      onComplete: () => {
        //this.playBirthdaySong();
      }
    });

    this.input.on("pointerdown", () => this.advanceCutscene());
    this.input.keyboard.on("keydown-SPACE", () => this.advanceCutscene());
    this.input.keyboard.on("keydown-ENTER", () => this.advanceCutscene());
    this.input.keyboard.on("keydown-ESC", () => this.skipCutscene());
    this.events.once("shutdown", () => this.stopBirthdaySong());
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
    this.stopBirthdaySong();
    this.cameras.main.fadeOut(350, 19, 14, 11);
    this.time.delayedCall(360, () => {
      this.scene.start("MapScene");
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

  skipCutscene() {
    if (this.isTransitioningSlide) return;
    this.isTransitioningSlide = true;
    this.stopBirthdaySong();
    this.cameras.main.fadeOut(350, 19, 14, 11);
    this.time.delayedCall(360, () => {
      this.scene.start("MapScene");
    });
  }

  playBirthdaySong() {
    if (!this.birthdaySong) {
      this.birthdaySong = this.sound.add("birthday_song", { volume: 0.55 });
    }
    if (!this.birthdaySong.isPlaying) {
      this.birthdaySong.play();
    }
  }

  stopBirthdaySong() {
    if (this.birthdaySong && this.birthdaySong.isPlaying) {
      this.birthdaySong.stop();
    }
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

// ===============================
// MAP SCENE
// ===============================
class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
  }

  preload() {
    this.load.image("mapBg", "assets/map (2).png");
    this.load.image("flagPhilippines", "assets/Philippines_flag.png");
    this.load.image("flagMexico", "assets/Mexico_flag.png");
    this.load.image("flagEgypt", "assets/Egypt_flag.png");
    this.load.image("flagItaly", "assets/Italy_flag.png");
    this.load.image("hatChef", "assets/hats/hat_chef.PNG");
    this.load.image("hatJester", "assets/hats/hat_jester.PNG");
    this.load.image("hatPropeller", "assets/hats/hat_propeller.PNG");
    this.load.image("hatWizard", "assets/hats/hat_wizard.PNG");
    this.load.image("oliveOverjoyed", "assets/olivesprites/olive_overjoyed.PNG");
    this.load.image("oliveHatChef", "assets/olivesprites/olive_hat_chef.PNG");
    this.load.image("oliveHatJester", "assets/olivesprites/olive_hat_jester.PNG");
    this.load.image("oliveHatPropeller", "assets/olivesprites/olive_hat_propeller.PNG");
    this.load.image("oliveHatWizard", "assets/olivesprites/olive_hat_wizard.PNG");
  }

  init(data) {
    if (!this.registry.has('equippedItems')) {
      this.registry.set('equippedItems', { hat: null });
    }
    if (!this.registry.has('currency')) {
      this.registry.set('currency', 0);
    }
    if (!this.registry.has('ownedItems')) {
      this.registry.set('ownedItems', {});
    }
    if (!this.registry.has('wins')) {
      this.registry.set('wins', { mexico: false, italy: false, philippines: false, egypt: false, brazil: false, india: false });
    }
    if (!this.registry.has('seenCutscenes')) {
      this.registry.set('seenCutscenes', { mexico: false, italy: false, philippines: false, egypt: false, brazil: false, india: false });
    }
  }

  create() {
    startBackgroundMusic(this);

    //Sets the background
    const width = this.scale.width;
    const height = this.scale.height;
    const bg = this.add.image(width / 2, height / 2, "mapBg");
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);
    bg.setOrigin(0, 0);
    bg.setPosition(0, 0);
    bg.setDepth(-1);

    const worldWidth = bg.displayWidth;
    const worldHeight = bg.displayHeight;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setZoom(2.5);

    // Top-left navigation buttons
    const navButtonStyle = {
      fontSize: "10px",
      fill: "#000000",
      backgroundColor: "#ffc4e3",
      padding: { x: 10, y: 5 }
    };

    const returnButton = this.add.text(250, 190, "Return", navButtonStyle)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(30);

    returnButton.on("pointerover", () => {
      this.tweens.add({
        targets: returnButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 140,
        ease: "Sine.easeOut"
      });
      returnButton.setBackgroundColor("#ef7cac");
    });

    returnButton.on("pointerout", () => {
      this.tweens.add({
        targets: returnButton,
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: "Sine.easeOut",
      });
      returnButton.setBackgroundColor("#ffc4e3");
    });

    returnButton.on("pointerdown", () => {
      this.scene.start("StartScene");
    });


    //Store Button
    const storeButton = this.add.text(310, 190, "Store", navButtonStyle)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(30);

    storeButton.on("pointerover", () => {
      this.tweens.add({
        targets: storeButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 140,
        ease: "Sine.easeOut"
      });
      storeButton.setBackgroundColor("#ef7cac");
    });

    storeButton.on("pointerout", () => {
      this.tweens.add({
        targets: storeButton,
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: "Sine.easeOut",
      });
      storeButton.setBackgroundColor("#ffc4e3");
    });

    storeButton.on("pointerdown", () => {
      this.scene.start("Store");
    });

    //Inventory Button
    const inventoryButton = this.add.text(365, 190, "Inventory", navButtonStyle)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(30);
    inventoryButton.on("pointerdown", () => {
      this.scene.start("Inventory");
    });

    inventoryButton.on("pointerover", () => {
      this.tweens.add({
        targets: inventoryButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 140,
        ease: "Sine.easeOut"
      });
      inventoryButton.setBackgroundColor("#ef7cac");
    });

    inventoryButton.on("pointerout", () => {
      this.tweens.add({
        targets: inventoryButton,
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: "Sine.easeOut",
      });
      inventoryButton.setBackgroundColor("#ffc4e3");
    });

    //Settings Button
    const settingsButton = this.add.image(540, 200, "settingsbutton")
      .setOrigin(0.5)
      .setScale(0.03)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(30);
    settingsButton.on("pointerdown", () => {
      this.scene.start("Settings", { returnTo: "MapScene" });
    });

    settingsButton.on("pointerover", () => {
      this.tweens.add({
        targets: settingsButton,
        scaleX: 0.03 * 1.06,
        scaleY: 0.03 * 1.06,
        duration: 140,
        ease: "Sine.easeOut"
      });
    });

    settingsButton.on("pointerout", () => {
      this.tweens.add({
        targets: settingsButton,
        scaleX: 0.03,
        scaleY: 0.03,
        duration: 140,
        ease: "Sine.easeOut",
      });
    });

    //Adds Player
    this.player = this.add.image(width / 2, height / 2, "oliveOverjoyed").setDepth(2);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(22, 22);
    this.player.body.setOffset(6, 6);
    this.player.setDepth(5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.countries = [];

    this.createCountry("Mexico", width * 0.3, height * 0.44,
      "Whack piñatas.\nAvoid spicy chiles!", "MexicoCutscene", "flagMexico");
    this.createCountry("Italy", width * 0.70, height * 0.35,
      "Fix pasta pipes.\nServe the perfect plate!", "ItalyCutscene", "flagItaly");
    this.createCountry("India", width * 0.62, height * 0.27,
      "A quick visit to India.\nTry the India scene!", "IndiaScene", "flagIndia");
    this.createCountry("Philippines", width * 1.1, height * 0.5,
      "Collect lumpia ingredients.\nAvoid traffic!", "PhilippinesCutscene", "flagPhilippines");
    this.createCountry("Egypt", width * 0.76, height * 0.42,
      "Run in the desert.\nDodge palm trees and flying falafels!", "EgyptCutscene", "flagEgypt");
    this.createCountry("Brazil", width * 0.45, height * 0.65,
      "Collect carnival ingredients.\nJump past floats and hazards!", "BrazilCutscene", "BrazilScene", "flagBrazil");
    this.createInfoPanel();
    this.updatePlayerAppearance();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  createCountry(name, x, y, description, sceneName, storeName, flagKey) {
    const landmark = this.add.image(x, y, flagKey).setScale(0.6).setDepth(1);
    this.add.text(x, y - 40, name, {
      fontSize: "18px",
      fill: "#000"
    }).setOrigin(0.5).setDepth(2);

    this.countries.push({
      name,
      landmark,
      description,
      sceneName,
      storeName,
      flagKey,
      radius: 60
    });
  }
  // Creates the info panel that appears when the player is near a country landmark
  createInfoPanel() {
    this.infoPanel = this.add.container(0, 0);
    this.infoPanel.setDepth(10);
    this.infoPanel.setVisible(false);
    const bg = this.add.rectangle(0, 0, 290, 150, 0xfff7ef)
      .setStrokeStyle(3, 0x000000);
    this.panelTitle = this.add.text(-130, -55, "", {
      fontSize: "20px",
      fill: "#000"
    });
    this.panelText = this.add.text(-130, -20, "", {
      fontSize: "16px",
      fill: "#000"
    }).setWordWrapWidth(250);
    const playButton = this.add.text(-130, 42, "Play game!", {
      fontSize: "18px",
      fill: "#007700"
    }).setInteractive();
    playButton.on("pointerdown", () => {
      if (this.currentCountry) {
        stopBackgroundMusic();
        this.scene.start(this.getCountrySceneName(this.currentCountry));
      }
    });
    this.infoPanel.add([bg, this.panelTitle, this.panelText, playButton]);
  }

  getCountrySceneName(country) {
    const wins = this.registry.get('wins') || {};
    const seenCutscenes = this.registry.get('seenCutscenes') || {};
    if (country.name === "Italy" && (wins.italy || seenCutscenes.italy)) {
      return "ItalyScene";
    }
    if (country.name === "Egypt" && (wins.egypt || seenCutscenes.egypt)) {
      return "EgyptScene";
    }
    if (country.name === "Mexico" && (wins.mexico || seenCutscenes.mexico)) {
      return "MexicoScene";
    }
    if (country.name === "Philippines" && (wins.philippines || seenCutscenes.philippines)) {
      return "PhilippinesScene";
    }
    if (country.name === "Brazil" && (wins.brazil || seenCutscenes.brazil)) {
      return "BrazilScene";
    }
    return country.sceneName;
  }

  positionInfoPanel(country) {
    const width = this.scale.width;
    const height = this.scale.height;
    const worldWidth = this.physics.world.bounds.width;
    const worldHeight = this.physics.world.bounds.height;
    const bubbleWidth = 290;
    const bubbleHeight = 150;
    const offsetX = 100;
    const offsetY = -50;

    const x = Phaser.Math.Clamp(
      country.landmark.x + offsetX,
      bubbleWidth / 2,
      worldWidth - bubbleWidth / 2
    );
    const y = Phaser.Math.Clamp(
      country.landmark.y + offsetY,
      bubbleHeight / 2,
      worldHeight - bubbleHeight / 2
    );

    this.infoPanel.setPosition(x, y);
    this.infoPanel.setScale(1 / this.cameras.main.zoom);
  }

  updatePlayerAppearance() {
    const hat = this.registry.get('equippedItems').hat;
    const hatConfig = HAT_CATALOG.find((entry) => entry.key === hat);
    this.player.setTexture(hatConfig ? hatConfig.oliveTexture : "oliveOverjoyed");
    this.fitPlayerOlive();
  }

  fitPlayerOlive() {
    const sourceImage = this.player.texture.getSourceImage();
    const scale = MAP_OLIVE_TARGET_HEIGHT / sourceImage.height;
    this.player.setScale(scale);
  }

  update() {
    const speed = 125;

    // Handle player movement (Arrow keys and WASD)
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.setFlipX(true);
    }
    if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.setFlipX(false);
    }
    if (this.cursors.up.isDown || this.keys.W.isDown) this.player.body.setVelocityY(-speed);
    if (this.cursors.down.isDown || this.keys.S.isDown) this.player.body.setVelocityY(speed);


    let foundCountry = null;
    for (let country of this.countries) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        country.landmark.x,
        country.landmark.y
      );
      if (distance < country.radius) {
        foundCountry = country;
        break;
      }
    }
    if (foundCountry) {
      this.currentCountry = foundCountry;
      this.panelTitle.setText(foundCountry.name);
      this.panelText.setText(foundCountry.description);
      this.positionInfoPanel(foundCountry);
      this.infoPanel.setVisible(true);
    } else {
      this.currentCountry = null;
      this.infoPanel.setVisible(false);
    }
  }
}

// ===============================
// STORE SCENE
// ===============================
class Store extends Phaser.Scene {
  constructor() {
    super("Store");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0xffeaa7);
    this.add.text(width / 2, 60, "Welcome to the store!", {
      fontSize: "36px",
      fill: "#000"
    }).setOrigin(0.5);

    // currency display
    this.coinText = this.add.text(width - 20, 20, `Coins: ${this.registry.get('currency')}`, {
      fontSize: "28px", fill: "#000",
      backgroundColor: "#fffbe6", padding: { x: 10, y: 5 }
    }).setOrigin(1, 0);

    this.hatStatusTexts = {};
    const positions = [
      { x: width * 0.28, y: height * 0.36 },
      { x: width * 0.72, y: height * 0.36 },
      { x: width * 0.28, y: height * 0.67 },
      { x: width * 0.72, y: height * 0.67 }
    ];

    const ownedItems = this.registry.get('ownedItems') || {};

    HAT_CATALOG.forEach((hat, index) => {
      const pos = positions[index];
      const panel = this.add.rectangle(pos.x, pos.y, 180, 180, 0xfff8e5)
        .setStrokeStyle(4, 0xcaa24f)
        .setInteractive({ useHandCursor: true });
      const image = this.add.image(pos.x, pos.y - 20, hat.texture)
        .setDisplaySize(hat.storeDisplayWidth || hat.displayWidth, hat.storeDisplayHeight || hat.displayHeight)
        .setInteractive({ useHandCursor: true });

      this.add.text(pos.x, pos.y + 55, hat.label, {
        fontSize: "18px",
        fill: "#000"
      }).setOrigin(0.5);
      this.add.text(pos.x, pos.y - 75, `Coins: ${hat.price}`, {
        fontSize: "18px",
        fill: "#b8860b"
      }).setOrigin(0.5);

      this.hatStatusTexts[hat.key] = this.add.text(pos.x, pos.y + 85, this._storeItemLabel(ownedItems, hat.key), {
        fontSize: "16px",
        fill: this._storeItemColor(ownedItems, hat.key)
      }).setOrigin(0.5);

      const buyHat = () => this._handlePurchase(hat.key, hat.price);
      panel.on("pointerdown", buyHat);
      image.on("pointerdown", buyHat);
    });

    this.add.text(width / 2, height - 50, "Press ESC to return to map", {
      fontSize: "20px", fill: "#000"
    }).setOrigin(0.5);
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MapScene"));
  }



  _storeItemLabel(owned, key) {
    if (owned[key]) return "Owned";
    return "Click to buy";
  }

  _storeItemColor(owned, key) {
    if (owned[key]) return "#00aa00";
    return "#cc0000";
  }

  _refreshStoreStatuses() {
    const ownedItems = this.registry.get('ownedItems') || {};
    HAT_CATALOG.forEach((hat) => {
      this.hatStatusTexts[hat.key]
        .setText(this._storeItemLabel(ownedItems, hat.key))
        .setColor(this._storeItemColor(ownedItems, hat.key));
    });
  }

  _handlePurchase(key, price) {
    const ownedItems = this.registry.get('ownedItems') || {};
    const currency = this.registry.get('currency') || 0;

    if (ownedItems[key] || currency < price) return;

    ownedItems[key] = true;
    this.registry.set('ownedItems', ownedItems);
    this.registry.set('currency', currency - price);
    this.coinText.setText(`Coins: ${this.registry.get('currency')}`);
    this._refreshStoreStatuses();
  }
}

// ===============================
// INVENTORY SCENE 
// ===============================
class Inventory extends Phaser.Scene {
  constructor() {
    super("Inventory");
  }

  init(data) {
    this.initialScrollY = data?.scrollY ?? 0;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0xf8e7c5);
    this.add.rectangle(width / 2, height / 2, width - 48, height - 48, 0xfff7e7)
      .setStrokeStyle(3, 0xc99b52, 0.85);
    this.add.text(width / 2, 64, "Inventory", {
      fontSize: "38px",
      fill: "#6b3e1f",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.add.text(width / 2, 98, "Collect tokens from each country to fill your passport.", {
      fontSize: "18px",
      fill: "#9a6b3d"
    }).setOrigin(0.5);

    const scrollArea = {
      x: 58,
      y: 158,
      width: width - 116,
      height: height - 250
    };
    this.scrollArea = scrollArea;

    this.add.rectangle(scrollArea.x + scrollArea.width / 2, scrollArea.y + scrollArea.height / 2, scrollArea.width, scrollArea.height, 0xfffbf1)
      .setStrokeStyle(2, 0xd5b073, 0.8);

    this.add.text(width / 2, height - 50, "Press ESC to return to map", {
      fontSize: "20px",
      fill: "#6b3e1f"
    }).setOrigin(0.5);

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MapScene");
    });

    const wins = this.registry.get('wins');
    const ownedItems = this.registry.get('ownedItems') || {};
    const equippedItems = this.registry.get('equippedItems') || { hat: null };
    const equippedHatConfig = HAT_CATALOG.find((entry) => entry.key === equippedItems.hat);
    this.inventoryOlive = this.add.image(
      85,
      500,
      equippedHatConfig ? equippedHatConfig.oliveTexture : "oliveOverjoyed"
    ).setDepth(101);
    this.fitInventoryOlive();

    const cards = [
       { section: "Accessories", label: "No Hat", unlocked: true, texture: "oliveOverjoyed", tokenWidth: 74, tokenHeight: 74, ribbon: equippedItems.hat === null ? "Equipped" : "Click to unequip", accessoryKey: null },
      { section: "Country Tokens", label: "Mexico", unlocked: wins.mexico, texture: "mexico_token", tokenWidth: 150, tokenHeight: 150, ribbon: "Collected" },
      { section: "Country Tokens", label: "Italy", unlocked: wins.italy, texture: "italy_token", tokenWidth: 150, tokenHeight: 150, ribbon: "Collected" },
      { section: "Country Tokens", label: "Philippines", unlocked: wins.philippines, texture: "philip_token", tokenWidth: 150, tokenHeight: 150, ribbon: "Collected" },
      { section: "Country Tokens", label: "Egypt", unlocked: wins.egypt, texture: "egypt_token", tokenWidth: 150, tokenHeight: 150, ribbon: "Collected" },
      { section: "Country Tokens", label: "India", unlocked: wins.india, texture: "india_token", tokenWidth: 150, tokenHeight: 150, ribbon: "Collected" },
      { section: "Country Tokens", label: "Brazil", unlocked: wins.brazil, texture: "brazil_token", tokenWidth: 150, tokenHeight: 150, ribbon: "Collected" },

     
      ...HAT_CATALOG.map((hat) => ({
        section: "Accessories",
        label: hat.label,
        unlocked: !!ownedItems[hat.key],
        texture: hat.texture,
        tokenWidth: hat.displayWidth,
        tokenHeight: hat.displayHeight,
        ribbon: equippedItems.hat === hat.key ? "Equipped" : "Click to equip",
        accessoryKey: hat.key
      }))
    ];

    this.scrollContent = this.add.container(scrollArea.x, scrollArea.y);
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(scrollArea.x, scrollArea.y, scrollArea.width, scrollArea.height);
    this.scrollContent.setMask(maskShape.createGeometryMask());

    const contentHeight = this.buildInventoryCards(cards);
    this.maxScrollY = Math.max(0, contentHeight - scrollArea.height);
    this.scrollY = Phaser.Math.Clamp(this.initialScrollY, -this.maxScrollY, 0);
    this.isDraggingInventory = false;
    this.setInventoryScroll(this.scrollY);

    this.add.rectangle(50, 550, 300, 300, 0xf8e7c4).setDepth(100).setStrokeStyle(3, 0xc99b52);

    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(scrollArea.x, scrollArea.y, scrollArea.width, scrollArea.height), pointer.x, pointer.y)) {
        return;
      }
      this.setInventoryScroll(this.scrollY - deltaY * 0.6);
    });

    this.input.on("pointerdown", (pointer) => {
      if (Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(scrollArea.x, scrollArea.y, scrollArea.width, scrollArea.height), pointer.x, pointer.y)) {
        this.isDraggingInventory = true;
      }
    });

    this.input.on("pointerup", () => {
      this.isDraggingInventory = false;
    });

    this.input.on("pointermove", (pointer) => {
      if (!this.isDraggingInventory || !pointer.isDown) return;
      this.setInventoryScroll(this.scrollY + pointer.velocity.y / 10);
    });

    if (this.maxScrollY > 0) {
      this.add.text(width - 74, scrollArea.y + scrollArea.height - 14, "Scroll for more", {
        fontSize: "16px",
        fill: "#9a6b3d"
      }).setOrigin(1, 1);
    }
  }

  buildInventoryCards(cards) {
    const columns = 3;
    const cardWidth = 184;
    const cardHeight = 250;
    const rowGap = 36;
    const sectionGap = 72;
    const titleGap = 28;
    const topPadding = 34;
    const leftPadding = 22;
    const usableWidth = this.scrollArea.width - leftPadding * 2;
    const columnGap = (usableWidth - columns * cardWidth) / (columns - 1);
    const startX = leftPadding + cardWidth / 2;
    let currentY = topPadding;

    const sections = [];
    cards.forEach((cardData) => {
      let section = sections.find((entry) => entry.name === cardData.section);
      if (!section) {
        section = { name: cardData.section, cards: [] };
        sections.push(section);
      }
      section.cards.push(cardData);
    });

    sections.forEach((section) => {
      const sectionTitle = this.add.text(0, currentY, section.name, {
        fontSize: "26px",
        fill: "#6b3e1f",
        fontStyle: "bold"
      });
      const underline = this.add.rectangle(this.scrollArea.width / 2, currentY + 15, this.scrollArea.width - 24, 2, 0xd9bb84, 0.85)
        .setOrigin(0.5);
      this.scrollContent.add([sectionTitle, underline]);

      currentY += titleGap + cardHeight / 2;

      section.cards.forEach((cardData, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + column * (cardWidth + columnGap);
        const y = currentY + row * (cardHeight + rowGap);
        this.scrollContent.add(this.createInventoryCard(x, y, cardData));
      });

      const rowsUsed = Math.ceil(section.cards.length / columns);
      currentY += rowsUsed * cardHeight + Math.max(0, rowsUsed - 1) * rowGap + sectionGap;
    });

    return currentY;
  }

  createInventoryCard(x, y, cardData) {
    const card = this.add.container(x, y);
    const shadow = this.add.rectangle(6, 8, 184, 250, 0xd9b97d, 0.35)
      .setStrokeStyle(0, 0x000000, 0);
    const panel = this.add.rectangle(0, 0, 184, 250, 0xfffcf2)
      .setStrokeStyle(3, 0xc79b53);
    const ringColor = cardData.unlocked ? 0xe0bb67 : 0xdbc9a9;
    const medallion = this.add.circle(0, -18, 62, ringColor, 0.28)
      .setStrokeStyle(5, ringColor, 0.95);
    const innerPlate = this.add.circle(0, -18, 49, cardData.unlocked ? 0xfff1cf : 0xf0e5d0, 1)
      .setStrokeStyle(2, cardData.unlocked ? 0xc4933f : 0xc9bca1, 0.9);

    card.add([shadow, panel, medallion, innerPlate]);

    if (cardData.unlocked) {
      if (cardData.texture) {
        const token = this.add.image(0, -18, cardData.texture)
          .setDisplaySize(cardData.tokenWidth, cardData.tokenHeight);
        card.add(token);
      }

      const isAccessory = !!cardData.accessoryKey;
      const ribbon = this.add.rectangle(0, 78, 120, 30, isAccessory && cardData.ribbon === "Equipped" ? 0x4d8d57 : 0x8c7446, 1)
        .setStrokeStyle(2, 0x2f6137);
      const ribbonText = this.add.text(0, 78, cardData.ribbon, {
        fontSize: "16px",
        fill: "#fff8e8",
        fontStyle: "bold"
      }).setOrigin(0.5);
      card.add([ribbon, ribbonText]);

      if (Object.prototype.hasOwnProperty.call(cardData, "accessoryKey")) {
        panel.setInteractive({ useHandCursor: true });
        panel.on("pointerdown", () => {
          const equipped = this.registry.get('equippedItems') || { hat: null };
          equipped.hat = cardData.accessoryKey;
          this.registry.set('equippedItems', equipped);
          this.scene.restart({ scrollY: this.scrollY });
        });
      }
    } else {
      const lockSilhouette = this.add.circle(0, -18, 34, 0xb5a58c, 0.45)
        .setStrokeStyle(2, 0x98876d, 0.8);
      const question = this.add.text(0, -18, "?", {
        fontSize: "34px",
        fill: "#7c6a54",
        fontStyle: "bold"
      }).setOrigin(0.5);
      const lockedText = this.add.text(0, 78, "Not collected yet", {
        fontSize: "16px",
        fill: "#8d7a62"
      }).setOrigin(0.5);
      card.add([lockSilhouette, question, lockedText]);
    }

    const label = this.add.text(0, 112, cardData.label, {
      fontSize: "20px",
      fill: "#6b3e1f",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: 150 }
    }).setOrigin(0.5);
    card.add(label);

    return card;
  }

  setInventoryScroll(nextY) {
    this.scrollY = Phaser.Math.Clamp(nextY, -this.maxScrollY, 0);
    this.scrollContent.y = this.scrollY + this.scrollArea.y;
  }

  fitInventoryOlive() {
    const sourceImage = this.inventoryOlive.texture.getSourceImage();
    const scale = 180 / sourceImage.height;
    this.inventoryOlive.setScale(scale);
  }
}

// ===============================
// Settings Scene
// ===============================

class Settings extends Phaser.Scene {
  constructor() {
    super("Settings");
  }

  init(data) {
    this.returnTo = data?.returnTo || "MapScene";
    this.isReturning = false;

    if (!this.registry.has("musicVolume")) {
      this.registry.set("musicVolume", backgroundMusic ? backgroundMusic.volume : 0.55);
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);

    const panel = this.add.rectangle(width / 2, height / 2, 420, 300, 0xfff4e3)
      .setStrokeStyle(4, 0x6b3e1f);

    this.add.text(width / 2, height / 2 - 110, "Settings", {
      fontSize: "40px",
      color: "#6b3e1f",
      fontStyle: "bold"
    }).setOrigin(0.5);

    const musicText = this.add.text(width / 2, height / 2 - 25, "", {
      fontSize: "24px",
      color: "#5a341d"
    }).setOrigin(0.5);

    const refreshMusicLabel = () => {
      const isMuted = backgroundMusic ? backgroundMusic.mute : false;
      musicText.setText(`Music: ${isMuted ? "Off" : "On"}`);
    };

    const applyMusicVolume = (volume) => {
      const clampedVolume = Phaser.Math.Clamp(volume, 0, 1);
      this.registry.set("musicVolume", clampedVolume);
      this.sound.volume = clampedVolume;
      if (backgroundMusic) {
        backgroundMusic.setVolume(clampedVolume);
      }
      return clampedVolume;
    };

    const scrollBar = this.add.rectangle(width / 2, height / 2 + 15, 200, 8, 0xd9b97d)
      .setStrokeStyle(2, 0x000000, 0.6)
      .setOrigin(0.5);

    const scrollHandle = this.add.circle(width / 2, height / 2 + 15, 12, 0xe0bb67)
      .setStrokeStyle(2, 0x000000, 0.6)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.input.setDraggable(scrollHandle);

    const minX = scrollBar.x - scrollBar.width / 2;
    const maxX = scrollBar.x + scrollBar.width / 2;
    const savedVolume = Phaser.Math.Clamp(this.registry.get("musicVolume") ?? 0.55, 0, 1);

    applyMusicVolume(savedVolume);
    scrollHandle.x = Phaser.Math.Linear(minX, maxX, savedVolume);

    scrollHandle.on("drag", (pointer, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);

      const volume = (clampedX - minX) / scrollBar.width;

      applyMusicVolume(volume);
      scrollHandle.x = clampedX;
      refreshMusicLabel();
    });

    const backButton = this.add.text(width / 2, height / 2 + 85, this.returnTo === "StartScene" ? "Back to Start" : "Back to Map", {
      fontSize: "22px",
      color: "#ffffff",
      backgroundColor: "#5a341d",
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const goBack = () => {
      if (this.isReturning) return;
      this.isReturning = true;
      this.cameras.main.fadeOut(220, 0, 0, 0);
      this.time.delayedCall(240, () => {
        this.scene.start(this.returnTo);
      });
    };

    backButton.on("pointerdown", goBack);

    this.input.keyboard.on("keydown-ESC", goBack);

    this.cameras.main.fadeIn(180, 0, 0, 0);

    refreshMusicLabel();
    this.add.text(width / 2, height / 2 + 145, "ESC to return", {
      fontSize: "16px",
      color: "#8a5d34"
    }).setOrigin(0.5);
  }
}

// ===============================
// GAME CONFIG
// ===============================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  render: {
    antialias: true,
    pixelArt: false
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [
    StartScene,
    IntroCutscene,
    MapScene,
    MexicoScene,
    ItalyCutscene,
    ItalyScene,
    PhilippinesCutscene,
    PhilippinesScene,
    EgyptCutscene,
    EgyptScene,
    MexicoCutscene,
    BrazilScene,
    IndiaScene,
    Store,
    Inventory,
    Settings
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
new Phaser.Game(config);
