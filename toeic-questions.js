// TOEIC Questions Database

const TOEIC_QUESTIONS = [
    // Level 1: Basic Grammar - Present/Past Tense (Start of 100+)
    { id: 101, level: 1, question: "She ____ to school every day.", choices: [{ text: "goes", correct: true }, { text: "go", correct: false }, { text: "going", correct: false }, { text: "went", correct: false }] },
    { id: 102, level: 1, question: "I ____ a student.", choices: [{ text: "am", correct: true }, { text: "is", correct: false }, { text: "are", correct: false }, { text: "be", correct: false }] },
    { id: 103, level: 1, question: "They ____ lunch at 12:00.", choices: [{ text: "eat", correct: true }, { text: "eats", correct: false }, { text: "eating", correct: false }, { text: "ate", correct: false }] },
    { id: 104, level: 1, question: "He ____ busy yesterday.", choices: [{ text: "was", correct: true }, { text: "is", correct: false }, { text: "were", correct: false }, { text: "will be", correct: false }] },
    { id: 105, level: 1, question: "We ____ tennis last Sunday.", choices: [{ text: "played", correct: true }, { text: "play", correct: false }, { text: "playing", correct: false }, { text: "plays", correct: false }] },
    { id: 106, level: 1, question: "____ you like coffee?", choices: [{ text: "Do", correct: true }, { text: "Are", correct: false }, { text: "Is", correct: false }, { text: "Does", correct: false }] },
    { id: 107, level: 1, question: "She ____ not have a car.", choices: [{ text: "does", correct: true }, { text: "do", correct: false }, { text: "is", correct: false }, { text: "has", correct: false }] },
    { id: 108, level: 1, question: "I am ____ music now.", choices: [{ text: "listening to", correct: true }, { text: "listen to", correct: false }, { text: "listened to", correct: false }, { text: "listens to", correct: false }] },
    { id: 109, level: 1, question: "The train ____ slowly.", choices: [{ text: "moves", correct: true }, { text: "move", correct: false }, { text: "moving", correct: false }, { text: "movement", correct: false }] },
    { id: 110, level: 1, question: "This book is ____.", choices: [{ text: "interesting", correct: true }, { text: "interest", correct: false }, { text: "interested", correct: false }, { text: "interests", correct: false }] },
    { id: 111, level: 1, question: "My father ____ at a bank.", choices: [{ text: "works", correct: true }, { text: "work", correct: false }, { text: "working", correct: false }, { text: "worked", correct: false }] },
    { id: 112, level: 1, question: "____ open the window.", choices: [{ text: "Don't", correct: true }, { text: "Not", correct: false }, { text: "No", correct: false }, { text: "Doesn't", correct: false }] },
    { id: 113, level: 1, question: "There ____ many books on the desk.", choices: [{ text: "are", correct: true }, { text: "is", correct: false }, { text: "was", correct: false }, { text: "be", correct: false }] },
    { id: 114, level: 1, question: "She ____ looks happy.", choices: [{ text: "always", correct: true }, { text: "every", correct: false }, { text: "very", correct: false }, { text: "much", correct: false }] },
    { id: 115, level: 1, question: "I usually ____ up at 7.", choices: [{ text: "get", correct: true }, { text: "gets", correct: false }, { text: "getting", correct: false }, { text: "got", correct: false }] },
    { id: 116, level: 1, question: "He ____ speak English well.", choices: [{ text: "can", correct: true }, { text: "is", correct: false }, { text: "does", correct: false }, { text: "has", correct: false }] },
    { id: 117, level: 1, question: "We ____ to the park tomorrow.", choices: [{ text: "will go", correct: true }, { text: "went", correct: false }, { text: "gone", correct: false }, { text: "goes", correct: false }] },
    { id: 118, level: 1, question: "Did you ____ him?", choices: [{ text: "see", correct: true }, { text: "saw", correct: false }, { text: "seen", correct: false }, { text: "seeing", correct: false }] },
    { id: 119, level: 1, question: "It is ____ today.", choices: [{ text: "raining", correct: true }, { text: "rain", correct: false }, { text: "rains", correct: false }, { text: "rained", correct: false }] },
    { id: 120, level: 1, question: "She is ____ than me.", choices: [{ text: "taller", correct: true }, { text: "tall", correct: false }, { text: "tallest", correct: false }, { text: "more tall", correct: false }] },

    // Level 2: Basic Grammar - Future/Progressive
    { id: 201, level: 2, question: "They ____ playing soccer now.", choices: [{ text: "are", correct: true }, { text: "is", correct: false }, { text: "was", correct: false }, { text: "were", correct: false }] },
    { id: 202, level: 2, question: "He ____ his homework yesterday.", choices: [{ text: "finished", correct: true }, { text: "finish", correct: false }, { text: "finishes", correct: false }, { text: "finishing", correct: false }] },
    { id: 203, level: 2, question: "I ____ visit my uncle next week.", choices: [{ text: "will", correct: true }, { text: "did", correct: false }, { text: "have", correct: false }, { text: "am", correct: false }] },
    { id: 204, level: 2, question: "Look at that ____ bird.", choices: [{ text: "flying", correct: true }, { text: "fly", correct: false }, { text: "flew", correct: false }, { text: "flown", correct: false }] },
    { id: 205, level: 2, question: "Do you enjoy ____?", choices: [{ text: "swimming", correct: true }, { text: "swim", correct: false }, { text: "swam", correct: false }, { text: "to swim", correct: false }] },
    { id: 206, level: 2, question: "Thank you for ____ me.", choices: [{ text: "inviting", correct: true }, { text: "invite", correct: false }, { text: "invited", correct: false }, { text: "invitation", correct: false }] },
    { id: 207, level: 2, question: "I want ____ to the movies.", choices: [{ text: "to go", correct: true }, { text: "going", correct: false }, { text: "go", correct: false }, { text: "gone", correct: false }] },
    { id: 208, level: 2, question: "It started ____.", choices: [{ text: "raining", correct: true }, { text: "rain", correct: false }, { text: "rains", correct: false }, { text: "rained", correct: false }] },
    { id: 209, level: 2, question: "He is good at ____.", choices: [{ text: "cooking", correct: true }, { text: "cook", correct: false }, { text: "cooked", correct: false }, { text: "to cook", correct: false }] },
    { id: 210, level: 2, question: "____ is my hobby.", choices: [{ text: "Reading", correct: true }, { text: "Read", correct: false }, { text: "Reads", correct: false }, { text: "Readed", correct: false }] },
    { id: 211, level: 2, question: "She stopped ____.", choices: [{ text: "crying", correct: true }, { text: "cry", correct: false }, { text: "cried", correct: false }, { text: "to cry", correct: false }] },
    { id: 212, level: 2, question: "Please ____ quiet.", choices: [{ text: "be", correct: true }, { text: "are", correct: false }, { text: "is", correct: false }, { text: "being", correct: false }] },
    { id: 213, level: 2, question: "Let's ____ together.", choices: [{ text: "go", correct: true }, { text: "going", correct: false }, { text: "goes", correct: false }, { text: "went", correct: false }] },
    { id: 214, level: 2, question: "How about ____ tea?", choices: [{ text: "drinking", correct: true }, { text: "drink", correct: false }, { text: "drank", correct: false }, { text: "to drink", correct: false }] },
    { id: 215, level: 2, question: "I ____ seen him before.", choices: [{ text: "have", correct: true }, { text: "has", correct: false }, { text: "did", correct: false }, { text: "was", correct: false }] },
    { id: 216, level: 2, question: "He has ____ to Japan.", choices: [{ text: "been", correct: true }, { text: "be", correct: false }, { text: "being", correct: false }, { text: "was", correct: false }] },
    { id: 217, level: 2, question: "Have you ____ sushi?", choices: [{ text: "eaten", correct: true }, { text: "eat", correct: false }, { text: "ate", correct: false }, { text: "eating", correct: false }] },
    { id: 218, level: 2, question: "This is the ____ movie.", choices: [{ text: "best", correct: true }, { text: "good", correct: false }, { text: "better", correct: false }, { text: "well", correct: false }] },
    { id: 219, level: 2, question: "Run ____ than him.", choices: [{ text: "faster", correct: true }, { text: "fast", correct: false }, { text: "fastest", correct: false }, { text: "more fast", correct: false }] },
    { id: 220, level: 2, question: "As ____ as possible.", choices: [{ text: "soon", correct: true }, { text: "sooner", correct: false }, { text: "soonest", correct: false }, { text: "early", correct: false }] },

    // Level 3: Intermediate Grammar (Perfect Tense/Passive)
    { id: 301, level: 3, question: "She has ____ in Paris for 3 years.", choices: [{ text: "lived", correct: true }, { text: "live", correct: false }, { text: "lives", correct: false }, { text: "living", correct: false }] },
    { id: 302, level: 3, question: "The window was ____ by him.", choices: [{ text: "broken", correct: true }, { text: "break", correct: false }, { text: "broke", correct: false }, { text: "breaking", correct: false }] },
    { id: 303, level: 3, question: "English is ____ in many countries.", choices: [{ text: "spoken", correct: true }, { text: "speak", correct: false }, { text: "spoke", correct: false }, { text: "speaking", correct: false }] },
    { id: 304, level: 3, question: "The letter ____ yesterday.", choices: [{ text: "was sent", correct: true }, { text: "is sent", correct: false }, { text: "sent", correct: false }, { text: "has sent", correct: false }] },
    { id: 305, level: 3, question: "The meeting will be ____ next week.", choices: [{ text: "held", correct: true }, { text: "hold", correct: false }, { text: "holding", correct: false }, { text: "holds", correct: false }] },
    { id: 306, level: 3, question: "I have ____ finished my work.", choices: [{ text: "just", correct: true }, { text: "yet", correct: false }, { text: "already", correct: false }, { text: "still", correct: false }] },
    { id: 307, level: 3, question: "He has not come ____.", choices: [{ text: "yet", correct: true }, { text: "just", correct: false }, { text: "already", correct: false }, { text: "still", correct: false }] },
    { id: 308, level: 3, question: "I ____ him since 2010.", choices: [{ text: "have known", correct: true }, { text: "know", correct: false }, { text: "knew", correct: false }, { text: "have knew", correct: false }] },
    { id: 309, level: 3, question: "If it ____, I will stay home.", choices: [{ text: "rains", correct: true }, { text: "rain", correct: false }, { text: "will rain", correct: false }, { text: "rained", correct: false }] },
    { id: 310, level: 3, question: "When I came home, he ____ TV.", choices: [{ text: "was watching", correct: true }, { text: "is watching", correct: false }, { text: "watches", correct: false }, { text: "watched", correct: false }] },
    { id: 311, level: 3, question: "I saw him ____ the street.", choices: [{ text: "crossing", correct: true }, { text: "crossed", correct: false }, { text: "to cross", correct: false }, { text: "crosses", correct: false }] },
    { id: 312, level: 3, question: "He made me ____ the room.", choices: [{ text: "clean", correct: true }, { text: "to clean", correct: false }, { text: "cleaning", correct: false }, { text: "cleaned", correct: false }] },
    { id: 313, level: 3, question: "I want you ____ here.", choices: [{ text: "to come", correct: true }, { text: "come", correct: false }, { text: "coming", correct: false }, { text: "came", correct: false }] },
    { id: 314, level: 3, question: "It is necessary for you ____ hard.", choices: [{ text: "to study", correct: true }, { text: "study", correct: false }, { text: "studying", correct: false }, { text: "studied", correct: false }] },
    { id: 315, level: 3, question: "This is the pen ____ I bought.", choices: [{ text: "which", correct: true }, { text: "who", correct: false }, { text: "where", correct: false }, { text: "what", correct: false }] },
    { id: 316, level: 3, question: "He is the man ____ lives next door.", choices: [{ text: "who", correct: true }, { text: "which", correct: false }, { text: "whom", correct: false }, { text: "whose", correct: false }] },
    { id: 317, level: 3, question: "This is the house ____ I was born.", choices: [{ text: "where", correct: true }, { text: "which", correct: false }, { text: "that", correct: false }, { text: "who", correct: false }] },
    { id: 318, level: 3, question: "I don't know ____ to do.", choices: [{ text: "what", correct: true }, { text: "how", correct: false }, { text: "why", correct: false }, { text: "which", correct: false }] },
    { id: 319, level: 3, question: "Tell me ____ to swim.", choices: [{ text: "how", correct: true }, { text: "what", correct: false }, { text: "who", correct: false }, { text: "where", correct: false }] },
    { id: 320, level: 3, question: "I am ____ in history.", choices: [{ text: "interested", correct: true }, { text: "interesting", correct: false }, { text: "interest", correct: false }, { text: "interests", correct: false }] },

    // Level 4: Business Vocabulary 1
    { id: 401, level: 4, question: "Please ____ the report by Friday.", choices: [{ text: "submit", correct: true }, { text: "submission", correct: false }, { text: "submitted", correct: false }, { text: "submitting", correct: false }] },
    { id: 402, level: 4, question: "The room is ____ for the meeting.", choices: [{ text: "available", correct: true }, { text: "availability", correct: false }, { text: "occupy", correct: false }, { text: "vacant", correct: false }] },
    { id: 403, level: 4, question: "The meeting will be ____ until next week.", choices: [{ text: "postponed", correct: true }, { text: "advanced", correct: false }, { text: "prevented", correct: false }, { text: "stopped", correct: false }] },
    { id: 404, level: 4, question: "He is in ____ of the sales department.", choices: [{ text: "charge", correct: true }, { text: "head", correct: false }, { text: "leader", correct: false }, { text: "top", correct: false }] },
    { id: 405, level: 4, question: "Please ____ the attached file.", choices: [{ text: "check", correct: true }, { text: "valid", correct: false }, { text: "look", correct: false }, { text: "inspection", correct: false }] },
    { id: 406, level: 4, question: "I would like to ____ an appointment.", choices: [{ text: "make", correct: true }, { text: "do", correct: false }, { text: "take", correct: false }, { text: "have", correct: false }] },
    { id: 407, level: 4, question: "The price ____ tax.", choices: [{ text: "includes", correct: true }, { text: "inclusive", correct: false }, { text: "including", correct: false }, { text: "include", correct: false }] },
    { id: 408, level: 4, question: "We need to ____ the cost.", choices: [{ text: "reduce", correct: true }, { text: "reduction", correct: false }, { text: "cheap", correct: false }, { text: "down", correct: false }] },
    { id: 409, level: 4, question: "The result was ____.", choices: [{ text: "disappointing", correct: true }, { text: "disappointed", correct: false }, { text: "disappoint", correct: false }, { text: "disappointment", correct: false }] },
    { id: 410, level: 4, question: "I ____ to hearing from you.", choices: [{ text: "look forward", correct: true }, { text: "looking forward", correct: false }, { text: "see forward", correct: false }, { text: "wait forward", correct: false }] },
    { id: 411, level: 4, question: "Please ____ out this form.", choices: [{ text: "fill", correct: true }, { text: "write", correct: false }, { text: "put", correct: false }, { text: "draw", correct: false }] },
    { id: 412, level: 4, question: "The store is ____ located.", choices: [{ text: "conveniently", correct: true }, { text: "convenient", correct: false }, { text: "convenience", correct: false }, { text: "near", correct: false }] },
    { id: 413, level: 4, question: "We offer a wide ____ of products.", choices: [{ text: "variety", correct: true }, { text: "vary", correct: false }, { text: "various", correct: false }, { text: "variation", correct: false }] },
    { id: 414, level: 4, question: "All employees must ____ the meeting.", choices: [{ text: "attend", correct: true }, { text: "attendance", correct: false }, { text: "attention", correct: false }, { text: "appear", correct: false }] },
    { id: 415, level: 4, question: "Please ____ your receipt.", choices: [{ text: "keep", correct: true }, { text: "stay", correct: false }, { text: "remain", correct: false }, { text: "wait", correct: false }] },
    { id: 416, level: 4, question: "The flight was ____ delayed.", choices: [{ text: "slightly", correct: true }, { text: "slight", correct: false }, { text: "few", correct: false }, { text: "small", correct: false }] },
    { id: 417, level: 4, question: "We ____ analyze the data.", choices: [{ text: "carefully", correct: true }, { text: "careful", correct: false }, { text: "care", correct: false }, { text: "caring", correct: false }] },
    { id: 418, level: 4, question: "He is a ____ worker.", choices: [{ text: "reliable", correct: true }, { text: "rely", correct: false }, { text: "reliability", correct: false }, { text: "reliably", correct: false }] },
    { id: 419, level: 4, question: "Access is ____ to staff only.", choices: [{ text: "restricted", correct: true }, { text: "restrict", correct: false }, { text: "restriction", correct: false }, { text: "restricting", correct: false }] },
    { id: 420, level: 4, question: "The annual ____ fee is $100.", choices: [{ text: "membership", correct: true }, { text: "member", correct: false }, { text: "members", correct: false }, { text: "main", correct: false }] },

    // Level 5: Business Vocabulary 2
    { id: 501, level: 5, question: "We need to ____ our marketing strategy.", choices: [{ text: "revise", correct: true }, { text: "revision", correct: false }, { text: "revised", correct: false }, { text: "revising", correct: false }] },
    { id: 502, level: 5, question: "The project was completed ____ schedule.", choices: [{ text: "ahead of", correct: true }, { text: "behind", correct: false }, { text: "on", correct: false }, { text: "over", correct: false }] },
    { id: 503, level: 5, question: "We should ____ advantage of this opportunity.", choices: [{ text: "take", correct: true }, { text: "make", correct: false }, { text: "get", correct: false }, { text: "have", correct: false }] },
    { id: 504, level: 5, question: "He is ____ for the error.", choices: [{ text: "responsible", correct: true }, { text: "responsibility", correct: false }, { text: "response", correct: false }, { text: "respond", correct: false }] },
    { id: 505, level: 5, question: "The ____ of the product is high.", choices: [{ text: "quality", correct: true }, { text: "qualify", correct: false }, { text: "qualification", correct: false }, { text: "quantity", correct: false }] },
    { id: 506, level: 5, question: "Please ____ that the meeting is cancelled.", choices: [{ text: "note", correct: true }, { text: "notice", correct: false }, { text: "notification", correct: false }, { text: "noting", correct: false }] },
    { id: 507, level: 5, question: "The ____ rate is increasing.", choices: [{ text: "unemployment", correct: true }, { text: "employ", correct: false }, { text: "employee", correct: false }, { text: "employer", correct: false }] },
    { id: 508, level: 5, question: "It is strictly ____.", choices: [{ text: "prohibited", correct: true }, { text: "prohibit", correct: false }, { text: "prohibition", correct: false }, { text: "ban", correct: false }] },
    { id: 509, level: 5, question: "We received a ____ from the client.", choices: [{ text: "complaint", correct: true }, { text: "complain", correct: false }, { text: "complaining", correct: false }, { text: "complex", correct: false }] },
    { id: 510, level: 5, question: "The device is ____ easy to use.", choices: [{ text: "extremely", correct: true }, { text: "extreme", correct: false }, { text: "extremity", correct: false }, { text: "extra", correct: false }] },
    { id: 511, level: 5, question: "He ____ as a manager.", choices: [{ text: "serves", correct: true }, { text: "service", correct: false }, { text: "server", correct: false }, { text: "serving", correct: false }] },
    { id: 512, level: 5, question: "We offer free ____.", choices: [{ text: "shipping", correct: true }, { text: "ship", correct: false }, { text: "shipped", correct: false }, { text: "shipment", correct: false }] },
    { id: 513, level: 5, question: "____ details, please contact us.", choices: [{ text: "For", correct: true }, { text: "To", correct: false }, { text: "At", correct: false }, { text: "By", correct: false }] },
    { id: 514, level: 5, question: "The rent includes ____.", choices: [{ text: "utilities", correct: true }, { text: "utilize", correct: false }, { text: "utility", correct: false }, { text: "using", correct: false }] },
    { id: 515, level: 5, question: "She is a ____ experienced teacher.", choices: [{ text: "highly", correct: true }, { text: "high", correct: false }, { text: "height", correct: false }, { text: "higer", correct: false }] },
    { id: 516, level: 5, question: "I ____ confirm the reservation.", choices: [{ text: "would like to", correct: true }, { text: "want", correct: false }, { text: "will", correct: false }, { text: "am", correct: false }] },
    { id: 517, level: 5, question: "The solution is ____ effective.", choices: [{ text: "cost", correct: true }, { text: "price", correct: false }, { text: "money", correct: false }, { text: "cash", correct: false }] },
    { id: 518, level: 5, question: "Please ____ your belongings.", choices: [{ text: "remove", correct: true }, { text: "move", correct: false }, { text: "removal", correct: false }, { text: "removing", correct: false }] },
    { id: 519, level: 5, question: "They ____ a press conference.", choices: [{ text: "held", correct: true }, { text: "opened", correct: false }, { text: "kept", correct: false }, { text: "did", correct: false }] },
    { id: 520, level: 5, question: "The demand ____ significantly.", choices: [{ text: "increased", correct: true }, { text: "increase", correct: false }, { text: "increasing", correct: false }, { text: "to increase", correct: false }] },

    // Level 6-10: Advanced/Expert (Selecting a few for brevity to reach 100)
    { id: 601, level: 6, question: "____ the circumstances, we decided to proceed.", choices: [{ text: "Given", correct: true }, { text: "Give", correct: false }, { text: "Giving", correct: false }, { text: "Gave", correct: false }] },
    { id: 602, level: 6, question: "The CEO will ____ the new policy.", choices: [{ text: "announce", correct: true }, { text: "announcement", correct: false }, { text: "announced", correct: false }, { text: "announcing", correct: false }] },
    { id: 603, level: 6, question: "The deadline has been ____.", choices: [{ text: "extended", correct: true }, { text: "expanded", correct: false }, { text: "enlarged", correct: false }, { text: "increased", correct: false }] },
    { id: 604, level: 7, question: "Had I known, I ____ differently.", choices: [{ text: "would have acted", correct: true }, { text: "will act", correct: false }, { text: "acted", correct: false }, { text: "would act", correct: false }] },
    { id: 605, level: 7, question: "The proposal was ____ approved.", choices: [{ text: "unanimously", correct: true }, { text: "unanimous", correct: false }, { text: "unanimity", correct: false }, { text: "unanimousness", correct: false }] },
    { id: 606, level: 7, question: "The team worked ____.", choices: [{ text: "diligently", correct: true }, { text: "diligent", correct: false }, { text: "diligence", correct: false }, { text: "more diligent", correct: false }] },
    { id: 607, level: 8, question: "The merger is ____ to create value.", choices: [{ text: "anticipated", correct: true }, { text: "expecting", correct: false }, { text: "waited", correct: false }, { text: "hopeful", correct: false }] },
    { id: 608, level: 8, question: "____ the deadline, we finished.", choices: [{ text: "Despite", correct: true }, { text: "Although", correct: false }, { text: "However", correct: false }, { text: "Because", correct: false }] },
    { id: 609, level: 8, question: "The contract is ____.", choices: [{ text: "binding", correct: true }, { text: "bound", correct: false }, { text: "bind", correct: false }, { text: "bounds", correct: false }] },
    { id: 610, level: 9, question: "The regulation ____ to ensure compliance.", choices: [{ text: "has been implemented", correct: true }, { text: "implemented", correct: false }, { text: "implementing", correct: false }, { text: "implement", correct: false }] },
    // ... Filling up to 10 more to reach a safe 100+ count
    { id: 611, level: 9, question: "The committee will ____.", choices: [{ text: "deliberate", correct: true }, { text: "deliberation", correct: false }, { text: "deliberated", correct: false }, { text: "deliberating", correct: false }] },
    { id: 612, level: 10, question: "____ the provisions, complying is must.", choices: [{ text: "In accordance with", correct: true }, { text: "According", correct: false }, { text: "In accord", correct: false }, { text: "Accordance to", correct: false }] },
    { id: 613, level: 10, question: "Acquisition is ____ to approval.", choices: [{ text: "contingent upon", correct: true }, { text: "depend on", correct: false }, { text: "based in", correct: false }, { text: "relying to", correct: false }] },
    { id: 614, level: 6, question: "Please ____ your receipt.", choices: [{ text: "retain", correct: true }, { text: "remain", correct: false }, { text: "stay", correct: false }, { text: "detain", correct: false }] },
    { id: 615, level: 6, question: "We specialize ____ software.", choices: [{ text: "in", correct: true }, { text: "on", correct: false }, { text: "at", correct: false }, { text: "of", correct: false }] },
    { id: 616, level: 7, question: "The event takes ____ annually.", choices: [{ text: "place", correct: true }, { text: "space", correct: false }, { text: "part", correct: false }, { text: "seat", correct: false }] },
    { id: 617, level: 7, question: "We are ____ to assist you.", choices: [{ text: "pleased", correct: true }, { text: "please", correct: false }, { text: "pleasant", correct: false }, { text: "pleasing", correct: false }] },
    { id: 618, level: 8, question: "The system is ____ maintenence.", choices: [{ text: "undergoing", correct: true }, { text: "undergone", correct: false }, { text: "undergo", correct: false }, { text: "undergoes", correct: false }] },
    { id: 619, level: 8, question: "Receipt is required for ____.", choices: [{ text: "reimbursement", correct: true }, { text: "reimburse", correct: false }, { text: "paying", correct: false }, { text: "payment", correct: false }] },
    { id: 620, level: 9, question: "It is ____ efficient.", choices: [{ text: "highly", correct: true }, { text: "high", correct: false }, { text: "higher", correct: false }, { text: "height", correct: false }] }
];

// Get random question by level (Simplified)
function getQuestionByLevel(level) {
    const questionsAtLevel = TOEIC_QUESTIONS.filter(q => q.level === level);
    if (questionsAtLevel.length === 0) {
        // fallback to mostly level 5
        const mid = TOEIC_QUESTIONS.filter(q => q.level === 5);
        return mid[Math.floor(Math.random() * mid.length)];
    }
    return questionsAtLevel[Math.floor(Math.random() * questionsAtLevel.length)];
}

// Get question difficulty based on floor
function getQuestionLevelForFloor(floor) {
    // Linear progression roughly
    const l = Math.min(10, Math.floor((floor - 1) / 5) + 1 + Math.floor(Math.random() * 2));
    return l;
}
