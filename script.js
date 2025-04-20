// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const themeIcon = document.getElementById('themeIcon');

if (localStorage.getItem('darkMode') === 'enabled') {
  body.classList.add('dark-mode');
}

function updateIcon() {
  themeIcon.className = body.classList.contains('dark-mode') ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
}

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : '');
  updateIcon();
});

window.onload = updateIcon;

// Blockchain Classes
class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return (
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.data)
    ).split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.hash !== current.calculateHash() || current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }
}

const reviewChain = new Blockchain();

async function loadGuitarData() {
  try {
    const response = await fetch('guitars.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading guitar data:', error);
    return [];
  }
}

document.getElementById('budgetRange').addEventListener('input', function () {
  document.getElementById('budgetVal').textContent = this.value;
});

document.getElementById('guitarForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const budget = parseInt(document.getElementById('budgetRange').value);
  const genre = document.getElementById('genre').value.toLowerCase();
  const level = document.getElementById('level').value;

  document.getElementById('loading').style.display = 'block';

  const guitars = await loadGuitarData();

  setTimeout(() => {
    const filteredGuitars = guitars.filter(guitar =>
      guitar.budget <= budget &&
      guitar.genre.map(g => g.toLowerCase()).includes(genre) &&
      guitar.level === level
    );

    document.getElementById('loading').style.display = 'none';
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '';

    if (filteredGuitars.length === 0) {
      recommendationsContainer.innerHTML = '<p>No recommendations found.</p>';
    } else {
      filteredGuitars.forEach(guitar => {
        const card = `
          <div class="col-md-4 mb-4 fade-in" data-aos="fade-up">
            <div class="card">
              <img src="${guitar.image}" class="card-img-top" alt="${guitar.name}">
              <div class="card-body">
                <h5 class="card-title">${guitar.name}</h5>
                <p class="card-text"><strong>Price:</strong> ${guitar.price}</p>
                <p class="card-text"><strong>Level:</strong> ${guitar.level}</p>
                <p class="card-text"><strong>Genre:</strong> ${guitar.genre.join(', ')}</p>
                <p class="card-text"><strong>Brand:</strong> ${guitar.details?.brand || 'N/A'}</p>
                <p class="card-text"><strong>Body:</strong> ${guitar.details?.body_type || 'N/A'}</p>
                <div class="rating">⭐️⭐️⭐️⭐️⭐️</div>
                <button class="btn btn-outline-danger mt-2" onclick="addToFavorites('${guitar.name}')">❤️ Favorite</button>
                <a href="${guitar.purchase_link}" target="_blank" class="btn btn-primary mt-2">Buy Now</a>
                <a href="${guitar.youtube}" target="_blank" class="btn btn-info mt-2">Watch Review</a>
              </div>
            </div>
          </div>
        `;
        recommendationsContainer.innerHTML += card;
      });
      AOS.refresh();
    }
  }, 1000);
});

function addToFavorites(name) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favs.includes(name)) {
    favs.push(name);
    localStorage.setItem("favorites", JSON.stringify(favs));
    alert(`${name} added to favorites!`);
  }
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const reviewer = document.getElementById('reviewer').value;
    const guitarReviewed = document.getElementById('guitarReviewed').value;
    const reviewText = document.getElementById('reviewText').value;

    const reviewData = { reviewer, guitar: guitarReviewed, review: reviewText };

    const newBlock = new Block(reviewChain.chain.length, Date.now(), reviewData);
    reviewChain.addBlock(newBlock);

    displayBlockchain();
    this.reset();
  });
}

function displayBlockchain() {
  const container = document.getElementById('blockchainDisplay');
  if (!container) return;

  container.innerHTML = '<h4>Review Blockchain:</h4>';
  reviewChain.chain.forEach(block => {
    container.innerHTML += `
      <div class="card mb-2 p-3">
        <strong>Index:</strong> ${block.index}<br>
        <strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}<br>
        <strong>Reviewer:</strong> ${block.data.reviewer}<br>
        <strong>Guitar:</strong> ${block.data.guitar}<br>
        <strong>Review:</strong> ${block.data.review}<br>
        <strong>Hash:</strong> ${block.hash}<br>
        <strong>Previous Hash:</strong> ${block.previousHash}
      </div>
    `;
  });
}