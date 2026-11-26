/* ===== COLOR DROP 2.0 - script.js ===== */

"use strict";

/* ==================== CONFIGURACIÓN DE COLORES ==================== */
const COLOR_DEFS = {
    rojo:     { name: "ROJO",     css: "#ff4757",  key: "1" },
    azul:     { name: "AZUL",     css: "#3742fa",  key: "2" },
    verde:    { name: "VERDE",    css: "#2ed573",  key: "3" },
    amarillo: { name: "AMARILLO", css: "#ffc048",  key: "4" },
    naranja:  { name: "NARANJA",  css: "#ff9f43",  key: "5" },
    morado:   { name: "MORADO",   css: "#a55eea",  key: "6" },
    rosa:     { name: "ROSA",     css: "#ff6b81",  key: "" },
    celeste:  { name: "CELESTE",  css: "#17c0eb",  key: "" },
    turquesa: { name: "TURQUESA", css: "#1dd1a1",  key: "" },
    lima:     { name: "LIMA",     css: "#c0e218",  key: "" },
    magenta:  { name: "MAGENTA",  css: "#fd79a8",  key: "" }
};

/* Arreglo de grupos de colores por nivel (cuántos colores activos) */
const COLOR_GROUPS = [
    ["rojo", "azul", "verde", "amarillo"],                         // Nivel 1
    ["rojo", "azul", "verde", "amarillo", "naranja"],              // Nivel 2-3
    ["rojo", "azul", "verde", "amarillo", "naranja", "morado"],    // Nivel 4-5
    ["rojo", "azul", "verde", "amarillo", "naranja", "morado", "rosa", "celeste"], // Nivel 6-7
    ["rojo", "azul", "verde", "amarillo", "naranja", "morado", "rosa", "celeste", "turquesa", "lima", "magenta"] // Nivel 8+
];

const SHAPES = ["circle", "square", "triangle", "diamond"];

const PHRASES = [
    "¡VAMOS!", "¡BIEN!", "¡PERFECTO!", "¡RÁPIDO!",
    "¡INCREÍBLE!", "¡NO TE EQUIVOQUES!", "¡GENIAL!", "¡EXCELENTE!",
    "¡EN RACHA!", "¡IMPRESIONANTE!", "¡SIGUE ASÍ!", "¡ESO ES!",
    "¡TU PUEDES!", "¡BUENÍSIMO!", "¡ARRIBA!", "¡DALE!"
];

const POWERUP_TYPES = {
    velocidad: { icon: "⚡", label: "VELOCIDAD", color: "#ffc048" },
    congelar:  { icon: "❄️", label: "CONGELAR", color: "#17c0eb" },
    vida:      { icon: "❤️", label: "VIDA", color: "#ff4757" },
    doble:     { icon: "💎", label: "DOBLE PUNTOS", color: "#a55eea" },
    escudo:    { icon: "🛡️", label: "ESCUDO", color: "#2ed573" }
};

/* Niveles: [puntos mínimos necesarios para entrar en el nivel] */
/* Cada nivel requiere sumar SUBIR_DELTA pts para avanzar al siguiente */
const LEVEL_UP_SCORES = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 4900, 5900, 7000, 8200];

/* ==================== ESTADO DEL JUEGO ==================== */
let state = {
    mode: "clasico",
    score: 0,
    level: 1,
    lives: 3,
    maxLives: 3,
    combo: 0,
    bestCombo: 0,
    record: 0,
    running: false,
    paused: false,
    over: false,
    gameOver: false,
    targetColor: "rojo",
    availableColors: ["rojo", "azul", "verde", "amarillo"],
    levelProgress: 0,
    levelMax: 100,
    elapsedTime: 0,
    timeLimit: 60,
    timeRemaining: 60,
    shieldActive: false,
    frozenUntil: 0,
    doubleUntil: 0,
    speedBoostUntil: 0,
    frameCount: 0,
    spawnTimer: 0,
    fallSpeed: 1.5,
    spawnInterval: 1100,
    showTutorial: true
};

/* ==================== CANVAS ==================== */
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let canvasWidth = 0;
let canvasHeight = 0;

/* ==================== OBJETOS QUE CAEN ==================== */
let fallingObjects = [];

