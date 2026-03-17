let allVerses = {};
let verses = [];
let shuffledVerses = [];
let currentIndex = 0;
let currentVerse = null;
let versesLoaded = false;
let currentCategory = null;
let lastVerseId = null;

async function loadVerses() {
    try {
        const response = await fetch("verses.json");
        const data = await response.json();
        allVerses = data;
        versesLoaded = true;
        
        const allVersesFlat = Object.values(allVerses).flat();
        displayVerse(getVerseOfTheDay(allVersesFlat), true);
    } catch (error) {
        console.error("Erro ao carregar versículos:", error);
    }
}

function getVerseOfTheDay(versesList) {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % versesList.length;
    return versesList[index];
}

function displayVerse(verse, isDaily = false) {
    if (!verse) return;
    currentVerse = verse;
    lastVerseId = verse.id;

    const label = document.getElementById("top-label");
    const card = document.querySelector(".verse-card");
    
    // Esconde a reflexão anterior ao mudar de verso
    const reflectionDiv = document.getElementById("reflection-box");
    if (reflectionDiv) reflectionDiv.style.display = "none";

    card.style.opacity = 0;
    
    setTimeout(() => {
        document.getElementById("verse").innerText = verse.text;
        document.getElementById("reference").innerText = verse.reference;
        
        if (isDaily) {
            label.innerText = "📅 Versículo do Dia";
            label.style.background = "#eef2ff";
        } else {
            const catName = findCategory(verse.id);
            label.innerText = "📂 " + catName.toUpperCase();
            label.style.background = "#fff4e6";
        }
        
        card.style.opacity = 1;
        updateFavoriteButton();
    }, 200);
}

function findCategory(id) {
    for (const cat in allVerses) {
        if (allVerses[cat].some(v => v.id === id)) return cat;
    }
    return "Versículo";
}

function showRandomVerse() {
    if (!versesLoaded) return;

    if (shuffledVerses.length === 0 || currentIndex >= shuffledVerses.length) {
        let pool;
        if (currentCategory && allVerses[currentCategory]) {
            pool = [...allVerses[currentCategory]];
        } else {
            pool = Object.values(allVerses).flat();
        }

        do {
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
        } while (pool.length > 1 && pool[0].id === lastVerseId); 

        shuffledVerses = pool;
        currentIndex = 0;
    }

    const nextVerse = shuffledVerses[currentIndex];
    currentIndex++;
    displayVerse(nextVerse, false);
}

function loadCategory(category) {
    if (!versesLoaded) return;
    
    currentCategory = category;
    shuffledVerses = []; 
    currentIndex = 0;
    
    showRandomVerse();
}

// ================= FUNÇÃO DE REFLEXÃO (INTEGRADA) =================

function toggleReflection() {
    const reflectionDiv = document.getElementById("reflection-box");
    const reflectionText = document.getElementById("reflection-text");

    if (reflectionDiv.style.display === "block") {
        reflectionDiv.style.display = "none";
    } else {
        if (currentVerse && currentVerse.reflection) {
            reflectionText.innerText = currentVerse.reflection;
            reflectionDiv.style.display = "block";
            reflectionDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            alert("Reflexão ainda não disponível para este versículo.");
        }
    }
}

// ================= SEÇÃO DE FAVORITOS =================

function removeFavorite(id) {
    let favs = JSON.parse(localStorage.getItem("favoriteVerses")) || [];
    favs = favs.filter(v => v.id !== id);
    localStorage.setItem("favoriteVerses", JSON.stringify(favs));
    
    const div = document.getElementById("favorites-list");
    if (div.style.display === "block") {
        renderFavorites(); 
    }
}

function renderFavorites() {
    const div = document.getElementById("favorites-list");
    const favs = JSON.parse(localStorage.getItem("favoriteVerses")) || [];
    
    if (favs.length === 0) {
        div.innerHTML = "<h3>⭐ Meus Favoritos</h3><p style='text-align:center; color:#888;'>Sua lista está vazia.</p>";
    } else {
        let html = "<h3>⭐ Meus Favoritos</h3>";
        favs.forEach(v => {
            html += `
                <div class="fav-item">
                    <p>${v.text}<br><strong>${v.reference}</strong></p>
                    <button class="btn-remove" onclick="removeFavorite('${v.id}')">🗑 Remover</button>
                </div>`;
        });
        div.innerHTML = html;
    }
}

function toggleFavoritesPane() {
    const div = document.getElementById("favorites-list");
    const btn = document.querySelector(".btn-favorites");

    if (div.style.display === "block") {
        div.style.display = "none";
        btn.innerText = "⭐ Meus Favoritos";
    } else {
        renderFavorites();
        div.style.display = "block";
        btn.innerText = "❌ Fechar Favoritos";
        div.scrollIntoView({ behavior: "smooth" });
    }
}

// ================= INTERFACE E TEMA =================

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.getElementById("theme-toggle").innerText = isDark ? "☀️" : "🌙";
}

function loadTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("theme-toggle").innerText = "☀️";
    }
}

function copyVerse() {
    if (!currentVerse) return;
    const text = `${currentVerse.text} (${currentVerse.reference})`;
    navigator.clipboard.writeText(text);
    alert("Copiado!");
}

function shareVerse() {
    if (!currentVerse) return;
    const text = encodeURIComponent(`${currentVerse.text} (${currentVerse.reference})`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
}

function favoriteVerse() {
    if (!currentVerse) return;
    let favs = JSON.parse(localStorage.getItem("favoriteVerses")) || [];
    if (!favs.some(v => v.id === currentVerse.id)) {
        favs.push(currentVerse);
        localStorage.setItem("favoriteVerses", JSON.stringify(favs));
        alert("Favoritado! ❤️");
    } else {
        alert("Já está nos favoritos!");
    }
}

function updateFavoriteButton() {}

// ================= INICIALIZAÇÃO =================

window.onload = () => {
    loadTheme();
    loadVerses();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log("App pronto para uso offline!"))
            .catch((err) => console.log("Erro ao registrar Service Worker:", err));
    }
};

let deferredPrompt;
const installContainer = document.getElementById('install-container');
const btnInstall = document.getElementById('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
    // Impede que o Chrome mostre o aviso automático muito cedo
    e.preventDefault();
    // Guarda o evento para usar depois
    deferredPrompt = e;
    // Mostra o nosso botão personalizado
    installContainer.style.display = 'block';
});

btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Mostra o prompt de instalação
        deferredPrompt.prompt();
        // Espera a resposta do usuário
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuário escolheu: ${outcome}`);
        // Limpa o prompt para não ser usado de novo
        deferredPrompt = null;
        // Esconde o botão após a instalação
        installContainer.style.display = 'none';
    }
});

// Esconde o botão se o app já estiver instalado
window.addEventListener('appinstalled', () => {
    installContainer.style.display = 'none';
    console.log('App instalado com sucesso!');
});