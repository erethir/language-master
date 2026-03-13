const STORAGE_KEY = 'study_master_progress';
const THEME_KEY = 'study_master_theme';

const defaultAchievements = [
  { threshold: 0, icon: "🥚", title: "Recién Llegado", translation: "Newcomer" },
  { threshold: 8, icon: "🐣", title: "Aprendiz Curioso", translation: "Curious Learner" },
  { threshold: 16, icon: "🦅", title: "Viajero Valiente", translation: "Brave Traveler" },
  { threshold: 24, icon: "🦁", title: "Guerrero de Palabras", translation: "Word Warrior" },
  { threshold: 32, icon: "🐉", title: "Leyenda Viva", translation: "Living Legend" },
  { threshold: 39, icon: "👑", title: "Study Master", translation: "Master" }
];

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
  } else if (type === 'achievement') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
    osc.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  }
}

// State
let progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let missions = [];
let currentMission = null;
let currentTopic = null;
let currentQuestionIndex = 0;
let questions = [];
let mistakes = 0;
let questionLocked = false;

// DOM Elements
const screens = {
  missions: document.getElementById('missions-screen'),
  menu: document.getElementById('menu-screen'),
  quiz: document.getElementById('quiz-screen'),
  result: document.getElementById('result-screen')
};

const missionsGrid = document.getElementById('missions-grid');
const levelGrid = document.getElementById('level-grid');
const verbDisplay = document.getElementById('verb-display');
const pronounDisplay = document.getElementById('pronoun-display');
const blankDisplay = document.getElementById('blank-display');
const optionsGrid = document.getElementById('options-grid');
const freeTextContainer = document.getElementById('free-text-container');
const freeTextInput = document.getElementById('free-text-input');
const freeTextSubmit = document.getElementById('free-text-submit');
const progressBar = document.getElementById('progress-bar');
const mistakeCounter = document.getElementById('mistake-counter');
const resultStars = document.getElementById('result-stars');
const resultMessage = document.getElementById('result-message');
const achievementModal = document.getElementById('achievement-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalIcon = document.getElementById('modal-icon');
const modalTitleEs = document.getElementById('modal-title-es');
const modalTitleEn = document.getElementById('modal-title-en');

// HTML SVG for Star Icon
const starSVG = `<svg viewBox="0 0 24 24" class="star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

// Initialize App
async function init() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'theme-neon';
  document.documentElement.className = savedTheme;
  document.getElementById('theme-selector').value = savedTheme;

  document.getElementById('theme-selector').addEventListener('change', (e) => {
    document.documentElement.className = e.target.value;
    localStorage.setItem(THEME_KEY, e.target.value);
  });

  try {
    const res = await fetch('missions.json');
    const missionFiles = await res.json();
    for (const file of missionFiles) {
      const mRes = await fetch(file);
      const mData = await mRes.json();
      missions.push(mData);
    }
  } catch (e) {
    console.error('Failed to load missions', e);
  }

  renderMissions();

  document.getElementById('back-to-missions-btn').addEventListener('click', () => switchScreen('missions'));
  document.getElementById('back-to-menu-btn').addEventListener('click', () => switchScreen('menu'));
  document.getElementById('play-again-btn').addEventListener('click', () => startLevel(currentTopic));
  document.getElementById('map-btn').addEventListener('click', () => switchScreen('menu'));
  
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all your progress?')) {
      progress = {};
      saveProgress();
      renderMissions();
    }
  });

  closeModalBtn.addEventListener('click', () => {
    achievementModal.classList.add('hide');
  });

  freeTextSubmit.addEventListener('click', () => handleFreeTextSubmit());
  freeTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleFreeTextSubmit();
  });
}

function showAchievementModal(achievement) {
  modalIcon.innerText = achievement.icon;
  modalTitleEs.innerText = achievement.title;
  modalTitleEn.innerText = achievement.translation;
  achievementModal.classList.remove('hide');
  playSound('achievement');
  startConfetti();
}

function switchScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
  if (screenName === 'missions') renderMissions();
  if (screenName === 'menu' && currentMission) renderTopics();
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Missions Menu Logic
function renderMissions() {
  missionsGrid.innerHTML = '';
  missions.forEach(mission => {
    // calculate total stars earned in this mission
    if (!progress[mission.id]) progress[mission.id] = {};
    const missionStars = Object.values(progress[mission.id]).reduce((a, b) => a + Number(b), 0);
    const maxStars = mission.topics.length * 3;
    
    const card = document.createElement('div');
    card.className = 'verb-card';
    card.onclick = () => {
      initAudio();
      openMission(mission);
    };

    card.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.5rem">${mission.icon || '🎯'}</div>
      <h3>${mission.title}</h3>
      <p style="color: var(--text-dim); font-size: 0.9rem; margin-bottom: 1rem;">${mission.description}</p>
      <div class="stars-count" style="font-size: 1rem;">🌟 ${missionStars} / ${maxStars}</div>
    `;
    missionsGrid.appendChild(card);
  });
}

function openMission(mission) {
  currentMission = mission;
  renderTopics();
  switchScreen('menu');
}

// Topics Logic
function renderTopics() {
  document.getElementById('mission-title-display').innerText = currentMission.title;
  document.getElementById('mission-desc-display').innerText = currentMission.description || "Complete topics to earn stars!";

  levelGrid.innerHTML = '';
  
  const currentMissionProgress = progress[currentMission.id];

  currentMission.topics.forEach(topic => {
    const starsEarned = currentMissionProgress[topic.id] || 0;

    const card = document.createElement('div');
    card.className = 'verb-card';
    card.onclick = () => {
      initAudio(); // Required to bypass user-interaction rule for audio
      startLevel(topic);
    };

    card.innerHTML = `
      <h3>${topic.title}</h3>
      <div class="stars">
        ${starSVG.replace('class="star"', `class="star ${starsEarned >= 1 ? 'active' : ''}"`)}
        ${starSVG.replace('class="star"', `class="star ${starsEarned >= 2 ? 'active' : ''}"`)}
        ${starSVG.replace('class="star"', `class="star ${starsEarned >= 3 ? 'active' : ''}"`)}
      </div>
    `;
    levelGrid.appendChild(card);
  });
  updateStats();
}

