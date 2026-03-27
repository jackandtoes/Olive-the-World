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
  }

  create() {
    //Sets the background
    const width = this.scale.width;
    const height = this.scale.height;
    const bgcolor = this.add.rectangle(width/2, height/2, width, height, 0xa0326);
    const bg = this.add.image(width/2, height/2, "homeBg"); // 800 x 600
    const homeScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(homeScale);

    // Start Button
    const startButton = this.add.image(width/2, height/2 + 150, "startBtn").setInteractive().setScale(0.5);
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

  init(data) {
    if (!this.registry.has('equippedItems')) {
      this.registry.set('equippedItems', {
        hat: null
      });
    }
  }

  preload() {
     this.load.image("mapBg", "assets/worldMap.jpg");
  }
  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const bg = this.add.image(width/2, height/2, "mapBg");
    const mapScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(mapScale);
    
    const storeButton = this.add.text(width/2, 30, "Store", {
      fontSize: "28px",
      fill: "#000000",
      backgroundColor: "#ffc4e3",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    storeButton.on("pointerdown", () => {
      this.scene.start("Store");
    });

    this.player = this.add.circle(width/2, height/2, 18, 0x556b2f);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    
    this.playerHat = this.add.rectangle(width/2, height/2 -25, 20, 20, 0xff0000);
    this.playerHat.setVisible(false);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.countries = [];

    this.createCountry("Mexico", width * 0.3, height * 0.6,
      "Whack piñatas.\nAvoid spicy chiles!", "MexicoScene", "MexicoStore");
    this.createCountry("Italy", width * 0.55, height * 0.45,
      "Fix pasta pipes.\nServe the perfect plate!", "ItalyScene", "ItalyStore");
    this.createCountry("Philippines", width * 0.8, height * 0.7,
      "Collect lumpia ingredients.\nAvoid traffic!", "PhilippinesScene", "PhilippinesStore");
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
    this.infoPanel = this.add.container(width/2, height - 130);
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
  const equippedItems = this.registry.get('equippedItems');
  this.playerHat.setVisible(equippedItems.hat !== null);
}

  update() {
    const speed = 200;
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);
    this.playerHat.setPosition(this.player.x, this.player.y - 25);
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
    this.add.rectangle(width/2, height/2, width, height, 0xffeaa7);
    this.add.text(width/2, 60, "Welcome to the store!", {
      fontSize: "36px",
      fill: "#000"
    }).setOrigin(0.5);

      const itemSquare = this.add.rectangle(width/2, height/2, 80, 80, 0xff0000)
      .setStrokeStyle(4, 0x000000)
      .setInteractive();
    
    this.add.text(width/2, height/2 + 70, "Fancy Hat", {
      fontSize: "18px",
      fill: "#000"
    }).setOrigin(0.5);
    
    const equippedItems = this.registry.get('equippedItems');
    const isEquipped = equippedItems.hat === 'square';
    
    this.statusText = this.add.text(width/2, height/2 + 100, 
      isEquipped ? "EQUIPPED" : "Click to equip", {
      fontSize: "16px",
      fill: isEquipped ? "#00aa00" : "#666666"
    }).setOrigin(0.5);
    
    itemSquare.on("pointerdown", () => {
      const equippedItems = this.registry.get('equippedItems');
      equippedItems.hat = 'square';
      this.registry.set('equippedItems', equippedItems);
      
      this.statusText.setText("EQUIPPED");
      this.statusText.setColor("#00aa00");
    });
    
    this.add.text(width/2, height - 50, "Press ESC to return to map", {
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
    Store
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
new Phaser.Game(config);