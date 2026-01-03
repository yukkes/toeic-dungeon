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
    constructor(gameInstance, floor) {
        this.game = gameInstance;
        this.floor = floor;
        this.width = 30; // 30x20
        this.height = 20;
        this.map = [];
        this.rooms = [];
        this.fieldItems = []; // {x, y, type: 'potion'|'ball'}
        this.enemies = []; // Visible enemies & Gatekeeper
        this.playerX = 1;
        this.playerY = 1;
        this.playerDirection = 'down'; // Track facing direction
        this.stairsX = 0;
        this.stairsY = 0;
        this.gatekeeper = null; // Spec: 9F Gatekeeper

        this.inputLocked = false;
        this.turnCount = 0;


        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.render();
        });

        this.generate();
    }

    resizeCanvas() {
        const canvas = document.getElementById('dungeon-canvas');
        if (!canvas) return;

        // Check for mobile portrait
        if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
            // Mobile Portrait: Vertical Map
            // Use slightly higher resolution for sharpness, CSS will scale it down
            canvas.width = 480;
            canvas.height = 640;
        } else {
            // Desktop / Landscape: Horizontal Map
            canvas.width = 600;
            canvas.height = 400;
        }
    }

    generate() {
        // Reset Map
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = 1; // Wall
            }
        }

        // Rooms
        const roomCount = Math.floor(Math.random() * 5) + 5; // 5-10
        this.rooms = [];

        for (let i = 0; i < roomCount; i++) {
            const w = Math.floor(Math.random() * 6) + 4;
            const h = Math.floor(Math.random() * 6) + 4;
            const x = Math.floor(Math.random() * (this.width - w - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - h - 2)) + 1;

            const newRoom = { x, y, w, h };

            // Overlap check
            let overlap = false;
            for (const r of this.rooms) {
                if (x < r.x + r.w + 1 && x + w + 1 > r.x &&
                    y < r.y + r.h + 1 && y + h + 1 > r.y) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                this.createRoom(newRoom);
                this.rooms.push(newRoom);
                if (this.rooms.length === 1) {
                    this.playerX = Math.floor(x + w / 2);
                    this.playerY = Math.floor(y + h / 2);
                }
            }
        }

        this.connectRooms();

        // Stairs in Last Room
        const lastRoom = this.rooms[this.rooms.length - 1];
        this.stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
        this.stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);

        // Populate
        this.spawnEnemies();
        this.spawnItems();

        // Spec: 9F Gatekeeper
        if (this.floor === 9) {
            this.spawnGatekeeper();
        }

        // Initial Render
        this.render();
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
            const rA = this.rooms[i];
            const rB = this.rooms[i + 1];
            const x1 = Math.floor(rA.x + rA.w / 2);
            const y1 = Math.floor(rA.y + rA.h / 2);
            const x2 = Math.floor(rB.x + rB.w / 2);
            const y2 = Math.floor(rB.y + rB.h / 2);

            if (Math.random() > 0.5) {
                this.createTunnel(x1, x2, y1, true);
                this.createTunnel(y1, y2, x2, false);
            } else {
                this.createTunnel(y1, y2, x1, false);
                this.createTunnel(x1, x2, y2, true);
            }
        }
    }

    createTunnel(start, end, fixed, horizontal) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= max; i++) {
            if (horizontal) this.map[fixed][i] = 0;
            else this.map[i][fixed] = 0;
        }
    }

    spawnGatekeeper() {
        this.gatekeeper = {
            x: this.stairsX,
            y: this.stairsY,
            id: 149, // Dragonite
            isBoss: true
        };
        // Remove normal enemy if generated there
        this.enemies = this.enemies.filter(e => e.x !== this.stairsX || e.y !== this.stairsY);
        this.enemies.push(this.gatekeeper);
    }

    spawnEnemies() {
        const count = 3 + Math.floor(this.floor / 2);
        for (let i = 0; i < count; i++) {
            const r = this.rooms[Math.floor(Math.random() * this.rooms.length)];
            const x = Math.floor(r.x + 1 + Math.random() * (r.w - 2));
            const y = Math.floor(r.y + 1 + Math.random() * (r.h - 2));

            if (this.map[y][x] === 1) continue;
            if (x === this.playerX && y === this.playerY) continue;
            if (x === this.stairsX && y === this.stairsY) continue;
            if (Math.abs(x - this.playerX) + Math.abs(y - this.playerY) < 5) continue;

            this.enemies.push({
                x, y,
                id: getEnemyForFloor(this.floor)
            });
        }
    }

    spawnItems() {
        // Spawn 2 Potions and 2 Balls per floor
        this.fieldItems = [];
        const itemsToSpawn = [
            { type: 'potion' },
            { type: 'potion' },
            { type: 'ball' },
            { type: 'ball' }
        ];

        for (const item of itemsToSpawn) {
            let attempts = 0;
            while (attempts < 50) {
                const r = this.rooms[Math.floor(Math.random() * this.rooms.length)];
                const x = Math.floor(r.x + 1 + Math.random() * (r.w - 2));
                const y = Math.floor(r.y + 1 + Math.random() * (r.h - 2));

                if (this.map[y][x] === 1) { attempts++; continue; }
                if (this.isOccupied(x, y)) { attempts++; continue; }
                if (x === this.playerX && y === this.playerY) { attempts++; continue; }
                if (x === this.stairsX && y === this.stairsY) { attempts++; continue; }
                // Check if item already exists at this position
                if (this.fieldItems.some(fi => fi.x === x && fi.y === y)) { attempts++; continue; }

                this.fieldItems.push({ x, y, type: item.type });
                break;
            }
        }
    }

    movePlayer(dx, dy) {
        if (this.inputLocked) return;

        const nx = this.playerX + dx;
        const ny = this.playerY + dy;

        // Wall
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) return;
        if (this.map[ny][nx] === 1) return;

        // Enemy Collision
        const enemy = this.enemies.find(e => e.x === nx && e.y === ny);
        if (enemy) {
            this.startBattle(enemy);
            return;
        }

        this.playerX = nx;
        this.playerY = ny;

        // Track direction for sprite rendering
        if (dx > 0) this.playerDirection = 'right';
        else if (dx < 0) this.playerDirection = 'left';
        else if (dy > 0) this.playerDirection = 'down';
        else if (dy < 0) this.playerDirection = 'up';

        // Item Pickup
        const itemIdx = this.fieldItems.findIndex(i => i.x === nx && i.y === ny);
        if (itemIdx >= 0) {
            const item = this.fieldItems[itemIdx];
            const msgLog = document.getElementById('dungeon-message');
            if (item.type === 'potion') {
                if (this.game.items.potions < this.game.items.maxPotions) {
                    this.game.items.potions++;
                    msgLog.innerText = "傷薬を手に入れた！";
                    this.fieldItems.splice(itemIdx, 1);
                } else {
                    msgLog.innerText = "傷薬はもう持てない！";
                }
            } else if (item.type === 'ball') {
                if (this.game.items.balls < this.game.items.maxBalls) {
                    this.game.items.balls++;
                    msgLog.innerText = "モンスターボールを手に入れた！";
                    this.fieldItems.splice(itemIdx, 1);
                } else {
                    msgLog.innerText = "モンスターボールはもう持てない！";
                }
            }
            this.game.updateDungeonUI();
        }

        // Turn Logic
        this.turnCount = (this.turnCount || 0) + 1;

        // Move Enemies (Every 2 turns)
        if (this.turnCount % 2 === 0) {
            const hit = this.moveEnemies();
            if (hit) return; // Battle started by enemy
        }

        this.render();

        // Check Stairs
        // Check Stairs
        if (this.playerX === this.stairsX && this.playerY === this.stairsY) {
            if (this.gatekeeper && !this.gatekeeperDefeated) {
                // If somehow on stairs while Gatekeeper is valid (should be blocked by collision)
                // Just let it pass to confirm for now, or return?
                // Logic says: gatekeeper occupies the tile.
            }

            // Render update wait
            this.inputLocked = true;
            setTimeout(() => {
                if (confirm("次の階へ進みますか？")) {
                    this.game.onComponentsCleared();
                    // New dungeon instance will be created, unlocking input
                } else {
                    this.inputLocked = false;
                }
            }, 20);
        }
    }

    moveEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (e.isBoss) continue; // Boss doesn't move

            // Simple Axis movement towards player
            const dx = Math.sign(this.playerX - e.x);
            const dy = Math.sign(this.playerY - e.y);

            let moved = false;
            let nx = e.x;
            let ny = e.y;

            // Try X then Y
            if (Math.abs(this.playerX - e.x) >= Math.abs(this.playerY - e.y)) {
                if (dx !== 0 && this.map[e.y][e.x + dx] !== 1 && !this.isOccupied(e.x + dx, e.y)) {
                    nx += dx;
                    moved = true;
                } else if (dy !== 0 && this.map[e.y + dy][e.x] !== 1 && !this.isOccupied(e.x, e.y + dy)) {
                    ny += dy;
                    moved = true;
                }
            } else {
                if (dy !== 0 && this.map[e.y + dy][e.x] !== 1 && !this.isOccupied(e.x, e.y + dy)) {
                    ny += dy;
                    moved = true;
                } else if (dx !== 0 && this.map[e.y][e.x + dx] !== 1 && !this.isOccupied(e.x + dx, e.y)) {
                    nx += dx;
                    moved = true;
                }
            }

            if (moved) {
                e.x = nx;
                e.y = ny;
            }

            // Check Collision with Player
            if (e.x === this.playerX && e.y === this.playerY) {
                this.startBattle(e);
                return true;
            }
        }
        return false;
    }

    isOccupied(x, y) {
        // occupied by other enemies?
        return this.enemies.some(e => e.x === x && e.y === y);
    }

    startBattle(enemyEntity) {
        this.inputLocked = true;

        let enemy;
        if (enemyEntity.isBoss) {
            // "先頭ポケモンのレベル + 3"
            const pLv = this.game.playerPokemon.level;
            enemy = new Pokemon(enemyEntity.id, pLv + 3);
            enemy.name = "番人 " + enemy.name;
        } else {
            const floorBase = 3 + (this.floor * 3);
            const pLv = this.game.playerPokemon.level;
            // User Request: Wild level <= Starter Level - 1
            let lv = Math.min(floorBase, pLv - 1);
            if (lv < 1) lv = 1; // Minimum level 1

            enemy = new Pokemon(enemyEntity.id, lv);
        }

        // Save reference to remove after battle
        this.interactingEnemy = enemyEntity;

        // Start
        this.game.battleManager.startBattle(this.game.playerPokemon, enemy, this.floor);
    }

    resumeFromBattle(won) {
        this.inputLocked = false;
        this.game.showScreen('dungeon-screen');
        if (won && this.interactingEnemy) {
            this.enemies = this.enemies.filter(e => e !== this.interactingEnemy);
            if (this.interactingEnemy.isBoss) {
                this.gatekeeperDefeated = true;
                this.playerX = this.stairsX;
                this.playerY = this.stairsY;
                setTimeout(() => {
                    this.game.onComponentsCleared();
                }, 500);
            }
            this.interactingEnemy = null;
        }
        this.render();
    }

    render() {
        const canvas = document.getElementById('dungeon-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Settings
        const TILE_SIZE = 32;
        const VIEW_W = w;
        const VIEW_H = h;

        // Calculate Camera Position (Centered on Player)
        // CameraX is top-left of view
        let camX = this.playerX * TILE_SIZE - VIEW_W / 2 + TILE_SIZE / 2;
        let camY = this.playerY * TILE_SIZE - VIEW_H / 2 + TILE_SIZE / 2;

        // Clamp Camera
        const mapPixelW = this.width * TILE_SIZE;
        const mapPixelH = this.height * TILE_SIZE;

        camX = Math.max(0, Math.min(camX, mapPixelW - VIEW_W));
        camY = Math.max(0, Math.min(camY, mapPixelH - VIEW_H));

        // Draw Background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        const theme = getTheme(this.floor);

        // Optimize: Draw only visible tiles
        const startCol = Math.floor(camX / TILE_SIZE);
        const endCol = Math.min(this.width, Math.ceil((camX + VIEW_W) / TILE_SIZE));
        const startRow = Math.floor(camY / TILE_SIZE);
        const endRow = Math.min(this.height, Math.ceil((camY + VIEW_H) / TILE_SIZE));

        ctx.save();
        ctx.translate(-camX, -camY);

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;

                if (this.map[y][x] === 1) {
                    ctx.fillStyle = theme.wall;
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    // 3D effect bevel
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(px, py, TILE_SIZE, 4);
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
                } else {
                    ctx.fillStyle = theme.floor;
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '24px serif';

        // Stairs
        if (!(this.gatekeeper && !this.gatekeeperDefeated)) {
            const sx = this.stairsX * TILE_SIZE + TILE_SIZE / 2;
            const sy = this.stairsY * TILE_SIZE + TILE_SIZE / 2;
            ctx.fillText('🪜', sx, sy);
        }

        // Items
        ctx.fillStyle = '#fff';
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.fieldItems.forEach(i => {
            if (i.x >= startCol && i.x < endCol && i.y >= startRow && i.y < endRow) {
                const ix = i.x * TILE_SIZE + TILE_SIZE / 2;
                const iy = i.y * TILE_SIZE + TILE_SIZE / 2;
                ctx.fillText(i.type === 'potion' ? '💊' : '⚾', ix, iy);
            }
        });

        // Enemies
        this.enemies.forEach(e => {
            // Only draw if roughly visible
            if (e.x >= startCol && e.x < endCol && e.y >= startRow && e.y < endRow) {
                let icon = POKEMON_DATA[e.id] ? POKEMON_DATA[e.id].emoji : '👾';
                if (e.isBoss) icon = '👿';
                const ex = e.x * TILE_SIZE + TILE_SIZE / 2;
                const ey = e.y * TILE_SIZE + TILE_SIZE / 2;
                ctx.font = '24px serif';
                ctx.fillText(icon, ex, ey);
            }
        });

        // Player - Directional Character (Pattern 1)
        const px = this.playerX * TILE_SIZE + TILE_SIZE / 2;
        const py = this.playerY * TILE_SIZE + TILE_SIZE / 2;

        // Determine direction based on last movement
        const direction = this.playerDirection || 'down';

        if (direction === 'down') {
            // Front view
            ctx.fillStyle = '#2196f3';
            ctx.fillRect(px - 6, py + 2, 12, 10);

            ctx.fillStyle = '#ffcc80';
            ctx.beginPath();
            ctx.arc(px, py - 4, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(px, py - 5, 6, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(px - 8, py - 5, 16, 2);

            ctx.fillStyle = '#000';
            ctx.fillRect(px - 3, py - 3, 2, 2);
            ctx.fillRect(px + 1, py - 3, 2, 2);

            ctx.fillStyle = '#1565c0';
            ctx.fillRect(px - 4, py + 12, 3, 6);
            ctx.fillRect(px + 1, py + 12, 3, 6);

        } else if (direction === 'up') {
            // Back view
            ctx.fillStyle = '#2196f3';
            ctx.fillRect(px - 6, py + 2, 12, 10);

            ctx.fillStyle = '#ffcc80';
            ctx.beginPath();
            ctx.arc(px, py - 4, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(px, py - 6, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(px - 5, py - 1, 10, 2);

            ctx.fillStyle = '#1565c0';
            ctx.fillRect(px - 4, py + 12, 3, 6);
            ctx.fillRect(px + 1, py + 12, 3, 6);

        } else if (direction === 'left') {
            // Left side view
            ctx.fillStyle = '#2196f3';
            ctx.fillRect(px - 2, py + 2, 8, 10);

            ctx.fillStyle = '#ffcc80';
            ctx.beginPath();
            ctx.arc(px + 1, py - 4, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(px + 1, py - 5, 6, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(px - 7, py - 5, 10, 2);

            ctx.fillStyle = '#000';
            ctx.fillRect(px - 1, py - 4, 2, 2);

            ctx.fillStyle = '#ffcc80';
            ctx.fillRect(px - 3, py - 3, 2, 2);

            ctx.fillStyle = '#1565c0';
            ctx.fillRect(px - 1, py + 12, 4, 6);

        } else if (direction === 'right') {
            // Right side view
            ctx.fillStyle = '#2196f3';
            ctx.fillRect(px - 6, py + 2, 8, 10);

            ctx.fillStyle = '#ffcc80';
            ctx.beginPath();
            ctx.arc(px - 1, py - 4, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(px - 1, py - 5, 6, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(px - 3, py - 5, 10, 2);

            ctx.fillStyle = '#000';
            ctx.fillRect(px + 1, py - 4, 2, 2);

            ctx.fillStyle = '#ffcc80';
            ctx.fillRect(px + 3, py - 3, 2, 2);

            ctx.fillStyle = '#1565c0';
            ctx.fillRect(px - 3, py + 12, 4, 6);
        }

        ctx.shadowBlur = 0; // Reset
        ctx.restore();
    }
}

function getEnemyForFloor(floor) {
    const pool = [16, 19, 10, 25]; // Simplified
    return pool[Math.floor(Math.random() * pool.length)];
}
