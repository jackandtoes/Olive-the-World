// 1. Rename class to match what main.js expects
class MexicoScene extends Phaser.Scene {
    constructor() {
        // 2. Use the specific key 'MexicoScene'
        super('MexicoScene');
        this.score = 0;
        this.timeLeft = 120; // seconds (2 minutes)
        this.levelDuration = 120;
        this.gameOver = false;
        this.toasts = [];
    }

    create() {
        // RESET STATE: Important because the scene is reused
        this.score = 0;
        this.timeLeft = this.levelDuration;
        this.gameOver = false;
        this.toasts = [];

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

        // Start spawning toasts
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (!this.gameOver) this.spawnToast();
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
        this.spawnToast();
    }

    spawnToast() {
        if (this.gameOver) return;

        const width = this.scale.width;
        const height = this.scale.height;

        // Use game width, not window width
        const startX = Phaser.Math.Between(40, width - 40);
        const endX = Phaser.Math.Between(width - 40, 40);
        // Adjust peak for 600px height
        const peakY = Phaser.Math.Between(height * 0.3, height * 0.5); 
        const startY = height + 50; // Start just below screen

        const toast = this.add.rectangle(startX, startY, 40, 40, 0xDEB887);
        toast.setInteractive();
        toast.on('pointerdown', () => this.onToastClicked(toast));

        const toastData = {
            el: toast,
            startX,
            endX,
            startY,
            peakY,
            startTime: Date.now(),
            duration: 3000,
            clicked: false
        };

        this.toasts.push(toastData);
    }

    onToastClicked(toastEl) {
        if (this.gameOver) return;

        const index = this.toasts.findIndex(t => t.el === toastEl);
        if (index !== -1 && !this.toasts[index].clicked) {
            this.toasts[index].clicked = true;
            this.score += 1;
            this.scoreText.setText('Score: ' + this.score);

            this.tweens.add({
                targets: toastEl,
                y: -50,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    toastEl.destroy();
                    const removeIndex = this.toasts.findIndex(t => t.el === toastEl);
                    if (removeIndex !== -1) {
                        this.toasts.splice(removeIndex, 1);
                    }
                }
            });
        }
    }

    update() {
        if (this.gameOver) return;

        const now = Date.now();

        for (let i = this.toasts.length - 1; i >= 0; i--) {
            const toastData = this.toasts[i];

            if (toastData.clicked) continue;

            const elapsed = now - toastData.startTime;
            const t = elapsed / toastData.duration;

            if (t > 1) {
                // Toast missed: simply remove the toast (no lives in timer mode)
                toastData.el.destroy();
                this.toasts.splice(i, 1);
            } else {
                // Parabolic movement
                const x = toastData.startX + (toastData.endX - toastData.startX) * t;
                const y = toastData.startY - (4 * t * (1 - t)) * (toastData.startY - toastData.peakY);
                toastData.el.setPosition(x, y);
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
