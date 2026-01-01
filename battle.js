// Battle System

class BattleManager {
    constructor() {
        this.playerPokemon = null;
        this.enemyPokemon = null;
        this.currentQuestion = null;
        this.pendingMove = null;
        this.bindEvents();
    }

    bindEvents() {
        // Bind new question panel run button
        const runBtn = document.getElementById('battle-run-btn');
        if (runBtn) runBtn.addEventListener('click', () => this.attemptRun());

        const ballBtn = document.getElementById('battle-ball-btn');
        if (ballBtn) ballBtn.addEventListener('click', () => this.attemptCatch());
    }

    startBattle(playerPokemon, enemyPokemon, floor) {
        this.playerPokemon = playerPokemon;
        this.enemyPokemon = enemyPokemon;
        this.battleActive = true;
        this.pendingMove = null;

        // Question level based on enemy level (1-10 -> Lv1, 11-20 -> Lv2, etc)
        let qLevel = Math.floor((enemyPokemon.level - 1) / 10) + 1;
        if (qLevel < 1) qLevel = 1;
        if (qLevel > 10) qLevel = 10;
        this.currentQuestion = getQuestionByLevel(qLevel);

        // Update UI
        this.updateBattleUI();
        this.showMessage(`野生の${this.enemyPokemon.name}が現れた！`);

        // Set Background
        if (typeof getTheme === 'function') {
            const theme = getTheme(floor);
            const container = document.querySelector('.battle-container');
            if (container) container.style.background = theme.battleBg;
        }

        // Draw sprites
        setTimeout(() => {
            spriteLoader.drawToCanvas(
                document.getElementById('player-sprite'),
                this.playerPokemon.id
            );
            spriteLoader.drawToCanvas(
                document.getElementById('enemy-sprite'),
                this.enemyPokemon.id
            );

            // Show question directly
            setTimeout(() => {
                this.displayQuestion();
                this.showMessage("正解を選んで攻撃！");
            }, 1000);
        }, 100);
    }

    updateBattleUI() {
        // Player stats
        document.getElementById('battle-player-name').textContent = this.playerPokemon.name;
        document.getElementById('battle-player-level').textContent = this.playerPokemon.level;
        document.getElementById('player-hp').textContent = this.playerPokemon.hp;
        document.getElementById('player-max-hp').textContent = this.playerPokemon.maxHp;

        const playerHpPercent = (this.playerPokemon.hp / this.playerPokemon.maxHp) * 100;
        const playerHpFill = document.getElementById('player-hp-fill');
        playerHpFill.style.width = playerHpPercent + '%';

        // Update HP bar color
        if (playerHpPercent > 50) {
            playerHpFill.className = 'hp-fill';
        } else if (playerHpPercent > 25) {
            playerHpFill.className = 'hp-fill medium';
        } else {
            playerHpFill.className = 'hp-fill low';
        }

        // Experience bar
        const expPercent = (this.playerPokemon.exp / this.playerPokemon.expToNext) * 100;
        document.getElementById('player-exp-fill').style.width = expPercent + '%';

        // Enemy stats
        document.getElementById('enemy-name').textContent = this.enemyPokemon.name;
        document.getElementById('enemy-level').textContent = this.enemyPokemon.level;
        document.getElementById('enemy-hp').textContent = this.enemyPokemon.hp;
        document.getElementById('enemy-max-hp').textContent = this.enemyPokemon.maxHp;

        const enemyHpPercent = (this.enemyPokemon.hp / this.enemyPokemon.maxHp) * 100;
        const enemyHpFill = document.getElementById('enemy-hp-fill');
        enemyHpFill.style.width = enemyHpPercent + '%';

        // Update HP bar color
        if (enemyHpPercent > 50) {
            enemyHpFill.className = 'hp-fill';
        } else if (enemyHpPercent > 25) {
            enemyHpFill.className = 'hp-fill medium';
        } else {
            enemyHpFill.className = 'hp-fill low';
        }

        // Update Ball Count
        const ballCount = document.getElementById('battle-ball-count');
        if (ballCount && window.game) {
            ballCount.textContent = window.game.stats.balls;
        }
    }

    attemptRun() {
        if (this.playerPokemon.speed >= this.enemyPokemon.speed || Math.random() > 0.3) {
            this.showMessage("うまく にげきれた！");
            setTimeout(() => {
                if (window.game) window.game.showScreen('dungeon-screen');
            }, 1000);
        } else {
            this.showMessage("にげられない！");
            setTimeout(() => {
                this.executeEnemyTurn();
            }, 1000);
        }
    }

