// 1. Rename class to match what main.js expects
class MexicoScene extends Phaser.Scene {
    constructor() {
        super('MexicoScene');
        this.score = 0;
        this.timeLeft = 120;
        this.levelDuration = 120;
        this.gameOver = false;
        this.pinatas = [];
        this.chiles = [];
    }

    create() {
        // RESET STATE: Important because the scene is reused
        this.score = 0;
        this.timeLeft = this.levelDuration;
        this.gameOver = false;
        this.pinatas = [];
        this.chiles = [];

        // Use Phaser's scale system, not window.innerWidth
        const width = this.scale.width;
        const height = this.scale.height;

        // Background (optional, so it doesn't look like a black void)
        this.add.rectangle(width/2, height/2, width, height, 0x87CEEB);

        // UI Text
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.timerText = this.add.text(10, 50, `Time: ${this.timeLeft}`, { fontSize: '24px', fill: '#fff' });

        // Exit instructions
        this.add.text(width - 10, 10, 'Press ESC to Quit', { fontSize: '16px', fill: '#fff' })
            .setOrigin(1, 0);

        // Listen for ESC key to return to map
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MapScene');
        });

        // Start spawning pinatas
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (!this.gameOver) this.spawnPinata();
            },
            callbackScope: this,
            loop: true
        });

        // Start spawning chiles
        this.spawnChileTimer = this.time.addEvent({
            delay: 2500,
            callback: () => {
                if (!this.gameOver) this.spawnChile();
            },
            callbackScope: this,
            loop: true
        });

        // Countdown event for the level timer (ticks every second)
        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onSecondTick,
            callbackScope: this,
            loop: true
        });
        this.spawnPinata();
        this.spawnChile();
    }

    spawnPinata() {
        if (this.gameOver) return;

        const width = this.scale.width;
        const height = this.scale.height;

        // Use game width, not window width
        const startX = Phaser.Math.Between(40, width - 40);
        const endX = Phaser.Math.Between(width - 40, 40);
        // Adjust peak for 600px height
        const peakY = Phaser.Math.Between(height * 0.3, height * 0.5); 
        const startY = height + 50; // Start just below screen

        const pinata = this.add.rectangle(startX, startY, 40, 40, 0xDEB887);
        pinata.setInteractive();
        pinata.on('pointerdown', () => this.onPinataClicked(pinata));

        const pinataData = {
            el: pinata,
            startX,
            endX,
            startY,
            peakY,
            startTime: Date.now(),
            duration: 3000,
            clicked: false
        };

        this.pinatas.push(pinataData);
    }

    spawnChile() {
        if (this.gameOver) return;

        const width = this.scale.width;
        const height = this.scale.height;

        // Use game width, not window width
        const startX = Phaser.Math.Between(40, width - 40);
        const endX = Phaser.Math.Between(width - 40, 40);
        // Adjust peak for 600px height
        const peakY = Phaser.Math.Between(height * 0.3, height * 0.5); 
        const startY = height + 50; // Start just below screen

        const chile = this.add.rectangle(startX, startY, 40, 40, 0xB22222);
        chile.setInteractive();
        chile.on('pointerdown', () => this.onChileClicked(chile));

        const chileData = {
            el: chile,
            startX,
            endX,
            startY,
            peakY,
            startTime: Date.now(),
            duration: 3000,
            clicked: false
        };

        this.chiles.push(chileData);
    }

    onPinataClicked(pinataEl) {
        if (this.gameOver) return;

        const index = this.pinatas.findIndex(p => p.el === pinataEl);
        if (index !== -1 && !this.pinatas[index].clicked) {
            this.pinatas[index].clicked = true;
            this.score += 1;
            this.scoreText.setText('Score: ' + this.score);

            this.tweens.add({
                targets: pinataEl,
                y: -50,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    pinataEl.destroy();
                    const removeIndex = this.pinatas.findIndex(p => p.el === pinataEl);
                    if (removeIndex !== -1) {
                        this.pinatas.splice(removeIndex, 1);
                    }
                }
            });
        }
    }

    onChileClicked(chileEl) {
        if (this.gameOver) return;

        const index = this.chiles.findIndex(p => p.el === chileEl);
        if (index !== -1 && !this.chiles[index].clicked) {
            this.chiles[index].clicked = true;
            this.score -= 1;
            this.scoreText.setText('Score: ' + this.score);

            this.tweens.add({
                targets: chileEl,
                y: -50,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    chileEl.destroy();
                    const removeIndex = this.chiles.findIndex(p => p.el === chileEl);
                    if (removeIndex !== -1) {
                        this.chiles.splice(removeIndex, 1);
                    }
                }
            });
        }
    }

    update() {
        if (this.gameOver) return;

        const now = Date.now();

        for (let i = this.pinatas.length - 1; i >= 0; i--) {
            const pinataData = this.pinatas[i];

            if (pinataData.clicked) continue;

            const elapsed = now - pinataData.startTime;
            const t = elapsed / pinataData.duration;

            if (t > 1) {
                // Pinata missed: simply remove the pinata (no lives in timer mode)
                pinataData.el.destroy();
                this.pinatas.splice(i, 1);
            } else {
                // Parabolic movement
                const x = pinataData.startX + (pinataData.endX - pinataData.startX) * t;
                const y = pinataData.startY - (4 * t * (1 - t)) * (pinataData.startY - pinataData.peakY);
                pinataData.el.setPosition(x, y);
            }
        }

        for (let i = this.chiles.length - 1; i >= 0; i--) {
            const chileData = this.chiles[i];

            if (chileData.clicked) continue;

            const elapsed = now - chileData.startTime;
            const t = elapsed / chileData.duration;

            if (t > 1) {
                // Chile missed: simply remove the chile (no lives in timer mode)
                chileData.el.destroy();
                this.chiles.splice(i, 1);
            } else {
                // Parabolic movement
                const x = chileData.startX + (chileData.endX - chileData.startX) * t;
                const y = chileData.startY - (4 * t * (1 - t)) * (chileData.startY - chileData.peakY);
                chileData.el.setPosition(x, y);
            }
        }
    }
    onSecondTick() {
        if (this.gameOver) return;
        this.timeLeft -= 1;
        this.timerText.setText(`Time: ${this.timeLeft}`);
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    endGame() {
        this.gameOver = true;
        this.spawnTimer.remove(); // Stop spawning
        if (this.countdownEvent) this.countdownEvent.remove();
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.rectangle(width/2, height/2, 400, 200, 0x000000, 0.8);
        
        this.add.text(width/2, height/2 - 40, 'GAME OVER', 
            { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
            
        this.add.text(width/2, height/2 + 20, `Final Score: ${this.score}`, 
            { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        const backButton = this.add.text(width/2, height/2 + 70, 'Click to Return', 
            { fontSize: '24px', fill: '#00ff00' })
            .setOrigin(0.5)
            .setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('MapScene');
        });
    }
}
