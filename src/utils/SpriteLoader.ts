
import pokePng from '/poke.png';

export class SpriteLoader {
    spriteSheet: HTMLImageElement;
    spriteSize = 128;
    columns = 4;
    loaded = false;

    constructor() {
        this.spriteSheet = new Image();
        this.spriteSheet.src = pokePng;

        const checkLoad = () => {
            if (this.spriteSheet.complete && this.spriteSheet.naturalWidth !== 0) {
                this.loaded = true;
                console.log("SpriteSheet loaded");
            }
        };

        if (this.spriteSheet.complete) {
            checkLoad();
        } else {
            this.spriteSheet.onload = () => checkLoad();
            this.spriteSheet.onerror = () => console.error("Failed to load poke.png");
        }
    }

    getSpritePosition(id: number) {
        const index = id - 1;
        const col = index % this.columns;
        const row = Math.floor(index / this.columns);

        return {
            x: col * this.spriteSize,
            y: row * this.spriteSize
        };
    }

    drawSprite(ctx: CanvasRenderingContext2D, id: number, dx: number, dy: number, scale = 1, smooth = false) {
        if (!this.loaded) return;

        const pos = this.getSpritePosition(id);
        const size = this.spriteSize * scale;

        ctx.imageSmoothingEnabled = smooth;
        ctx.drawImage(
            this.spriteSheet,
            pos.x, pos.y,
            this.spriteSize, this.spriteSize,
            dx, dy,
            size, size
        );
    }

    drawToCanvas(canvas: HTMLCanvasElement, id: number, smooth = false) {
        if (!this.loaded) {
            setTimeout(() => this.drawToCanvas(canvas, id, smooth), 200);
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = canvas.width / this.spriteSize;
        this.drawSprite(ctx, id, 0, 0, scale, smooth);
    }

    animateShake(canvas: HTMLCanvasElement, id: number, duration = 300) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const startTime = Date.now();
        const scale = canvas.width / this.spriteSize; // Calculate correct scale for canvas size

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.drawSprite(ctx, id, 0, 0, scale); // Use correct scale
                return;
            }

            const offsetX = Math.sin(elapsed * 0.1) * 5;
            const offsetY = Math.cos(elapsed * 0.15) * 3;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawSprite(ctx, id, offsetX, offsetY, scale); // Use correct scale

            requestAnimationFrame(animate);
        };

        animate();
    }
}

export const spriteLoader = new SpriteLoader();
