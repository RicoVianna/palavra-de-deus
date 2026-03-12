console.log("APP JS VERSAO NOVA 10");

let allVerses = {}
let verses = []
let currentCategory = null
let shuffledVerses = []
let usedVerses = []
let currentIndex = 0
let lastVerseId = null
let versesLoaded = false
let currentVerse = null

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0);
});

function loadTheme() {
    const savedTheme = localStorage.getItem("theme")
    const btn = document.getElementById("theme-toggle")
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode")
        btn.innerText = "☀️"
    } else {
        btn.innerText = "🌙"
    }
}

async function loadVerses() {
    try {
        const response = await fetch("verses.json")
        const data = await response.json()
        allVerses = data
        window.scrollTo(0, 0)
        versesLoaded = true
        console.log("Versículos carregados:")
        console.log(allVerses)
        const allVersesFlat = Object.values(allVerses).flat()
        const verseOfTheDay = getVerseOfTheDay(allVersesFlat)
        console.log("📅 Versículo do dia:")
        console.log(verseOfTheDay)

        const verseElement = document.getElementById("verse")
        verseElement.innerText = verseOfTheDay.text
        document.getElementById("reference").innerText = verseOfTheDay.reference
        document.getElementById("category").innerText = "📂 " + findCategory(verseOfTheDay.id)
    } catch (error) {
        console.error("Erro ao carregar versículos:", error)
    }
}

function shuffleArray(array) {
    let shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

function reshuffleAvoidRepeat(lastVerseId) {
    let newShuffle
    do {
        newShuffle = shuffleArray(verses)
    } while (newShuffle[0].id === lastVerseId)
    return newShuffle
}

function getNextVerse() {
    if (currentIndex >= shuffledVerses.length) {
        shuffledVerses = reshuffleAvoidRepeat(lastVerseId)
        currentIndex = 0
        console.log("🔀 Nova rodada embaralhada")
    }
    const verse = shuffledVerses[currentIndex]
    lastVerseId = verse.id
    currentIndex++
    return verse
}

function getRandomVerse() {
    if (usedVerses.length === verses.length) {
        usedVerses = []
    }
    let verse
    do {
        const index = Math.floor(Math.random() * verses.length)
        verse = verses[index]
    } while (usedVerses.includes(verse.id))
    usedVerses.push(verse.id)
    return verse
}

function showRandomVerse() {

    if (verses.length === 0) {
    const allVersesFlat = Object.values(allVerses).flat()
    verses = allVersesFlat
    shuffledVerses = shuffleArray(verses)
    currentIndex = 0
}
    const verse = getNextVerse()
    currentVerse = verse
    console.log("Verso sorteado:", verse)

    const verseElement = document.getElementById("verse")
    const label = document.getElementById("top-label")
    label.innerText = "📖 Versículo"
    verseElement.classList.add("fade")
    setTimeout(() => {
        verseElement.innerText = verse.text
        document.getElementById("reference").innerText = verse.reference
        document.getElementById("category").innerText = "📂 " + findCategory(verse.id)
        verseElement.classList.remove("fade")
}, 200)
}

window.onload = function() {
    loadTheme()
    loadVerses()
}

function loadCategory(category) {
    if (!versesLoaded) {
        console.log("Versículos ainda não foram carregados.")
        return
    }

    console.log("CATEGORIA CARREGADA:", category)

    currentCategory = category
    verses = allVerses[category]
    shuffledVerses = shuffleArray(verses)
    currentIndex = 0
    lastVerseId = null
    usedVerses = []

    currentVerse = null

    document.getElementById("category").innerText = "📂 " + category
    document.getElementById("verse").innerText = "Clique em 'Novo versículo'"
    document.getElementById("reference").innerText = ""
    
}

function getVerseOfTheDay(verses) {
    const today = new Date()
    const start = new Date(today.getFullYear(), 0, 0)
    const diff = today - start
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    const index = dayOfYear % verses.length
    return verses[index]
}

function favoriteVerse() {
    if (!currentVerse) {
    alert("Nenhum versículo para favoritar. Clique em 'Novo versículo'.")
    return
}
    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || []
    const alreadySaved = favorites.some(v => v.id === currentVerse.id)
    if (alreadySaved) {
        alert("Este versículo já está nos favoritos.")
        return
    }
    favorites.push(currentVerse)
    localStorage.setItem("favoriteVerses", JSON.stringify(favorites))
    alert("Versículo salvo nos favoritos ❤️")
}

function showFavorites() {

    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || []
    const verseElement = document.getElementById("verse")
    if (favorites.length === 0) {
        verseElement.innerText = "Você ainda não tem versículos favoritos."
        return
    }
    let html = "<h3>⭐ Seus Favoritos</h3>"
    favorites.forEach(v => {
    html += `
        <div class="verse-card">
            <p>${v.text}<br><strong>${v.reference}</strong></p>
            <button onclick="removeFavorite('${v.id}')">🗑 Remover</button>
        </div>
    `
})
    verseElement.innerHTML = html
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, 50)
    window.scrollTo(0, 0)
}

function updateFavoriteButton() {
    const btn = document.getElementById("favorite-btn")
    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || []
    const isFavorite = favorites.some(v => v.id === currentVerse?.id)
    if (isFavorite) {
        btn.innerText = "💔 Remover favorito"
    } else {
        btn.innerText = "❤️ Favoritar"
    }
}

function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem("favoriteVerses")) || []
    favorites = favorites.filter(v => v.id !== id)
    localStorage.setItem("favoriteVerses", JSON.stringify(favorites))
    showFavorites()
}

function shareVerse() {

    if (!currentVerse) {
        alert("Nenhum versículo para compartilhar.")
        return
    }
    const textToShare =
        currentVerse.reference + " - " + currentVerse.text
    const whatsappURL =
        "https://wa.me/?text=" + encodeURIComponent(textToShare)
    window.open(whatsappURL, "_blank")
}

function toggleTheme() {
    const body = document.body
    const btn = document.getElementById("theme-toggle")
    body.classList.toggle("dark-mode")
    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark")
        btn.innerText = "☀️"
    } else {
        localStorage.setItem("theme", "light")
        btn.innerText = "🌙"
    }
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado"));
}

function copyVerse() {
    if (!currentVerse) {
        alert("Nenhum versículo para copiar. Clique em 'Novo versículo'.")
        return
    }
    const verseText =
        currentVerse.reference + " - " + currentVerse.text
    navigator.clipboard.writeText(verseText)
    alert("Versículo copiado!")
}

function findCategory(id) {
    for (const category in allVerses) {
        const verse = allVerses[category].find(v => v.id === id)
        if (verse) {
            return category
        }
    }
    return ""
}