function updateStats() {
  const currentMissionProgress = progress[currentMission.id] || {};
  const totalStars = Object.values(currentMissionProgress).reduce((a, b) => a + Number(b), 0);
  const maxStars = currentMission.topics.length * 3;
  
  document.getElementById('total-stars-count').innerText = totalStars;
  document.getElementById('max-stars-count').innerText = maxStars;

  const missionAchievements = currentMission.achievements || defaultAchievements;
  
  let currentAchievement = missionAchievements[0];
  for (let i = missionAchievements.length - 1; i >= 0; i--) {
    if (totalStars >= missionAchievements[i].threshold) {
      currentAchievement = missionAchievements[i];
      break;
    }
  }

  const titleEl = document.getElementById('achievement-title');
  const iconEl = document.getElementById('achievement-icon-display');
  if (titleEl && iconEl) {
    titleEl.innerText = currentAchievement.title;
    iconEl.innerText = currentAchievement.icon;
  }
}

// Quiz Logic
function startLevel(topic) {
  currentTopic = topic;
  currentQuestionIndex = 0;
  mistakes = 0;

  // Clone and shuffle questions
  questions = [...topic.questions].sort(() => Math.random() - 0.5);

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

  // Update UI Defaults
  verbDisplay.innerText = currentTopic.title;
  pronounDisplay.innerText = q.prompt;
  blankDisplay.innerText = '_________';
  blankDisplay.className = 'blank';
  progressBar.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;

  optionsGrid.innerHTML = '';
  
  if (q.type === 'free_text') {
    optionsGrid.classList.add('hide');
    freeTextContainer.classList.remove('hide');
    freeTextInput.value = '';
    freeTextInput.disabled = false;
    freeTextSubmit.disabled = false;
    freeTextInput.classList.remove('wrong', 'correct');
    setTimeout(() => freeTextInput.focus(), 50);
  } else {
    optionsGrid.classList.remove('hide');
    freeTextContainer.classList.add('hide');

    const options = generateOptions(q);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerText = opt;
      btn.onclick = () => handleAnswer(opt.trim().toLowerCase(), q.answer.trim().toLowerCase(), btn);
      optionsGrid.appendChild(btn);
    });
  }
}

function generateOptions(q) {
  if (q.options && q.options.length > 0) {
    return [...q.options].sort(() => Math.random() - 0.5);
  }
  
  // Fallback if no specific options are provided, use other answers from topic
  const allAnswers = currentTopic.questions.map(v => v.answer);
  const distractors = allAnswers.filter(a => a !== q.answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Pad with random words if needed
  while(distractors.length < 3) distractors.push("...")

  return [q.answer, ...distractors].sort(() => Math.random() - 0.5);
}

function handleFreeTextSubmit() {
  if (questionLocked) return;
  const q = questions[currentQuestionIndex];
  const inputVal = freeTextInput.value.trim().toLowerCase();
  if(!inputVal) return;
  
  handleAnswer(inputVal, q.answer.trim().toLowerCase(), freeTextInput, true);
}

function handleAnswer(selected, correct, element, isFreeText = false) {
  if (questionLocked) return;

  if (selected === correct) {
    questionLocked = true;
    playSound('correct');
    element.classList.add('correct');
    if (isFreeText) {
      freeTextInput.blur();
      blankDisplay.innerText = correct;
      blankDisplay.className = 'correct';
      blankDisplay.style.color = 'var(--primary)';
    }

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
    element.classList.add('wrong');
    mistakes++;
    updateMistakeDisplay();
    // Allow trying again after animation
    setTimeout(() => {
      element.classList.remove('wrong');
      if(isFreeText) {
          freeTextInput.focus();
      }
    }, 500);
  }
}

// Result Logic
function finishLevel() {
  progressBar.style.width = '100%';

  const currentMissionProgress = progress[currentMission.id] || {};
  const previousTotalStars = Object.values(currentMissionProgress).reduce((a, b) => a + Number(b), 0);

  // Calculate stars
  let stars = 0;
  if (mistakes === 0) {
    if (currentMissionProgress[currentTopic.id] >= 2) {
      stars = 3; // Second perfect run
    } else {
      stars = 2; // First perfect run
    }
  }
  else if (mistakes <= 2) stars = 1;

  if (stars >= 1) {
    playSound('win');
  }

  // Save progress if better than previous
  if (!currentMissionProgress[currentTopic.id] || currentMissionProgress[currentTopic.id] < stars) {
    currentMissionProgress[currentTopic.id] = stars;
    progress[currentMission.id] = currentMissionProgress;
    saveProgress();
  }

  const currentTotalStars = Object.values(currentMissionProgress).reduce((a, b) => a + Number(b), 0);
  const missionAchievements = currentMission.achievements || defaultAchievements;

  let newlyUnlockedAchievement = null;
  for (let i = 0; i < missionAchievements.length; i++) {
    if (missionAchievements[i].threshold > previousTotalStars && missionAchievements[i].threshold <= currentTotalStars) {
      newlyUnlockedAchievement = missionAchievements[i];
    }
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

  if (newlyUnlockedAchievement) {
    setTimeout(() => {
      showAchievementModal(newlyUnlockedAchievement);
    }, 800);
  }
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
