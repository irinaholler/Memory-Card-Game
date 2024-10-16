const API_URL = 'https://corsproxy.io/?https://ws.audioscrobbler.com/2.0/';
const API_KEY = '9a14a71906232bc96ebb2d797f20f3dd';

let cards = [];
let firstCard = null;
let secondCard = null;
let score = 0;
let timeInterval;
let seconds = 0;
let matchedPairs = 0;

// Fetch album images
const randomSearchTerms = ['believe', 'greatest', 'love', 'sun', 'night', 'dream', 'world', 'light', 'fire', 'magic'];

async function fetchAlbumImages() {
    try {
        // Pick a random search term from the list
        const randomTerm = randomSearchTerms[Math.floor(Math.random() * randomSearchTerms.length)];

        //JSON: /2.0/?method=chart.gettoptracks&api_key=YOUR_API_KEY&format=json
        const response = await fetch(`${API_URL}?method=album.search&album=${randomTerm}&api_key=${API_KEY}&format=json`);
        const data = await response.json();
        
        const albums = data.results.albummatches.album.slice(0, 10); // Get only 10 albums

        const images = albums
            .map(album => album.image.find(img => img.size === 'medium')?.['#text'])
            .filter(imageUrl => imageUrl); // Filter out any empty or undefined image URLs
        
        // If not enough images, throw an error
        if (images.length < 10) {
            throw new Error("Not enough images fetched.");
        }

        // Shuffle the images to randomize their order
        shuffle(images);

        return images;
    } catch (error) {
        console.error("Failed to fetch album images:", error);
        alert("Error fetching album images. Please try again later.");
        return []; // Return empty array on error
    }
}

// Initialize game
async function initGame() {
    const images = await fetchAlbumImages();
    if (images.length === 0) return; // Don't proceed if no images were fetched

    const allImages = [...images, ...images]; // Duplicate images for matching
    shuffle(allImages);

    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // Clear board
    allImages.forEach(img => createCard(img, gameBoard));
    
    resetGame();
}

// Shuffle array
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// Create card elements
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

// Handle card click
function handleCardClick(card) {
    if (card.classList.contains('flipped') || secondCard) return; // Prevent clicking a flipped card

    card.classList.add('flipped');
    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        checkForMatch();
    }
}

// Check if the cards match
function checkForMatch() {
    const firstImage = firstCard.querySelector('img').src;
    const secondImage = secondCard.querySelector('img').src;
    
    if (firstImage === secondImage) {
        matchedPairs++;
        resetCards();
        if (matchedPairs === 10) {
            clearInterval(timeInterval);
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

// Reset first and second card
function resetCards() {
    firstCard = null;
    secondCard = null;
    score++;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Timer function
function startTimer() {
    timeInterval = setInterval(() => {
        seconds++;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        document.getElementById('time').textContent = `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Reset game
function resetGame() {
    clearInterval(timeInterval);
    seconds = 0;
    score = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('time').textContent = 'Time: 00:00';
    startTimer();
}

// Reset button
document.getElementById('reset-btn').addEventListener('click', initGame);

// Start the game on page load
window.addEventListener('DOMContentLoaded', initGame);
