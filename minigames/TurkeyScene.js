class TurkeyScene extends Phaser.Scene {
    constructor() {
        super("TurkeyScene");
    }

    preload() {
        this.load.image('chile', 'assets/mexico/mexico_minigame_chile.png');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        this.score = 0;
        this.gameOver = false;
        this.spawnTimer = null;

        this.physics.world.gravity.y = 300;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf7d6b4);
        this.physics.world.setBounds(0, 0, width, height);

        this.add.text(width / 2, 34, "Turkey Skewer", {
            fontSize: "28px",
            fontStyle: "bold",
            fill: "#4a2a18"
        }).setOrigin(0.5);

        this.add.text(width / 2, height - 24, "Arrow keys to move, ESC to return to map", {
            fontSize: "18px",
            fill: "#4a2a18"
        }).setOrigin(0.5);

        this.scoreText = this.add.text(20, 20, "Score: 0", {
            fontSize: "24px",
            fill: "#4a2a18"
        });

        // Add Skewer
        this.skewer = this.add.rectangle(width / 2, height - 100, 20, 200, 0x8b4513);
        this.physics.add.existing(this.skewer);
        this.skewer.body.setAllowGravity(false);
        this.skewer.body.setCollideWorldBounds(true);
        this.skewer.body.setSize(20, 200, true);

        this.fallingFoods = this.physics.add.group();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-ESC", () => this.scene.start("MapScene"));

        // Adds Timer
        this.time.addEvent({
            delay: 1200,
            callback: this.spawnRandomIngredient,
            callbackScope: this,
            loop: true
        });

        // Collision Detection
        this.physics.add.overlap(this.skewer, this.fallingFoods, (skewer, ingredient) => {
            if (ingredient.texture.key === 'chile') {
                ingredient.destroy();
                this.score += 10;
                this.scoreText.setText("Score: " + this.score);
            }
        });
    }

    update() {
        if (this.cursors.left.isDown) {
            this.skewer.body.setVelocityX(-300);
        }
        else if (this.cursors.right.isDown) {
            this.skewer.body.setVelocityX(300);
        }
        else {
            this.skewer.body.setVelocityX(0);
        }
    }

    spawnRandomIngredient() {
        const ingredient = this.physics.add.image(
            Phaser.Math.Between(50, this.scale.width - 50),
            -50,
            'chile'
        );
        ingredient.setVelocityY(120);
        ingredient.setCollideWorldBounds(false);
        this.fallingFoods.add(ingredient);
    }


}
