class BrazilCutscene extends Phaser.Scene {
  constructor() {
    super("BrazilCutscene");
  }

  preload() {
    this.load.audio("brazil_music", "assets/brazil/cutscene/brazil_music.mp3");
    this.load.image("olive_hanggliding", "assets/brazil/cutscene/olive_flying_hang.png");
    this.load.image("olive_carnaval", "assets/brazil/cutscene/olive_carnaval.png");
    this.load.image("olive_bean_chef", "assets/brazil/cutscene/bean_chef_olive.png");
    // this.load.audio("egyptian_music", "assets/italy/cutscene/italian_music.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const seenCutscenes = this.registry.get("seenCutscenes") || {};
    seenCutscenes.brazil = true;
    this.registry.set("seenCutscenes", seenCutscenes);
    this.slides = ["olive_hanggliding", "olive_carnaval", "olive_bean_chef"];
    this.dialogueLines = [
      "What a great view from here!\n I wonder what is going on below?",
      "Get a taste of Carnival!",
      "No party can start without feijoada!\n Let's find those ingredients!"
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
    this.startBrazilMusic();

    this.cutsceneCaption = this.add.text(width / 2, height - 44, "Click or press SPACE to continue", {
      fontSize: "22px",
      fill: "#fff4dd",
      backgroundColor: "#5a341d",
      padding: { x: 13, y: 8 }
    }).setOrigin(0.5).setShadow(2, 2, "#000000", 0, false, true);

    this.cutsceneProgress = this.add.text(width / 2, 36, `1 / ${this.slides.length}`, {
      fontSize: "24px",
      fill: "#fff4dd"
    }).setOrigin(0.5).setShadow(2, 2, "#000000", 0, false, true);

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

  startBrazilMusic() {
    let brazilMusic = this.sound.get("brazil_music");
    const musicVolume = this.registry.get("musicVolume") ?? 0.55;
    if (!brazilMusic) {
      brazilMusic = this.sound.add("brazil_music", { volume: musicVolume, loop: true });
    }
    brazilMusic.setVolume(musicVolume);
    if (!brazilMusic.isPlaying) {
      brazilMusic.play();
    }
  }

  stopBrazilMusic() {
    this.sound.stopByKey("brazil_music");
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
      ).setOrigin(0.5).setShadow(2, 2, "#000000", 0, false, true);
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
        this.scene.start("BrazilScene");
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

const BRAZIL_PLATFORM_LEVELS = [
  {
    heights: [4, 5, 4, null, 6, 5, null, 6, 5], // larger number = lower platform, null = no platform
    weather: "afternoon",
    ingredient: "Beans",
  },
  {
    heights: [5, 4, null, 4, 6, 4, null, 5, 6],
    weather: "twilight",
    ingredient: "Rice",
  },
  {
    heights: [6, null, 6, 4, 6, 4, 5, null, 5],
    weather: "night",
    ingredient: "Sausage",
  },
  {
    heights: [6, null, 6, 5, 4, null, 5, null, 6],
    weather: "morning",
    ingredient: "Pork Ribs",
  },
];

const BRAZIL_OLIVE_TEXTURES = {
  default: "oliveOverjoyed",
  chef: "oliveHatChef",
  jester: "oliveHatJester",
  propeller: "oliveHatPropeller",
  wizard: "oliveHatWizard",
  viking: "oliveHatViking",
  shark: "oliveHatShark"
};

class BrazilScene extends Phaser.Scene {
  constructor() {
    super("BrazilScene");
    this.platformSpacing = 240;
    this.sceneWidth = this.platformSpacing * 9;
  }

  init(data) {
    this.currentLevel = data?.level || 1;
    this.levelData = BRAZIL_PLATFORM_LEVELS[this.currentLevel - 1];
    this.active = true;
    this.goalReached = false;
    this.ingredientCollected = false;
    this.toast = null;

    this.palette = {
      bgTop: 0xdfeee4,
      bgBottom: 0xe8efe3,
      sun: 0xf2ecc0,
      mountain: 0xb9ccb5,
      mountainShadow: 0x99b59a,
      uiPanel: 0xf6f4eb,
      uiBorder: 0x9fad95,
      uiText: "#5b351d",
      uiAccent: 0xc9d4c0,
      shadow: 0x000000,
      coin: 0xe3c254,
      coinInner: 0xf1e5a4,
      overlay: 0x222620,
      win: "#2f9e44",
      lose: "#d94841",
      buttonFill: 0xf1efe4,
      buttonBorder: 0x97a38b,
      buttonText: "#5a5143",
      buttonHover: 0xe3eadb,
    };

    this.TOP_UI_HEIGHT = 96;
  }
  
  playSfx(key) {
    if (!this.cache.audio.exists(key)) return;
    this.sound.play(key, { volume: getSfxVolume(this) });
  }

  preload() {
    this.load.audio("brazil_music", "assets/brazil/cutscene/brazil_music.mp3");
    this.load.image("oliveOverjoyed", "assets/olive_overjoyed.PNG");
    this.load.image("mountain", "assets/brazil/brazil_mountains.PNG");
    this.load.image("sky", "assets/brazil/brazil_sky.PNG");
    this.load.image("skyline", "assets/brazil/brazil_skyline.PNG");
    this.load.image("buildings", "assets/brazil/brazil_buildings.PNG");

    this.load.image("beans", "assets/brazil/brazil_blackbeansb.png");
    this.load.image("rice", "assets/brazil/brazil_riceb.png");
    this.load.image("sausage", "assets/brazil/brazil_sausageb.png");
    this.load.image("ribs", "assets/brazil/brazil_porkribsb.png");

    this.load.image("oliveHatChef", "assets/olivesprites/olive_hat_chef.PNG");
    this.load.image("oliveHatJester", "assets/olivesprites/olive_hat_jester.PNG");
    this.load.image("oliveHatPropeller", "assets/olivesprites/olive_hat_propeller.PNG");
    this.load.image("oliveHatWizard", "assets/olivesprites/olive_hat_wizard.PNG");
    this.load.image("oliveHatViking", "assets/olivesprites/olive_hat_viking.PNG");
    this.load.image("oliveHatShark", "assets/olivesprites/olive_hat_shark.PNG");


    this.load.image("float_a_4", "assets/brazil/float_a_4.png");
    this.load.image("float_b_4", "assets/brazil/float_b_4.png");
    this.load.image("float_a_5", "assets/brazil/float_a_5.png");
    this.load.image("float_b_5", "assets/brazil/float_b_5.png");
    this.load.image("float_a_6", "assets/brazil/float_a_6.png");
    this.load.image("float_b_6", "assets/brazil/float_b_6.png");

    this.load.audio("item_collection_sfx", "assets/sfx/item_collection_sfx.mp3");
    this.load.audio("hit_sfx", "assets/sfx/hit_sfx.mp3");
    this.load.audio("victory_sfx", "assets/sfx/victory_sfx.mp3");
  }

  create() {
    this.startBrazilMusic();
    this.input.keyboard.enabled = true;
    this.physics.world.gravity.y = 800;
    this.physics.world.setBounds(0, 0, this.sceneWidth, 760);

    this.createTextures();
    this.createStars();
    this.createParallaxBackgrounds();
    this.createPlatforms();
    this.createPlayer();
    this.createIngredient();
    this.createCoin();
    this.createGoal();
    this.createParticles();
    this.createUi();
    this.createAnimations();
    this.applyWeather(this.levelData.weather);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-ESC", () => this.returnToMap());

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.goal, this.platforms);
    this.physics.add.overlap(this.player, this.ingredient, this.collectIngredient, null, this);
    this.physics.add.overlap(this.player, this.coin, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.goal, this.tryFinishLevel, null, this);

    this.cameras.main.setBounds(0, 0, this.sceneWidth, 600);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);

    //this.showBanner(`Level ${this.currentLevel}`, `Collect ${this.levelData.ingredient} and reach the goal.`);
  }

  startBrazilMusic() {
    let brazilMusic = this.sound.get("brazil_music");
    const musicVolume = this.registry.get("musicVolume") ?? 0.55;
    if (!brazilMusic) {
      brazilMusic = this.sound.add("brazil_music", { volume: musicVolume, loop: true });
    }
    brazilMusic.setVolume(musicVolume);
    if (!brazilMusic.isPlaying) {
      brazilMusic.play();
    }
  }

  stopBrazilMusic() {
    this.sound.stopByKey("brazil_music");
  }

  returnToMap() {
    this.stopBrazilMusic();
    if (!this.checkOliveWin()) {
      this.scene.start("MapScene");
    }
    else {
      this.scene.start("OliveWinScene");
    }
  }

  createTextures() {
    if (this.textures.exists("brazilPlatformBlock")) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRoundedRect(0, 0, 220, 28, 8);
    graphics.fillStyle(0xb08968, 1);
    graphics.fillRoundedRect(0, 0, 220, 12, 8);
    graphics.lineStyle(2, 0xe6ccb2, 0.45);
    graphics.strokeRoundedRect(0, 0, 220, 28, 8);
    graphics.generateTexture("brazilPlatformBlock", 220, 28);
    graphics.clear();

    graphics.fillStyle(0xf4a261, 1);
    graphics.fillRoundedRect(0, 0, 36, 48, 10);
    graphics.fillStyle(0xffe8a1, 1);
    graphics.fillCircle(18, 16, 7);
    graphics.fillStyle(0xe76f51, 1);
    graphics.fillTriangle(10, 26, 26, 26, 18, 42);
    graphics.generateTexture("brazilGoalBlock", 36, 48);
    graphics.clear();

    graphics.fillStyle(0x7a4e2d, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.fillStyle(0xc7f9cc, 1);
    graphics.fillCircle(10, 11, 4);
    graphics.fillCircle(22, 9, 4);
    graphics.fillCircle(18, 22, 5);
    graphics.generateTexture("brazilIngredientBlock", 32, 32);
    graphics.clear();

    graphics.fillStyle(0xe3c254, 1);
    graphics.fillCircle(18, 18, 18);
    graphics.fillStyle(0xf1e5a4, 1);
    graphics.fillCircle(18, 18, 12);
    graphics.fillStyle(0xffffff, 0.85);
    graphics.fillCircle(12, 11, 4);
    graphics.generateTexture("brazilCoinBlock", 36, 36);
    graphics.clear();

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 6, 10);
    graphics.generateTexture("brazilParticle", 6, 10);
    graphics.clear();

    graphics.destroy();
  }

  createStars() {
    this.stars = [];

    for (let i = 0; i < 200; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 900),
        Phaser.Math.Between(0, 280),
        Phaser.Math.Between(1, 3),
        0xffffff
      );
      star.setScrollFactor(Math.random() * 0.1);
      star.setDepth(-27);
      star.setVisible(false);
      this.stars.push(star);
    }
  }

  createParallaxBackgrounds() {
    const viewportWidth = this.scale.width;
    const viewportHeight = this.scale.height;
    const maxCameraScroll = this.sceneWidth - viewportWidth;
    const skyFactor = 0.18;
    const mountainFactor = 0.28;
    const skylineFactor = 0.38;
    const buildingsFactor = 0.62;
    const skySource = this.textures.get("sky").getSourceImage();
    const mountainSource = this.textures.get("mountain").getSourceImage();
    const skylineSource = this.textures.get("skyline").getSourceImage();
    const buildingsSource = this.textures.get("buildings").getSourceImage();
    const skyWidth = viewportWidth + maxCameraScroll * skyFactor;
    const mountainWidth = viewportWidth + maxCameraScroll * mountainFactor;
    const skylineWidth = viewportWidth + maxCameraScroll * skylineFactor;
    const buildingsWidth = viewportWidth + maxCameraScroll * buildingsFactor;
    const skyHeight = skyWidth * (skySource.height / skySource.width);
    const mountainHeight = mountainWidth * (mountainSource.height / mountainSource.width);
    const skylineHeight = skylineWidth * (skylineSource.height / skylineSource.width);
    const buildingsHeight = buildingsWidth * (buildingsSource.height / buildingsSource.width);

    this.bgColor = this.add.rectangle(0, 0, viewportWidth, viewportHeight, 0x0571ff)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-30);

    this.bg1 = this.add.image(0, 0, "sky")
      .setOrigin(0, 0)
      .setScrollFactor(skyFactor)
      .setDepth(-28)
      .setDisplaySize(skyWidth, skyHeight);

    this.bg2 = this.add.image(0, 0, "mountain")
      .setOrigin(0, 0)
      .setScrollFactor(mountainFactor)
      .setDepth(-26)
      .setDisplaySize(mountainWidth, mountainHeight);

    this.bg3 = this.add.image(0, -180, "skyline")
      .setOrigin(0, 0)
      .setScrollFactor(skylineFactor)
      .setDepth(-22)
      .setDisplaySize(skylineWidth, skylineHeight);

    this.bg4 = this.add.image(0, viewportHeight + 28, "buildings")
      .setOrigin(0, 1)
      .setScrollFactor(buildingsFactor)
      .setDepth(-18)
      .setDisplaySize(buildingsWidth, buildingsHeight);
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    const platformHitboxWidth = 160;
    const floatWidthFactor = 0.85;
    const heightVariantCounters = {};

    for (const [xIndex, yIndex] of this.levelData.heights.entries()) {
      if (typeof yIndex !== "number") {
        continue;
      }

      const x = this.platformSpacing * xIndex + this.platformSpacing / 2;
      const y = yIndex * 70;
      const platform = this.platforms.create(x, y, "brazilPlatformBlock");
      platform.refreshBody();
      platform.setVisible(false);
      platform.body.setSize(platformHitboxWidth, platform.body.height);
      platform.body.setOffset((220 - platformHitboxWidth) / 2, 0);

      const occurrence = (heightVariantCounters[yIndex] = (heightVariantCounters[yIndex] || 0) + 1);
      const floatKey = this.getFloatImageKey(yIndex, occurrence);
      const floatImage = this.add.image(x, this.scale.height, floatKey)
        .setOrigin(0.5, 1)
        .setScrollFactor(1, 0);

      const floatScale = this.scale.height / floatImage.height;
      floatImage.setDisplaySize(floatImage.width * floatScale * floatWidthFactor, this.scale.height);
    }
  }

  getFloatImageKey(height, occurrence) {
    const variant = occurrence % 2 === 1 ? "a" : "b";
    if (height === 4) {
      return `float_${variant}_4`;
    }
    if (height === 5) {
      return `float_${variant}_5`;
    }
    if (height === 6) {
      return `float_${variant}_6`;
    }
    return "brazilPlatformBlock";
  }

  createPlayer() {
    const equippedHat = this.registry.get("equippedItems")?.hat;

    const textureKey =
      BRAZIL_OLIVE_TEXTURES[equippedHat] ||
      BRAZIL_OLIVE_TEXTURES.default;

    this.player = this.physics.add.sprite(125, 110, textureKey);

    const sourceImage = this.player.texture.getSourceImage();
    const scale = 52 / sourceImage.height;

    this.player.setScale(scale);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(sourceImage.width * 0.56, sourceImage.height * 0.82);
    this.player.body.setOffset(sourceImage.width * 0.22, sourceImage.height * 0.12);
  }
  createIngredient() {
    const textureMap = {
      "Beans": "beans",
      "Rice": "rice",
      "Sausage": "sausage",
      "Pork Ribs": "ribs",
    };

    const platformIndexes = this.levelData.heights
      .map((height, index) => ({ height, index }))
      .filter((platform) => Number.isFinite(platform.height));

    const goalIndex = platformIndexes[platformIndexes.length - 1].index;

    const candidatePlatforms = platformIndexes.filter(
      (platform) => platform.index > 0 && platform.index < goalIndex
    );

    const spawnPlatforms = candidatePlatforms.length
      ? candidatePlatforms
      : platformIndexes;

    const targetPlatform = spawnPlatforms[spawnPlatforms.length - 1];

    const ingredientIndex = targetPlatform.index;
    const ingredientHeight = this.levelData.heights[ingredientIndex] ?? 4;

    const x = this.platformSpacing * ingredientIndex + this.platformSpacing / 2;
    const y = ingredientHeight * 70 - 55;

    const texture = textureMap[this.levelData.ingredient] || "beans";

    this.ingredient = this.physics.add.sprite(x, y, texture);

    this.ingredient.setDisplaySize(48, 48);

    this.ingredient.body.setAllowGravity(false);
    this.ingredient.setImmovable(true);

    this.tweens.add({
      targets: this.ingredient,
      y: y - 12,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  createCoin() {
    const platformIndexes = this.levelData.heights
      .map((height, index) => ({ height, index }))
      .filter((platform) => Number.isFinite(platform.height));
    const targetPlatform = platformIndexes[Math.min(this.currentLevel, platformIndexes.length - 2)] || platformIndexes[0];
    const x = this.platformSpacing * targetPlatform.index + this.platformSpacing / 2;
    const y = targetPlatform.height * 70 - 58;

    this.coin = this.physics.add.sprite(x, y, "brazilCoinBlock");
    this.coin.body.setAllowGravity(false);
    this.coin.setImmovable(true);

    this.tweens.add({
      targets: this.coin,
      y: y - 10,
      angle: 8,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  createGoal() {
    let lastHeight = 4;

    for (let i = this.levelData.heights.length - 1; i >= 0; i--) {
      if (typeof this.levelData.heights[i] === "number") {
        lastHeight = this.levelData.heights[i];
        break;
      }
    }

    const x = this.sceneWidth - 40;
    const y = lastHeight * 70 - 40;

    this.goal = this.physics.add.sprite(x, y, "brazilGoalBlock");
    this.goal.body.setAllowGravity(false);
    this.goal.setImmovable(true);

    this.tweens.add({
      targets: this.goal,
      angle: 8,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  createParticles() { // confetti
    this.emitter = this.add.particles(0, 0, "brazilParticle", {
      x: { min: 0, max: this.scale.width * 2 },
      y: -5,
      lifespan: 2200,
      speedX: { min: -160, max: -5 },
      speedY: { min: 160, max: 320 },
      scale: { start: 1, end: 0.5 },
      quantity: 8,
      rotate: {
        min: 0,
        max: 360
      },

      angularVelocity: {
        min: -300,
        max: 300
      },
      tint: {
        onEmit: () => Phaser.Math.RND.pick([
          0xff4d4d,
          0xffc94d,
          0x4dd2ff,
          0x8aff4d,
          0xff7ad9
        ])
      }
    });

    this.emitter.setFrequency(300);
    this.emitter.setScrollFactor(0);
  }

  createPanel(x, y, width, height, alpha = 0.94) {
    const shadow = this.add.rectangle(x + 3, y + 3, width, height, 0x7f8a78, 0.12);
    const bg = this.add.rectangle(x, y, width, height, this.palette.uiPanel, alpha)
      .setStrokeStyle(3, this.palette.uiBorder, 0.9);
    return this.add.container(0, 0, [shadow, bg]);
  }

  createUi() {
    const width = this.scale.width;
    const midY = this.TOP_UI_HEIGHT / 2;

    this.add.rectangle(width / 2, midY, width, this.TOP_UI_HEIGHT, 0xf5f4ec, 0.98)
      .setScrollFactor(0)
      .setDepth(100);
    this.add.rectangle(width / 2, this.TOP_UI_HEIGHT - 2, width, 4, this.palette.uiAccent, 0.95)
      .setScrollFactor(0)
      .setDepth(101);

    this.levelPanel = this.createPanel(110, midY, 178, 48);
    this.levelPanel.setScrollFactor(0).setDepth(102);
    this.levelText = this.add.text(110, midY, `Level ${this.currentLevel}/4`, {
      fontSize: "24px",
      color: this.palette.uiText,
      fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

    this.ingredientPanel = this.createPanel(width / 2, midY, 340, 50);
    this.ingredientPanel.setScrollFactor(0).setDepth(102);
    this.ingredientText = this.add.text(
      width / 2,
      midY,
      `${this.levelData.ingredient}: missing`,
      {
        fontSize: "22px",
        color: this.palette.uiText,
        fontStyle: "bold",
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(102);

    this.coinPanel = this.createPanel(width - 108, midY, 182, 48);
    this.coinPanel.setScrollFactor(0).setDepth(102);
    this.coinText = this.add.text(width - 108, midY, `Coins: ${this.registry.get("currency") || 0}`, {
      fontSize: "22px",
      color: this.palette.uiText,
      fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

    this.hintText = this.add.text(width / 2, 16, "ESC to return to map", {
      fontSize: "15px",
      color: "#6d4a2e",
      backgroundColor: "#fff5e800",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0.7).setAlpha(0.88).setScrollFactor(0).setDepth(102);
  }

  createAnimations() {
    if (!this.anims.exists("brazilRun")) {
      this.anims.create({
        key: "brazilRun",
        frames: [{ key: "oliveOverjoyed" }],
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("brazilIdle")) {
      this.anims.create({
        key: "brazilIdle",
        frames: [{ key: "oliveOverjoyed" }],
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("brazilJump")) {
      this.anims.create({
        key: "brazilJump",
        frames: [{ key: "oliveOverjoyed" }],
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  applyWeather(weather) {
    const weathers = {
      morning: { color: 0xecdccc, particles: 1, wind: 80, bgColor: 0xf8c3ac, },
      afternoon: { color: 0xffffff, particles: 4, wind: 80, bgColor: 0x0571ff, },
      twilight: { color: 0xccaacc, particles: 9, wind: 80, bgColor: 0x5b4b8a, },
      night: { color: 0x7f8fa6, particles: 1, wind: 80, bgColor: 0x111827, },
    };

    const current = weathers[weather];
    this.bg1.setTint(current.color);
    this.bg2.setTint(current.color);
    this.bg3.setTint(current.color);
    this.bg4.setTint(current.color);
    this.bgColor.fillColor = current.bgColor;
    this.emitter.setQuantity(current.particles);
    this.emitter.updateConfig({
      speedX: { min: -current.wind - 20, max: -current.wind }
    });
    //this.player.setTint(current.color);

    this.platforms.getChildren().forEach((platform) => {
      platform.setTint(current.color);
    });
    this.stars.forEach((star) => {
      star.setVisible(weather === "night");
      star.setFillStyle(0xffffff);
      star.setAlpha(0.8);
    });
  }

  collectIngredient(player, ingredient) {
    if (!ingredient.active) {
      return;
    }

    this.playSfx("item_collection_sfx");
    ingredient.disableBody(true, true);
    this.ingredientCollected = true;
    this.ingredientText.setText(`${this.levelData.ingredient}: collected`);
    //this.showToast("Ingredient collected");
    if (this.ingredientText) {
      this.tweens.add({
        targets: this.ingredientText, scale: 1.08,
        duration: 200, yoyo: true, repeat: 0
      });
    }
  }

  collectCoin(player, coin) {
    if (!coin.active) {
      return;
    }
    this.playSfx("item_collection_sfx");
    coin.disableBody(true, true);
    const current = this.registry.get("currency") || 0;
    this.registry.set("currency", current + 1);
    if (this.coinText) {
      this.coinText.setText(`Coins: ${current + 1}`);
    }
    //this.showToast("Coin collected");
    if (this.coinText) {
      this.tweens.add({
        targets: this.coinText, scale: 1.08,
        duration: 200, yoyo: true, repeat: 0
      });
    }
  }

  tryFinishLevel() {
    if (this.goalReached) {
      return;
    }
    this.playSfx("victory_sfx");
    if (!this.ingredientCollected) {
      this.showToast("Collect the ingredient first");
      return;
    }

    this.goalReached = true;
    this.active = false;

    if (this.currentLevel < BRAZIL_PLATFORM_LEVELS.length) {
      this.cameras.main.fade(800, 0, 0, 0);

      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.restart({ level: this.currentLevel + 1 });
      });
    } else {
      this.showVictory();
    }
  }

  _button(x, y, label, cb, depth = 30) {
    const shadow = this.add.rectangle(x + 3, y + 4, 190, 44, 0x7e4a2c, 0.2).setScrollFactor(0).setDepth(depth - 1);
    const bg = this.add.rectangle(x, y, 190, 44, this.palette.buttonFill)
      .setStrokeStyle(3, this.palette.buttonBorder, 0.95)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0).setDepth(depth);
    const text = this.add.text(x, y, label, {
      fontSize: "24px",
      color: this.palette.buttonText,
      fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1).setInteractive({ useHandCursor: true });

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

    return this.add.container(0, 0, [shadow, bg, text]).setScrollFactor(0).setDepth(depth);
  }

  _overlay() {
    const { width, height } = this.scale;
    const depth = 1000;

    const fade = this.add.rectangle(width / 2, height / 2, width, height, this.palette.overlay, 0.38)
      .setScrollFactor(0).setDepth(depth);
    const panelShadow = this.add.rectangle(width / 2 + 6, height / 2 + 8, 530, 380, 0x5e685d, 0.14)
      .setScrollFactor(0).setDepth(depth + 1);
    const panel = this.add.rectangle(width / 2, height / 2, 530, 380, 0xf6f4eb, 0.98)
      .setStrokeStyle(3, this.palette.uiBorder, 1)
      .setScrollFactor(0).setDepth(depth + 2);
    // const accent = this.add.rectangle(width / 2, height / 2 - 140, 440, 6, this.palette.uiAccent, 0.95)
    //   .setScrollFactor(0).setDepth(depth + 3);

    return { width, height, depth, fade, panelShadow, panel };
  }

  showVictory() {
    const wins = this.registry.get("wins") || {};
    wins.brazil = true;
    this.playSfx("victory_sfx");
    this.registry.set("wins", wins);

    this.active = false;
    this.physics.pause();
    this.input.keyboard.enabled = false;

    const { width, height, depth } = this._overlay();

    this.add.text(width / 2, height / 2 - 108, "Victory!", {
      fontSize: "46px",
      color: this.palette.win,
      fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 4);

    this.add.text(width / 2, height / 2 - 48, "All ingredients collected!", {
      fontSize: "24px",
      color: "#6b3b21",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 4);

    this.add.text(width / 2, height / 2 + 4, "You completed all 4 Brazil levels.", {
      fontSize: "22px",
      color: "#82553a",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 4);

    this._button(width / 2, height / 2 + 78, "Play Again",
      () => this.scene.restart({ level: 1 }), depth + 5);

    this._button(width / 2, height / 2 + 132, "Back to Map",
      () => this.returnToMap(), depth + 5);
  }

  showBanner(title, subtitle) {
    const banner = this.add.container(this.scale.width / 2, 82).setScrollFactor(0);
    const bg = this.add.rectangle(0, 0, 360, 72, 0xfff8ef, 0.95).setStrokeStyle(2, 0x9c6644, 1);
    const titleText = this.add.text(0, -12, title, {
      fontSize: "24px",
      color: "#5c3d2e",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const subtitleText = this.add.text(0, 14, subtitle, {
      fontSize: "16px",
      color: "#7f5539",
    }).setOrigin(0.5);

    banner.add([bg, titleText, subtitleText]);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: 64,
      delay: 1200,
      duration: 300,
      onComplete: () => banner.destroy(),
    });
  }

  showToast(message) {
    if (this.toast) {
      this.toast.destroy();
    }

    this.toast = this.add.text(this.scale.width / 2, 116, message, {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#5c3d2e",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0);

    this.tweens.add({
      targets: this.toast,
      alpha: 0,
      y: 100,
      delay: 700,
      duration: 220,
      onComplete: () => {
        if (this.toast) {
          this.toast.destroy();
          this.toast = null;
        }
      },
    });
  }

  update() {
    if (!this.active) {
      return;
    }

    if (this.cursors.right.isDown) {
      this.player.flipX = false;
      this.player.setVelocityX(240);
    } else if (this.cursors.left.isDown) {
      this.player.flipX = true;
      this.player.setVelocityX(-240);
    } else {
      this.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    if (this.player.y > this.scale.height + 120) {
      this.active = false;
      this.playSfx("hit_sfx");
      this.cameras.main.shake(240, 0.01, false, (camera, progress) => {
        if (progress > 0.9) {
          this.scene.restart({ level: this.currentLevel });
        }
      });
    }
  }
  checkOliveWin() {
    const wins = this.registry.get('wins') || {};
    if (wins.italy && wins.philippines && wins.egypt && wins.mexico && wins.india && wins.brazil) {
      return true;
    }
    return false;
  }
}
