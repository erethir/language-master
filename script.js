const verbsData = {
  beber: [
    { pronoun: 'yo', answer: 'bebo' },
    { pronoun: 'tú', answer: 'bebes' },
    { pronoun: 'él/ella/usted', answer: 'bebe' },
    { pronoun: 'nosotros/as', answer: 'bebemos' },
    { pronoun: 'vosotros/as', answer: 'bebéis' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'beben' }
  ],
  vivir: [
    { pronoun: 'yo', answer: 'vivo' },
    { pronoun: 'tú', answer: 'vives' },
    { pronoun: 'él/ella/usted', answer: 'vive' },
    { pronoun: 'nosotros/as', answer: 'vivimos' },
    { pronoun: 'vosotros/as', answer: 'vivís' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'viven' }
  ],
  estudiar: [
    { pronoun: 'yo', answer: 'estudio' },
    { pronoun: 'tú', answer: 'estudias' },
    { pronoun: 'él/ella/usted', answer: 'estudia' },
    { pronoun: 'nosotros/as', answer: 'estudiamos' },
    { pronoun: 'vosotros/as', answer: 'estudiáis' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'estudian' }
  ],
  aprender: [
    { pronoun: 'yo', answer: 'aprendo' },
    { pronoun: 'tú', answer: 'aprendes' },
    { pronoun: 'él/ella/usted', answer: 'aprende' },
    { pronoun: 'nosotros/as', answer: 'aprendemos' },
    { pronoun: 'vosotros/as', answer: 'aprendéis' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'aprenden' }
  ],
  escribir: [
    { pronoun: 'yo', answer: 'escribo' },
    { pronoun: 'tú', answer: 'escribes' },
    { pronoun: 'él/ella/usted', answer: 'escribe' },
    { pronoun: 'nosotros/as', answer: 'escribimos' },
    { pronoun: 'vosotros/as', answer: 'escribís' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'escriben' }
  ],
  trabajar: [
    { pronoun: 'yo', answer: 'trabajo' },
    { pronoun: 'tú', answer: 'trabajas' },
    { pronoun: 'él/ella/usted', answer: 'trabaja' },
    { pronoun: 'nosotros/as', answer: 'trabajamos' },
    { pronoun: 'vosotros/as', answer: 'trabajáis' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'trabajan' }
  ],
  abrir: [
    { pronoun: 'yo', answer: 'abro' },
    { pronoun: 'tú', answer: 'abres' },
    { pronoun: 'él/ella/usted', answer: 'abre' },
    { pronoun: 'nosotros/as', answer: 'abrimos' },
    { pronoun: 'vosotros/as', answer: 'abrís' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'abren' }
  ],
  tener: [
    { pronoun: 'yo', answer: 'tengo' },
    { pronoun: 'tú', answer: 'tienes' },
    { pronoun: 'él/ella/usted', answer: 'tiene' },
    { pronoun: 'nosotros/as', answer: 'tenemos' },
    { pronoun: 'vosotros/as', answer: 'tenéis' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'tienen' }
  ],
  ser: [
    { pronoun: 'yo', answer: 'soy' },
    { pronoun: 'tú', answer: 'eres' },
    { pronoun: 'él/ella/usted', answer: 'es' },
    { pronoun: 'nosotros/as', answer: 'somos' },
    { pronoun: 'vosotros/as', answer: 'sois' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'son' }
  ],
  estar: [
    { pronoun: 'yo', answer: 'estoy' },
    { pronoun: 'tú', answer: 'estás' },
    { pronoun: 'él/ella/usted', answer: 'está' },
    { pronoun: 'nosotros/as', answer: 'estamos' },
    { pronoun: 'vosotros/as', answer: 'estáis' },
    { pronoun: 'ellos/ellas/ustedes', answer: 'están' }
  ]
};

const STORAGE_KEY = 'espanol_master_progress';
const THEME_KEY = 'espanol_master_theme';

// Audio Context Setup (lazy init to bypass auto-play policies)
let audioCtx;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } else if (type === 'win') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);     // A4
    osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.15); // C#5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3);  // E5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.45);    // A5

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  }
}

// State
let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let currentVerb = null;
let currentQuestionIndex = 0;
let questions = [];
let mistakes = 0;
let questionLocked = false;

// DOM Elements
const screens = {
  menu: document.getElementById('menu-screen'),
  quiz: document.getElementById('quiz-screen'),
  result: document.getElementById('result-screen')
};

const levelGrid = document.getElementById('level-grid');
const verbDisplay = document.getElementById('verb-display');
const pronounDisplay = document.getElementById('pronoun-display');
const optionsGrid = document.getElementById('options-grid');
const progressBar = document.getElementById('progress-bar');
const mistakeCounter = document.getElementById('mistake-counter');
const resultStars = document.getElementById('result-stars');
const resultMessage = document.getElementById('result-message');

