const BRAZIL_PLATFORM_LEVELS = [
  {
    heights: [4, 7, 5, null, 5, 4, null, 4, 4], // larger number = lower platform, null = no platform
    weather: "afternoon",
    ingredient: "Beans",
  },
  {
    heights: [5, 4, null, 4, 6, 4, 6, 5, 6],
    weather: "twilight",
    ingredient: "Rice",
  },
  {
    heights: [6, null, 6, 4, 6, 4, 5, null, 4],
    weather: "night",
    ingredient: "Sausage",
  },
  {
    heights: [4, null, 3, 6, null, 6, null, 5, 4],
    weather: "morning",
    ingredient: "Greens",
  },
];

class BrazilScene extends Phaser.Scene {
  constructor() {
    super("BrazilScene");
    this.sceneWidth = 220 * 9;
  }

  init(data) {
    this.currentLevel = data?.level || 1;
    this.levelData = BRAZIL_PLATFORM_LEVELS[this.currentLevel - 1];
    this.active = true;
    this.goalReached = false;
  }

  preload() {
    this.load.image("oliveOverjoyed", "assets/olive_overjoyed.PNG");
  }

  create() {
    this.physics.world.gravity.y = 800;
    this.physics.world.setBounds(0, 0, this.sceneWidth, 760);

    this.createTextures();
    this.createStars();
    this.createParallaxBackgrounds();
    this.createPlatforms();
    this.createPlayer();
    this.createIngredient();
    this.createGoal();
    this.createParticles();
    this.createUi();
    this.createAnimations();
    this.applyWeather(this.levelData.weather);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MapScene");
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.goal, this.platforms);
    this.physics.add.overlap(this.player, this.ingredient, this.collectIngredient, null, this);
    this.physics.add.overlap(this.player, this.goal, this.tryFinishLevel, null, this);

