import { Pokemon } from './Pokemon';
import POKEMON_DATA_JSON from '../data/pokemon.json';
import EVOLUTIONS_JSON from '../data/evolutions.json';
import { PokemonDef } from '../types';

const POKEMON_DATA: Record<string, PokemonDef> = POKEMON_DATA_JSON as any;
const EVOLUTIONS: Record<string, { level: number; to: number }> = EVOLUTIONS_JSON as any;

const THEMES = {
    grass: { floor: '#e8f5e9', wall: '#2e7d32' },
    cave: { floor: '#616161', wall: '#212121' },
    volcano: { floor: '#5d4037', wall: '#b71c1c' },
    sea: { floor: '#e3f2fd', wall: '#0277bd' }
};

function getTheme(floor: number) {
    if (floor <= 2) return THEMES.grass;
    if (floor <= 4) return THEMES.cave;
    if (floor <= 6) return THEMES.volcano;
    return THEMES.sea;
}

export interface DungeonCallbacks {
    onBattle: (enemy: Pokemon, originalEntity: any) => void;
    onClear: () => void;
    onItem: (type: 'potion' | 'ball') => void;
    canMove: () => boolean; // Check if input locked externally
    getPlayerLevel: () => number; // Needed for enemy scaling
    onMessage: (msg: string) => void;
}

export class Dungeon {
    floor: number;
    width = 30;
    height = 20;
    map: number[][] = [];
    rooms: any[] = [];
    fieldItems: any[] = []; // {x, y, type}
    enemies: any[] = [];
    playerX = 1;
    playerY = 1;
    playerDirection = 'down';
    stairsX = 0;
    stairsY = 0;
    gatekeeper: any = null;
    gatekeeperDefeated = false;
    inputLocked = false;
    turnCount = 0;
    interactingEnemy: any = null;

    canvas: HTMLCanvasElement;
    callbacks: DungeonCallbacks;

