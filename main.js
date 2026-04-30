// ===============================
// START SCENE
// ===============================
class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("homeBg", "assets/background.png");
    this.load.image("startBtn", "assets/start_button.png");
    this.load.image("settingsbutton", "assets/settingsbutton.png");
    this.load.image("philip_token", "assets/bronze_token_otw.png");
    this.load.image("italy_token", "assets/silver_token.png");
    this.load.image("mexico_token", "assets/gold_token_otw.png");
  }

  create() {
    //Sets the background
    const width = this.scale.width;
    const height = this.scale.height;
    const bgcolor = this.add.rectangle(width / 2, height / 2, width, height, 0xa0326);
    const bg = this.add.image(width / 2, height / 2, "homeBg"); // 800 x 600
    const homeScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(homeScale);
    this.textures.get('italy_token').setFilter(Phaser.Textures.LINEAR);
    this.textures.get('philip_token').setFilter(Phaser.Textures.LINEAR);
    this.textures.get('mexico_token').setFilter(Phaser.Textures.LINEAR);
    // Start Button
    const startButton = this.add.image(width / 2, height / 2 + 150, "startBtn").setInteractive().setScale(0.5);
    startButton.on("pointerdown", () => {
      this.scene.start("MapScene");
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
    this.load.image("mapBg", "assets/map.png")
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
      this.registry.set('wins', { mexico: false, italy: false, philippines: false, egypt: false });
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

    const settingsButton = this.add.image(width / 3 * 2.75, 40, "settingsbutton").setOrigin(0.5).setScale(0.07).setInteractive();
    settingsButton.on("pointerdown", () => {
      this.scene.start("Settings");
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

    this.createCountry("Mexico", width * 0.3, height * 0.6,
      "Whack piñatas.\nAvoid spicy chiles!", "MexicoScene", "MexicoStore");
    this.createCountry("Italy", width * 0.55, height * 0.45,
      "Fix pasta pipes.\nServe the perfect plate!", "ItalyScene", "ItalyStore");
    this.createCountry("Philippines", width * 0.8, height * 0.7,
      "Collect lumpia ingredients.\nAvoid traffic!", "PhilippinesScene", "PhilippinesStore");
    this.createCountry("Egypt", width * 0.4, height * 0.8,
      "Run in the desert.\nDodge palm trees and flying falafels!", "EgyptScene", "EgyptStore");
    this.createInfoPanel();
    this.updatePlayerAppearance();
  }

  createCountry(name, x, y, description, sceneName) {
    const landmark = this.add.rectangle(x, y, 50, 50, 0xffcc00);
    this.add.text(x, y - 40, name, {
      fontSize: "18px",
      fill: "#000"
    }).setOrigin(0.5);
    this.countries.push({
      name,
      landmark,
      description,
      sceneName,
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
    const cards = [
      { section: "Country Tokens", label: "Mexico", unlocked: wins.mexico, texture: "mexico_token", tokenWidth: 118, tokenHeight: 118, ribbon: "Collected" },
      { section: "Country Tokens", label: "Italy", unlocked: wins.italy, texture: "italy_token", tokenWidth: 125, tokenHeight: 156.25, ribbon: "Collected" },
      { section: "Country Tokens", label: "Philippines", unlocked: wins.philippines, texture: "philip_token", tokenWidth: 118, tokenHeight: 118, ribbon: "Collected" },
      { section: "Accessories", label: "Fancy Square", unlocked: !!ownedItems.square, shape: "square", ribbon: "Owned" },
      { section: "Accessories", label: "Fancy Triangle", unlocked: !!ownedItems.triangle, shape: "triangle", ribbon: "Owned" }
    ];

    this.scrollContent = this.add.container(scrollArea.x, scrollArea.y);
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(scrollArea.x, scrollArea.y, scrollArea.width, scrollArea.height);
    this.scrollContent.setMask(maskShape.createGeometryMask());

    const contentHeight = this.buildInventoryCards(cards);
    this.maxScrollY = Math.max(0, contentHeight - scrollArea.height);
    this.scrollY = 0;
    this.isDraggingInventory = false;

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
      } else if (cardData.shape === "square") {
        const square = this.add.rectangle(0, -18, 64, 64, 0xff5757)
          .setStrokeStyle(4, 0x8b1e1e);
        card.add(square);
      } else if (cardData.shape === "triangle") {
        const triangle = this.add.triangle(0, -12, -34, 34, 34, 34, 0, -34, 0x9b59b6)
          .setStrokeStyle(4, 0x5d2b7f);
        card.add(triangle);
      }

      const ribbon = this.add.rectangle(0, 78, 120, 30, 0x4d8d57, 1)
        .setStrokeStyle(2, 0x2f6137);
      const ribbonText = this.add.text(0, 78, cardData.ribbon, {
        fontSize: "16px",
        fill: "#fff8e8",
        fontStyle: "bold"
      }).setOrigin(0.5);
      card.add([ribbon, ribbonText]);
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
}

class Settings extends Phaser.Scene {
  constructor() {
    super("Settings");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0xffeaa7);
    this.add.text(width / 2, 60, "Settings", {
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
  render: {
    antialias: true,
    pixelArt: false},
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
    Inventory,
    Settings
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
new Phaser.Game(config);