    this.cameras.main.setBounds(0, 0, this.sceneWidth, 600);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);

    this.showBanner(`Level ${this.currentLevel}`, `Collect ${this.levelData.ingredient} and reach the goal.`);
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

    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillCircle(6, 6, 6);
    graphics.generateTexture("brazilParticle", 12, 12);
    graphics.clear();

    graphics.fillStyle(0x7fb3d5, 1);
    graphics.fillRect(0, 0, 1400, 600);
    graphics.fillStyle(0x9ad1d4, 1);
    graphics.fillEllipse(240, 440, 420, 220);
    graphics.fillEllipse(820, 400, 500, 210);
    graphics.fillEllipse(1180, 445, 360, 180);
    graphics.generateTexture("brazilBgFar", 1400, 600);
    graphics.clear();

    graphics.fillStyle(0x6d9dc5, 1);
    graphics.fillRect(0, 0, 1700, 600);
    for (let i = 0; i < 14; i++) {
      graphics.fillStyle(i % 2 === 0 ? 0x4d7ea8 : 0x7f5539, 1);
      graphics.fillRect(i * 120, 260 - (i % 3) * 25, 90, 300);
      graphics.fillStyle(0xfefae0, 0.55);
      graphics.fillRect(i * 120 + 16, 320, 14, 18);
      graphics.fillRect(i * 120 + 42, 350, 14, 18);
      graphics.fillRect(i * 120 + 60, 390, 14, 18);
    }
    graphics.generateTexture("brazilBgMid", 1700, 600);
    graphics.clear();

    graphics.fillStyle(0xcdb4db, 1);
    graphics.fillRect(0, 0, 2000, 600);
    for (let i = 0; i < 18; i++) {
      graphics.fillStyle(i % 2 === 0 ? 0xffafcc : 0xbde0fe, 1);
      graphics.fillRect(i * 112, 430, 88, 120);
      graphics.fillStyle(0xffffff, 0.85);
      graphics.fillRect(i * 112 + 18, 450, 12, 12);
      graphics.fillRect(i * 112 + 42, 470, 12, 12);
      graphics.fillRect(i * 112 + 56, 492, 12, 12);
    }
    graphics.fillStyle(0x5b4b49, 1);
    graphics.fillRect(0, 552, 2000, 48);
    graphics.generateTexture("brazilBgNear", 2000, 600);

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
      star.setVisible(false);
      this.stars.push(star);
    }
  }

  createParallaxBackgrounds() {
    this.bgColor = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0571ff)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.bg1 = this.add.image(0, 0, "brazilBgFar").setOrigin(0, 0);
    this.bg2 = this.add.image(0, 0, "brazilBgMid").setOrigin(0, 0);
    this.bg3 = this.add.image(0, 0, "brazilBgNear").setOrigin(0, 0);

    this.bg1.setScrollFactor(0.2);
    this.bg2.setScrollFactor(0.5);
    this.bg3.setScrollFactor(1);
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    for (const [xIndex, yIndex] of this.levelData.heights.entries()) {
      if (typeof yIndex !== "number") {
        continue;
      }

      const x = 220 * xIndex + 110;
      const y = yIndex * 70;
      const platform = this.platforms.create(x, y, "brazilPlatformBlock");
      platform.refreshBody();
    }
  }

  createPlayer() {
    this.player = this.physics.add.sprite(125, 110, "oliveOverjoyed");
    const sourceImage = this.player.texture.getSourceImage();
    const scale = 52 / sourceImage.height;
    this.player.setScale(scale);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(sourceImage.width * 0.56, sourceImage.height * 0.82);
    this.player.body.setOffset(sourceImage.width * 0.22, sourceImage.height * 0.12);
  }

  createIngredient() {
    const ingredientIndex = Math.max(1, this.levelData.heights.lastIndexOf(Math.max(...this.levelData.heights.filter(Number.isFinite))) - 1);
    const ingredientHeight = this.levelData.heights[ingredientIndex] ?? 4;
    const x = 220 * ingredientIndex + 110;
    const y = ingredientHeight * 70 - 55;

    this.ingredient = this.physics.add.sprite(x, y, "brazilIngredientBlock");
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

  createParticles() {
    this.emitter = this.add.particles(0, 0, "brazilParticle", {
      x: { min: 0, max: this.scale.width * 2 },
      y: -5,
      lifespan: 2200,
      speedX: { min: -160, max: -5 },
      speedY: { min: 160, max: 320 },
      scale: { start: 0.5, end: 0 },
      quantity: 8,
      blendMode: "ADD"
    });

    this.emitter.setScrollFactor(0);
  }

  createUi() {
    this.add.rectangle(this.scale.width / 2, 24, this.scale.width - 24, 42, 0xfff8ef, 0.92)
      .setStrokeStyle(2, 0x9c6644, 1)
      .setScrollFactor(0);

    this.levelText = this.add.text(18, 12, `Level ${this.currentLevel}/4`, {
      fontSize: "20px",
      color: "#5c3d2e",
      fontStyle: "bold",
    }).setScrollFactor(0);

    this.ingredientText = this.add.text(this.scale.width / 2, 12, `${this.levelData.ingredient}: missing`, {
      fontSize: "20px",
      color: "#5c3d2e",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.quitText = this.add.text(this.scale.width - 14, 12, "ESC to map", {
      fontSize: "16px",
      color: "#7f5539",
    }).setOrigin(1, 0).setScrollFactor(0);
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
      morning: {
        color: 0xecdccc,
        particles: 2,
        wind: 20,
        bgColor: 0xf8c3ac,
      },
      afternoon: {
        color: 0xffffff,
        particles: 4,
        wind: 80,
        bgColor: 0x0571ff,
      },
      twilight: {
        color: 0xccaacc,
        particles: 9,
        wind: 180,
        bgColor: 0x5b4b8a,
      },
      night: {
        color: 0x7f8fa6,
        particles: 1,
        wind: 10,
        bgColor: 0x111827,
      },
    };

    const current = weathers[weather];
    this.bg1.setTint(current.color);
    this.bg2.setTint(current.color);
    this.bg3.setTint(current.color);
    this.bgColor.fillColor = current.bgColor;
    this.emitter.setQuantity(current.particles);
    this.emitter.setConfig({
      speedX: { min: -current.wind, max: -current.wind - 20 }
    }); this.player.setTint(current.color);

    this.platforms.getChildren().forEach((platform) => {
      platform.setTint(current.color);
    });

    this.stars.forEach((star) => {
      star.setVisible(weather === "night");
    });
  }

  collectIngredient(player, ingredient) {
    if (!ingredient.active) {
      return;
    }

    ingredient.disableBody(true, true);
    this.ingredientCollected = true;
    this.ingredientText.setText(`${this.levelData.ingredient}: collected`);
    this.showToast("Ingredient collected");
  }

  tryFinishLevel() {
    if (this.goalReached) {
      return;
    }

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

showVictory() {
  const wins = this.registry.get("wins") || {};
  wins.brazil = true;
  this.registry.set("wins", wins);

  this.physics.pause();
  this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 420, 260, 0x000000, 0.8)
    .setScrollFactor(0);
  this.add.text(this.scale.width / 2, this.scale.height / 2 - 56, "You Win!", {
    fontSize: "42px",
    color: "#ffffff",
    fontStyle: "bold",
  }).setOrigin(0.5).setScrollFactor(0);
  this.add.text(this.scale.width / 2, this.scale.height / 2 - 6, "All platform levels cleared.", {
    fontSize: "22px",
    color: "#ffffff",
  }).setOrigin(0.5).setScrollFactor(0);

  const backButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 54, "Return to Map", {
    fontSize: "24px",
    color: "#00ff99",
    backgroundColor: "#2d1e2f",
    padding: { x: 12, y: 8 },
  }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

  backButton.on("pointerdown", () => {
    this.scene.start("MapScene");
  });
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
    this.player.anims.play("brazilRun", true);
  } else if (this.cursors.left.isDown) {
    this.player.flipX = true;
    this.player.setVelocityX(-240);
    this.player.anims.play("brazilRun", true);
  } else {
    this.player.setVelocityX(0);
    this.player.anims.play("brazilIdle", true);
  }

  if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.touching.down) {
    this.player.anims.play("brazilJump", true);
    this.player.setVelocityY(-500);
  }

  if (!this.player.body.touching.down) {
    this.player.anims.play("brazilJump", true);
  }

  if (this.player.y > this.bg3.height) {
    this.active = false;
    this.cameras.main.shake(240, 0.01, false, (camera, progress) => {
      if (progress > 0.9) {
        this.scene.restart({ level: this.currentLevel });
      }
    });
  }
}
}
