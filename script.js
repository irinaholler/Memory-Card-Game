// constants
const API_URL = 'https://corsproxy.io/?https://ws.audioscrobbler.com/2.0/';
const API_KEY = '9a14a71906232bc96ebb2d797f20f3dd';

let cards = [];
let firstCard = null;
let secondCard = null;
let score = 0;
let timeInterval;
let seconds = 0;
let matchedPairs = 0;
let gamesPlayed = 0;
let bestTime = Infinity;
let bestScore = 0;

const randomSearchTerms = ['believe', 'greatest', 'love', 'sun', 'night', 'dream', 'world', 'light', 'fire', 'magic'];

// Fetch album images
async function fetchAlbumImages() {
    try {
        const randomTerm = randomSearchTerms[Math.floor(Math.random() * randomSearchTerms.length)];
        const response = await fetch(`${API_URL}?method=album.search&album=${randomTerm}&api_key=${API_KEY}&format=json`);
        const data = await response.json();

        const albums = data.results.albummatches.album.slice(0, 8);

        const images = albums
            .map(album => album.image.find(img => img.size === 'medium')?.['#text'])
            .filter(imageUrl => imageUrl);

        if (images.length < 8) {
            throw new Error("Not enough images fetched.");
        }

        shuffle(images);
        return images;
    } catch (error) {
        console.error("Failed to fetch album images:", error);
        alert("Error fetching album images. Please try again later.");
        return [];
    }
}

function loadStats() {
    const savedStats = localStorage.getItem('memoryGameStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        gamesPlayed = stats.gamesPlayed || 0;
        bestTime = stats.bestTime || Infinity;
        bestScore = stats.bestScore || 0;
        updateStatsDisplay();
    }
}

function saveStats() {
    const stats = {
        gamesPlayed,
        bestTime,
        bestScore
    };
    localStorage.setItem('memoryGameStats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('games-played').textContent = gamesPlayed;
    document.getElementById('best-score').textContent = bestScore;

    if (bestTime === Infinity) {
        document.getElementById('best-time').textContent = '--:--';
    } else {
        const mins = Math.floor(bestTime / 60);
        const secs = bestTime % 60;
        document.getElementById('best-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

async function initGame() {
    const images = await fetchAlbumImages();
    if (images.length === 0) return;

    const allImages = [...images, ...images];
    shuffle(allImages);

    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    allImages.forEach(img => createCard(img, gameBoard));

    resetGame();
    startTimer();
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function createCard(image, container) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="front"></div>
        <div class="back"><img src="${image}" alt="Album Image"></div>
    `;
    container.appendChild(card);
    card.addEventListener('click', () => handleCardClick(card));
}

function handleCardClick(card) {
    if (card.classList.contains('flipped') || secondCard) return;

    card.classList.add('flipped');
    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        checkForMatch();
    }
}

function checkForMatch() {
    const firstImage = firstCard.querySelector('img').src;
    const secondImage = secondCard.querySelector('img').src;

    if (firstImage === secondImage) {
        matchedPairs++;
        resetCards();
        if (matchedPairs === 8) {
            clearInterval(timeInterval);
            gamesPlayed++;

            if (seconds < bestTime) bestTime = seconds;
            if (score > bestScore) bestScore = score;

            saveStats();
            updateStatsDisplay();
            alert('Congratulations! You matched all pairs!');
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetCards();
        }, 1000);
    }
}

function resetCards() {
    firstCard = null;
    secondCard = null;
    score++;
    document.getElementById('score').textContent = `Score: ${score}`;
}

function startTimer() {
    timeInterval = setInterval(() => {
        seconds++;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        document.getElementById('time').textContent = `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function resetGame() {
    clearInterval(timeInterval);
    seconds = 0;
    score = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('time').textContent = 'Time: 00:00';
}

document.getElementById('reset-btn').addEventListener('click', initGame);

window.addEventListener('DOMContentLoaded', () => {
    loadStats();
    initGame();
});
