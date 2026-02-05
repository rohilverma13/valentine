// ==========================================
// Valentine's Day Interactive Website
// ==========================================

// Screen Management
const screens = {
    intro: document.getElementById('screen-intro'),
    catch: document.getElementById('screen-catch'),
    matchIntro: document.getElementById('screen-match-intro'),
    memory: document.getElementById('screen-memory'),
    message: document.getElementById('screen-message'),
    question: document.getElementById('screen-question')
};

let currentScreen = 'intro';

function showScreen(screenName) {
    // Hide current screen
    screens[currentScreen].classList.remove('active');

    // Show new screen after brief delay
    setTimeout(() => {
        screens[screenName].classList.add('active');
        currentScreen = screenName;

        // Initialize screen-specific content
        if (screenName === 'catch') {
            initCatchGame();
        } else if (screenName === 'matchIntro') {
            // Auto-advance to memory game after showing "match these"
            setTimeout(() => showScreen('memory'), 1500);
        } else if (screenName === 'memory') {
            initMemoryGame();
        }
    }, 500);
}

// ==========================================
// Floating Hearts Background
// ==========================================
function createFloatingHearts() {
    const container = document.getElementById('heartsBg');
    const hearts = ['💕', '💗', '💖', '💝', '❤️', '💓'];

    function spawnHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
        heart.style.fontSize = (Math.random() * 15 + 15) + 'px';
        container.appendChild(heart);

        // Remove after animation
        setTimeout(() => heart.remove(), 13000);
    }

    // Initial hearts
    for (let i = 0; i < 10; i++) {
        setTimeout(spawnHeart, i * 300);
    }

    // Continuous hearts
    setInterval(spawnHeart, 1500);
}

// ==========================================
// Screen 1: Intro with Typewriter Effect
// ==========================================
function initIntro() {
    const text = "Hi Leslie, hope you enjoy baby😘";
    const element = document.getElementById('introText');
    const tapPrompt = document.getElementById('tapPrompt');
    let index = 0;

    function typeWriter() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 80);
        } else {
            // Show tap prompt after typing completes
            setTimeout(() => {
                tapPrompt.classList.add('visible');
            }, 500);
        }
    }

    typeWriter();

    // Click to advance
    screens.intro.addEventListener('click', () => {
        if (tapPrompt.classList.contains('visible')) {
            showScreen('catch');
        }
    });
}

// ==========================================
// Screen 2: Catch Falling Hearts Game
// ==========================================
let catchGame = {
    canvas: null,
    ctx: null,
    basket: { x: 0, y: 0, width: 120, height: 80 },
    hearts: [],
    score: 0,
    gameRunning: false,
    animationId: null
};

function initCatchGame() {
    const canvas = document.getElementById('catchCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    catchGame.canvas = canvas;
    catchGame.ctx = ctx;
    catchGame.score = 0;
    catchGame.hearts = [];
    catchGame.gameRunning = true;

    // Position basket
    catchGame.basket.x = canvas.width / 2 - catchGame.basket.width / 2;
    catchGame.basket.y = canvas.height - 100;

    document.getElementById('catchScore').textContent = '0';
    document.getElementById('catchWinMessage').classList.remove('show');

    // Touch/Mouse controls
    function moveBasket(clientX) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        catchGame.basket.x = Math.max(0, Math.min(canvas.width - catchGame.basket.width, x - catchGame.basket.width / 2));
    }

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        moveBasket(e.touches[0].clientX);
    }, { passive: false });

    canvas.addEventListener('mousemove', (e) => {
        moveBasket(e.clientX);
    });

    // Start game loop
    spawnHearts();
    gameLoop();
}

function spawnHearts() {
    if (!catchGame.gameRunning) return;

    const isBadHeart = Math.random() < 0.2; // 20% chance of bad heart
    const goodEmojis = ['💕', '💗', '💖', '💝', '❤️', '💓'];

    const heart = {
        x: Math.random() * (catchGame.canvas.width - 40) + 20,
        y: -40,
        speed: Math.random() * 2 + 2,
        type: isBadHeart ? 'bad' : 'good',
        emoji: isBadHeart ? '💔' : goodEmojis[Math.floor(Math.random() * goodEmojis.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02
    };

    catchGame.hearts.push(heart);

    // Spawn next heart
    setTimeout(spawnHearts, Math.random() * 800 + 500);
}

function gameLoop() {
    if (!catchGame.gameRunning) return;

    const { ctx, canvas, basket, hearts } = catchGame;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw basket
    ctx.font = '85px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🧺', basket.x + basket.width / 2, basket.y + basket.height);

    // Update and draw hearts
    for (let i = hearts.length - 1; i >= 0; i--) {
        const heart = hearts[i];

        // Update position
        heart.y += heart.speed;
        heart.wobble += heart.wobbleSpeed;
        const wobbleX = Math.sin(heart.wobble) * 20;

        // Draw heart
        ctx.font = '60px Arial';
        ctx.fillText(heart.emoji, heart.x + wobbleX, heart.y);

        // Check collision with basket
        if (heart.y > basket.y - 20 && heart.y < basket.y + basket.height &&
            heart.x + wobbleX > basket.x && heart.x + wobbleX < basket.x + basket.width) {

            if (heart.type === 'good') {
                catchGame.score++;
                document.getElementById('catchScore').textContent = catchGame.score;

                // Check win condition
                if (catchGame.score >= 1) {
                    catchGame.gameRunning = false;
                    document.getElementById('catchWinMessage').classList.add('show');
                    setTimeout(() => showScreen('matchIntro'), 4000);
                }
            } else {
                // Bad heart - reduce score but don't go below 0
                catchGame.score = Math.max(0, catchGame.score - 1);
                document.getElementById('catchScore').textContent = catchGame.score;
            }

            hearts.splice(i, 1);
            continue;
        }

        // Remove if off screen
        if (heart.y > canvas.height + 50) {
            hearts.splice(i, 1);
        }
    }

    catchGame.animationId = requestAnimationFrame(gameLoop);
}

// ==========================================
// Screen 3: Memory Match Game
// ==========================================
let memoryGame = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    canFlip: true
};