/* ==================== AUDIO ==================== */
let audioCtx = null;
let soundEnabled = localStorage.getItem("color_drop_sound") !== "off";

/* ==================== PARTÍCULAS / TEXTOS ==================== */
let particles = [];
let floatingTexts = [];

/* ==================== ELEMENTOS DOM ==================== */
const $ = (id) => document.getElementById(id);

/* ==================== CARGAR ESTADO INICIAL ==================== */
function loadRecord() {
    state.record = parseInt(localStorage.getItem("color_drop_record") || "0", 10);
    $("record").textContent = state.record;
}

/* ==================== AUDIO ==================== */
function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            return;
        }
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!soundEnabled || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const t = audioCtx.currentTime;

    switch (type) {
        case "acierto":
            osc.type = "sine";
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
            osc.start(t); osc.stop(t + 0.25);
            break;
        case "error":
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(300, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t); osc.stop(t + 0.3);
            break;
        case "combo":
            osc.type = "square";
            osc.frequency.setValueAtTime(660, t);
            osc.frequency.exponentialRampToValueAtTime(1320, t + 0.1);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            osc.start(t); osc.stop(t + 0.15);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2); gain2.connect(audioCtx.destination);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1320, t + 0.1);
            gain2.gain.setValueAtTime(0.2, t + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc2.start(t + 0.1); osc2.stop(t + 0.3);
            break;
        case "nivel":
            osc.type = "triangle";
            [400, 500, 600, 800].forEach((f, i) => osc.frequency.setValueAtTime(f, t + i * 0.1));
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
            osc.start(t); osc.stop(t + 0.5);
            break;
        case "powerup":
            osc.type = "sine";
            [600, 900, 1200].forEach((f, i) => osc.frequency.setValueAtTime(f, t + i * 0.1));
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t); osc.stop(t + 0.3);
            break;
        case "gameover":
            osc.type = "sawtooth";
            [400, 300, 200, 100].forEach((f, i) => osc.frequency.setValueAtTime(f, t + i * 0.3));
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 1.1);
            osc.start(t); osc.stop(t + 1.1);
            break;
        case "clic":
            osc.type = "square";
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
            break;
        case "record":
            osc.type = "triangle";
            [523, 659, 784, 1046].forEach((f, i) => osc.frequency.setValueAtTime(f, t + i * 0.08));
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
            osc.start(t); osc.stop(t + 0.5);
            break;
    }
}

/* ==================== TOGGLE SONIDO ==================== */
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("color_drop_sound", soundEnabled ? "on" : "off");
    updateSoundIcons();
    if (soundEnabled) {
        initAudio();
        playSound("clic");
    }
}

function updateSoundIcons() {
    const icon = soundEnabled ? "🔊" : "🔇";
    $("sound-toggle-menu").textContent = icon;
    $("sound-toggle-game").textContent = icon;
}

/* ==================== NAVEGACIÓN DE PANTALLAS ==================== */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
}

function showMainMenu() {
    if (state.running) {
        state.running = false;
        cancelAnimationFrame(animationId);
    }
    $("game-screen").style.pointerEvents = "auto";
    showScreen("main-menu");
}

function openModeSelect() {
    initAudio();
    playSound("clic");
    if (state.showTutorial) {
        showScreen("tutorial");
    } else {
        showScreen("mode-select");
    }
}

function closeTutorial() {
    initAudio();
    playSound("clic");
    state.showTutorial = false;
    showScreen("mode-select");
}

function showInstructions() {
    initAudio();
    playSound("clic");
    showScreen("instructions");
}

function showHighScores() {
    initAudio();
    playSound("clic");
    showScreen("highscores");
    renderHighScores();
}

function exitToMenu() {
    state.running = false;
    cancelAnimationFrame(animationId);
    $("game-screen").style.pointerEvents = "auto";
    showMainMenu();
}

/* ==================== HIGH SCORES ==================== */
function getHighScores() {
    try {
        return JSON.parse(localStorage.getItem("color_drop_scores") || "[]");
    } catch (e) {
        return [];
    }
}