// HTML SVG for Star Icon
const starSVG = `<svg viewBox="0 0 24 24" class="star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

// Initialize App
function init() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'theme-neon';
  document.documentElement.className = savedTheme;
  document.getElementById('theme-selector').value = savedTheme;

  document.getElementById('theme-selector').addEventListener('change', (e) => {
    document.documentElement.className = e.target.value;
    localStorage.setItem(THEME_KEY, e.target.value);
  });

  renderMenu();

  document.getElementById('back-to-menu-btn').addEventListener('click', () => switchScreen('menu'));
  document.getElementById('play-again-btn').addEventListener('click', () => startLevel(currentVerb));
  document.getElementById('map-btn').addEventListener('click', () => switchScreen('menu'));
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all your progress?')) {
      progress = {};
      saveProgress();
      renderMenu();
    }
  });
}

function switchScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
  if (screenName === 'menu') renderMenu();
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Menu Logic
function renderMenu() {
  levelGrid.innerHTML = '';
  Object.keys(verbsData).forEach(verb => {
    const starsEarned = progress[verb] || 0;

    const card = document.createElement('div');
    card.className = 'verb-card';
    card.onclick = () => {
      initAudio(); // Required to bypass user-interaction rule for audio
      startLevel(verb);
    };

    card.innerHTML = `
      <h3>${verb}</h3>
      <div class="stars">
        ${starSVG.replace('class="star"', `class="star ${starsEarned >= 1 ? 'active' : ''}"`)}
        ${starSVG.replace('class="star"', `class="star ${starsEarned >= 2 ? 'active' : ''}"`)}
        ${starSVG.replace('class="star"', `class="star ${starsEarned >= 3 ? 'active' : ''}"`)}
      </div>
    `;
    levelGrid.appendChild(card);
  });
}

// Quiz Logic
function startLevel(verb) {
  currentVerb = verb;
  currentQuestionIndex = 0;
  mistakes = 0;

  // Clone and shuffle questions
  questions = [...verbsData[verb]].sort(() => Math.random() - 0.5);

  switchScreen('quiz');
  updateMistakeDisplay();
  loadQuestion();
}

function updateMistakeDisplay() {
  mistakeCounter.innerText = mistakes === 0 ? 'Perfect!' : `${mistakes} Mistake${mistakes > 1 ? 's' : ''}`;
  mistakeCounter.style.color = mistakes === 0 ? 'var(--primary)' : 'var(--star)';
}

function loadQuestion() {
  questionLocked = false;
  const q = questions[currentQuestionIndex];

  // Update UI
  verbDisplay.innerText = currentVerb;
  pronounDisplay.innerText = q.pronoun.charAt(0).toUpperCase() + q.pronoun.slice(1);
  progressBar.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;

  // Generate options
  optionsGrid.innerHTML = '';
  const options = generateOptions(q.answer, currentVerb);
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, q.answer, btn);
    optionsGrid.appendChild(btn);
  });
}

function generateOptions(correctAnswer, verb) {
  const allAnswers = verbsData[verb].map(v => v.answer);
  const distractors = allAnswers.filter(a => a !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
}

function handleAnswer(selected, correct, buttonElement) {
  if (questionLocked) return;

  if (selected === correct) {
    questionLocked = true;
    playSound('correct');
    buttonElement.classList.add('correct');

    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        loadQuestion();
      } else {
        finishLevel();
      }
    }, 800);
  } else {
    playSound('wrong');
    buttonElement.classList.add('wrong');
    mistakes++;
    updateMistakeDisplay();
    // Allow clicking again after animation
    setTimeout(() => {
      buttonElement.classList.remove('wrong');
    }, 500);
  }
}

// Result Logic
function finishLevel() {
  progressBar.style.width = '100%';
  playSound('win');

  // Calculate stars
  let stars = 0;
  if (mistakes === 0) {
    if (progress[currentVerb] >= 2) {
      stars = 3; // Second perfect run
    } else {
      stars = 2; // First perfect run
    }
  }
  else if (mistakes <= 2) stars = 1;

  // Save progress if better than previous
  if (!progress[currentVerb] || progress[currentVerb] < stars) {
    progress[currentVerb] = stars;
    saveProgress();
  }

  // Update Result UI
  resultStars.innerHTML = `
    ${starSVG.replace('class="star"', `class="star ${stars >= 1 ? 'active' : ''}"`)}
    ${starSVG.replace('class="star"', `class="star ${stars >= 2 ? 'active' : ''}"`)}
    ${starSVG.replace('class="star"', `class="star ${stars >= 3 ? 'active' : ''}"`)}
  `;

  if (stars === 3) {
    resultMessage.innerText = "¡Increíble! Perfect 2 times!";
    startConfetti();
  } else if (stars === 2) {
    resultMessage.innerText = "¡Perfecto! Do it again for 3 stars!";
    startConfetti();
  } else if (stars === 1) {
    resultMessage.innerText = "¡Muy bien! Just one mistake.";
    stopConfetti();
  } else {
    resultMessage.innerText = "You need more practice. Try again!";
    stopConfetti();
  }

  switchScreen('result');
}

// Simple Confetti using Canvas
let confettiAnimId;
function startConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#f43f5e', '#3b82f6', '#4ade80', '#fbbf24', '#c084fc'];

  for (let i = 0; i < 100; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      dy: Math.random() * 3 + 2,
      dx: Math.random() * 2 - 1,
      rot: Math.random() * 360,
      dr: Math.random() * 10 - 5
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.dy;
      p.x += p.dx;
      p.rot += p.dr;
      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    confettiAnimId = requestAnimationFrame(render);
  }
  render();
}

function stopConfetti() {
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Start
init();
