class BattleManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.playerPokemon = null;
        this.enemyPokemon = null;
        this.currentQuestion = null;
        this.battleActive = false;

        // Bind UI
        this.uiQuestionArea = document.getElementById('question-area');
        this.uiMoveArea = document.getElementById('move-area');

        // Commands
        document.getElementById('btn-potion').onclick = () => this.usePotion();
        document.getElementById('btn-ball').onclick = () => this.attemptCapture();
        document.getElementById('btn-run').onclick = () => this.attemptRun();
    }

    usePotion() {
        if (!this.battleActive) return;
        if (this.game.items.potions <= 0) {
            this.showMessage("傷薬を持っていない！");
            return;
        }

        const firstBtn = document.querySelector('.choice-btn');
        if (firstBtn && firstBtn.style.pointerEvents === 'none') return;

        // Lock inputs
        this.lockInputs();

        // Heal 50% Max HP
        const healAmount = Math.floor(this.playerPokemon.maxHp / 2);
        this.playerPokemon.heal(healAmount);
        this.game.items.potions--;

        this.updateUI();
        this.showMessage(`傷薬を使った！ HPが回復した！ (残り: ${this.game.items.potions})`);

        setTimeout(() => {
            this.enemyTurn();
        }, 1000);
    }

    attemptCapture() {
        if (!this.battleActive) return;
        if (this.game.mode === 'gym') {
            this.showMessage("人のポケモンは捕まえられない！");
            return;
        }
        if (this.game.dungeon && this.game.dungeon.interactingEnemy && this.game.dungeon.interactingEnemy.isBoss) {
            this.showMessage("このポケモンは捕まえられない！");
            return;
        }
        if (this.game.items.balls <= 0) {
            this.showMessage("モンスターボールを持っていない！");
            return;
        }

        const firstBtn = document.querySelector('.choice-btn');
        if (firstBtn && firstBtn.style.pointerEvents === 'none') return;

        this.lockInputs();
        this.game.items.balls--;
        this.updateUI();

        this.showMessage("モンスターボールを投げた！");

        // Animation delay
        setTimeout(() => {
            // Capture Calc (Gen 1 style simplified)
            // Status not impl fully, just HP
            const max = this.enemyPokemon.maxHp;
            const curr = this.enemyPokemon.hp;
            // Rate: (3 * Max - 2 * Curr) * Rate / (3 * Max) ... roughly
            // Let's assume Rate for all is decent for now, say 100 base?
            // Simplified: Chance % = ((Max - Curr) / Max) * 0.8 + 0.2 (20% to 100%)
            // Actually let's make it easier.
            let chance = 0.3 + (1 - (curr / max)) * 0.6; // 30% at full, 90% at 0
            if (Math.random() < chance) {
                this.showMessage("やったー！ " + this.enemyPokemon.name + " を捕まえた！");
                setTimeout(() => {
                    this.victory(true);
                }, 1000);
            } else {
                this.showMessage("ああっ！ ボールから出てしまった！");
                setTimeout(() => {
                    this.enemyTurn();
                }, 1000);
            }
        }, 800);
    }

    lockInputs() {
        const btns = document.querySelectorAll('.choice-btn');
        btns.forEach(b => b.style.pointerEvents = 'none');
    }

    attemptRun() {
        if (!this.battleActive) return;
        // Simple input lock check
        const firstBtn = document.querySelector('.choice-btn');
        if (firstBtn && firstBtn.style.pointerEvents === 'none') return;

        if (this.game.mode === 'gym') {
            this.showMessage("トレーナー戦からは逃げられない！");
            return;
        }

        if (this.game.mode === 'training' && this.game.dungeon && this.game.dungeon.interactingEnemy && this.game.dungeon.interactingEnemy.isBoss) {
            this.showMessage("この戦いからは逃げられない！");
            return;
        }

        // Lock inputs
        const btns = document.querySelectorAll('.choice-btn');
        btns.forEach(b => b.style.pointerEvents = 'none');

        // Speed Check
        const playerSpeed = this.playerPokemon.speed;
        const enemySpeed = this.enemyPokemon.speed;

        let success = false;
        if (playerSpeed >= enemySpeed) success = true;
        else {
            // Chance: (PlayerSpeed * 128 / EnemySpeed + 30) % 256 logic simplified
            success = Math.random() < 0.5;
        }

        if (success) {
            this.showMessage("うまく逃げ切れた！");
            setTimeout(() => {
                this.battleActive = false;
                this.game.endBattle(true); // Treat as won (removes enemy) but no XP
            }, 1000);
        } else {
            this.showMessage("逃げられなかった！");
            setTimeout(() => {
                this.enemyTurn();
            }, 1000);
        }
    }


    startBattle(player, enemy, floor) {
        this.playerPokemon = player;
        this.enemyPokemon = enemy;
        this.battleActive = true;
        this.game.showScreen('battle-screen');

        // Draw
        if (window.spriteLoader) {
            spriteLoader.drawToCanvas(document.getElementById('player-sprite'), player.id);
            spriteLoader.drawToCanvas(document.getElementById('enemy-sprite'), enemy.id);
        }

        // Initial Question
        let qLevel = floor;
        this.currentQuestion = getQuestionByFloor(qLevel);

        this.updateUI();
        this.showMessage(`あ！ 野生の ${enemy.name} が飛び出してきた！`);

        // Show Question after brief delay
        setTimeout(() => {
            this.prepareTurn();
        }, 1500);
    }

    prepareTurn() {
        if (!this.battleActive) return;
        this.showMessage("どうする？ (正解を選んで技を繰り出そう！)");
        this.presentQuestion();
    }

    presentQuestion() {
        this.uiQuestionArea.style.display = 'block';
        this.uiMoveArea.style.display = 'none';

        document.getElementById('question-text').innerText = this.currentQuestion.question;
        const grid = document.querySelector('.choices-grid');
        grid.innerHTML = '';

        // Shuffle choices
        const choices = [...this.currentQuestion.choices].sort(() => Math.random() - 0.5);

        choices.forEach(c => {
            const btn = document.createElement('div');
            btn.className = 'choice-btn';
            btn.innerText = c.text;
            btn.onclick = () => this.handleAnswer(c, btn);
            grid.appendChild(btn);
        });
    }

    handleAnswer(choice, btnElement) {
        if (!this.battleActive) return;

        const btns = document.querySelectorAll('.choice-btn');
        btns.forEach(b => b.style.pointerEvents = 'none');

        if (choice.correct) {
            btnElement.classList.add('correct');
            this.showMessage("正解！最も威力の高い技で攻撃！");
            this.setupAutoMove(true);
        } else {
            btnElement.classList.add('wrong');
            btns.forEach(b => {
                if (this.currentQuestion.choices.find(c => c.text === b.innerText).correct) {
                    b.classList.add('correct');
                }
            });
            this.showMessage("不正解... 補助技しか出せない！");
            this.setupAutoMove(false);
        }
    }

    setupAutoMove(isCorrect) {
        setTimeout(() => {
            if (isCorrect) {
                // Pick Best Attack
                let bestMove = null;
                let maxDmg = -1;

                const attackMoves = this.playerPokemon.moves.filter(m => {
                    const d = MOVES[m];
                    return d && d.category !== 'status';
                });

                if (attackMoves.length === 0) {
                    bestMove = "たいあたり"; // Fallback
                } else {
                    attackMoves.forEach(m => {
                        const sim = calculateDamage(this.playerPokemon, this.enemyPokemon, m);
                        if (sim.damage > maxDmg) {
                            maxDmg = sim.damage;
                            bestMove = m;
                        }
                    });
                }
                this.playerTurn(bestMove);
            } else {
                // Pick Random Status
                const statusMoves = this.playerPokemon.moves.filter(m => {
                    const d = MOVES[m];
                    return d && d.category === 'status';
                });

                if (statusMoves.length === 0) {
                    this.showMessage("補助技を持っていない！ うまくいかなかった！");
                    setTimeout(() => this.enemyTurn(), 1000);
                } else {
                    const randomM = statusMoves[Math.floor(Math.random() * statusMoves.length)];
                    this.playerTurn(randomM);
                }
            }
        }, 800);
    }

    getStatNameJP(stat) {
        const map = {
            attack: "こうげき", defense: "ぼうぎょ", spAttack: "とくこう", spDefense: "とくぼう",
            speed: "すばやさ", accuracy: "めいちゅう", evasion: "かいひ"
        };
        return map[stat] || stat;
    }

    playerTurn(moveName) {
        this.uiMoveArea.style.display = 'none';

        this.showMessage(`${this.playerPokemon.name} の ${moveName}！`);

        if (window.spriteLoader) {
            spriteLoader.animateShake(document.getElementById('enemy-sprite'), this.enemyPokemon.id);
        }

        setTimeout(() => {
            let msg = "";
            let fainted = false;
            const mData = MOVES[moveName];

            if (mData && mData.category === 'status') {
                // Determine Target
                let target = this.enemyPokemon;
                if (mData.effect && mData.effect.amount > 0) target = this.playerPokemon; // Simple heuristic: Buffs are Self

                if (target.changeStage && mData.effect && mData.effect.stat) {
                    const changed = target.changeStage(mData.effect.stat, mData.effect.amount);
                    if (changed) {
                        const action = mData.effect.amount < 0 ? "さがった！" : "あがった！";
                        msg = `${target.name} の ${this.getStatNameJP(mData.effect.stat)} が ${action}`;
                    } else {
                        msg = "効果がないようだ...";
                    }
                } else if (mData.isParalyze) {
                    msg = `${target.name} は マヒしてしまった！(未実装)`;
                } else if (mData.isLeechSeed) {
                    msg = `${target.name} に 宿り木の種を植え付けた！(未実装)`;
                } else {
                    msg = "しかし うまくきまらなかった！";
                }
            } else {
                const result = calculateDamage(this.playerPokemon, this.enemyPokemon, moveName);
                fainted = this.enemyPokemon.takeDamage(result.damage);
                if (result.critical) msg += "急所にあたった！ ";
                msg += getEffectivenessMessage(result.effectiveness);
            }

            this.updateUI();
            if (msg) this.showMessage(msg);

            setTimeout(() => {
                if (fainted) {
                    this.victory();
                } else {
                    this.enemyTurn();
                }
            }, 1000);
        }, 500);
    }

    enemyTurn() {
        // Smart AI: Max Damage
        const moves = this.enemyPokemon.moves;
        let bestMove = moves[0];
        let maxDamage = -1;

        moves.forEach(m => {
            const data = MOVES[m];
            if (!data) return;
            if (data.category === 'status') {
                if (maxDamage < 0) {
                    maxDamage = 0;
                    bestMove = m;
                }
            } else {
                // Simulate
                const sim = calculateDamage(this.enemyPokemon, this.playerPokemon, m);
                if (sim.damage > maxDamage) {
                    maxDamage = sim.damage;
                    bestMove = m;
                }
            }
        });

        const moveName = bestMove;
        this.showMessage(`敵の ${this.enemyPokemon.name} の ${moveName}！`);

        if (window.spriteLoader) {
            spriteLoader.animateShake(document.getElementById('player-sprite'), this.playerPokemon.id);
        }

        setTimeout(() => {
            let msg = "";
            let fainted = false;
            const mData = MOVES[moveName];

            if (mData && mData.category === 'status') {
                // Determine Target
                let target = this.playerPokemon;
                if (mData.effect && mData.effect.amount > 0) target = this.enemyPokemon; // Buffs are Self

                if (target.changeStage && mData.effect && mData.effect.stat) {
                    const changed = target.changeStage(mData.effect.stat, mData.effect.amount);
                    if (changed) {
                        const action = mData.effect.amount < 0 ? "さがった！" : "あがった！";
                        msg = `${target.name} の ${this.getStatNameJP(mData.effect.stat)} が ${action}`;
                    } else {
                        msg = "効果がないようだ...";
                    }
                } else if (mData.isParalyze) {
                    msg = `${target.name} は マヒしてしまった！(未実装)`;
                } else if (mData.isLeechSeed) {
                    msg = `${target.name} に 宿り木の種を植え付けた！(未実装)`;
                } else {
                    msg = "しかし うまくきまらなかった！";
                }
            } else {
                const result = calculateDamage(this.enemyPokemon, this.playerPokemon, moveName);
                fainted = this.playerPokemon.takeDamage(result.damage);
                if (result.critical) msg += "急所にあたった！ ";
                msg += getEffectivenessMessage(result.effectiveness);
            }

            this.updateUI();
            if (msg) this.showMessage(msg);

            setTimeout(() => {
                if (fainted) {
                    this.defeat();
                } else {
                    if (this.game.mode === 'training') {
                        this.currentQuestion = getQuestionByFloor(this.game.currentFloor);
                    } else {
                        this.currentQuestion = getQuestionByFloor(10);
                    }
                    this.prepareTurn();
                }
            }, 1000);

        }, 500);
    }

    victory(captured = false) {
        this.battleActive = false;
        if (captured) {
            this.game.saveManager.saveToBox(this.enemyPokemon); // Save captured
            // Add to party if space available
            if (this.game.party.length < 6) {
                this.game.party.push(this.enemyPokemon);
                this.showMessage("手持ちに加わった！");
            } else {
                this.showMessage("ボックスに転送された！");
            }
        }

        const msg = captured ? "捕獲に成功した！" : "敵を倒した！";
        this.showMessage(msg);

        // Exp gain (only if killed? In Gen 1 yes, Gen 6+ no. Let's give XP only for kill for now to keep simple, or maybe half?)
        // Let's Skip XP for capture for MVP simplicity unless requested.

        let leveledUp = false;
        if (!captured) {
            const exp = Math.floor(this.enemyPokemon.baseStats.hp * this.enemyPokemon.level / 7) * 5;
            this.showMessage(`${exp} の経験値獲得！`);
            leveledUp = this.playerPokemon.gainExp(exp);
            this.updateUI(); // Visual update bar
        }

        setTimeout(() => {
            if (leveledUp) {
                alert(`${this.playerPokemon.name} は Lv${this.playerPokemon.level} になった！`);
            }

            // Return to Game Loop
            if (this.game.mode === 'training') {
                this.game.showScreen('dungeon-screen');
                if (!captured && this.enemyPokemon.id === 149 && this.game.currentFloor === 9) {
                    this.game.onComponentsCleared(); // Victory
                }
                this.game.endBattle(true);
            } else {
                // Gym - Continue to next Pokemon in leader's team
                this.game.onGymPokemonVictory();
            }
        }, 1000);
    }

    defeat() {
        this.battleActive = false;
        this.showMessage(`${this.playerPokemon.name} は倒れた...`);

        // Switch Pokemon? (Gym Mode)
        if (this.game.mode === 'gym') {
            const next = this.game.switchPokemonInBattle();
            if (next) {
                setTimeout(() => {
                    this.playerPokemon = next;
                    this.updateUI();
                    this.showMessage(`いけ！ ${next.name}！`);
                    setTimeout(() => this.prepareTurn(), 1000);
                }, 1500);
                return;
            }
        }

        // Game Over
        setTimeout(() => {
            this.game.onTrainingGameOver();
        }, 1500);
    }

    updateUI() {
        // Update Bars and Text
        document.getElementById('battle-player-name').innerText = this.playerPokemon.name;
        document.getElementById('battle-player-level').innerText = this.playerPokemon.level;
        document.getElementById('player-hp-val').innerText = this.playerPokemon.hp;
        document.getElementById('player-max-hp-val').innerText = this.playerPokemon.maxHp;
        document.getElementById('player-hp-fill').style.width = (this.playerPokemon.hp / this.playerPokemon.maxHp * 100) + "%";

        // Exp bar
        if (this.playerPokemon.expToNext) {
            const expPct = (this.playerPokemon.exp / this.playerPokemon.expToNext) * 100;
            const expFill = document.getElementById('player-exp-fill');
            if (expFill) expFill.style.width = expPct + "%";
        }

        document.getElementById('enemy-name').innerText = this.enemyPokemon.name;
        document.getElementById('enemy-level').innerText = this.enemyPokemon.level;
        document.getElementById('enemy-hp-fill').style.width = (this.enemyPokemon.hp / this.enemyPokemon.maxHp * 100) + "%";

        // Update Command Buttons with counts
        if (this.game.items) {
            const potLbl = document.getElementById('lbl-potion');
            const ballLbl = document.getElementById('lbl-ball');
            if (potLbl) potLbl.innerText = `傷薬(${this.game.items.potions})`;
            if (ballLbl) ballLbl.innerText = `ボール(${this.game.items.balls})`;
        }
    }

    showMessage(text) {
        document.getElementById('message-box').innerText = text;
    }
}
