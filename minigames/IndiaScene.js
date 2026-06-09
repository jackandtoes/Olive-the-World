class IndiaCutscene extends Phaser.Scene {
    constructor() {
        super("IndiaCutscene");
    }

    preload() {
        this.load.image("oliveMumbai", "assets/india/cutscene/olive_in_mumbai.png");
        this.load.image("oliveIndianRest", "assets/india/cutscene/olive_at_indianrest.png");
        this.load.image("oliveSamosaChef", "assets/india/cutscene/olive_samosa_chef.png");
        this.load.audio("india_music", "assets/india/cutscene/india_music.mp3");
    }

    create() {

        const width = this.scale.width;
        const height = this.scale.height;
        const seenCutscenes = this.registry.get("seenCutscenes") || {};
        seenCutscenes.india = true;
        this.registry.set("seenCutscenes", seenCutscenes);
        this.slides = ["oliveMumbai", "oliveIndianRest", "oliveSamosaChef"];
        this.dialogueLines = [
            "Wow, Mumbai is so busy!\n I wonder what I can find here?",
            "This place is amazing! The food looks so good.",
            "Welcome to India!\nNow that you've seen the sights, let's get cooking!"
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
        this.startIndiaMusic();

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

    startIndiaMusic() {
        let indiaMusic = this.sound.get("india_music");
        if (!indiaMusic) {
            indiaMusic = this.sound.add("india_music", { volume: 0.55, loop: true });
        }
        if (!indiaMusic.isPlaying) {
            indiaMusic.play();
        }
    }

    stopIndiaMusic() {
        this.sound.stopByKey("india_music");
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
                this.scene.start("IndiaScene");
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

const INDIA_LEVELS = {
  1: { targetScore: 50, spawnDelay: 1000, timeLimit: 10, ingredientKey: "biryaniIngredients", frames: [0, 1, 2, 3, 4, 5, 6, 7] },
  2: { targetScore: 70, spawnDelay: 850, timeLimit: 25, ingredientKey: "palakPaneerIngredients", frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  3: { targetScore: 90, spawnDelay: 700, timeLimit: 20, ingredientKey: "samosasIngredients", frames: [0, 1, 2, 3, 4, 5, 6] },
};


class IndiaScene extends Phaser.Scene {
    constructor() {
        super("IndiaScene");
    }

    init(data) {
        this.currentLevel = data?.level || 1;
        this.maxLevel = data?.maxLevel || 3;
        this.palette = {
            uiBorder: 0x9fad95,
            overlay: 0x222620,
            win: "#2f9e44",
            lose: "#d94841",
            buttonFill: 0xf1efe4,
            buttonBorder: 0x97a38b,
            buttonText: "#5a5143",
            buttonHover: 0xe3eadb,
        };
    }

    preload() {
        this.load.audio("india_music", "assets/india/cutscene/india_music.mp3");
        this.load.image('pot', 'assets/india/clayPot.png');

        this.load.spritesheet('biryaniIngredients', 'assets/india/biryaniIngredients.png', {
            frameWidth: 200,
            frameHeight: 200
        });

        this.load.spritesheet('palakPaneerIngredients', 'assets/india/palakPaneerIngredients.png', {
            frameWidth: 200,
            frameHeight: 200
        });

        this.load.spritesheet('samosasIngredients', 'assets/india/samosasIngredients.png', {
            frameWidth: 200,
            frameHeight: 200
        });
        this.load.audio("item_collection_sfx", "assets/sfx/item_collection_sfx.mp3");
        this.load.audio("victory_sfx", "assets/sfx/victory_sfx.mp3");
        this.load.audio("lose_sfx", "assets/sfx/lose_sfx.mp3");
    }

    create() {
        this.startIndiaMusic();
        this.gameIsOver = false;
        this.levelComplete = false;
        this.input.keyboard.enabled = true;

        this.score = 0;
        this.physics.world.gravity.y = 350;

        // create background
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xf7d6b4).setDepth(0);

        // add player basket
        this.basket = this.physics.add.image(this.scale.width / 2, 550, 'pot');
        this.basket.setScale(0.15);
        this.basket.body.setAllowGravity(false).setCollideWorldBounds(true);

        // input
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-ESC", () => this.returnToMap());
        
        // Create Ingredient group
        this.ingredientGroup = this.physics.add.group();

        // collision detection
        this.physics.add.overlap(this.basket, this.ingredientGroup, this.handleBasketIngredientCollision, null, this);

        // Score and timer display
        const scorePrefix = this.add.text(10, 10, 'Score: ', {
            fontSize: '40px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setDepth(20);
        this.scoreText = this.add.text(scorePrefix.x + scorePrefix.width, 10, '0', {
            fontSize: '40px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setDepth(20);
        this.timerText = this.add.text(this.scale.width - 80, 10, '30', {
            fontSize: '60px',
            color: '#043D8C',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setDepth(20);

        // Initialize level parameters
        const level = INDIA_LEVELS[this.currentLevel];
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

    startIndiaMusic() {
        let indiaMusic = this.sound.get("india_music");
        if (!indiaMusic) {
            indiaMusic = this.sound.add("india_music", { volume: 0.55, loop: true });
        }
        if (!indiaMusic.isPlaying) {
            indiaMusic.play();
        }
    }

    stopIndiaMusic() {
        this.sound.stopByKey("india_music");
    }

    returnToMap() {
        this.stopIndiaMusic();
        if(!this.checkOliveWin()){
	    this.scene.start("MapScene");
        }
        else {
        this.scene.start("OliveWinScene");
        }
    }

    update() {
        // Update timer
        if (this.levelTimer) {
            this.timerText.setText(Math.max(0, Math.ceil(this.levelTimer.getRemainingSeconds())).toString(10));
        }

        if (this.gameIsOver) {
            this.basket.setVelocityX(0);
            return;
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
            child.angle += child.spinSpeed || 0;
            if (child.y > this.scale.height + 10) {
                child.disableBody(true, true);
            }
        });
    }

    spawnRandomIngredient() {
        const level = INDIA_LEVELS[this.currentLevel];

        const angle = Phaser.Math.Between(-1, 1);

        if (!level) {
            return;
        }

        const frame = Phaser.Utils.Array.GetRandom(level.frames);

        const ingredient = this.ingredientGroup.create(
            Phaser.Math.Between(50, this.scale.width - 50),
            -40,
            level.ingredientKey,
            frame
        );

        ingredient.setScale(0.7);
        ingredient.setDepth(5);
        ingredient.body.setAllowGravity(true);
        ingredient.setAngle(Phaser.Math.Between(0, 359));
        ingredient.spinSpeed = Phaser.Math.Between(0, 1) === 0
            ? Phaser.Math.Between(-3, -1)
            : Phaser.Math.Between(1, 3);
    }


    handleBasketIngredientCollision(basket, ingredient) {
        ingredient.disableBody(true, true);
        if (this.gameIsOver) {
                this.sound.play("item_collection_sfx", { volume: getSfxVolume(this) });
            return;
        }
        this.score += 10;
        this.scoreText.setText(this.score.toString(10));
        console.log(this.score);
        this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.score >= INDIA_LEVELS[this.currentLevel].targetScore) {
            this.endLevel(true);
        }
    }

    endLevel(success = false) {
        this.gameIsOver = true;
        this.basket.setVelocityX(0);

        if (this.timedEvent) {
            this.timedEvent.remove(false);
            this.timedEvent = null;
        }

        if (this.levelTimer) {
            this.levelTimer.remove(false);
            this.levelTimer = null;
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

        this.input.keyboard.enabled = false;
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

    _overlay() {
        const { width, height } = this.scale;
        const depth = 1000;

        const fade = this.add.rectangle(width / 2, height / 2, width, height, this.palette.overlay, 0.38)
            .setDepth(depth);
        const panelShadow = this.add.rectangle(width / 2 + 6, height / 2 + 8, 530, 380, 0x5e685d, 0.14)
            .setDepth(depth + 1);
        const panel = this.add.rectangle(width / 2, height / 2, 530, 380, 0xf6f4eb, 0.98)
            .setStrokeStyle(3, this.palette.uiBorder, 1)
            .setDepth(depth + 2);

        return { width, height, depth, fade, panelShadow, panel };
    }

    _button(x, y, label, cb, depth = 30) {
        const shadow = this.add.rectangle(x + 3, y + 4, 190, 44, 0x7e4a2c, 0.2).setDepth(depth - 1);
        const bg = this.add.rectangle(x, y, 190, 44, this.palette.buttonFill)
            .setStrokeStyle(3, this.palette.buttonBorder, 0.95)
            .setInteractive({ useHandCursor: true })
            .setDepth(depth);
        const text = this.add.text(x, y, label, {
            fontSize: "24px",
            color: this.palette.buttonText,
            fontStyle: "bold",
        }).setOrigin(0.5).setDepth(depth + 1).setInteractive({ useHandCursor: true });

        const activateHover = () => {
            bg.setFillStyle(this.palette.buttonHover, 1);
            text.setScale(1.03);
        };

        const deactivateHover = () => {
            bg.setFillStyle(this.palette.buttonFill, 1);
            text.setScale(1);
        };

        const handleClick = () => {
            playButtonClickSfx(this);
            cb();
        };

        bg.on("pointerover", activateHover);
        text.on("pointerover", activateHover);
        bg.on("pointerout", deactivateHover);
        text.on("pointerout", deactivateHover);
        bg.on("pointerdown", handleClick);
        text.on("pointerdown", handleClick);

        return this.add.container(0, 0, [shadow, bg, text]).setDepth(depth);
    }

    showLevelComplete() {
        const { width, height, depth } = this._overlay();
        this.add.text(width / 2, height / 2 - 112, "Level Complete", {
            fontSize: "44px",
            color: this.palette.win,
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(depth + 4);
        this.add.text(width / 2, height / 2 - 46, `Score: ${this.score}`, {
            fontSize: "28px",
            color: "#6b3b21",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(depth + 4);
        this.add.text(width / 2, height / 2 + 2, "Olive is ready for the next level.", {
            fontSize: "21px",
            color: "#82553a"
        }).setOrigin(0.5).setDepth(depth + 4);
        this._button(width / 2, height / 2 + 78, "Next Level", () => {
            this.scene.restart({ level: this.currentLevel + 1, maxLevel: this.maxLevel });
        }, depth + 5);
        this._button(width / 2, height / 2 + 132, "Back to Map", () => this.returnToMap(), depth + 5);
    }

    showGameOver() {
            this.sound.play("lose_sfx", { volume: getSfxVolume(this) });
        const { width, height, depth } = this._overlay();
        this.add.text(width / 2, height / 2 - 108, "Game Over", {
            fontSize: "46px",
            color: this.palette.lose,
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(depth + 4);
        this.add.text(width / 2, height / 2 - 48, `Score: ${this.score}`, {
            fontSize: "24px",
            color: "#6b3b21",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(depth + 4);
        this.add.text(width / 2, height / 2 + 4, "Try catching the ingredients again.", {
            fontSize: "22px",
            color: "#82553a"
        }).setOrigin(0.5).setDepth(depth + 4);
        this._button(width / 2, height / 2 + 78, "Retry Level", () => {
            this.scene.restart({ level: this.currentLevel, maxLevel: this.maxLevel });
        }, depth + 5);
        this._button(width / 2, height / 2 + 132, "Back to Map", () => this.returnToMap(), depth + 5);
    }

    showVictory() {
        const wins = this.registry.get('wins') || {};
        wins.india = true;
        this.registry.set('wins', wins);
    this.sound.play("victory_sfx", { volume: getSfxVolume(this) });

        const { width, height, depth } = this._overlay();
        this.add.text(width / 2, height / 2 - 108, "Victory!", {
            fontSize: "46px",
            color: this.palette.win,
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(depth + 4);
        this.add.text(width / 2, height / 2 - 48, "All ingredients collected!", {
            fontSize: "24px",
            color: "#6b3b21"
        }).setOrigin(0.5).setDepth(depth + 4);
        this.add.text(width / 2, height / 2 + 4, `You completed all ${this.maxLevel} India levels.`, {
            fontSize: "22px",
            color: "#5a341d"
        }).setOrigin(0.5).setDepth(depth + 4);
        this._button(width / 2, height / 2 + 78, "Play Again", () => {
            this.scene.restart({ level: 1, maxLevel: this.maxLevel });
        }, depth + 5);
        this._button(width / 2, height / 2 + 132, "Back to Map", () => this.returnToMap(), depth + 5);
    }
  checkOliveWin() {
    const wins = this.registry.get('wins') || {};
    if (wins.italy && wins.philippines && wins.egypt && wins.mexico && wins.india && wins.brazil) {
      return true;
    }
    return false;
  }

}
