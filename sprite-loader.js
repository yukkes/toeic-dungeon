// Sprite Loader - Handles sprite sheet extraction and rendering

class SpriteLoader {
    constructor() {
        this.spriteSheet = document.getElementById('sprite-sheet');
        this.spriteSize = 128;
        this.columns = 4;
        this.loaded = false;

        // Wait for sprite sheet to load
        if (this.spriteSheet.complete) {
            this.loaded = true;
        } else {
            this.spriteSheet.addEventListener('load', () => {
                this.loaded = true;
            });
        }
    }

    /**
     * Calculate sprite position in sheet
     * @param {number} id - Pokemon ID (1-151) or special IDs (152=player, 153-160=gym leaders)
     * @returns {Object} {x, y} coordinates in pixels
     */
    getSpritePosition(id) {
        // Convert 1-based ID to 0-based index
        const index = id - 1;
        const col = index % this.columns;
        const row = Math.floor(index / this.columns);

        return {
            x: col * this.spriteSize,
            y: row * this.spriteSize
        };
    }

    /**
     * Draw sprite on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} id - Pokemon/character ID
     * @param {number} dx - Destination x
     * @param {number} dy - Destination y
     * @param {number} scale - Scale factor (default 1)
     */
    drawSprite(ctx, id, dx, dy, scale = 1) {
        if (!this.loaded) {
            console.warn('Sprite sheet not loaded yet');
            return;
        }

        const pos = this.getSpritePosition(id);
        const size = this.spriteSize * scale;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.spriteSheet,
            pos.x, pos.y,
            this.spriteSize, this.spriteSize,
            dx, dy,
            size, size
        );
    }

    /**
     * Draw sprite to canvas element (for UI cards)
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} id - Pokemon/character ID
     */
    drawToCanvas(canvas, id) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawSprite(ctx, id, 0, 0, 1);
    }

    /**
     * Animate sprite with shake effect (for battles)
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} id - Pokemon/character ID
     * @param {number} duration - Animation duration in ms
     */
    animateShake(canvas, id, duration = 300) {
        const ctx = canvas.getContext('2d');
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                // Reset to normal position
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.drawSprite(ctx, id, 0, 0, 1);
                return;
            }

            // Shake offset
            const offsetX = Math.sin(elapsed * 0.1) * 5;
            const offsetY = Math.cos(elapsed * 0.15) * 3;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawSprite(ctx, id, offsetX, offsetY, 1);

            requestAnimationFrame(animate);
        };

        animate();
    }
}

// Create global sprite loader instance
const spriteLoader = new SpriteLoader();
