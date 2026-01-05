import { Component } from 'solid-js';
import { setState, saveManager } from '../store';

const TitleScreen: Component = () => {
    const startTraining = () => {
        // Ideally check for existing run, but for now New Game
        saveManager.clearRun(); // Clear old run
        setState({ mode: 'training', screen: 'starter' });
    };

    const startGym = () => {
        setState({ mode: 'gym', screen: 'party-select' });
    };

    return (
        <div id="title-screen" class="screen active">
            <h1 class="game-title">MoeMon Tower</h1>
            <p class="subtitle" style={{ "text-align": "center", "margin-bottom": "20px" }}>TOEIC & Dungeon & Battle</p>

            <div class="menu">
                <button class="pixel-btn" onClick={startTraining}>
                    <div>
                        <span class="main">特訓モード</span>
                        <div style={{ "font-size": "10px" }}>Training Mode</div>
                    </div>
                </button>

                <button class="pixel-btn" onClick={startGym}>
                    <div>
                        <span class="main">ジム攻略</span>
                        <div style={{ "font-size": "10px" }}>Gym Challenge</div>
                    </div>
                </button>
            </div>
        </div>
    );
};
export default TitleScreen;
