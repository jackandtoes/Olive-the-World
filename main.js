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
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a140f).setDepth(-20);

    const warmGlow = this.add.circle(width * 0.8, height * 0.18, 280, 0xffd98a, 0.18)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-18);
    const coolGlow = this.add.circle(width * 0.16, height * 0.85, 240, 0x8fd3ff, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-18);

    const backdrop = this.add.image(width / 2, height / 2 + 12, "homeBg");
    const bgScale = Math.max(width / backdrop.width, height / backdrop.height) * 1.08;
    backdrop.setScale(bgScale);
    backdrop.setAlpha(1);
    backdrop.setDepth(0);

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.18).setDepth(-5);
    this.add.rectangle(width / 2, height / 2, width, height, 0x7a5a2a, 0.08).setDepth(-4);

    this._createSparkles(width, height);

    const buttonShadow = this.add.ellipse(width / 2, height * 0.81 + 18, 320, 62, 0x000000, 0.28)
      .setDepth(7);
    buttonShadow.setAlpha(0);
    buttonShadow.setScale(1);
    const startButton = this.add.image(width / 2, height * 0.81, "startBtn")
      .setInteractive({ useHandCursor: true })
      .setDepth(8);

    const buttonScale = Math.min(0.62, (width * 0.44) / startButton.width);
    startButton.setScale(buttonScale);
    startButton.setAlpha(0);
    startButton.y += 12;

    const startGame = () => this.scene.start("MapScene");
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