    attemptCatch() {
        if (!window.game || window.game.stats.balls <= 0) {
            this.showMessage("モンスターボールを持っていない！");
            return;
        }

        window.game.stats.balls--;
        this.updateBattleUI();

        this.showMessage("モンスターボールを投げた！");

        // Chance increases as HP decreases (Min 10%, Max 100%)
        const chance = 0.1 + (0.9 * (1 - this.enemyPokemon.hp / this.enemyPokemon.maxHp));

        setTimeout(() => {
            if (Math.random() < chance) {
                this.battleActive = false;
                this.showMessage(`${this.enemyPokemon.name}を捕まえた！`);
                if (window.game) {
                    window.game.stats.totalBattles++;
                    window.game.addToParty(this.enemyPokemon); // Add to party
                    setTimeout(() => {
                        window.game.endBattle(true);
                    }, 2000);
                }
            } else {
                this.showMessage("捕まらなかった！");
                setTimeout(() => {
                    this.executeEnemyTurn();
                }, 1000);
            }
        }, 1000);
    }

    displayQuestion() {
        if (!this.currentQuestion) return;

        document.getElementById('question-text').textContent = this.currentQuestion.question;

        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';

        // Prepare choices (4 choices)
        let displayChoices = [...this.currentQuestion.choices];
        // Shuffle
        displayChoices.sort(() => Math.random() - 0.5);

        displayChoices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn pixel-btn';
            button.dataset.index = index; // Note: this index is for display array, but we need to track correctness

            const label = document.createElement('span');
            label.className = 'choice-label';
            label.textContent = String.fromCharCode(65 + index); // A, B

            const text = document.createElement('span');
            text.className = 'choice-text';
            text.textContent = choice.text;

            button.appendChild(label);
            button.appendChild(text);

            button.addEventListener('click', () => this.handleChoice(choice));

            choicesContainer.appendChild(button);
        });

        // Adjust grid for 2 choices if needed (CSS) logic handled by grid-template-columns: repeat(2, 1fr) works fine for 2 items.
    }

    handleChoice(choice) {
        const buttons = document.querySelectorAll('.choice-btn');

        buttons.forEach(btn => {
            btn.disabled = true;
            const btnText = btn.querySelector('.choice-text').textContent;

            if (btnText === choice.text) {
                btn.classList.add(choice.correct ? 'correct' : 'incorrect');
            }

            if (!choice.correct) {
                const correctC = this.currentQuestion.choices.find(c => c.correct);
                if (btn.querySelector('.choice-text').textContent === correctC.text) {
                    btn.classList.add('correct');
                }
            }
        });

        // Execute turn after a short delay to verify button color
        setTimeout(() => {
            if (choice.correct) {
                // Auto-select ATTACK move (physical/special)
                let attackMoves = this.playerPokemon.moves.filter(m => MOVES[m] && MOVES[m].category !== 'status');
                if (attackMoves.length === 0) attackMoves = this.playerPokemon.moves; // Fallback

                const randomMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
                this.executePlayerAttack(randomMove, "正解！ ");
            } else {
                // Incorrect answer -> Use Support Move
                if (window.game) window.game.stats.totalQuestions++;

                // Find status move (priority) or fallback
                let statusMoves = this.playerPokemon.moves.filter(m => MOVES[m] && MOVES[m].category === 'status');
                let moveName = "なきごえ"; // Default fallback
                if (statusMoves.length > 0) {
                    moveName = statusMoves[Math.floor(Math.random() * statusMoves.length)];
                }

                this.executeSupportMove(moveName, "不正解！ ");
            }
        }, 800);
    }

    executePlayerAttack(moveName, prefix = "") {
        const result = calculateDamage(this.playerPokemon, this.enemyPokemon, moveName);

        this.showMessage(`${prefix}${this.playerPokemon.name}の${moveName}！`);

        // Animate player sprite
        spriteLoader.animateShake(document.getElementById('enemy-sprite'), this.enemyPokemon.id);

        setTimeout(() => {
            const defeated = this.enemyPokemon.takeDamage(result.damage);

            let message = `${result.damage}のダメージ！ `;
            message += getEffectivenessMessage(result.effectiveness);

            this.showMessage(message);
            this.updateBattleUI();

            // Track stats
            if (window.game) {
                window.game.stats.totalQuestions++;
                window.game.stats.correctAnswers++;
            }

            if (defeated) {
                setTimeout(() => {
                    this.handleVictory();
                }, 1500);
            } else {
                setTimeout(() => {
                    this.executeEnemyTurn();
                }, 1500);
            }
        }, 800);
    }

    executeSupportMove(moveName, prefix = "") {
        const move = MOVES[moveName];
        this.showMessage(`${prefix}${this.playerPokemon.name}の${moveName}！`);

        // Visual shake
        spriteLoader.animateShake(document.getElementById('enemy-sprite'), this.enemyPokemon.id);

        setTimeout(() => {
            // Apply effect if method exists
            if (move && move.effect && this.enemyPokemon.changeStage) {
                const changed = this.enemyPokemon.changeStage(move.effect.stat, move.effect.amount);
                if (changed) {
                    let text = move.effect.amount < 0 ? "さがった！" : "あがった！";
                    // JP Stat names
                    const statsJP = { attack: "こうげき", defense: "ぼうぎょ", spAttack: "とくこう", spDefense: "とくぼう", speed: "すばやさ" };
                    const statName = statsJP[move.effect.stat] || move.effect.stat;

                    this.showMessage(`${this.enemyPokemon.name}の${statName}が${text}`);
                } else {
                    this.showMessage("しかし うまくきまらなかった！");
                }
            } else {
                this.showMessage("しかし うまくきまらなかった！");
            }

            setTimeout(() => {
                this.executeEnemyTurn();
            }, 1500);
        }, 800);
    }

    executeEnemyTurn() {
        // AI prioritizes attacks
        let attackMoves = this.enemyPokemon.moves.filter(m => MOVES[m] && MOVES[m].category !== 'status');
        // If empty (only status moves?), use all moves or fallback
        if (attackMoves.length === 0) attackMoves = this.enemyPokemon.moves;
        if (attackMoves.length === 0) attackMoves = ["たいあたり"];

        const moveName = attackMoves[Math.floor(Math.random() * attackMoves.length)];

        const result = calculateDamage(this.enemyPokemon, this.playerPokemon, moveName);

        this.showMessage(`${this.enemyPokemon.name}の${moveName}！`);

        // Animate enemy sprite
        spriteLoader.animateShake(document.getElementById('player-sprite'), this.playerPokemon.id);

        setTimeout(() => {
            const defeated = this.playerPokemon.takeDamage(result.damage);

            // Should be 0 if status move like なきごえ but calculateDamage handles it (returns 1 min for now)
            // Ideally non-damaging moves deal 0. current impl deals min 1.
            // Good enough for MVP.

            let message = `${result.damage}のダメージ！ `;
            message += getEffectivenessMessage(result.effectiveness);

            this.showMessage(message);
            this.updateBattleUI();

            if (defeated) {
                setTimeout(() => {
                    this.handleDefeat();
                }, 1500);
            } else {
                // New question for next turn?
                // New question for next round?
                setTimeout(() => {
                    // Update question for next round
                    let qLevel = Math.floor((this.enemyPokemon.level - 1) / 10) + 1;
                    if (qLevel < 1) qLevel = 1;
                    if (qLevel > 10) qLevel = 10;
                    this.currentQuestion = getQuestionByLevel(qLevel);

                    this.displayQuestion();
                    this.showMessage("正解を選んで攻撃！");
                }, 1500);
            }
        }, 800);
    }

    handleVictory() {
        this.battleActive = false;

        // Calculate exp
        const expGained = Math.floor(this.enemyPokemon.level * 50 * 1.5);
        this.playerPokemon.gainExp(expGained);

        this.showMessage(`${this.enemyPokemon.name}を倒した！ ${expGained}の経験値を獲得！`);

        // Track stats
        if (window.game) {
            window.game.stats.totalBattles++;
        }

        // Check for level up
        setTimeout(() => {
            this.updateBattleUI();

            setTimeout(() => {
                if (window.game) {
                    window.game.endBattle(true);
                }
            }, 2000);
        }, 1500);
    }

    handleDefeat() {
        this.battleActive = false;
        this.showMessage(`${this.playerPokemon.name}は倒れた...`);

        setTimeout(() => {
            if (window.game) {
                window.game.gameOver();
            }
        }, 2000);
    }

    showMessage(message) {
        document.getElementById('message-log').textContent = message;
    }
}
