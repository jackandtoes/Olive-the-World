class VietnamScene extends Phaser.Scene {
    constructor() {
        super("VietnamScene");
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
        this.chiles = [];
        this.stackedFoods = [];
        this.gravity = 300;
        this.fallSpeed = 120;
        this.breadSpeed = 300;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf7d6b4);

        this.add.text(width / 2, 34, "Bahn Mi", {
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
        this.bottomBread = this.add.rectangle(width / 2, height - 20, 200, 20, 0x8b4513);
        this.bottomBread.setDepth(2);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-ESC", () => this.scene.start("MapScene"));

        // Spawn timer
        this.time.addEvent({
            delay: 1200,
            callback: this.spawnRandomIngredient,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        const dt = delta / 1000;

        if (this.cursors.left.isDown) {
            this.bottomBread.x -= this.breadSpeed * dt;
        } else if (this.cursors.right.isDown) {
            this.bottomBread.x += this.breadSpeed * dt;
        }

        this.bottomBread.x = Phaser.Math.Clamp(this.bottomBread.x, 100, this.scale.width - 100);

        this._updateFallingChiles(dt);
        this._refreshStackPositions();
    }

    spawnRandomIngredient() {
        const ingredient = this.add.image(
            Phaser.Math.Between(50, this.scale.width - 50),
            -50,
            'chile'
        );
        ingredient.setDepth(3);
        ingredient.vy = this.fallSpeed;
        ingredient.isStacked = false;
        ingredient.support = null;
        this.chiles.push(ingredient);
    }

    _updateFallingChiles(dt) {
        for (let i = this.chiles.length - 1; i >= 0; i--) {
            const ingredient = this.chiles[i];

            if (!ingredient || ingredient.isStacked) {
                continue;
            }

            ingredient.prevX = ingredient.x;
            ingredient.prevY = ingredient.y;
            ingredient.vy += this.gravity * dt;
            ingredient.y += ingredient.vy * dt;

            const support = this._findLandingSupport(ingredient);
            if (support) {
                this._stackIngredient(support, ingredient);
                continue;
            }

            if (ingredient.y > this.scale.height + 80) {
                ingredient.destroy();
                this.chiles.splice(i, 1);
            }
        }
    }

    _findLandingSupport(ingredient) {
        if (this._crossedSupport(ingredient, this.bottomBread)) {
            return this.bottomBread;
        }

        for (let i = this.stackedFoods.length - 1; i >= 0; i--) {
            const support = this.stackedFoods[i];
            if (this._crossedSupport(ingredient, support)) {
                return support;
            }
        }

        return null;
    }

    _crossedSupport(ingredient, support) {
        const ingredientHalfWidth = (ingredient.displayWidth || ingredient.width) / 2;
        const ingredientHalfHeight = (ingredient.displayHeight || ingredient.height) / 2;
        const supportHalfWidth = (support.displayWidth || support.width) / 2;
        const supportHalfHeight = (support.displayHeight || support.height) / 2;

        const ingredientLeft = ingredient.x - ingredientHalfWidth;
        const ingredientRight = ingredient.x + ingredientHalfWidth;
        const supportLeft = support.x - supportHalfWidth;
        const supportRight = support.x + supportHalfWidth;
        const supportTop = support.y - supportHalfHeight;
        const prevBottom = ingredient.prevY + ingredientHalfHeight;
        const currentBottom = ingredient.y + ingredientHalfHeight;

        const horizontalOverlap =
            ingredientRight >= supportLeft &&
            ingredientLeft <= supportRight;
        const crossedSurface =
            prevBottom <= supportTop &&
            currentBottom >= supportTop;

        return horizontalOverlap && crossedSurface;
    }

    _stackIngredient(support, ingredient) {
        if (!ingredient || ingredient.isStacked || ingredient.texture.key !== 'chile') {
            return;
        }

        const supportHeight = support.displayHeight ?? support.height ?? 20;
        const ingredientHeight = ingredient.displayHeight ?? ingredient.height ?? 20;

        ingredient.isStacked = true;
        ingredient.support = support;
        ingredient.followDrag = Math.min(0.32, 0.16 + this.stackedFoods.length * 0.03);
        ingredient.vy = 0;
        ingredient.y = support.y - (supportHeight / 2) - (ingredientHeight / 2);
        ingredient.x = support.x;
        ingredient.setDepth(3 + this.stackedFoods.length);

        this.stackedFoods.push(ingredient);

        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
    }

    _refreshStackPositions() {
        for (const ingredient of this.stackedFoods) {
            if (!ingredient || !ingredient.support) {
                continue;
            }

            const support = ingredient.support;
            const supportHeight = support.displayHeight ?? support.height ?? 20;
            const ingredientHeight = ingredient.displayHeight ?? ingredient.height ?? 20;
            const targetX = support.x;
            const drag = ingredient.followDrag ?? 0.2;

            ingredient.x = Phaser.Math.Linear(ingredient.x, targetX, drag);
            ingredient.y = support.y - (supportHeight / 2) - (ingredientHeight / 2);
        }
    }
}
