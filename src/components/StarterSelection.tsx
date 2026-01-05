import { Component, createSignal, onMount } from 'solid-js';
import { setState } from '../store';
import { Pokemon } from '../game/Pokemon';
import { spriteLoader } from '../utils/SpriteLoader';

const starters = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle

const StarterSelection: Component = () => {
    const [selectedId, setSelectedId] = createSignal<number | null>(null);

    // Setup preview pokemons for display
    const starterPokemons = starters.map(id => new Pokemon(id, 5));

    const handleConfirm = () => {
        const id = selectedId();
        if (!id) return;

        const p = new Pokemon(id, 5);
        setState({
            player: p,
            party: [p], // Player is also in party
            screen: 'dungeon',
            currentFloor: 1,
            items: { potions: 2, maxPotions: 5, balls: 2, maxBalls: 5 }
        });
    };

    return (
        <div class="screen starter-screen active">
            <h2 class="screen-title">パートナーを選ぼう</h2>
            <p style={{ "text-align": "center", "margin": "0" }}>一緒に冒険するポケモンを選んでください</p>

            <div class="starter-container">
                {starterPokemons.map(p => (
                    <button
                        class={`starter-card ${selectedId() === p.id ? 'selected' : ''}`}
                        onClick={() => setSelectedId(p.id)}
                        style={{ "flex-direction": "column" }}
                    >
                        <div style={{ "color": "white", "font-weight": "bold" }}>{p.name}</div>
                        <div class="sprite-preview">
                            {/* We use a specialized canvas component or just ref effects. 
                    Simple ref approach here for brevity. */}
                            <CanvasSprite id={p.id} />
                        </div>
                        <div class="type-badges">
                            <span class={`badge ${p.type1}`}>{p.type1}</span>
                            {p.type2 && <span class={`badge ${p.type2}`}>{p.type2}</span>}
                        </div>
                    </button>
                ))}
            </div>

            <div class="actions" style={{ "text-align": "center", "margin-top": "20px", "margin-bottom": "10px", "display": "flex", "justify-content": "center", "gap": "10px" }}>
                <button
                    class="pixel-btn"
                    onClick={() => setState('screen', 'title')}
                >
                    戻る
                </button>
                <button
                    class="pixel-btn action-btn"
                    disabled={!selectedId()}
                    onClick={handleConfirm}
                >
                    冒険を始める
                </button>
            </div>
        </div>
    );
};

const CanvasSprite: Component<{ id: number }> = (props) => {
    let canvasRef: HTMLCanvasElement | undefined;

    onMount(() => {
        if (canvasRef) {
            spriteLoader.drawToCanvas(canvasRef, props.id);
        }
    });

    return <canvas ref={canvasRef} width="96" height="96" />;
};

export default StarterSelection;