// ===============================
// MAP SCENE
// ===============================
class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
  }

  preload() {
    this.load.image("mapBg", "assets/map.png");
    this.load.image("flagPhilippines", "assets/Philippines_flag.png");
    this.load.image("flagMexico", "assets/Mexico_flag.png");
    this.load.image("flagEgypt", "assets/Egypt_flag.png");
    this.load.image("flagItaly", "assets/Italy_flag.png");
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
  }

  create() {
    //Sets the background
    const width = this.scale.width;
    const height = this.scale.height;
    const bg = this.add.image(width / 2, height / 2, "mapBg");
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);
    bg.setScrollFactor(0);
    bg.setDepth(-1);

    //Store Button
    const storeButton = this.add.text(width / 3 * 2, 30, "Store", {
      fontSize: "28px",
      fill: "#000000",
      backgroundColor: "#ffc4e3",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    storeButton.on("pointerdown", () => {
      this.scene.start("Store");
    });

    //Inventory Button
    const inventoryButton = this.add.text(width / 3, 30, "Inventory", {
      fontSize: "28px",
      fill: "#000000",
      backgroundColor: "#ffc4e3",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    inventoryButton.on("pointerdown", () => {
      this.scene.start("Inventory");
    });

    //Adds Player
    this.player = this.add.circle(width / 2, height / 2, 18, 0x556b2f);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.playerHatSquare = this.add.rectangle(width / 2, height / 2 - 25, 20, 20, 0xff0000);
    this.playerHatSquare.setVisible(false);

    this.playerHatTriangle = this.add.graphics();
    this.playerHatTriangle.fillStyle(0x9b59b6, 1);
    this.playerHatTriangle.fillTriangle(-10, 0, 10, 0, 0, -18);
    this.playerHatTriangle.setVisible(false);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.countries = [];

    this.createCountry("Mexico", width * 0.222, height * 0.47,
      "Whack piñatas.\nAvoid spicy chiles!", "MexicoScene", "MexicoStore", "flagMexico");
    this.createCountry("Italy", width * 0.55, height * 0.45,
      "Fix pasta pipes.\nServe the perfect plate!", "ItalyScene", "ItalyStore", "flagItaly");
    this.createCountry("Philippines", width * 0.8, height * 0.7,
      "Collect lumpia ingredients.\nAvoid traffic!", "PhilippinesScene", "PhilippinesStore", "flagPhilippines");
    this.createCountry("Egypt", width * 0.4, height * 0.8,
      "Run in the desert.\nDodge palm trees and flying falafels!", "EgyptScene", "EgyptStore", "flagEgypt");
    this.createInfoPanel();
    this.updatePlayerAppearance();
  }

  createCountry(name, x, y, description, sceneName, storeName, flagKey) {
    const landmark = this.add.image(x, y, flagKey).setScale(0.6);
    this.add.text(x, y - 40, name, {
      fontSize: "18px",
      fill: "#000"
    }).setOrigin(0.5);
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

  createInfoPanel() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.infoPanel = this.add.container(width / 2, height - 130);
    this.infoPanel.setVisible(false);
    const bg = this.add.rectangle(0, 0, 600, 140, 0xffffff)
      .setStrokeStyle(3, 0x000000);
    this.panelTitle = this.add.text(-260, -45, "", {
      fontSize: "22px",
      fill: "#000"
    });
    this.panelText = this.add.text(-260, -10, "", {
      fontSize: "18px",
      fill: "#000"
    });
    const playButton = this.add.text(-240, 35, "Play game!", {
      fontSize: "22px",
      fill: "#007700"
    }).setInteractive();
    playButton.on("pointerdown", () => {
      if (this.currentCountry) {
        this.scene.start(this.currentCountry.sceneName);
      }
    });
    this.infoPanel.add([bg, this.panelTitle, this.panelText, playButton]);
  }

  updatePlayerAppearance() {
    const hat = this.registry.get('equippedItems').hat;
    this.playerHatSquare.setVisible(hat === 'square');
    this.playerHatTriangle.setVisible(hat === 'triangle');
  }

  update() {
    const speed = 200;
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);
    this.playerHatSquare.setPosition(this.player.x, this.player.y - 25);
    this.playerHatTriangle.setPosition(this.player.x, this.player.y - 15);
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

    const equippedItems = this.registry.get('equippedItems');
    const PRICES = { square: 2, triangle: 3 };

    // first item (square hat)
    const itemSquare = this.add.rectangle(width / 3, height / 2, 80, 80, 0xff0000)
      .setStrokeStyle(4, 0x000000)
      .setInteractive();

    this.add.text(width / 3, height / 2 + 70, "Fancy Square", {
      fontSize: "18px",
      fill: "#000"
    }).setOrigin(0.5);
    this.add.text(width / 3, height / 2 - 65, `Coins: ${PRICES.square}`, {
      fontSize: "18px",
      fill: "#b8860b"
    }).setOrigin(0.5);

    const ownedItems = this.registry.get('ownedItems') || {};
    this.squareStatusText = this.add.text(width / 3, height / 2 + 100,
      this._itemLabel(equippedItems, ownedItems, 'square'), {
      fontSize: "16px",
      fill: this._itemColor(equippedItems, ownedItems, 'square')
    }).setOrigin(0.5);

    itemSquare.on("pointerdown", () => this._handlePurchaseOrEquip('square', PRICES.square));


    // second item (triangle hat)
    const itemTriangle = this.add.triangle(width / 3 * 2, height / 2, 0, 80, 80, 80, 40, 0, 0x9b59b6)
      .setStrokeStyle(4, 0x000000)
      .setInteractive(new Phaser.Geom.Triangle(0, 80, 80, 80, 40, 0), Phaser.Geom.Triangle.Contains);

    this.add.text(width / 3 * 2, height / 2 + 70, "Fancy Triangle", {
      fontSize: "18px",
      fill: "#000"
    }).setOrigin(0.5);

    this.add.text(width / 3 * 2, height / 2 - 65, `Coins: ${PRICES.triangle}`, {
      fontSize: "18px", fill: "#b8860b"
    }).setOrigin(0.5);

    this.triangleStatusText = this.add.text(width / 3 * 2, height / 2 + 100,
      this._itemLabel(equippedItems, ownedItems, 'triangle'), {
      fontSize: "16px",
      fill: this._itemColor(equippedItems, ownedItems, 'triangle')
    }).setOrigin(0.5);

    itemTriangle.on("pointerdown", () => this._handlePurchaseOrEquip('triangle', PRICES.triangle));

    this.add.text(width / 2, height - 50, "Press ESC to return to map", {
      fontSize: "20px", fill: "#000"
    }).setOrigin(0.5);
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MapScene"));
  }

  _itemLabel(equipped, owned, key) {
    if (equipped.hat === key) return "EQUIPPED";
    if (owned[key]) return "Click to equip";
    return "Buy";
  }

  _itemColor(equipped, owned, key) {
    if (equipped.hat === key) return "#00aa00";
    if (owned[key]) return "#666666";
    return "#cc0000";
  }

  _handlePurchaseOrEquip(key, price) {
    const equippedItems = this.registry.get('equippedItems');
    const ownedItems = this.registry.get('ownedItems') || {};
    const currency = this.registry.get('currency') || 0;

    if (!ownedItems[key]) {
      if (currency < price) return;
      this.registry.set('currency', currency - price);
      ownedItems[key] = true;
      this.registry.set('ownedItems', ownedItems);
      this.coinText.setText(`Coins: ${this.registry.get('currency')}`);
    }

    equippedItems.hat = key;
    this.registry.set('equippedItems', equippedItems);

    const owned2 = this.registry.get('ownedItems') || {};
    const equipped2 = this.registry.get('equippedItems');
    this.squareStatusText.setText(this._itemLabel(equipped2, owned2, 'square')).setColor(this._itemColor(equipped2, owned2, 'square'));
    this.triangleStatusText.setText(this._itemLabel(equipped2, owned2, 'triangle')).setColor(this._itemColor(equipped2, owned2, 'triangle'));
  }
}

// ===============================
// INVENTORY SCENE 
// ===============================
class Inventory extends Phaser.Scene {
  constructor() {
    super("Inventory");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0xffeaa7);
    this.add.text(width / 2, 60, "Inventory", {
      fontSize: "36px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 50, "Press ESC to return to map", {
      fontSize: "20px",
      fill: "#000"
    }).setOrigin(0.5);

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("MapScene");
    });
  }
}

// ===============================
// GAME CONFIG
// ===============================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [
    StartScene,
    MapScene,
    MexicoScene,
    ItalyScene,
    PhilippinesScene,
    EgyptScene,
    Store,
    Inventory
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
new Phaser.Game(config);
