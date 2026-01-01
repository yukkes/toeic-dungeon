class Game {
    constructor() {
        this.currentScreen = 'title-screen';
        this.mode = null; // 'training' | 'gym'

        // Data
        this.saveManager = new SaveManager();
        this.battleManager = new BattleManager(this);
        this.dungeon = null;

        // State
        this.playerPokemon = null; // Active Pokemon (Training Leader or Gym Battler)
        this.party = []; // For Gym Mode (up to 6)
        this.box = []; // Loaded from Storage
        this.currentFloor = 1;

        // Inventory
        this.items = {
            potions: 0,
            maxPotions: 5,
            balls: 0,
            maxBalls: 5
        };

        // UI Binding
        this.bindEvents();

        // Init
        this.init();
    }

    init() {
        this.showScreen('title-screen');
        // Load box data just to see? No need yet.
    }

    bindEvents() {
        // Title
        document.getElementById('mode-training-btn').onclick = () => this.startTrainingSetup();
        document.getElementById('mode-gym-btn').onclick = () => this.startGymSetup();

        // Starter
        document.querySelectorAll('.starter-card').forEach(card => {
            card.onclick = () => this.selectStarter(parseInt(card.dataset.id));
        });

        // Gym Party
        document.getElementById('start-gym-run-btn').onclick = () => this.startGymRun();
        document.getElementById('start-next-gym-btn').onclick = () => this.startNextGymBattle();

        // Dungeon Controls
        document.getElementById('btn-up').onclick = () => this.dungeon && this.dungeon.movePlayer(0, -1);
        document.getElementById('btn-down').onclick = () => this.dungeon && this.dungeon.movePlayer(0, 1);
        document.getElementById('btn-left').onclick = () => this.dungeon && this.dungeon.movePlayer(-1, 0);
        document.getElementById('btn-right').onclick = () => this.dungeon && this.dungeon.movePlayer(1, 0);

        // Key Controls
        window.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'dungeon-screen' && this.dungeon && !this.dungeon.inputLocked) {
                if (e.key === 'ArrowUp') this.dungeon.movePlayer(0, -1);
                if (e.key === 'ArrowDown') this.dungeon.movePlayer(0, 1);
                if (e.key === 'ArrowLeft') this.dungeon.movePlayer(-1, 0);
                if (e.key === 'ArrowRight') this.dungeon.movePlayer(1, 0);
            }
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    // --- Training Mode Flow ---

    startTrainingSetup() {
        this.mode = 'training';
        this.showScreen('starter-screen');

        // Draw Starter Sprites
        setTimeout(() => {
            document.querySelectorAll('.starter-sprite-canvas').forEach(canvas => {
                const id = parseInt(canvas.dataset.id);
                if (window.spriteLoader) {
                    spriteLoader.drawToCanvas(canvas, id);
                }
            });
        }, 100);
    }

    selectStarter(id) {
        // Create new starter or load? Currently always new for Training
        // Spec says: "Starter levels are maintained".
        // So we should check if this starter exists in Box first.
        const box = this.saveManager.getBox();
        const existingInfo = box.find(p => {
            // Basic starter lineage check
            if (id === 1 && [1, 2, 3].includes(p.id)) return true;
            if (id === 4 && [4, 5, 6].includes(p.id)) return true;
            if (id === 7 && [7, 8, 9].includes(p.id)) return true;
            return false;
        });

        if (existingInfo) {
            // Load existing
            this.playerPokemon = new Pokemon(existingInfo.id, existingInfo.level);
            this.playerPokemon.hp = this.playerPokemon.maxHp;
            this.playerPokemon.exp = existingInfo.exp;
            this.playerPokemon.moves = existingInfo.moves;
            // Recalc stats just in case
            this.playerPokemon.levelUp(); this.playerPokemon.level--; // Hack to refresh stats? Or just Constructor does it. Constructor does it.
            alert(`${this.playerPokemon.name} (Lv.${this.playerPokemon.level}) がボックスから帰ってきた！`);
        } else {
            // New
            this.playerPokemon = new Pokemon(id, 5);
        }

        this.party = [this.playerPokemon]; // Init party for switching
        this.currentFloor = 1;
        this.startDungeonFloor();
    }

    startDungeonFloor() {
        this.showScreen('dungeon-screen');
        // Init dungeon
        this.dungeon = new Dungeon(this, this.currentFloor);
        this.updateDungeonUI();
    }

    updateDungeonUI() {
        if (!this.playerPokemon) return;
        document.getElementById('player-name').innerText = this.playerPokemon.name;
        document.getElementById('player-level').innerText = this.playerPokemon.level;
        document.getElementById('floor-display').innerText = this.currentFloor + '/9F';

        const hpPct = (this.playerPokemon.hp / this.playerPokemon.maxHp) * 100;
        document.getElementById('d-hp-fill').style.width = hpPct + '%';
        document.getElementById('player-hp-text').innerText = `${this.playerPokemon.hp}/${this.playerPokemon.maxHp}`;

        // Sprite
        const cvs = document.getElementById('dungeon-status-canvas');
        if (window.spriteLoader) {
            spriteLoader.drawToCanvas(cvs, this.playerPokemon.id);
        }

        // Secret Cheat: Triple tap to level up
        cvs.onclick = (e) => {
            const now = Date.now();
            if (!this.lastTapTime) this.lastTapTime = 0;
            if (!this.tapCount) this.tapCount = 0;

            if (now - this.lastTapTime < 1000) {
                this.tapCount++;
            } else {
                this.tapCount = 1;
            }
            this.lastTapTime = now;

            if (this.tapCount >= 3) {
                this.tapCount = 0;
                this.playerPokemon.gainExp(this.playerPokemon.expToNext - this.playerPokemon.exp);
                alert(`${this.playerPokemon.name} は 不思議な力でレベルアップした！ (Lv.${this.playerPokemon.level})`);
                this.updateDungeonUI();
            }
        };

        // Items
        document.getElementById('d-potion-count').innerText = `${this.items.potions}/${this.items.maxPotions}`;
        document.getElementById('d-ball-count').innerText = `${this.items.balls}/${this.items.maxBalls}`;
    }

    openSwitchMenu() {
        const overlay = document.getElementById('switch-overlay');
        const list = document.getElementById('switch-list');
        list.innerHTML = '';

        this.party.forEach((p, i) => {
            const row = document.createElement('div');
            row.style.background = '#333';
            row.style.padding = '8px';
            row.style.cursor = 'pointer';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '10px';
            row.style.border = '1px solid #555';

            // Tiny Canvas for sprite
            const canv = document.createElement('canvas');
            canv.width = 30; canv.height = 30;
            if (window.spriteLoader) spriteLoader.drawToCanvas(canv, p.id);

            const info = document.createElement('div');
            info.innerHTML = `<div>${p.name} Lv.${p.level}</div><div style="font-size:10px; color:#aaa;">HP: ${p.hp}/${p.maxHp}</div>`;

            row.appendChild(canv);
            row.appendChild(info);
            row.onclick = () => this.switchLeader(i);
            list.appendChild(row);
        });

        overlay.style.display = 'flex';
    }

    switchLeader(index) {
        if (this.party[index].hp <= 0) {
            alert("瀕死のポケモンには交代できません！");
            return;
        }
        this.playerPokemon = this.party[index];
        this.updateDungeonUI();
        document.getElementById('switch-overlay').style.display = 'none';

        // Also update Dungeon render immediately to show new sprite (though loop does it)
        if (this.dungeon) this.dungeon.render();
    }

    usePotionInDungeon() {
        if (this.items.potions <= 0) {
            alert("傷薬を持っていません！");
            return;
        }
        if (this.playerPokemon.hp >= this.playerPokemon.maxHp) {
            alert("HPは満タンです！");
            return;
        }

        const healAmount = Math.floor(this.playerPokemon.maxHp / 2);
        this.playerPokemon.heal(healAmount);
        this.items.potions--;
        this.updateDungeonUI();

        const msgLog = document.getElementById('dungeon-message');
        msgLog.innerText = `傷薬を使った！ HPが${healAmount}回復した！`;

        // Clear message after delay
        setTimeout(() => {
            msgLog.innerText = '';
        }, 2000);
    }

    // Called when 9F Gatekeeper defeated or stairs used
    onComponentsCleared() {
        // If Training Mode 9F cleared -> Victory -> Save to box -> Title
        if (this.mode === 'training' && this.currentFloor === 9) {
            this.completeTrainingRun();
        } else {
            this.currentFloor++;
            this.startDungeonFloor();
        }
    }

    completeTrainingRun() {
        alert('ダンジョン踏破！おめでとう！');
        this.saveToBox();
        this.showScreen('result-screen');
        document.getElementById('result-content').innerText = `${this.playerPokemon.name} は Lv.${this.playerPokemon.level} に成長してボックスに戻った！`;
    }

    onTrainingGameOver() {
        // Starter persists rule
        // Save state (Level, Exp) back to box?
        // Spec: "Starter levels are maintained even after game over"
        // So yes, we save.
        if (this.mode === 'training') {
            alert('力尽きてしまった... (しかし経験値は引き継がれます)');
            this.saveToBox();
            this.showScreen('title-screen');
        } else {
            // Gym Mode Loss
            alert('目の前が真っ暗になった...');
            this.showScreen('title-screen');
        }
    }

    saveToBox() {
        // Only if it's a starter or we want to save captured ones (not impld yet)
        this.saveManager.saveToBox(this.playerPokemon);
    }

    // --- Gym Mode Flow ---

    startGymSetup() {
        this.mode = 'gym';
        this.box = this.saveManager.getBox();
        this.party = [];
        this.renderPartySelect();
        this.showScreen('party-select-screen');
    }

    renderPartySelect() {
        // Box
        const boxGrid = document.getElementById('box-grid');
        boxGrid.innerHTML = '';
        this.box.forEach((pData, idx) => {
            const slot = document.createElement('div');
            slot.className = 'box-slot';

            // Check if already in party
            const alreadySelected = this.party.some(p => p.id === pData.id);

            // Create canvas for sprite
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            if (window.spriteLoader) {
                spriteLoader.drawToCanvas(canvas, pData.id);
            }
            slot.appendChild(canvas);

            // Add level indicator
            const levelDiv = document.createElement('div');
            levelDiv.style.fontSize = '10px';
            levelDiv.style.color = '#aaa';
            levelDiv.innerText = `Lv.${pData.level}`;
            slot.appendChild(levelDiv);

            if (alreadySelected) {
                slot.classList.add('selected');
                slot.style.opacity = '0.5';
                slot.style.cursor = 'not-allowed';
            } else {
                slot.onclick = () => this.moveToParty(idx);
            }

            boxGrid.appendChild(slot);
        });

        // Party
        const partyList = document.getElementById('party-list');
        partyList.innerHTML = '';
        this.party.forEach((p, idx) => {
            const slot = document.createElement('div');
            slot.className = 'party-slot';

            // Create canvas for sprite
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            canvas.style.marginRight = '10px';
            if (window.spriteLoader) {
                spriteLoader.drawToCanvas(canvas, p.id);
            }

            const info = document.createElement('div');
            info.innerHTML = `<span>${POKEMON_DATA[p.id].name} Lv.${p.level}</span>`;

            slot.appendChild(canvas);
            slot.appendChild(info);
            slot.onclick = () => this.removeFromParty(idx);
            partyList.appendChild(slot);
        });
    }

    moveToParty(boxIdx) {
        if (this.party.length >= 3) {
            alert("パーティは3体までです！");
            return;
        }
        const pData = this.box[boxIdx];

        // Check for duplicates
        if (this.party.some(p => p.id === pData.id)) {
            alert("同じポケモンは選択できません！");
            return;
        }

        const pokemon = new Pokemon(pData.id, pData.level);
        pokemon.exp = pData.exp;
        pokemon.moves = pData.moves;
        this.party.push(pokemon);
        this.renderPartySelect();
    }

    removeFromParty(partyIdx) {
        this.party.splice(partyIdx, 1);
        this.renderPartySelect();
    }

    startGymRun() {
        if (this.party.length === 0) {
            alert("ポケモンを選んでください！");
            return;
        }

        // Initialize gym progress
        this.gymLeaders = [153, 154, 155, 156, 157, 158, 159, 160];
        this.gymStage = 0; // Current gym leader index
        this.currentGymTeamIndex = 0; // Current Pokemon in leader's team

        // Load or reset progress
        const saved = localStorage.getItem('gymProgress');
        if (saved) {
            this.gymStage = parseInt(saved);
        }

        this.showGymProgress();
    }

    showGymProgress() {
        this.showScreen('gym-progress-screen');

        // Render all leader cards
        const cards = document.querySelectorAll('.gym-leader-card');
        cards.forEach((card, idx) => {
            const leaderId = parseInt(card.dataset.leaderId);
            const canvas = card.querySelector('.leader-sprite');
            const statusEl = card.querySelector('.leader-status');

            // Draw sprite
            if (window.spriteLoader) {
                spriteLoader.drawToCanvas(canvas, leaderId);
            }

            // Update status
            card.classList.remove('cleared', 'next');
            if (idx < this.gymStage) {
                card.classList.add('cleared');
                statusEl.innerText = 'CLEAR';
            } else if (idx === this.gymStage) {
                card.classList.add('next');
                statusEl.innerText = 'NEXT';
            } else {
                statusEl.innerText = '';
            }
        });

        // Auto-advance after 3 seconds
        if (this.gymAutoAdvanceTimer) {
            clearTimeout(this.gymAutoAdvanceTimer);
        }
        this.gymAutoAdvanceTimer = setTimeout(() => {
            this.startNextGymBattle();
        }, 3000);
    }

    startNextGymBattle() {
        if (this.gymStage >= this.gymLeaders.length) {
            alert("すべてのジムリーダーを倒しました！\n殿堂入りおめでとう！");
            localStorage.removeItem('gymProgress');
            this.showScreen('title-screen');
            return;
        }

        const leaderId = this.gymLeaders[this.gymStage];
        this.currentGymTeamIndex = 0;

        // Show pre-battle dialogue
        this.showGymDialogue(leaderId, "pre").then(() => {
            // Show battle intro message
            const leaderName = POKEMON_DATA[leaderId].name;
            alert(`ジムリーダーの${leaderName}が 勝負をしかけてきた！`);

            // Start first Pokemon battle
            this.startGymPokemonBattle();
        });
    }

    startGymPokemonBattle() {
        const leaderId = this.gymLeaders[this.gymStage];
        const team = GYM_LEADER_TEAMS[leaderId];

        if (this.currentGymTeamIndex >= team.length) {
            // Leader defeated!
            this.onGymLeaderDefeated();
            return;
        }

        // Get player's first alive Pokemon
        const valid = this.party.find(p => p.hp > 0);
        if (!valid) {
            this.onGymGameOver();
            return;
        }
        this.playerPokemon = valid;

        // Create enemy Pokemon from team data
        const enemyData = team[this.currentGymTeamIndex];
        const enemy = new Pokemon(enemyData.id, enemyData.level);

        // TOEIC Level mapping: Takeshi=2, Kasumi=3, ..., Sakaki=9
        const toeicLevel = this.gymStage + 2;

        this.battleManager.startBattle(this.playerPokemon, enemy, toeicLevel);
    }

    onGymPokemonVictory() {
        // Called by BattleManager when a gym Pokemon is defeated
        this.currentGymTeamIndex++;
        this.startGymPokemonBattle();
    }

    onGymLeaderDefeated() {
        // All Pokemon in leader's team defeated
        const leaderId = this.gymLeaders[this.gymStage];

        this.showGymDialogue(leaderId, "post").then(() => {
            this.gymStage++;
            localStorage.setItem('gymProgress', this.gymStage);

            // Return to progress screen
            this.showGymProgress();
        });
    }

    onGymGameOver() {
        alert('目の前が真っ暗になった...');
        localStorage.removeItem('gymProgress');
        this.showScreen('title-screen');
    }

    showGymDialogue(leaderId, type) {
        return new Promise(resolve => {
            const overlay = document.getElementById('dialogue-overlay');
            const nameEl = document.getElementById('dialogue-speaker');
            const textEl = document.getElementById('dialogue-text');

            overlay.style.display = 'flex';

            const leaderName = POKEMON_DATA[leaderId].name;
            nameEl.innerText = leaderName;

            const dialogue = GYM_LEADER_DIALOGUE[leaderId];
            const text = type === "pre" ? dialogue.pre : dialogue.post;
            textEl.innerText = text;

            const clickHandler = () => {
                overlay.style.display = 'none';
                overlay.removeEventListener('click', clickHandler);
                resolve();
            };
            overlay.addEventListener('click', clickHandler);
        });
    }

    showDialogue(leaderId, type) {
        return new Promise(resolve => {
            const overlay = document.getElementById('dialogue-overlay');
            const nameEl = document.getElementById('dialogue-speaker');
            const textEl = document.getElementById('dialogue-text');
            const nextEl = document.querySelector('.dialogue-next');

            overlay.style.display = 'flex';

            const leaderName = POKEMON_DATA[leaderId].name;
            nameEl.innerText = leaderName;

            let text = "";
            if (type === "pre") text = `I am ${leaderName}. Are you ready to test your English skills?`;
            else text = `Impressive! You have mastered this level. Proceed!`;

            textEl.innerText = text;

            const clickHandler = () => {
                overlay.style.display = 'none';
                overlay.removeEventListener('click', clickHandler);
                resolve();
            };
            overlay.addEventListener('click', clickHandler);
        });
    }

    // API for BattleManager to Switch Pokemon
    switchPokemonInBattle() {
        const currentIdx = this.party.indexOf(this.playerPokemon);
        const next = this.party.find((p, i) => i > currentIdx && p.hp > 0);
        if (next) {
            this.playerPokemon = next;
            return next;
        }
        return null;
    }

    // --- Battle Callbacks ---

    endBattle(won) {
        this.showScreen('dungeon-screen');
        this.updateDungeonUI(); // Update HP bar
        if (this.dungeon) {
            this.dungeon.resumeFromBattle(won);
        }
    }
}

// Global instance
let game;
window.onload = () => {
    game = new Game();
};
