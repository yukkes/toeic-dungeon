// TOEIC Questions Database

const TOEIC_QUESTIONS = [
    // Level 1-2: Basic Grammar (TOEIC 300-500)
    {
        id: 1,
        level: 1,
        question: "She ____ to school every day.",
        choices: [
            { text: "goes", move: "たいあたり", correct: true },
            { text: "go", move: "ひっかく", correct: false },
            { text: "going", move: "はたく", correct: false },
            { text: "went", move: "つるのムチ", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 2,
        level: 1,
        question: "I ____ a student.",
        choices: [
            { text: "am", move: "たいあたり", correct: true },
            { text: "is", move: "みずでっぽう", correct: false },
            { text: "are", move: "ひのこ", correct: false },
            { text: "be", move: "でんきショック", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 3,
        level: 2,
        question: "They ____ playing soccer now.",
        choices: [
            { text: "are", move: "バブルこうせん", correct: true },
            { text: "is", move: "たいあたり", correct: false },
            { text: "was", move: "ひっかく", correct: false },
            { text: "were", move: "はたく", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 4,
        level: 2,
        question: "He ____ his homework yesterday.",
        choices: [
            { text: "finished", move: "ひっかく", correct: true },
            { text: "finish", move: "たいあたり", correct: false },
            { text: "finishes", move: "つるのムチ", correct: false },
            { text: "finishing", move: "はっぱカッター", correct: false }
        ],
        category: "grammar"
    },

    // Level 3-4: Present Perfect & Vocabulary (TOEIC 500-600)
    {
        id: 5,
        level: 3,
        question: "She has ____ in Paris for 3 years.",
        choices: [
            { text: "lived", move: "はっぱカッター", correct: true },
            { text: "live", move: "たいあたり", correct: false },
            { text: "lives", move: "ひっかく", correct: false },
            { text: "living", move: "つるのムチ", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 6,
        level: 3,
        question: "The meeting will be ____ until next week.",
        choices: [
            { text: "postponed", move: "かえんほうしゃ", correct: true },
            { text: "advanced", move: "ひのこ", correct: false },
            { text: "promoted", move: "たいあたり", correct: false },
            { text: "prevented", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 7,
        level: 4,
        question: "Please ____ the report by Friday.",
        choices: [
            { text: "submit", move: "バブルこうせん", correct: true },
            { text: "submission", move: "みずでっぽう", correct: false },
            { text: "submitted", move: "たいあたり", correct: false },
            { text: "submitting", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 8,
        level: 4,
        question: "The conference room is ____ for the meeting.",
        choices: [
            { text: "available", move: "でんきショック", correct: true },
            { text: "busy", move: "たいあたり", correct: false },
            { text: "occupy", move: "ひっかく", correct: false },
            { text: "reserved", move: "つるのムチ", correct: false }
        ],
        category: "vocabulary"
    },

    // Level 5-6: Business English (TOEIC 600-700)
    {
        id: 9,
        level: 5,
        question: "We need to ____ our marketing strategy.",
        choices: [
            { text: "revise", move: "10まんボルト", correct: true },
            { text: "revision", move: "でんきショック", correct: false },
            { text: "revised", move: "たいあたり", correct: false },
            { text: "revising", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 10,
        level: 5,
        question: "The project was completed ____ schedule.",
        choices: [
            { text: "ahead of", move: "かえんほうしゃ", correct: true },
            { text: "behind", move: "ひのこ", correct: false },
            { text: "on", move: "たいあたり", correct: false },
            { text: "over", move: "ひっかく", correct: false }
        ],
        category: "idiom"
    },
    {
        id: 11,
        level: 6,
        question: "____ the circumstances, we decided to proceed.",
        choices: [
            { text: "Given", move: "ハイドロポンプ", correct: true },
            { text: "Give", move: "バブルこうせん", correct: false },
            { text: "Giving", move: "みずでっぽう", correct: false },
            { text: "Gave", move: "たいあたり", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 12,
        level: 6,
        question: "The CEO will ____ the new policy tomorrow.",
        choices: [
            { text: "announce", move: "ソーラービーム", correct: true },
            { text: "announcement", move: "つるのムチ", correct: false },
            { text: "announced", move: "はっぱカッター", correct: false },
            { text: "announcing", move: "たいあたり", correct: false }
        ],
        category: "vocabulary"
    },

    // Level 7-8: Advanced Grammar (TOEIC 700-800)
    {
        id: 13,
        level: 7,
        question: "Had I known earlier, I ____ differently.",
        choices: [
            { text: "would have acted", move: "サイコキネシス", correct: true },
            { text: "will act", move: "たいあたり", correct: false },
            { text: "acted", move: "ひっかく", correct: false },
            { text: "would act", move: "はたく", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 14,
        level: 7,
        question: "The proposal was ____ by the board members.",
        choices: [
            { text: "unanimously approved", move: "10まんボルト", correct: true },
            { text: "unanimous approved", move: "でんきショック", correct: false },
            { text: "unanimity approve", move: "たいあたり", correct: false },
            { text: "approve unanimously", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 15,
        level: 8,
        question: "The merger is ____ to create significant value.",
        choices: [
            { text: "anticipated", move: "かえんほうしゃ", correct: true },
            { text: "expecting", move: "ひのこ", correct: false },
            { text: "waited", move: "たいあたり", correct: false },
            { text: "hopeful", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 16,
        level: 8,
        question: "____ the deadline, we managed to complete the project.",
        choices: [
            { text: "Despite", move: "ハイドロポンプ", correct: true },
            { text: "Although", move: "バブルこうせん", correct: false },
            { text: "However", move: "みずでっぽう", correct: false },
            { text: "Because", move: "たいあたり", correct: false }
        ],
        category: "grammar"
    },

    // Level 9-10: Expert Level (TOEIC 800-900)
    {
        id: 17,
        level: 9,
        question: "The regulation ____ to ensure compliance.",
        choices: [
            { text: "has been implemented", move: "じしん", correct: true },
            { text: "implemented", move: "いわおとし", correct: false },
            { text: "implementing", move: "たいあたり", correct: false },
            { text: "implement", move: "ひっかく", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 18,
        level: 9,
        question: "The committee will ____ on the matter next month.",
        choices: [
            { text: "deliberate", move: "サイコキネシス", correct: true },
            { text: "deliberation", move: "たいあたり", correct: false },
            { text: "deliberated", move: "ひっかく", correct: false },
            { text: "deliberating", move: "はたく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 19,
        level: 10,
        question: "____ the provisions set forth, all parties must comply.",
        choices: [
            { text: "In accordance with", move: "ソーラービーム", correct: true },
            { text: "According", move: "つるのムチ", correct: false },
            { text: "In accord", move: "はっぱカッター", correct: false },
            { text: "Accordance to", move: "たいあたり", correct: false }
        ],
        category: "idiom"
    },
    {
        id: 20,
        level: 10,
        question: "The acquisition is ____ to regulatory approval.",
        choices: [
            { text: "contingent upon", move: "10まんボルト", correct: true },
            { text: "depend on", move: "でんきショック", correct: false },
            { text: "based in", move: "たいあたり", correct: false },
            { text: "relying to", move: "ひっかく", correct: false }
        ],
        category: "idiom"
    },

    // Additional questions for variety
    {
        id: 21,
        level: 3,
        question: "I have ____ finished my work.",
        choices: [
            { text: "just", move: "はっぱカッター", correct: true },
            { text: "yet", move: "たいあたり", correct: false },
            { text: "already", move: "ひっかく", correct: false },
            { text: "still", move: "つるのムチ", correct: false }
        ],
        category: "grammar"
    },
    {
        id: 22,
        level: 5,
        question: "We should ____ advantage of this opportunity.",
        choices: [
            { text: "take", move: "かえんほうしゃ", correct: true },
            { text: "make", move: "ひのこ", correct: false },
            { text: "get", move: "たいあたり", correct: false },
            { text: "have", move: "ひっかく", correct: false }
        ],
        category: "idiom"
    },
    {
        id: 23,
        level: 6,
        question: "The deadline has been ____ to next Friday.",
        choices: [
            { text: "extended", move: "バブルこうせん", correct: true },
            { text: "expanded", move: "みずでっぽう", correct: false },
            { text: "enlarged", move: "たいあたり", correct: false },
            { text: "increased", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 24,
        level: 7,
        question: "The team worked ____ to meet the deadline.",
        choices: [
            { text: "diligently", move: "10まんボルト", correct: true },
            { text: "diligent", move: "でんきショック", correct: false },
            { text: "diligence", move: "たいあたり", correct: false },
            { text: "more diligent", move: "ひっかく", correct: false }
        ],
        category: "vocabulary"
    },
    {
        id: 25,
        level: 8,
        question: "The contract is ____ to both parties.",
        choices: [
            { text: "binding", move: "サイコキネシス", correct: true },
            { text: "bound", move: "たいあたり", correct: false },
            { text: "bind", move: "ひっかく", correct: false },
            { text: "bounds", move: "はたく", correct: false }
        ],
        category: "vocabulary"
    }
];

// Get random question by level
function getQuestionByLevel(level) {
    const questionsAtLevel = TOEIC_QUESTIONS.filter(q => q.level === level);
    if (questionsAtLevel.length === 0) {
        // Fallback to closest level
        const allLevels = [...new Set(TOEIC_QUESTIONS.map(q => q.level))].sort((a, b) => a - b);
        const closestLevel = allLevels.reduce((prev, curr) =>
            Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
        );
        return TOEIC_QUESTIONS.filter(q => q.level === closestLevel)[0];
    }

    return questionsAtLevel[Math.floor(Math.random() * questionsAtLevel.length)];
}

// Get question difficulty based on floor
function getQuestionLevelForFloor(floor) {
    if (floor <= 2) return Math.floor(Math.random() * 2) + 1; // Level 1-2
    if (floor <= 4) return Math.floor(Math.random() * 2) + 3; // Level 3-4
    if (floor <= 6) return Math.floor(Math.random() * 2) + 5; // Level 5-6
    if (floor <= 8) return Math.floor(Math.random() * 2) + 7; // Level 7-8
    return Math.floor(Math.random() * 2) + 9; // Level 9-10
}
