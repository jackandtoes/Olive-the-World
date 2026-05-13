class VietnamScene extends Phaser.Scene {
    constructor() {
        super("VietnamScene");
    }

    preload() {
        this.load.image('chile', 'assets/mexico/mexico_minigame_chile.png');
        this.load.spritesheet('biryani', 'assets/biryaniIngredients.png', {
            frameWidth: 450,
            frameHeight: 280
        });
    }

     create() {
        this.score = 0;
        this.physics.world.gravity.y = 500;

        // create background
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xf7d6b4).setDepth(0);

        // add player basket
        this.basket = this.physics.add.image(this.scale.width / 2, 630, 'chile');
        this.basket.body.setAllowGravity(false).setCollideWorldBounds(true);

        // input
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-ESC", () => {this.scene.start("MapScene");});
        
        // Create Ingredient group
        this.ingredientGroup = this.physics.add.group();

        // time event to spawn candy
        this.timedEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: this.spawnRandomIngredient,
            callbackScope: this,
        });

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

    }

    update() {
        // Update timer
        this.timerText.setText(Math.max(0, Math.ceil(this.timedEvent.getRemainingSeconds())).toString(10));

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
            -20,
            'biryani',
            frameIndex
        );

        ingredient.setScale(0.2);
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
    }

}
