// Dungeon Generation System

const THEMES = {
    grass: { floor: '#e8f5e9', wall: '#2e7d32', battleBg: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 50%, #66bb6a 50%, #2e7d32 100%)', floorTile: [0, 0], wallTile: [0, 1] },
    cave: { floor: '#616161', wall: '#212121', battleBg: 'linear-gradient(to bottom, #424242 0%, #212121 100%)', floorTile: [1, 0], wallTile: [1, 1] },
    volcano: { floor: '#5d4037', wall: '#b71c1c', battleBg: 'linear-gradient(to bottom, #d84315 0%, #3e2723 100%)', floorTile: [2, 0], wallTile: [2, 1] },
    sea: { floor: '#e3f2fd', wall: '#0277bd', battleBg: 'linear-gradient(to bottom, #81d4fa 0%, #0277bd 50%, #01579b 100%)', floorTile: [6, 0], wallTile: [6, 1] }
};

function getTheme(floor) {
    if (floor <= 2) return THEMES.grass;
    if (floor <= 4) return THEMES.cave;
    if (floor <= 6) return THEMES.volcano;
    return THEMES.sea;
}

class Dungeon {
    constructor(floor, seed) {
        this.floor = floor;
        this.seed = seed;
        this.width = 30; // 30x20
        this.height = 20;
        this.map = [];
        this.rooms = [];
        this.items = []; // Potions
        this.enemies = []; // Visible enemies
        this.playerX = 1;
        this.playerY = 1;
        this.stairsX = 0;
        this.stairsY = 0;
        this.turnCount = 0; // Track turns for enemy movement

        this.tileset = new Image();
        this.tileset.src = 'map_tiles.png';
        this.tileset.onload = () => {
            const canvas = document.getElementById('dungeon-canvas');
            if (canvas) this.draw(canvas.getContext('2d'), canvas.width, canvas.height);
        };

        this.generate();
    }

    // Simple seeded random number generator
    seededRandom() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    generate() {
        // Initialize map with walls
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = 1; // 1 = wall, 0 = floor
            }
        }

        this.placeRooms();
        this.connectRooms();
        this.spawnItems();
        this.spawnEnemies();
    }

    placeRooms() {
        const minRooms = 5;
        const maxRooms = 10;
        const roomCount = Math.floor(this.seededRandom() * (maxRooms - minRooms + 1)) + minRooms;

        for (let i = 0; i < roomCount; i++) {
            const w = Math.floor(this.seededRandom() * 6) + 4; // 4-9
            const h = Math.floor(this.seededRandom() * 6) + 4;
            const x = Math.floor(this.seededRandom() * (this.width - w - 2)) + 1;
            const y = Math.floor(this.seededRandom() * (this.height - h - 2)) + 1;

            const newRoom = { x, y, w, h };

            // Check overlap with existing rooms (with a 1-tile buffer)
            let overlap = false;
            for (const room of this.rooms) {
                if (newRoom.x < room.x + room.w + 1 && newRoom.x + newRoom.w + 1 > room.x &&
                    newRoom.y < room.y + room.h + 1 && newRoom.y + newRoom.h + 1 > room.y) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                this.createRoom(newRoom);
                this.rooms.push(newRoom);

                // Place player in the center of the first room
                if (this.rooms.length === 1) {
                    this.playerX = Math.floor(newRoom.x + newRoom.w / 2);
                    this.playerY = Math.floor(newRoom.y + newRoom.h / 2);
                }
            }
        }

        // Place stairs in the center of the last room
        const lastRoom = this.rooms[this.rooms.length - 1];
        this.stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
        this.stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
    }

    createRoom(room) {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                this.map[y][x] = 0;
            }
        }
    }

    connectRooms() {
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];

            const x1 = Math.floor(roomA.x + roomA.w / 2);
            const y1 = Math.floor(roomA.y + roomA.h / 2);
            const x2 = Math.floor(roomB.x + roomB.w / 2);
            const y2 = Math.floor(roomB.y + roomB.h / 2);

            // Random choice: horizontal then vertical, or vice versa
            if (this.seededRandom() > 0.5) {
                this.createTunnel(x1, x2, y1, true); // Horizontal
                this.createTunnel(y1, y2, x2, false); // Vertical
            } else {
                this.createTunnel(y1, y2, x1, false); // Vertical
                this.createTunnel(x1, x2, y2, true); // Horizontal
            }
        }
    }

    createTunnel(start, end, fixed, horizontal) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);

        for (let i = min; i <= max; i++) {
            if (horizontal) {
                if (fixed >= 0 && fixed < this.height && i >= 0 && i < this.width) {
                    this.map[fixed][i] = 0;
                }
            } else {
                if (i >= 0 && i < this.height && fixed >= 0 && fixed < this.width) {
                    this.map[i][fixed] = 0;
                }
            }
        }
    }

    spawnItems() {
        const itemCount = 1 + Math.floor(this.seededRandom() * 2); // 1-2 items
        for (let i = 0; i < itemCount; i++) {
            const room = this.rooms[Math.floor(this.seededRandom() * this.rooms.length)];
            const x = Math.floor(room.x + 1 + this.seededRandom() * (room.w - 2));
            const y = Math.floor(room.y + 1 + this.seededRandom() * (room.h - 2));

            // Avoid overlap with player, stairs, and other items
            if ((x === this.playerX && y === this.playerY) ||
                (x === this.stairsX && y === this.stairsY) ||
                this.items.some(item => item.x === x && item.y === y)) {
                i--; // Retry placing this item
                continue;
            }

            const type = this.seededRandom() > 0.5 ? 'potion' : 'ball';
            this.items.push({ x, y, type: type });
        }
    }

    spawnEnemies() {
        const enemyCount = 3 + Math.floor(this.floor / 3); // More enemies deeper
        const maxAttempts = 50; // Prevent infinite loops if map is too small/crowded

        for (let i = 0; i < enemyCount; i++) {
            let placed = false;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const room = this.rooms[Math.floor(this.seededRandom() * this.rooms.length)];
                const x = Math.floor(room.x + 1 + this.seededRandom() * (room.w - 2));
                const y = Math.floor(room.y + 1 + this.seededRandom() * (room.h - 2));

                // Ensure it's a floor tile
                if (this.map[y][x] === 1) continue;

                // Avoid overlap with player, stairs, items, and other enemies
                if ((x === this.playerX && y === this.playerY) ||
                    (x === this.stairsX && y === this.stairsY) ||
                    this.items.some(item => item.x === x && item.y === y) ||
                    this.enemies.some(enemy => enemy.x === x && enemy.y === y)) {
                    continue;
                }

                // Keep some distance from player initially
                if (Math.abs(x - this.playerX) + Math.abs(y - this.playerY) < 5) {
                    continue;
                }

                this.enemies.push({ x, y, id: getEnemyForFloor(this.floor) }); // Store ID if needed? Or just generic.
                placed = true;
                break;
            }
            if (!placed) {
                // console.warn("Could not place all enemies.");
                break; // Stop trying if placement is too difficult
            }
        }
    }

    movePlayer(dx, dy) {
        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) return null;
        if (this.map[newY][newX] === 1) return null; // Wall

        // Check Enemy Collision
        const enemyIndex = this.enemies.findIndex(e => e.x === newX && e.y === newY);
        if (enemyIndex !== -1) {
            this.enemies.splice(enemyIndex, 1);
            return 'encounter';
        }

        this.playerX = newX;
        this.playerY = newY;
        this.turnCount++;

        // Stairs
        if (this.playerX === this.stairsX && this.playerY === this.stairsY) {
            return 'stairs';
        }

        // Items
        const itemIndex = this.items.findIndex(i => i.x === this.playerX && i.y === this.playerY);
        if (itemIndex !== -1) {
            const item = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            return { type: 'item', item: item };
        }

        // Move Enemies
        const enemyHit = this.moveEnemies();
        if (enemyHit) return 'encounter';

        return 'moved';
    }

    moveEnemies() {
        if (this.turnCount % 2 !== 0) return null;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];

            const dx = Math.sign(this.playerX - e.x);
            const dy = Math.sign(this.playerY - e.y);

            let moved = false;

            // Try major axis
            if (Math.abs(this.playerX - e.x) >= Math.abs(this.playerY - e.y)) {
                if (dx !== 0 && this.map[e.y][e.x + dx] !== 1) {
                    e.x += dx;
                    moved = true;
                } else if (dy !== 0 && this.map[e.y + dy][e.x] !== 1) {
                    e.y += dy;
                    moved = true;
                }
            } else {
                if (dy !== 0 && this.map[e.y + dy][e.x] !== 1) {
                    e.y += dy;
                    moved = true;
                } else if (dx !== 0 && this.map[e.y][e.x + dx] !== 1) {
                    e.x += dx;
                    moved = true;
                }
            }

            if (e.x === this.playerX && e.y === this.playerY) {
                this.enemies.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    draw(ctx, width, height) {
        const tileW = width / this.width;
        const tileH = height / this.height;
        // Fix gaps
        const drawTileW = Math.ceil(tileW);
        const drawTileH = Math.ceil(tileH);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const theme = getTheme(this.floor);
        const useTiles = this.tileset && this.tileset.complete && this.tileset.naturalWidth !== 0;
        const srcS = useTiles ? this.tileset.width / 8 : 32;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const posX = Math.floor(x * tileW);
                const posY = Math.floor(y * tileH);

                if (this.map[y][x] === 1) { // Wall
                    if (useTiles) {
                        // Apply inset to avoid tile border artifacts
                        const inset = 2; // Crop 2px from each side
                        ctx.drawImage(this.tileset,
                            theme.wallTile[0] * srcS + inset, theme.wallTile[1] * srcS + inset, srcS - inset * 2, srcS - inset * 2,
                            posX, posY, drawTileW, drawTileH
                        );
                    } else {
                        ctx.fillStyle = theme.wall;
                        ctx.fillRect(posX, posY, drawTileW, drawTileH);
                    }
                } else { // Floor
                    if (useTiles) {
                        const inset = 2;
                        ctx.drawImage(this.tileset,
                            theme.floorTile[0] * srcS + inset, theme.floorTile[1] * srcS + inset, srcS - inset * 2, srcS - inset * 2,
                            posX, posY, drawTileW, drawTileH
                        );
                    } else {
                        ctx.fillStyle = theme.floor;
                        ctx.fillRect(posX, posY, drawTileW, drawTileH);
                    }
                }
            }
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.floor(tileW * 0.8);
        ctx.font = `${fontSize}px sans-serif`;

        // Stairs (Down: 0, 3)
        if (useTiles) {
            ctx.drawImage(this.tileset,
                0 * srcS, 3 * srcS, srcS, srcS,
                Math.floor(this.stairsX * tileW), Math.floor(this.stairsY * tileH), drawTileW, drawTileH
            );
        } else {
            ctx.fillText('🪜', this.stairsX * tileW + tileW / 2, this.stairsY * tileH + tileH / 2);
        }

        // Items
        this.items.forEach(item => {
            if (useTiles) {
                // Potion: 0, 2; Ball: 1, 2
                const tileX = item.type === 'potion' ? 0 : 1;
                const tileY = 2;
                ctx.drawImage(this.tileset,
                    tileX * srcS, tileY * srcS, srcS, srcS,
                    Math.floor(item.x * tileW), Math.floor(item.y * tileH), drawTileW, drawTileH
                );
            } else {
                const icon = item.type === 'potion' ? '💊' : '🔴';
                ctx.fillText(icon, item.x * tileW + tileW / 2, item.y * tileH + tileH / 2);
            }
        });

        // Enemies
        this.enemies.forEach(enemy => {
            let icon = '👾';
            if (typeof POKEMON_DATA !== 'undefined' && POKEMON_DATA[enemy.id] && POKEMON_DATA[enemy.id].emoji) {
                icon = POKEMON_DATA[enemy.id].emoji;
            }
            ctx.fillText(icon, enemy.x * tileW + tileW / 2, enemy.y * tileH + tileH / 2);
        });

        // Player
        // User requested easy-to-understand distinct emoji
        const playerIcon = '🤠'; // Cowboy/Hero

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'yellow'; // Glow effect
        ctx.fillText(playerIcon, this.playerX * tileW + tileW / 2, this.playerY * tileH + tileH / 2);
        ctx.restore();
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
