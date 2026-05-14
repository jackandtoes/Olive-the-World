const VIETNAM_LEVELS = {
  1: { targetScore: 50, spawnDelay: 1000, timeLimit: 10 },
  2: { targetScore: 70, spawnDelay: 850, timeLimit: 25 },
  3: { targetScore: 90, spawnDelay: 700, timeLimit: 20 }
};

class VietnamScene extends Phaser.Scene {
    constructor() {
        super("VietnamScene");
    }

    init(data) {
        this.currentLevel = data?.level || 1;
        this.maxLevel = data?.maxLevel || 3;
    }


    preload() {
        this.load.image('chile', 'assets/mexico/mexico_minigame_chile.png');
        this.load.spritesheet('biryani', 'assets/india/biryaniIngredients.png', {
            frameWidth: 200,
            frameHeight: 200
        });
    }

     create() {
        this.gameIsOver = false;
        this.levelComplete = false;
        
        this.score = 0;
        this.physics.world.gravity.y = 350;

        // create background
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xf7d6b4).setDepth(0);

        // add player basket
        this.basket = this.physics.add.image(this.scale.width / 2, 550, 'chile');
        this.basket.body.setAllowGravity(false).setCollideWorldBounds(true);

        // input
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-ESC", () => {this.scene.start("MapScene");});
        
        // Create Ingredient group
        this.ingredientGroup = this.physics.add.group();

        // // time event to spawn candy
        // this.timedEvent = this.time.addEvent({
        //     delay: 1000,
        //     loop: true,
        //     callback: this.spawnRandomIngredient,
        //     callbackScope: this,
        // });

        // collision detection
        this.physics.add.overlap(this.basket, this.ingredientGroup, this.handleBasketIngredientCollision, null, this);

         // Score and timer display
        const scorePrefix = this.add.text(10, 10, 'Score: ', {
            fontSize: '40px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        });
        this.scoreText = this.add.text(scorePrefix.x + scorePrefix.width, 10, '0', {
            fontSize: '40px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        });
        this.timerText = this.add.text(this.scale.width - 80, 10, '30', {
            fontSize: '60px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        });

        // Initialize level parameters
        const level = VIETNAM_LEVELS[this.currentLevel];
        this.score = 0;
        this.levelComplete = false;

        this.timedEvent = this.time.addEvent({
            delay: level.spawnDelay,
            loop: true,
            callback: this.spawnRandomIngredient,
            callbackScope: this
        });

        this.levelTimer = this.time.delayedCall(level.timeLimit * 1000, () => {
            this.endLevel(false);
        });

    }

    update() {
        // Update timer
        if (this.levelTimer) {
            this.timerText.setText(Math.max(0, Math.ceil(this.levelTimer.getRemainingSeconds())).toString(10));
        }

        // Updates basket movement
        if (this.cursorKeys.left.isDown) {
            this.basket.setVelocityX(-350);
        } else if (this.cursorKeys.right.isDown) {
            this.basket.setVelocityX(350);
        } else {
            this.basket.setVelocityX(0);
        }

        this.ingredientGroup.getChildren().forEach((child) => {
            if (!child.active) {
                return;
            }
            if (child.y > this.scale.height + 10) {
                child.disableBody(true, true);
            }
        });
    }

    spawnRandomIngredient() {
        const frameIndex = Phaser.Math.Between(0, 7);

        const ingredient = this.ingredientGroup.create(
            Phaser.Math.Between(50, this.scale.width - 50),
            -40,
            'biryani',
            frameIndex
        );

        ingredient.setScale(0.7);
        ingredient.body.setAllowGravity(true);
        ingredient.setVelocityY(0);
        ingredient.setVelocityX(0);
        ingredient.setImmovable(false);
    }

    handleBasketIngredientCollision(basket, ingredient) {
        ingredient.disableBody(true, true);
        if (this.gameIsOver) {
            return;
        }
        this.score += 10;
        this.scoreText.setText(this.score.toString(10));
        console.log(this.score);
        this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.score >= VIETNAM_LEVELS[this.currentLevel].targetScore) {
            this.endLevel(true);
        }
    }

    endLevel(success = false) {
        this.gameIsOver = true;
        if (this.timedEvent) {
            this.timedEvent.remove(false);
            this.timedEvent = null;
        }
        this.ingredientGroup.clear(true, true);

        if (success) {
            if (this.currentLevel >= this.maxLevel) {
            this.showVictory();
            } else {
            this.showLevelComplete();
            }
        } else {
            this.showGameOver();
        }
    }


    levelComplete() {
        this.gameIsOver = true;
        if (this.timedEvent) {
            this.timedEvent.remove(false);
            this.timedEvent = null;
        }
        this.ingredientGroup.clear(true, true);

        
        if (this.currentLevel >= this.maxLevel) {
            this.showVictory();
        } 
        else {
            this.showLevelComplete();
        }
    }

   showLevelComplete() {
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.35
        );

        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            480,
            260,
            0xfff8ef,
            0.98
        ).setStrokeStyle(3, 0x8d6237);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 70, "Level Complete", {
            fontSize: "44px",
            color: "#2f9e44",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 10, "Great job!", {
            fontSize: "24px",
            color: "#5a341d"
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "Next level loading...", {
            fontSize: "22px",
            color: "#5a341d"
        }).setOrigin(0.5);

        this.time.delayedCall(1200, () => {
            this.scene.restart({ level: this.currentLevel + 1, maxLevel: this.maxLevel });
        });
    }

    showVictory() {
        const victoryText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'You Win!', {
            fontSize: '60px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.time.delayedCall(3000, () => {
            victoryText.destroy();
            this.scene.start("MapScene");
        });
    }

    showGameOver() {
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.35
        );

        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            480,
            260,
            0xfff8ef,
            0.98
        ).setStrokeStyle(3, 0x8d6237);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 70, "Game Over", {
            fontSize: "44px",
            color: "#ff0000",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 10, "Restart", {
            fontSize: "24px",
            color: "#5a341d"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.scene.restart({ level: this.currentLevel, maxLevel: this.maxLevel });
        });

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "Return to Map", {
            fontSize: "22px",
            color: "#5a341d"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.scene.start("MapScene");
        });
    }  

}
