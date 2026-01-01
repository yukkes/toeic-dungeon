// TOEIC Questions Database
// IDs: 100-199: Level 1 (Floors 1)
// IDs: 200-299: Level 2 (Floors 2)
// ...
// IDs: 900-999: Level 9 (Floors 9)

const TOEIC_QUESTIONS = [
    // --- Level 1 (100-199) ---
    { id: 101, level: 1, question: "She ____ to school every day.", choices: [{ text: "goes", correct: true }, { text: "go", correct: false }, { text: "going", correct: false }, { text: "went", correct: false }] },
    { id: 102, level: 1, question: "I ____ a student.", choices: [{ text: "am", correct: true }, { text: "is", correct: false }, { text: "are", correct: false }, { text: "be", correct: false }] },
    { id: 103, level: 1, question: "They ____ lunch at 12:00.", choices: [{ text: "eat", correct: true }, { text: "eats", correct: false }, { text: "eating", correct: false }, { text: "ate", correct: false }] },
    { id: 104, level: 1, question: "He ____ busy yesterday.", choices: [{ text: "was", correct: true }, { text: "is", correct: false }, { text: "were", correct: false }, { text: "will be", correct: false }] },
    { id: 105, level: 1, question: "We ____ tennis last Sunday.", choices: [{ text: "played", correct: true }, { text: "play", correct: false }, { text: "playing", correct: false }, { text: "plays", correct: false }] },

    // --- Level 2 (200-299) ---
    { id: 201, level: 2, question: "They ____ playing soccer now.", choices: [{ text: "are", correct: true }, { text: "is", correct: false }, { text: "was", correct: false }, { text: "were", correct: false }] },
    { id: 202, level: 2, question: "He ____ his homework yesterday.", choices: [{ text: "finished", correct: true }, { text: "finish", correct: false }, { text: "finishes", correct: false }, { text: "finishing", correct: false }] },
    { id: 203, level: 2, question: "I ____ visit my uncle next week.", choices: [{ text: "will", correct: true }, { text: "did", correct: false }, { text: "have", correct: false }, { text: "am", correct: false }] },

    // --- Level 3 (300-399) ---
    { id: 301, level: 3, question: "She has ____ in Paris for 3 years.", choices: [{ text: "lived", correct: true }, { text: "live", correct: false }, { text: "lives", correct: false }, { text: "living", correct: false }] },
    { id: 302, level: 3, question: "The window was ____ by him.", choices: [{ text: "broken", correct: true }, { text: "break", correct: false }, { text: "broke", correct: false }, { text: "breaking", correct: false }] },

    // --- Level 4 (400-499) ---
    { id: 401, level: 4, question: "Please ____ the report by Friday.", choices: [{ text: "submit", correct: true }, { text: "submission", correct: false }, { text: "submitted", correct: false }, { text: "submitting", correct: false }] },
    { id: 402, level: 4, question: "The room is ____ for the meeting.", choices: [{ text: "available", correct: true }, { text: "availability", correct: false }, { text: "occupy", correct: false }, { text: "vacant", correct: false }] },

    // --- Level 5 (500-599) ---
    { id: 501, level: 5, question: "We need to ____ our marketing strategy.", choices: [{ text: "revise", correct: true }, { text: "revision", correct: false }, { text: "revised", correct: false }, { text: "revising", correct: false }] },
    { id: 502, level: 5, question: "The project was completed ____ schedule.", choices: [{ text: "ahead of", correct: true }, { text: "behind", correct: false }, { text: "on", correct: false }, { text: "over", correct: false }] },

    // --- Level 6 (600-699) ---
    { id: 601, level: 6, question: "____ the circumstances, we decided to proceed.", choices: [{ text: "Given", correct: true }, { text: "Give", correct: false }, { text: "Giving", correct: false }, { text: "Gave", correct: false }] },
    { id: 602, level: 6, question: "The CEO will ____ the new policy.", choices: [{ text: "announce", correct: true }, { text: "announcement", correct: false }, { text: "announced", correct: false }, { text: "announcing", correct: false }] },

    // --- Level 7 (700-799) ---
    { id: 701, level: 7, question: "Had I known, I ____ differently.", choices: [{ text: "would have acted", correct: true }, { text: "will act", correct: false }, { text: "acted", correct: false }, { text: "would act", correct: false }] },
    { id: 702, level: 7, question: "The proposal was ____ approved.", choices: [{ text: "unanimously", correct: true }, { text: "unanimous", correct: false }, { text: "unanimity", correct: false }, { text: "unanimousness", correct: false }] },

    // --- Level 8 (800-899) ---
    { id: 801, level: 8, question: "The merger is ____ to create value.", choices: [{ text: "anticipated", correct: true }, { text: "expecting", correct: false }, { text: "waited", correct: false }, { text: "hopeful", correct: false }] },
    { id: 802, level: 8, question: "____ the deadline, we finished.", choices: [{ text: "Despite", correct: true }, { text: "Although", correct: false }, { text: "However", correct: false }, { text: "Because", correct: false }] },

    // --- Level 9 (900-999) ---
    { id: 901, level: 9, question: "The regulation ____ to ensure compliance.", choices: [{ text: "has been implemented", correct: true }, { text: "implemented", correct: false }, { text: "implementing", correct: false }, { text: "implement", correct: false }] },
    { id: 902, level: 9, question: "The committee will ____.", choices: [{ text: "deliberate", correct: true }, { text: "deliberation", correct: false }, { text: "deliberated", correct: false }, { text: "deliberating", correct: false }] }
];

// Helper to fill gaps with dummy data for testing
function generateDummyQuestions() {
    for (let level = 1; level <= 9; level++) {
        const startId = level * 100;
        const count = TOEIC_QUESTIONS.filter(q => q.level === level).length;
        if (count < 5) {
            for (let i = 0; i < 5; i++) {
                TOEIC_QUESTIONS.push({
                    id: startId + 50 + i, // Offset to avoid collision
                    level: level,
                    question: `(Dummy Level ${level}) Question #${i + 1}`,
                    choices: [
                        { text: "Correct", correct: true },
                        { text: "Wrong 1", correct: false },
                        { text: "Wrong 2", correct: false },
                        { text: "Wrong 3", correct: false }
                    ]
                });
            }
        }
    }
}
generateDummyQuestions();

// Get random question for a specific floor (1-9)
function getQuestionByFloor(floor) {
    // Floor 1 -> Level 1 (100)
    // Floor 9 -> Level 9 (900)
    // Cap at 9 if floor > 9 (unlikely in this spec but safe)
    let level = floor;
    if (level < 1) level = 1;
    if (level > 9) level = 9;

    const questions = TOEIC_QUESTIONS.filter(q => q.level === level);
    if (questions.length === 0) {
        // Fallback
        return TOEIC_QUESTIONS[0];
    }
    return questions[Math.floor(Math.random() * questions.length)];
}

// Legacy support if needed
function getQuestionByLevel(level) {
    return getQuestionByFloor(level);
}
