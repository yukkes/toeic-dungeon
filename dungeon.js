// Dungeon Generation System

class Dungeon {
    constructor(floor, seed = Date.now()) {
        this.floor = floor;
        this.seed = seed;
        this.width = 40;
        this.height = 30;
        this.tileSize = 16;
        this.grid = [];
        this.rooms = [];
        this.playerPos = { x: 0, y: 0 };
        this.stairs = { x: 0, y: 0 };
        this.stepCount = 0;

        this.generate();
    }

    // Simple seeded random number generator
    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    generate() {
        // Initialize grid with walls
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1; // 1 = wall, 0 = floor
            }
        }

        // Generate rooms
        const numRooms = 6 + Math.floor(this.random() * 4);

        for (let i = 0; i < numRooms; i++) {
            const w = 4 + Math.floor(this.random() * 6);
            const h = 4 + Math.floor(this.random() * 6);
            const x = Math.floor(this.random() * (this.width - w - 2)) + 1;
            const y = Math.floor(this.random() * (this.height - h - 2)) + 1;

            const room = { x, y, w, h };

            // Check if room overlaps with existing rooms
            let overlaps = false;
            for (const other of this.rooms) {
                if (this.roomsOverlap(room, other)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                this.carveRoom(room);
                this.rooms.push(room);
            }
        }

        // Connect rooms with corridors
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.connectRooms(this.rooms[i], this.rooms[i + 1]);
        }

        // Place player in first room
        const firstRoom = this.rooms[0];
        this.playerPos = {
            x: firstRoom.x + Math.floor(firstRoom.w / 2),
            y: firstRoom.y + Math.floor(firstRoom.h / 2)
        };

        // Place stairs in last room
        const lastRoom = this.rooms[this.rooms.length - 1];
        this.stairs = {
            x: lastRoom.x + Math.floor(lastRoom.w / 2),
            y: lastRoom.y + Math.floor(lastRoom.h / 2)
        };
    }

    roomsOverlap(room1, room2) {
        return room1.x < room2.x + room2.w + 1 &&
            room1.x + room1.w + 1 > room2.x &&
            room1.y < room2.y + room2.h + 1 &&
            room1.y + room1.h + 1 > room2.y;
    }

    carveRoom(room) {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                this.grid[y][x] = 0;
            }
        }
    }

    connectRooms(room1, room2) {
        const x1 = room1.x + Math.floor(room1.w / 2);
        const y1 = room1.y + Math.floor(room1.h / 2);
        const x2 = room2.x + Math.floor(room2.w / 2);
        const y2 = room2.y + Math.floor(room2.h / 2);

        // Random choice: horizontal then vertical, or vice versa
        if (this.random() < 0.5) {
            this.carveCorridor(x1, y1, x2, y1); // Horizontal
            this.carveCorridor(x2, y1, x2, y2); // Vertical
        } else {
            this.carveCorridor(x1, y1, x1, y2); // Vertical
            this.carveCorridor(x1, y2, x2, y2); // Horizontal
        }
    }

    carveCorridor(x1, y1, x2, y2) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    this.grid[y][x] = 0;
                }
            }
        }
    }

    canMove(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.grid[y][x] === 0;
    }

    movePlayer(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;

        if (this.canMove(newX, newY)) {
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.stepCount++;

            // Check if reached stairs
            if (this.playerPos.x === this.stairs.x && this.playerPos.y === this.stairs.y) {
                return 'stairs';
            }

            // Random encounter check (15% chance per step)
            if (this.random() < 0.15) {
                return 'encounter';
            }

            return 'moved';
        }

        return 'blocked';
    }

    draw(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate camera offset to center on player
        const offsetX = Math.floor(canvasWidth / 2 - this.playerPos.x * this.tileSize);
        const offsetY = Math.floor(canvasHeight / 2 - this.playerPos.y * this.tileSize);

        // Draw tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const screenX = x * this.tileSize + offsetX;
                const screenY = y * this.tileSize + offsetY;

                // Only draw if on screen
                if (screenX >= -this.tileSize && screenX < canvasWidth &&
                    screenY >= -this.tileSize && screenY < canvasHeight) {

                    if (this.grid[y][x] === 0) {
                        // Floor
                        ctx.fillStyle = '#555555';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    } else {
                        // Wall
                        ctx.fillStyle = '#222222';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        ctx.strokeStyle = '#111111';
                        ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                    }
                }
            }
        }

        // Draw stairs
        const stairsX = this.stairs.x * this.tileSize + offsetX;
        const stairsY = this.stairs.y * this.tileSize + offsetY;
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(stairsX + 2, stairsY + 2, this.tileSize - 4, this.tileSize - 4);
        ctx.strokeStyle = '#fbc02d';
        ctx.lineWidth = 2;
        ctx.strokeRect(stairsX + 2, stairsY + 2, this.tileSize - 4, this.tileSize - 4);

        // Draw player
        const playerX = this.playerPos.x * this.tileSize + offsetX;
        const playerY = this.playerPos.y * this.tileSize + offsetY;
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(playerX + this.tileSize / 2, playerY + this.tileSize / 2, this.tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Get enemy Pokemon ID based on floor
function getEnemyForFloor(floor) {
    const weakPokemon = [16, 19, 10]; // Pidgey, Rattata, Caterpie
    const midPokemon = [25, 133, 39]; // Pikachu, Eevee, Jigglypuff
    const evolutions = [2, 5, 8, 17, 20]; // First evolutions
    const strongPokemon = [26, 38, 65, 6, 9]; // Strong Pokemon

    if (floor <= 2) {
        return weakPokemon[Math.floor(Math.random() * weakPokemon.length)];
    } else if (floor <= 4) {
        return [...weakPokemon, ...midPokemon][Math.floor(Math.random() * 6)];
    } else if (floor <= 6) {
        return midPokemon[Math.floor(Math.random() * midPokemon.length)];
    } else if (floor <= 8) {
        return evolutions[Math.floor(Math.random() * evolutions.length)];
    } else {
        return strongPokemon[Math.floor(Math.random() * strongPokemon.length)];
    }
}

// Get enemy level based on floor
function getEnemyLevel(floor) {
    if (floor <= 2) return 2 + Math.floor(Math.random() * 3); // 2-4
    if (floor <= 4) return 5 + Math.floor(Math.random() * 5); // 5-9
    if (floor <= 6) return 10 + Math.floor(Math.random() * 5); // 10-14
    if (floor <= 8) return 15 + Math.floor(Math.random() * 5); // 15-19
    return 20 + Math.floor(Math.random() * 5); // 20-24
}
