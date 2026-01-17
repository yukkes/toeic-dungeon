
import { Component, onMount, createEffect, onCleanup } from 'solid-js';
import { state, setState } from '../store';

import POKEMON_JSON from '../data/pokemon.json';
import GYM_DATA_JSON from '../data/gym-data.json';
import { Pokemon } from '../game/Pokemon';
import { spriteLoader } from '../utils/SpriteLoader';

// We need data access. 
const GYM_TEAMS = (GYM_DATA_JSON as any).teams;
const GYM_DIALOGUE = (GYM_DATA_JSON as any).dialogue;
const POKEMON_DB = POKEMON_JSON as any;

const GymProgressScreen: Component = () => {
    // Stage: 1..8
    // Logic: Show Leader -> Dialogue -> Start Battle (App switch to BattleScreen)

    // We reuse BattleScreen but need to pass gym context. 
    // BattleScreen reads state.battle. So we setup state.battle here.

    // Gym IDs: 153 to 160
    const leaderId = 153 + (state.battle.gymStage || 0);
    const leaderName = POKEMON_DB[String(leaderId)]?.name || "Leader";

    // Dialogue
    const dialogue = GYM_DIALOGUE[String(leaderId)]?.pre || "行くぞ！";

    onMount(() => {
        // If we just won a pokemon battle, we might return here? 
        // Or BattleScreen handles sequence?
        // Original game: Game.js handles 'startGymPokemonBattle', 'onGymPokemonVictory'.

        // Let's assume this screen acts as the "Intermission/Cutscene" screen.
    });

    const startBattle = () => {
        // Setup first pokemon of leader
        const team = GYM_TEAMS[String(leaderId)];
        if (!team) {
            alert("Gym Data Error");
            return;
        }

        // We encounter the first pokemon not defeated yet.
        // We need to track which pokemon index we are on.
        const teamIndex = state.battle.gymTeamIndex || 0;
        if (teamIndex >= team.length) {
            // Already beat this leader?
            // Next leader logic should have triggered.
            nextLeader();
            return;
        }

        const enemyDef = team[teamIndex];
        const enemy = new Pokemon(enemyDef.id, enemyDef.level);

        setState('battle', {
            active: true,
            enemy: enemy,
            gymLeaderId: leaderId,
            message: `${leaderName} が勝負を仕掛けてきた！`,
            log: []
        });
        setState('screen', 'battle');
    };

    const nextLeader = () => {
        const nextStage = (state.battle.gymStage || 0) + 1;
        if (nextStage >= 8) {
            alert("殿堂入りおめでとう！(End of content)");
            setState('screen', 'title');
            return;
        }
        setState('battle', {
            gymStage: nextStage,
            gymTeamIndex: 0
        });
        // Rerender handled by reactivity
    };

    return (
        <div id="gym-progress-screen" class="screen active">
            <div class="gym-content">
                <h2>Gym Challenge: Stage {(state.battle.gymStage || 0) + 1}</h2>

                <div class="leader-portrait">
                    <CanvasSprite id={leaderId} scale={2} />
                </div>

                <div class="dialogue-box">
                    <h3>{leaderName}</h3>
                    <p>"{dialogue}"</p>
                </div>

                <div class="actions">
                    <button class="pixel-btn action-btn" onClick={startBattle}>
                        BATTLE START
                    </button>
                    <button class="pixel-btn menu-btn" onClick={() => setState('screen', 'title')}>
                        Give Up
                    </button>
                </div>
            </div>
        </div>
    );
};

const CanvasSprite: Component<{ id: number, scale?: number }> = (props) => {
    let canvasRef: HTMLCanvasElement | undefined;
    onMount(() => {
        if (canvasRef) spriteLoader.drawToCanvas(canvasRef, props.id);
    });
    return <canvas ref={canvasRef} width={128 * (props.scale || 1)} height={128 * (props.scale || 1)} />;
};

export default GymProgressScreen;
