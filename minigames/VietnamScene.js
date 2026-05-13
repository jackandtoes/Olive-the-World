class VietnamScene extends Phaser.Scene {
    constructor() {
        super("VietnamScene");
    }

    preload() {
        this.load.image('chile', 'assets/mexico/mexico_minigame_chile.png');
    }

     create() {
        this.score = 0;
        this.physics.world.gravity.y = 600;

        // create background
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xf7d6b4).setDepth(0);

        // add player basket
        this.basket = this.physics.add.image(this.scale.width / 2, 630, 'chile');
        this.basket.body.setAllowGravity(false).setCollideWorldBounds(true);

        // input
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-ESC", () => {this.scene.start("MapScene");});
        
        // time event to spawn candy
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: this.spawnRandomIngredient,
            callbackScope: this,
        });

        // this.physics.add.overlap(this.basket, this.ingredient, (basket, ingredient) => {
        //     ingredient.destroy();
        //     this.score += 10;
        // });
    }

    update() {
        if (this.cursorKeys.left.isDown) {
            this.basket.setVelocityX(-350);
        } else if (this.cursorKeys.right.isDown) {
            this.basket.setVelocityX(350);
        } else {
            this.basket.setVelocityX(0);
        }
    }

    spawnRandomIngredient() {
        const ingredient = this.physics.add.image(
            Phaser.Math.Between(50, this.scale.width - 50), -20,
            'chile'
        );
    }

    basketCollision(basket, ingredient) {
        ingredient.disableBody(true, true);
        if (this.gameIsOver) {
            return;
        }
        this.score += 10;
        this.scoreText.setText(this.score.toString(10));
        console.log(this.score);
        };

}
