/**
 * Background Rain Effect
 * Heavy, diagonal rain using a single Canvas element.
 */

class RainEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.raindrops = [];
        this.count = 250; // Heavy rain density
        this.wind = 2;    // Diagonal tilt
        this.speed = 15;  // Base fall speed

        this.init();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();
        this.raindrops = [];
        for (let i = 0; i < this.count; i++) {
            this.raindrops.push(this.createRaindrop());
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRaindrop() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height - this.canvas.height, // Start above
            length: 15 + Math.random() * 20,
            opacity: 0.1 + Math.random() * 0.4,
            speed: this.speed + Math.random() * 10
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';

        this.raindrops.forEach((drop) => {
            this.ctx.globalAlpha = drop.opacity;
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x + this.wind, drop.y + drop.length);
            this.ctx.stroke();

            // Move
            drop.y += drop.speed;
            drop.x += this.wind;

            // Reset when out of bounds
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
            if (drop.x > this.canvas.width) {
                drop.x = 0;
            } else if (drop.x < 0) {
                drop.x = this.canvas.width;
            }
        });

        // Background flash effect (lightning)
        if (Math.random() < 0.005) {
            this.ctx.fillStyle = "rgba(255,255,255,0.15)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    new RainEffect('rain-canvas');
});
