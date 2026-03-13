console.log("APP JS VERSAO CORRIGIDA 11");

let allVerses = {};
let verses = [];
let currentCategory = null;
let shuffledVerses = [];
let usedVerses = [];
let currentIndex = 0;
let lastVerseId = null;
let versesLoaded = false;
let currentVerse = null;

// Evita scroll automático
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
});

// -------------------------
// THEME
// -------------------------
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    const btn = document.getElementById("theme-toggle");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        btn.innerText = "☀️";
    } else {
        btn.innerText = "🌙";
    }
}

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById("theme-toggle");
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        btn.innerText = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        btn.innerText = "🌙";
    }
}

// -------------------------
// LOAD VERSES
// -------------------------
async function loadVerses() {
    try {
        const response = await fetch("verses.json");
        const data = await response.json();
        allVerses = data;
        versesLoaded = true;
        console.log("Versículos carregados:", allVerses);

        // Versículo do dia
        const allVersesFlat = Object.values(allVerses).flat();
        const verseOfTheDay = getVerseOfTheDay(allVersesFlat);
        currentVerse = verseOfTheDay;

        document.getElementById("verse").innerText = verseOfTheDay.text;
        document.getElementById("reference").innerText = verseOfTheDay.reference;
        document.getElementById("category").innerText = "📂 " + findCategory(verseOfTheDay.id);
    } catch (error) {
        console.error("Erro ao carregar versículos:", error);
    }
}

function getVerseOfTheDay(verses) {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % verses.length;
    return verses[index];
}

// -------------------------
// SHUFFLE
// -------------------------
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function reshuffleAvoidRepeat(lastVerseId) {
    let newShuffle;
    do {
        newShuffle = shuffleArray(verses);
    } while (newShuffle[0].id === lastVerseId);
    return newShuffle;
}

function getNextVerse() {
    if (currentIndex >= shuffledVerses.length) {
        shuffledVerses = reshuffleAvoidRepeat(lastVerseId);
        currentIndex = 0;
        console.log("🔀 Nova rodada embaralhada");
    }
    const verse = shuffledVerses[currentIndex];
    lastVerseId = verse.id;
    currentIndex++;
    return verse;
}

// -------------------------
// SHOW RANDOM / CATEGORY
// -------------------------
function showRandomVerse() {
    if (!versesLoaded) {
        alert("Versículos ainda não carregados.");
        return;
    }
    if (verses.length === 0) {
        const allVersesFlat = Object.values(allVerses).flat();
        verses = allVersesFlat;
        shuffledVerses = shuffleArray(verses);
        currentIndex = 0;
    }

    const verse = getNextVerse();
    currentVerse = verse;

    const verseElement = document.getElementById("verse");
    const label = document.getElementById("top-label");
    label.innerText = "📖 Versículo";

    verseElement.classList.add("fade");
    setTimeout(() => {
        verseElement.innerText = verse.text;
        document.getElementById("reference").innerText = verse.reference;
        document.getElementById("category").innerText = "📂 " + findCategory(verse.id);
        verseElement.classList.remove("fade");
    }, 200);
}

function loadCategory(category) {
    if (!versesLoaded) {
        alert("Versículos ainda não carregados.");
        return;
    }

    currentCategory = category;
    verses = allVerses[category];
    shuffledVerses = shuffleArray(verses);
    currentIndex = 0;
    lastVerseId = null;
    usedVerses = [];
    currentVerse = null;

    document.getElementById("category").innerText = "📂 " + category;
    document.getElementById("verse").innerText = "Clique em 'Novo versículo'";
    document.getElementById("reference").innerText = "";
}

// -------------------------
// FAVORITOS
// -------------------------
function favoriteVerse() {
    if (!currentVerse) {
        alert("Nenhum versículo para favoritar. Clique em 'Novo versículo'.");
        return;
    }

    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || [];
    const alreadySaved = favorites.some(v => v.id === currentVerse.id);

    if (!alreadySaved) {
        favorites.push(currentVerse);
        localStorage.setItem("favoriteVerses", JSON.stringify(favorites));
        alert("Versículo salvo nos favoritos ❤️");
    } else {
        alert("Este versículo já está nos favoritos ❤️");
    }

    // **Botão principal nunca muda**
}

function showFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || [];
    const verseElement = document.getElementById("verse");

    if (favorites.length === 0) {
        verseElement.innerText = "Você ainda não tem versículos favoritos.";
        return;
    }

    let html = "<h3>⭐ Seus Favoritos</h3>";
    favorites.forEach(v => {
        html += `<div class="verse-card">
            <p>${v.text}<br><strong>${v.reference}</strong></p>
            <button onclick="removeFavorite('${v.id}')">🗑 Remover</button>
        </div>`;
    });

    verseElement.innerHTML = html;
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
}

function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || [];
    favorites = favorites.filter(v => v.id !== id);
    localStorage.setItem("favoriteVerses", JSON.stringify(favorites));
    showFavorites();
}

// -------------------------
// COPIAR / COMPARTILHAR
// -------------------------
function copyVerse() {
    if (!currentVerse) {
        alert("Nenhum versículo para copiar. Clique em 'Novo versículo'.");
        return;
    }
    const verseText = currentVerse.reference + " - " + currentVerse.text;
    navigator.clipboard.writeText(verseText);
    alert("Versículo copiado!");
}

function shareVerse() {
    if (!currentVerse) {
        alert("Nenhum versículo para compartilhar.");
        return;
    }
    const textToShare = currentVerse.reference + " - " + currentVerse.text;
    window.open("https://wa.me/?text=" + encodeURIComponent(textToShare), "_blank");
}

// -------------------------
// UTILITÁRIOS
// -------------------------
function findCategory(id) {
    for (const category in allVerses) {
        if (allVerses[category].some(v => v.id === id)) return category;
    }
    return "";
}

// -------------------------
// SERVICE WORKER
// -------------------------
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("Service Worker registrado"));
}

// -------------------------
// INIT
// -------------------------
window.onload = () => {
    loadTheme();
    loadVerses();
};