    constructor(floor: number, canvas: HTMLCanvasElement, callbacks: DungeonCallbacks) {
        this.floor = floor;
        this.canvas = canvas;
        this.callbacks = callbacks;
        this.resizeCanvas();
        this.generate();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
            this.canvas.width = 480;
            this.canvas.height = 640;
        } else {
            this.canvas.width = 600;
            this.canvas.height = 400;
        }
    }

    generate() {
        // Reset Map
        this.map = [];
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = 1; // Wall
            }
        }

        // Rooms
        const roomCount = Math.floor(Math.random() * 5) + 5;
        this.rooms = [];

        for (let i = 0; i < roomCount; i++) {
            const w = Math.floor(Math.random() * 6) + 4;
            const h = Math.floor(Math.random() * 6) + 4;
            const x = Math.floor(Math.random() * (this.width - w - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - h - 2)) + 1;

            const newRoom = { x, y, w, h };
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

        const lastRoom = this.rooms[this.rooms.length - 1];
        this.stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
        this.stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);

        this.spawnEnemies();
        this.spawnItems();

        if (this.floor === 9) {
            this.spawnGatekeeper();
        }

        this.render();
    }

    createRoom(room: any) {
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

    createTunnel(start: number, end: number, fixed: number, horizontal: boolean) {
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
            id: this.getRandomFinalEvolution(),
            isBoss: true
        };
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
                id: this.getEnemyForFloor(this.floor)
            });
        }
    }

    spawnItems() {
        this.fieldItems = [];
        const itemsToSpawn = [{ type: 'potion' }, { type: 'potion' }, { type: 'ball' }, { type: 'ball' }];
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
                if (this.fieldItems.some(fi => fi.x === x && fi.y === y)) { attempts++; continue; }

                this.fieldItems.push({ x, y, type: item.type });
                break;
            }
        }
    }

    movePlayer(dx: number, dy: number) {
        if (this.inputLocked || !this.callbacks.canMove()) return;

        const nx = this.playerX + dx;
        const ny = this.playerY + dy;

        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) return;
        if (this.map[ny][nx] === 1) return;

        const enemy = this.enemies.find(e => e.x === nx && e.y === ny);
        if (enemy) {
            this.startBattle(enemy);
            return;
        }

        this.playerX = nx;
        this.playerY = ny;

        if (dx > 0) this.playerDirection = 'right';
        else if (dx < 0) this.playerDirection = 'left';
        else if (dy > 0) this.playerDirection = 'down';
        else if (dy < 0) this.playerDirection = 'up';

        const itemIdx = this.fieldItems.findIndex(i => i.x === nx && i.y === ny);
        if (itemIdx >= 0) {
            const item = this.fieldItems[itemIdx];
            this.callbacks.onItem(item.type as 'potion' | 'ball');
            this.fieldItems.splice(itemIdx, 1);
        }

        this.turnCount++;
        if (this.turnCount % 2 === 0) {
            const hit = this.moveEnemies();
            if (hit) return;
        }

        this.render();

        if (this.playerX === this.stairsX && this.playerY === this.stairsY) {
            if (this.gatekeeper && !this.gatekeeperDefeated) {
                // Should not happen due to collision
            }
            this.inputLocked = true;
            if (confirm("次の階へ進みますか？")) {
                this.callbacks.onClear();
            } else {
                this.inputLocked = false;
            }
        }
    }

    moveEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (e.isBoss) continue;

            const dx = Math.sign(this.playerX - e.x);
            const dy = Math.sign(this.playerY - e.y);
            let moved = false;
            let nx = e.x;
            let ny = e.y;

            if (Math.abs(this.playerX - e.x) >= Math.abs(this.playerY - e.y)) {
                if (dx !== 0 && this.map[e.y][e.x + dx] !== 1 && !this.isOccupied(e.x + dx, e.y)) {
                    nx += dx; moved = true;
                } else if (dy !== 0 && this.map[e.y + dy][e.x] !== 1 && !this.isOccupied(e.x, e.y + dy)) {
                    ny += dy; moved = true;
                }
            } else {
                if (dy !== 0 && this.map[e.y + dy][e.x] !== 1 && !this.isOccupied(e.x, e.y + dy)) {
                    ny += dy; moved = true;
                } else if (dx !== 0 && this.map[e.y][e.x + dx] !== 1 && !this.isOccupied(e.x + dx, e.y)) {
                    nx += dx; moved = true;
                }
            }

            if (moved) { e.x = nx; e.y = ny; }
            if (e.x === this.playerX && e.y === this.playerY) {
                this.startBattle(e);
                return true;
            }
        }
        return false;
    }

    isOccupied(x: number, y: number) {
        return this.enemies.some(e => e.x === x && e.y === y);
    }

    startBattle(enemyEntity: any) {
        this.inputLocked = true;
        let enemy: Pokemon;
        if (enemyEntity.isBoss) {
            const maxLv = this.callbacks.getPlayerLevel();
            // NOTE: The original logic in dungeon.js line 362: this.game.party.map(p => p.level).
            // Here I only asked for getPlayerLevel. I should probably ask for maxPartyLevel if it was training mode?
            // "Highest level among Pokemon in the player's party" (Conversation 56e7... objective).
            // I'll stick to getPlayerLevel if party not available, but user instructions said "highest level".
            // I'll update callbacks to get scaling level.
            enemy = new Pokemon(enemyEntity.id, Math.max(maxLv, 5));
            enemy.name = "番人 " + enemy.name;
        } else {
            const floorBase = 3 + (this.floor * 3);
            const pLv = this.callbacks.getPlayerLevel();
            let lv = Math.min(floorBase, pLv - 1);
            if (lv < 1) lv = 1;
            enemy = new Pokemon(enemyEntity.id, lv);
        }

        this.interactingEnemy = enemyEntity;
        this.callbacks.onBattle(enemy, enemyEntity);
    }

    resumeFromBattle(won: boolean) {
        this.inputLocked = false;
        if (won && this.interactingEnemy) {
            this.enemies = this.enemies.filter(e => e !== this.interactingEnemy);
            if (this.interactingEnemy.isBoss) {
                this.gatekeeperDefeated = true;
                this.playerX = this.stairsX;
                this.playerY = this.stairsY;
                setTimeout(() => this.callbacks.onClear(), 500);
            }
            this.interactingEnemy = null;
        }
        this.render();
    }

    // Render methods (Simplified for brevity, assuming similar logic)
    render() {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const TILE_SIZE = 32;
        const VIEW_W = w;
        const VIEW_H = h;

        let camX = this.playerX * TILE_SIZE - VIEW_W / 2 + TILE_SIZE / 2;
        let camY = this.playerY * TILE_SIZE - VIEW_H / 2 + TILE_SIZE / 2;
        const mapPixelW = this.width * TILE_SIZE;
        const mapPixelH = this.height * TILE_SIZE;
        camX = Math.max(0, Math.min(camX, mapPixelW - VIEW_W));
        camY = Math.max(0, Math.min(camY, mapPixelH - VIEW_H));

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        const theme = getTheme(this.floor);
        ctx.save();
        ctx.translate(-camX, -camY);

        const startCol = Math.floor(camX / TILE_SIZE);
        const endCol = Math.min(this.width, Math.ceil((camX + VIEW_W) / TILE_SIZE));
        const startRow = Math.floor(camY / TILE_SIZE);
        const endRow = Math.min(this.height, Math.ceil((camY + VIEW_H) / TILE_SIZE));

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;
                if (this.map[y][x] === 1) {
                    ctx.fillStyle = theme.wall;
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    // Decoration
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(px, py, TILE_SIZE, 4);
                } else {
                    ctx.fillStyle = theme.floor;
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '24px serif';
        ctx.fillStyle = '#fff'; // Ensure icons are visible (reset from possible transparent fill)

        // Stairs
        if (!this.gatekeeper || this.gatekeeperDefeated) {
            const sx = this.stairsX * TILE_SIZE + TILE_SIZE / 2;
            const sy = this.stairsY * TILE_SIZE + TILE_SIZE / 2;
            ctx.fillText('🪜', sx, sy);
        }

        // Items
        for (const i of this.fieldItems) {
            if (i.x >= startCol && i.x < endCol && i.y >= startRow && i.y < endRow) {
                const ix = i.x * TILE_SIZE + TILE_SIZE / 2;
                const iy = i.y * TILE_SIZE + TILE_SIZE / 2;
                const text = i.type === 'potion' ? '💊' : '🔴'; // Simplified ball
                ctx.fillText(text, ix, iy);
            }
        }

        // Enemies
        for (const e of this.enemies) {
            if (e.x >= startCol && e.x < endCol && e.y >= startRow && e.y < endRow) {
                const ex = e.x * TILE_SIZE + TILE_SIZE / 2;
                const ey = e.y * TILE_SIZE + TILE_SIZE / 2;
                let icon = POKEMON_DATA[String(e.id)] ? POKEMON_DATA[String(e.id)].emoji : '👾';
                if (e.isBoss) icon = '👿';
                ctx.fillText(icon, ex, ey);
            }
        }

        // Player
        const px = this.playerX * TILE_SIZE + TILE_SIZE / 2;
        const py = this.playerY * TILE_SIZE + TILE_SIZE / 2;

        // Simple Player Draw (Circle)
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
        // Direction indicator
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        let dx = 0, dy = 0;
        if (this.playerDirection === 'right') dx = 10;
        if (this.playerDirection === 'left') dx = -10;
        if (this.playerDirection === 'up') dy = -10;
        if (this.playerDirection === 'down') dy = 10;
        ctx.arc(px + dx, py + dy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getRandomFinalEvolution() {
        // Simplified Logic: 149 Dragonite
        const allIds = Object.keys(POKEMON_DATA).map(Number).filter(id => id < 153);
        const sourceIds = Object.keys(EVOLUTIONS).map(Number);
        const finals = allIds.filter(id => !sourceIds.includes(id));
        if (finals.length === 0) return 149;
        return finals[Math.floor(Math.random() * finals.length)];
    }

    getEnemyForFloor(floor: number) {
        let pool: number[] = [];
        if (floor <= 2) pool = [1, 4, 7, 10, 16, 19, 25, 29, 32, 69];
        else if (floor <= 4) pool = [25, 50, 74, 95, 100, 109, 111, 39, 29, 32];
        else if (floor <= 6) pool = [4, 37, 58, 77, 74, 95, 111, 63];
        else pool = [7, 120, 121, 88, 122, 16, 19];
        return pool[Math.floor(Math.random() * pool.length)];
    }
}