function saveScore(score, mode) {
    const scores = getHighScores();
    scores.push({ score, mode, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem("color_drop_scores", JSON.stringify(scores.slice(0, 10)));
}

function renderHighScores() {
    const list = $("highscore-list");
    const scores = getHighScores();
    if (scores.length === 0) {
        list.innerHTML = '<div class="highscore-entry"><span style="color:var(--text-dim);">Aún no hay puntuaciones. ¡Sé el primero!</span></div>';
        return;
    }
    const medals = ["🥇", "🥈", "🥉"];
    const modeNames = { clasico: "Clásico", contrarreloj: "Contrarreloj", infinito: "Infinito" };
    list.innerHTML = scores.map((s, i) => {
        const medal = i < 3 ? medals[i] : (i + 1);
        return `<div class="highscore-entry">
            <span class="highscore-rank">${medal}</span>
            <span class="highscore-mode">${modeNames[s.mode] || s.mode}</span>
            <span class="highscore-score">${s.score}</span>
        </div>`;
    }).join("");
}

/* ==================== CONFIGURACIÓN DE NIVEL ==================== */
function getLevelEntry(level) {
    return LEVEL_UP_SCORES[Math.min(level - 1, LEVEL_UP_SCORES.length - 1)];
}

function getLevelNext(level) {
    return LEVEL_UP_SCORES[Math.min(level, LEVEL_UP_SCORES.length - 1)];
}

function calculateLevelFromScore(score) {
    let level = 1;
    for (let i = 0; i < LEVEL_UP_SCORES.length; i++) {
        if (score >= LEVEL_UP_SCORES[i]) level = i + 1;
    }
    // Niveles más allá de la tabla
    if (score >= LEVEL_UP_SCORES[LEVEL_UP_SCORES.length - 1]) {
        const base = LEVEL_UP_SCORES[LEVEL_UP_SCORES.length - 1];
        level = LEVEL_UP_SCORES.length + Math.floor((score - base) / 1000);
    }
    return level;
}

/* Determina los colores activos según el nivel */
function getColorsForLevel(level) {
    if (level >= 8) return COLOR_GROUPS[4];
    if (level >= 6) return COLOR_GROUPS[3];
    if (level >= 4) return COLOR_GROUPS[2];
    if (level >= 2) return COLOR_GROUPS[1];
    return COLOR_GROUPS[0];
}

function setupForLevel(level) {
    const prevLevel = state.level;
    state.level = level;

    // Velocidad base (tope razonable)
    state.fallSpeed = Math.min(8, 1.5 + (level - 1) * 0.55);

    // Frecuencia de aparición (cada vez más rápida)
    state.spawnInterval = Math.max(420, 1100 - (level - 1) * 70);

    // Colores disponibles
    state.availableColors = getColorsForLevel(level);

    if (level > prevLevel) {
        showLevelUp(level);
        playSound("nivel");
        buildColorButtons();
        if (level >= 7) {
            showDynamicPhrase("¡NIVEL EXTREMO!");
        } else {
            showDynamicPhrase(`¡NIVEL ${level}!`);
        }
        updateTargetColorName();
    }
}

/* ==================== INICIAR JUEGO ==================== */
function startGame(mode) {
    initAudio();
    playSound("clic");

    state.mode = mode;
    state.score = 0;
    state.level = 1;
    state.lives = 3;
    state.maxLives = 3;
    state.combo = 0;
    state.bestCombo = 0;
    state.over = false;
    state.gameOver = false;
    state.running = true;
    state.paused = false;
    state.availableColors = getColorsForLevel(1);
    state.levelProgress = 0;
    state.levelMax = getLevelNext(1) - getLevelEntry(1);
    state.elapsedTime = 0;
    state.timeRemaining = state.timeLimit;
    state.shieldActive = false;
    state.frozenUntil = 0;
    state.doubleUntil = 0;
    state.speedBoostUntil = 0;
    state.frameCount = 0;
    state.spawnTimer = 0;
    state.fallSpeed = 1.5;
    state.spawnInterval = 1100;

    fallingObjects = [];

    const modeLabels = { clasico: "CLÁSICO", contrarreloj: "CONTRARRELOJ", infinito: "INFINITO" };
    $("mode-label").textContent = modeLabels[mode] || "CLÁSICO";

    $("timer-display").style.display = mode === "contrarreloj" ? "inline-block" : "none";
    $("active-effects").style.display = mode === "contrarreloj" ? "none" : "flex";

    loadRecord();

    buildColorButtons();
    setRandomTarget();

    showGameScreen();
    resizeCanvas();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    startGame(state.mode);
}

function showGameScreen() {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $("game-screen").classList.add("active");
    $("game-screen").style.pointerEvents = "auto";
}

/* ==================== BOTONES DE COLOR ==================== */
function buildColorButtons() {
    const container = $("color-buttons");
    container.innerHTML = "";
    state.availableColors.forEach(colorKey => {
        const def = COLOR_DEFS[colorKey];
        const btn = document.createElement("button");
        btn.className = "color-btn";
        btn.style.backgroundColor = def.css;
        btn.dataset.color = colorKey;
        btn.textContent = def.name;
        if (def.key) {
            btn.title = `Tecla ${def.key}`;
        }
        btn.addEventListener("click", () => handleColorPress(colorKey, btn));
        container.appendChild(btn);
    });
}

/* ==================== COLOR OBJETIVO ==================== */
function setRandomTarget() {
    const colors = state.availableColors;
    let newColor;
    do {
        newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (colors.length > 1 && newColor === state.targetColor);

    state.targetColor = newColor;
    updateTargetColorName();
}

function updateTargetColorName() {
    const def = COLOR_DEFS[state.targetColor];
    const el = $("target-color-name");
    el.textContent = def.name;
    el.style.color = def.css;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "target-pop 0.3s ease";
}

/* ==================== HUD ==================== */
function updateHUD() {
    $("score").textContent = Math.floor(state.score);
    $("level").textContent = state.level;
    $("lives").textContent = "❤️".repeat(Math.max(0, state.lives)) + "🖤".repeat(Math.max(0, state.maxLives - state.lives));
    $("record").textContent = state.record;

    const progressBar = $("level-progress");
    const pct = Math.min(100, (state.levelProgress / state.levelMax) * 100);
    progressBar.style.setProperty('--fill-width', pct + '%');
    $("level-progress-text").textContent = `${Math.floor(state.levelProgress)}/${state.levelMax}`;
    $("progress-level-number").textContent = state.level;

    if (state.mode === "contrarreloj") {
        $("timer-display").textContent = `⏱ ${Math.ceil(state.timeRemaining)}`;
        $("timer-display").style.animation = state.timeRemaining <= 10 ? "pulse-red 0.5s ease infinite" : "";
    }

    renderActiveEffects();
}

/* ==================== EFECTOS ACTIVOS ==================== */
function renderActiveEffects() {
    const container = $("active-effects");
    container.innerHTML = "";
    if (state.mode === "contrarreloj") return;

    const now = Date.now();
    const effects = [];

    if (state.frozenUntil > now) effects.push([POWERUP_TYPES.congelar, Math.ceil((state.frozenUntil - now) / 1000)]);
    if (state.doubleUntil > now) effects.push([POWERUP_TYPES.doble, Math.ceil((state.doubleUntil - now) / 1000)]);
    if (state.speedBoostUntil > now) effects.push([POWERUP_TYPES.velocidad, Math.ceil((state.speedBoostUntil - now) / 1000)]);
    if (state.shieldActive) effects.push([POWERUP_TYPES.escudo, null]);

    effects.forEach(([def, rem]) => {
        const badge = document.createElement("div");
        badge.className = "effect-badge";
        badge.style.color = def.color;
        badge.style.borderColor = def.color;
        badge.innerHTML = `${def.icon} ${def.label}${rem ? " " + rem + "s" : ""}`;
        container.appendChild(badge);
    });
}

/* ==================== FRASES DINÁMICAS ==================== */
function showDynamicPhrase(text) {
    const el = $("dynamic-phrase");
    el.textContent = text || PHRASES[Math.floor(Math.random() * PHRASES.length)];
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
}

/* ==================== CREAR OBJETOS ==================== */
function createFallingObject() {
    const now = Date.now();
    const level = state.level;

    // Power-up ocasional
    if ((level >= 2 ? 0.07 : 0.03) > Math.random()) {
        const keys = Object.keys(POWERUP_TYPES);
        return {
            x: 0, y: -40, size: 38, speed: state.fallSpeed * 0.8,
            shape: "circle", powerup: true, isBlack: false, isGold: false,
            type: keys[Math.floor(Math.random() * keys.length)], collected: false
        };
    }

    // Determinar tipo especial
    const roll = Math.random();
    const blackChance = level >= 3 ? 0.12 : 0;
    const goldChance = level >= 2 ? 0.06 : 0;

    const obj = {
        x: 0, y: -40, size: 0, speed: 0,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        powerup: false, isBlack: false, isGold: false
    };

    if (roll < blackChance) {
        obj.isBlack = true;
        obj.color = "#1a1a2e";
        obj.border = "#000000";
    } else if (roll < blackChance + goldChance) {
        obj.isGold = true;
        obj.color = "#ffd700";
        obj.border = "#ffd700";
    } else {
        obj.colorKey = state.availableColors[Math.floor(Math.random() * state.availableColors.length)];
        obj.color = COLOR_DEFS[obj.colorKey].css;
    }

    obj.size = 30 + Math.random() * 25 + Math.min(15, level * 1.5);
    const margin = obj.size + 10;
    obj.x = margin + Math.random() * (canvasWidth - margin * 2);
    obj.speed = (state.fallSpeed + Math.random() * 1.2) * (now < state.speedBoostUntil ? 1.3 : 1);

    return obj;
}

/* ==================== MANEJAR COLOR ==================== */
function handleColorPress(colorKey, btn) {
    if (!state.running || state.paused || state.over || state.gameOver) return;
    playSound("clic");

    if (state.mode === "contrarreloj" && colorKey !== state.targetColor) {
        state.timeRemaining = Math.max(0, state.timeRemaining - 3);
    }

    if (colorKey === state.targetColor) {
        handleCorrect(colorKey, btn);
    } else {
        handleWrong(btn);
    }
}

/* ==================== ACIERTO ==================== */
function handleCorrect(colorKey, btn) {
    if (btn) {
        btn.classList.remove("correct");
        void btn.offsetWidth;
        btn.classList.add("correct");
        setTimeout(() => btn.classList.remove("correct"), 500);
    }

    playSound("acierto");

    state.combo++;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;

    const points = 10 * state.combo;

    if (state.combo >= 2) {
        playSound("combo");
        const comboEl = $("combo-display");
        comboEl.textContent = state.combo >= 10 ? `¡COMBO IMPARABLE! x${state.combo}` : `COMBO x${state.combo}`;
        comboEl.classList.toggle("imperial", state.combo >= 10);
        comboEl.classList.remove("show");
        void comboEl.offsetWidth;
        comboEl.classList.add("show");
        setTimeout(() => comboEl.classList.remove("show"), 800);
    }

    addScore(points);
    flashScreen("rgba(46, 213, 115, 0.2)");
    showDynamicPhrase();

    removeTargetObjects(colorKey);
    spawnBurst(btn, COLOR_DEFS[colorKey].css);

    setTimeout(setRandomTarget, 300);
    checkLevelProgress(points);
}

/* ==================== ERROR ==================== */
function handleWrong(btn) {
    playSound("error");

    // Escudo absorbe el error
    if (state.shieldActive) {
        state.shieldActive = false;
        showFloatingText("🛡️ ¡ESCUDO!", "#2ed573", canvasWidth / 2, canvasHeight / 2);
        shakeScreen();
        flashScreen("rgba(46, 213, 115, 0.15)");
        updateHUD();
        return;
    }

    if (btn) {
        btn.classList.remove("wrong");
        void btn.offsetWidth;
        btn.classList.add("wrong");
        setTimeout(() => btn.classList.remove("wrong"), 500);
    }

    state.combo = 0;
    shakeScreen();
    flashScreen("rgba(255, 71, 87, 0.25)");
    showDynamicPhrase("¡NO TE EQUIVOQUES!");
    showFloatingText("¡ERROR!", "#ff4757", canvasWidth / 2, canvasHeight / 2);

    if (state.mode !== "contrarreloj") {
        state.lives--;
        if (state.lives <= 0 && !state.gameOver) {
            state.gameOver = true;
            setTimeout(gameOver, 300);
        }
    }

    updateHUD();
}

/* ==================== PERDER VIDA POR OBJETO PASADO ==================== */
function loseLifeByObject(obj) {
    if (state.gameOver || state.over) return;

    if (obj.isBlack || obj.isGold || obj.powerup) return;

    if (obj.colorKey === state.targetColor) {
        if (state.mode === "contrarreloj") {
            state.timeRemaining = Math.max(0, state.timeRemaining - 2);
            showFloatingText("¡SE FUE! -2s", "#ff4757", obj.x, canvasHeight - 30);
            setRandomTarget();
            updateHUD();
            return;
        }

        state.lives--;
        shakeScreen();
        flashScreen("rgba(255, 71, 87, 0.25)");
        playSound("error");
        state.combo = 0;
        showFloatingText("¡SE FUE!", "#ff4757", obj.x, canvasHeight - 30);
        showDynamicPhrase("¡CUIDADO!");
        setRandomTarget();
        updateHUD();

        if (state.lives <= 0 && !state.gameOver) {
            state.gameOver = true;
            setTimeout(gameOver, 300);
        }
    }
}

/* ==================== POWER-UPS ==================== */
function collectPowerUp(obj) {
    applyPowerUp(obj.type);
    fallingObjects = fallingObjects.filter(o => o !== obj);
    spawnBurstAt(obj.x, obj.y, "#ffffff");
}

function collectGold(obj) {
    playSound("powerup");
    let points = 50;
    if (Date.now() < state.doubleUntil) points *= 2;
    showFloatingText(`💰 +${points}`, "#ffd700", obj.x, canvasHeight - 30);
    flashScreen("rgba(255, 215, 0, 0.15)");
    spawnBurstAt(obj.x, obj.y, "#ffd700");
    fallingObjects = fallingObjects.filter(o => o !== obj);
    state.score += points;
    state.levelProgress += points;
    updateHUD();
    checkLevelProgress(points);
    checkRecord();
}

function applyPowerUp(type) {
    playSound("powerup");
    const now = Date.now();

    switch (type) {
        case "velocidad":
            state.speedBoostUntil = now + 5000;
            showFloatingText("⚡ ¡VELOCIDAD!", "#ffc048", canvasWidth / 2, canvasHeight / 2);
            break;
        case "congelar":
            state.frozenUntil = now + 5000;
            showFloatingText("❄️ ¡CONGELAR!", "#17c0eb", canvasWidth / 2, canvasHeight / 2);
            break;
        case "vida":
            if (state.lives < state.maxLives) {
                state.lives++;
                showFloatingText("❤️ ¡+1 VIDA!", "#ff4757", canvasWidth / 2, canvasHeight / 2);
            } else {
                addScore(30);
            }
            break;
        case "doble":
            state.doubleUntil = now + 6000;
            showFloatingText("💎 ¡DOBLE PUNTOS!", "#a55eea", canvasWidth / 2, canvasHeight / 2);
            break;
        case "escudo":
            state.shieldActive = true;
            showFloatingText("🛡️ ¡ESCUDO!", "#2ed573", canvasWidth / 2, canvasHeight / 2);
            break;
    }
    updateHUD();
}

/* ==================== AÑADIR PUNTUACIÓN ==================== */
function addScore(basePoints) {
    let pts = basePoints;
    if (Date.now() < state.doubleUntil) pts *= 2;
    state.score += pts;
    state.levelProgress += pts;

    const color = Date.now() < state.doubleUntil ? "#a55eea" : "#2ed573";
    showFloatingText(`+${pts}`, color, canvasWidth / 2, canvasHeight * 0.3);
    updateHUD();
    checkRecord();
}

/* ==================== RÉCORD ==================== */
function checkRecord() {
    if (state.score > state.record) {
        state.record = Math.floor(state.score);
        localStorage.setItem("color_drop_record", String(state.record));
        $("record").textContent = state.record;
    }
}

/* ==================== PROGRESO DE NIVEL ==================== */
function checkLevelProgress() {
    const newLevel = calculateLevelFromScore(state.score);

    if (newLevel > state.level) {
        state.levelProgress = state.score - getLevelEntry(newLevel);
        state.levelMax = Math.max(1, getLevelNext(newLevel) - getLevelEntry(newLevel));
        setupForLevel(newLevel);
    }
    updateHUD();
}

/* ==================== ELIMINAR OBJETOS OBJETIVO ==================== */
function removeTargetObjects(colorKey) {
    fallingObjects = fallingObjects.filter(obj => {
        if (!obj.isBlack && !obj.isGold && !obj.powerup && obj.colorKey === colorKey) {
            spawnBurstAt(obj.x, obj.y, obj.color);
            return false;
        }
        return true;
    });
}

/* ==================== EFECTOS VISUALES ==================== */
function flashScreen(color) {
    const overlay = $("flash-overlay");
    overlay.style.background = color || "rgba(255,255,255,0.2)";
    overlay.classList.add("active");
    setTimeout(() => overlay.classList.remove("active"), 200);
}

function shakeScreen() {
    const overlay = $("shake-overlay");
    overlay.classList.remove("active");
    void overlay.offsetWidth;
    overlay.classList.add("active");
    setTimeout(() => overlay.classList.remove("active"), 350);
}

function spawnBurst(element, color) {
    const rect = element.getBoundingClientRect();
    const areaRect = $("play-area").getBoundingClientRect();
    const x = rect.left - areaRect.left + rect.width / 2;
    const y = rect.top - areaRect.top + rect.height / 2;
    spawnBurstAt(x, y, color);
}

function spawnBurstAt(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        const speed = 2 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            life: 1, color,
            decay: 0.02 + Math.random() * 0.02
        });
    }
}