function initMemoryGame() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    memoryGame.cards = [];
    memoryGame.flippedCards = [];
    memoryGame.matchedPairs = 0;
    memoryGame.canFlip = true;

    document.getElementById('memoryWinMessage').classList.remove('show');

    // Card images (6 pairs) - photos from images folder
    const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];
    const cardPairs = [...images, ...images];

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    // Create card elements
    cardPairs.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.image = image;

        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front"></div>
                <div class="memory-card-back">
                    <img src="images/${image}" alt="Memory photo">
                </div>
            </div>
        `;

        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
        memoryGame.cards.push(card);
    });
}

function flipCard(card) {
    if (!memoryGame.canFlip) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (memoryGame.flippedCards.length >= 2) return;

    card.classList.add('flipped');
    memoryGame.flippedCards.push(card);

    if (memoryGame.flippedCards.length === 2) {
        memoryGame.canFlip = false;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = memoryGame.flippedCards;
    const match = card1.dataset.image === card2.dataset.image;

    if (match) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        memoryGame.matchedPairs++;

        memoryGame.flippedCards = [];
        memoryGame.canFlip = true;

        // Check win
        if (memoryGame.matchedPairs === 6) {
            setTimeout(() => {
                document.getElementById('memoryWinMessage').classList.add('show');
                createMiniConfetti();
                setTimeout(() => showScreen('message'), 4000);
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            memoryGame.flippedCards = [];
            memoryGame.canFlip = true;
        }, 1000);
    }
}

function createMiniConfetti() {
    const container = document.getElementById('memoryWinMessage');
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = ['#ff69b4', '#ff1493', '#ff6b6b', '#ffd93d', '#6bcb77'][Math.floor(Math.random() * 5)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }, i * 50);
    }
}

// ==========================================
// Screen 4: Custom Message
// ==========================================
document.getElementById('continueBtn').addEventListener('click', () => {
    showScreen('question');
});

// ==========================================
// Screen 5: The Big Question
// ==========================================
const noMessages = [
    "i think you misclicked",
    "chill bae",
    "please reconsider",
    "you finna break my heart",
    "you know you wanna click yes",
];

let noClickCount = 0;
let yesBtnScale = 1;

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const questionContent = document.getElementById('questionContent');
const celebration = document.getElementById('celebration');

yesBtn.addEventListener('click', () => {
    questionContent.style.display = 'none';
    celebration.classList.add('show');
    createCelebration();

    // Open SMS app with pre-filled message after a short delay
    setTimeout(() => {
        window.location.href = 'sms:9404355294&body=you%20are%20the%20best%20boyfriend%20ever%20%F0%9F%92%95';
    }, 2000);
});

noBtn.addEventListener('click', (e) => {
    noClickCount++;

    // Update message
    noBtn.textContent = noMessages[Math.min(noClickCount - 1, noMessages.length - 1)];

    // Move button to random position (first few clicks)
    if (noClickCount <= 2) {
        const maxX = window.innerWidth - noBtn.offsetWidth - 40;
        const maxY = window.innerHeight - noBtn.offsetHeight - 40;
        const newX = Math.random() * maxX + 20;
        const newY = Math.random() * maxY + 20;

        noBtn.style.position = 'fixed';
        noBtn.style.left = newX + 'px';
        noBtn.style.top = newY + 'px';
    }

    // Grow YES button
    yesBtnScale += 0.1;
    yesBtn.style.transform = `scale(${yesBtnScale})`;

    // Shrink NO button after a few clicks
    if (noClickCount > 3) {
        const shrinkFactor = Math.max(0.3, 1 - (noClickCount - 3) * 0.15);
        noBtn.style.transform = `scale(${shrinkFactor})`;
    }

    // Fade NO button after many clicks
    if (noClickCount > 6) {
        const opacity = Math.max(0.2, 1 - (noClickCount - 6) * 0.2);
        noBtn.style.opacity = opacity;
    }
});

// Make NO button run away on hover (desktop)
noBtn.addEventListener('mouseenter', () => {
    if (noClickCount >= 2) {
        const maxX = window.innerWidth - noBtn.offsetWidth - 40;
        const maxY = window.innerHeight - noBtn.offsetHeight - 40;
        const newX = Math.random() * maxX + 20;
        const newY = Math.random() * maxY + 20;

        noBtn.style.position = 'fixed';
        noBtn.style.left = newX + 'px';
        noBtn.style.top = newY + 'px';
    }
});

// ==========================================
// Celebration Effects
// ==========================================
function createCelebration() {
    const container = document.getElementById('confettiContainer');

    // Confetti burst
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = ['#ff69b4', '#ff1493', '#ff6b6b', '#ffd93d', '#6bcb77', '#a855f7'][Math.floor(Math.random() * 6)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }

    // Rising hearts
    function spawnRisingHeart() {
        const heart = document.createElement('div');
        heart.className = 'rising-heart';
        heart.textContent = ['💕', '💗', '💖', '💝', '❤️'][Math.floor(Math.random() * 5)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '-50px';
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 3000);
    }

    // Continuous rising hearts
    const heartInterval = setInterval(spawnRisingHeart, 200);

    // Spawn initial batch
    for (let i = 0; i < 10; i++) {
        setTimeout(spawnRisingHeart, i * 100);
    }
}

// ==========================================
// Initialize
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    initIntro();
});