function showFloatingText(text, color, x, y) {
    floatingTexts.push({ text, color, x, y, life: 1, vy: -1.5 });
}

/* ==================== NIVEL ARRIBA ==================== */
function showLevelUp(level) {
    const banner = $("level-up-banner");
    banner.textContent = `¡NIVEL ${level}!`;
    banner.classList.add("show");
    setTimeout(() => banner.classList.remove("show"), 1800);
}

/* ==================== PAUSA ==================== */
function togglePause() {
    if (!state.running || state.gameOver || state.over) return;
    initAudio();
    playSound("clic");

    state.paused = !state.paused;
    if (state.paused) {
        $("pause-menu").classList.add("active");
        $("game-screen").style.pointerEvents = "none";
    } else {
        $("pause-menu").classList.remove("active");
        $("game-screen").style.pointerEvents = "auto";
    }
}

/* ==================== LOOP PRINCIPAL ==================== */
let animationId = null;
let lastTime = 0;

function gameLoop(timestamp) {
    if (!state.running) return;

    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    if (state.paused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    state.elapsedTime += dt;

    if (state.mode === "contrarreloj") {
        state.timeRemaining -= dt;
        if (state.timeRemaining <= 0 && !state.gameOver) {
            state.timeRemaining = 0;
            state.gameOver = true;
            updateHUD();
            setTimeout(gameOver, 100);
            return;
        }
    }

    updateObjects(dt);
    draw();
    updateHUD();

    animationId = requestAnimationFrame(gameLoop);
}

/* ==================== ACTUALIZAR OBJETOS ==================== */
function updateObjects(dt) {
    const now = Date.now();
    const frozen = now < state.frozenUntil;
    const speedFactor = frozen ? 0.2 : 1;

    state.frameCount++;
    state.spawnTimer -= dt * 1000;

    if (state.spawnTimer <= 0) {
        const spawnCount = 1 + (state.level > 2 ? 1 : 0) + (state.level > 5 ? 1 : 0) + (state.score > 300 ? 1 : 0);
        for (let i = 0; i < spawnCount; i++) {
            if (Math.random() < 0.6) fallingObjects.push(createFallingObject());
        }
        state.spawnTimer = state.spawnInterval * (0.7 + Math.random() * 0.5);
    }

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.y += obj.speed * speedFactor * dt * 60;

        if (obj.y > canvasHeight + obj.size) {
            if (obj.powerup || obj.isGold) {
                fallingObjects.splice(i, 1);
            } else {
                loseLifeByObject(obj);
                fallingObjects.splice(i, 1);
            }
            continue;
        }

        if ((obj.powerup || obj.isGold) && !obj.collected && obj.y >= canvasHeight - 70) {
            obj.collected = true;
            if (obj.powerup) collectPowerUp(obj);
            else if (obj.isGold) collectGold(obj);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const t = floatingTexts[i];
        t.y += t.vy;
        t.life -= 0.02;
        if (t.life <= 0) floatingTexts.splice(i, 1);
    }
}

/* ==================== DIBUJAR ==================== */
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "rgba(15, 15, 26, 0.9)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    fallingObjects.forEach(obj => drawObject(obj));

    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    floatingTexts.forEach(t => {
        ctx.globalAlpha = Math.max(0, t.life);
        ctx.fillStyle = t.color;
        ctx.font = "bold 24px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 15;
        ctx.fillText(t.text, t.x, t.y);
        ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
}

/* ==================== DIBUJAR OBJETO ==================== */
function drawObject(obj) {
    const x = obj.x, y = obj.y, size = obj.size;

    if (obj.powerup) {
        ctx.save();
        ctx.translate(x, y);
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = `${size * 0.9}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";
        ctx.fillText(POWERUP_TYPES[obj.type].icon, 0, 1);
        ctx.restore();
        return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = obj.isBlack ? "#000" : obj.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    switch (obj.shape) {
        case "square": ctx.rect(-size / 2, -size / 2, size, size); break;
        case "triangle":
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath(); break;
        case "diamond":
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, 0);
            ctx.lineTo(0, size / 2);
            ctx.lineTo(-size / 2, 0);
            ctx.closePath(); break;
        default: ctx.arc(0, 0, size / 2, 0, Math.PI * 2); break;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

/* ==================== REDIMENSIONAR CANVAS ==================== */
function resizeCanvas() {
    const area = $("play-area");
    const rect = area.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* ==================== GAME OVER ==================== */
function gameOver() {
    if (state.over) return;
    state.over = true;
    state.running = false;

    if (animationId) cancelAnimationFrame(animationId);
    playSound("gameover");

    saveScore(Math.floor(state.score), state.mode);

    const finalScore = Math.floor(state.score);
    const newRecord = finalScore > state.record;
    if (newRecord) {
        state.record = finalScore;
        localStorage.setItem("color_drop_record", String(state.record));
        playSound("record");
    }

    showScreen("game-over");
    $("final-score").textContent = finalScore;
    $("final-level").textContent = state.level;
    $("final-combo").textContent = "x" + state.bestCombo;

    if (state.mode === "contrarreloj") {
        $("final-time-display").style.display = "block";
        $("final-time-display").textContent = `Tiempo restante: ${Math.floor(state.timeRemaining)}s`;
    } else {
        $("final-time-display").style.display = "none";
    }

    $("new-record-banner").style.display = newRecord ? "block" : "none";
}

/* ==================== EVENTOS ==================== */
document.addEventListener("keydown", (e) => {
    if (!state.running || state.paused || state.gameOver || state.over) return;

    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        togglePause();
        return;
    }

    const keyMap = { "1": "rojo", "2": "azul", "3": "verde", "4": "amarillo", "5": "naranja", "6": "morado" };
    if (keyMap[e.key] && state.availableColors.includes(keyMap[e.key])) {
        const btn = document.querySelector(`.color-btn[data-color="${keyMap[e.key]}"]`);
        handleColorPress(keyMap[e.key], btn);
    }
});

window.addEventListener("resize", () => {
    if (state.running) resizeCanvas();
});

/* ==================== FONDO PARTÍCULAS ==================== */
function initBackgroundParticles() {
    const container = $("bg-particles");
    const colors = ["#ff4757", "#3742fa", "#2ed573", "#ffc048", "#17c0eb", "#a55eea"];
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "bg-particle";
        const size = 3 + Math.random() * 6;
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (10 + Math.random() * 15) + "s";
        particle.style.animationDelay = (-Math.random() * 15) + "s";
        container.appendChild(particle);
    }
}

/* ==================== INICIALIZACIÓN ==================== */
document.addEventListener("DOMContentLoaded", () => {
    initBackgroundParticles();
    updateSoundIcons();
    loadRecord();
    showScreen("main-menu");
});
