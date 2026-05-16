const stage = document.querySelector(".paper-stage");
const screens = [...document.querySelectorAll(".screen")];
const buttons = document.querySelectorAll("[data-next]");
const sparkles = document.querySelector(".sparkles");
const giftCard = document.querySelector(".gift-card");

let activeScreen = "intro";
let sparkleTimer = window.setInterval(makeHeart, 620);
let blowTimeout = null;

function showScreen(name) {
  if (name === activeScreen) {
    return;
  }

  const current = screens.find((screen) => screen.dataset.view === activeScreen);
  const next = screens.find((screen) => screen.dataset.view === name);

  if (!next) {
    return;
  }

  stage.dataset.screen = name;
  activeScreen = name;

  if (current) {
    current.classList.add("exiting");
    window.setTimeout(() => current.classList.remove("is-active", "exiting"), 480);
  }

  // Clear any pending blow timer
  if (blowTimeout) {
    clearTimeout(blowTimeout);
    blowTimeout = null;
  }

  window.setTimeout(() => {
    next.classList.add("is-active");
    burstHearts(name === "birthday" || name === "surprise" ? 18 : 8);

    // Start auto-blow countdown when birthday screen appears
    if (name === "birthday") {
      resetBirthdayScreen();
      // The cake takes ~6.6s to build, candles arrive at 6s.
      // 6s (entry) + 5s (requested delay) = 11s
      blowTimeout = setTimeout(blowOutCandles, 11000);
    }
  }, 210);
}

/* ── Reset birthday screen state ── */
function resetBirthdayScreen() {
  const birthdayArticle = document.querySelector('.screen-birthday');
  if (!birthdayArticle) return;

  birthdayArticle.classList.remove('blown-out');

  const overlay = birthdayArticle.querySelector('.celebration-overlay');
  if (overlay) overlay.classList.remove('is-visible');

  const confettiBox = birthdayArticle.querySelector('.confetti-container');
  if (confettiBox) confettiBox.innerHTML = '';

  // Restart SVG animations
  const svg = birthdayArticle.querySelector('svg#cake');
  if (svg) {
    svg.pauseAnimations();
    svg.setCurrentTime(0);
    svg.unpauseAnimations();
  }
}

/* ── Blow out candles ── */
function blowOutCandles() {
  const birthdayArticle = document.querySelector('.screen-birthday');
  if (!birthdayArticle || activeScreen !== 'birthday') return;

  birthdayArticle.classList.add('blown-out');

  // Trigger celebration effects
  setTimeout(() => {
    launchConfetti(birthdayArticle);
    burstHearts(35);
  }, 400);

  setTimeout(() => {
    showCelebration(birthdayArticle);
  }, 1000);
}

/* ── Confetti explosion ── */
function launchConfetti(container) {
  const confettiBox = container.querySelector('.confetti-container');
  if (!confettiBox) return;

  const colors = [
    '#ff6b9d', '#c44dff', '#ff4757', '#ffa502',
    '#2ed573', '#1e90ff', '#ffeb3b', '#e84393',
    '#00cec9', '#fd79a8', '#6c5ce7', '#fdcb6e'
  ];

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.random() * 8 + 6}px`;
    piece.style.height = `${Math.random() * 10 + 8}px`;
    piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confettiBox.appendChild(piece);

    setTimeout(() => piece.remove(), 5000);
  }
}

/* ── Show celebration wish overlay ── */
function showCelebration(container) {
  const overlay = container.querySelector('.celebration-overlay');
  if (!overlay) return;

  overlay.classList.add('is-visible');
  burstHearts(25);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    overlay.classList.remove('is-visible');
  }, 5000);
}

function makeHeart() {
  if (!sparkles) {
    window.clearInterval(sparkleTimer);
    return;
  }

  const heart = document.createElement("span");
  heart.innerHTML = "&hearts;";
  heart.style.left = `${Math.random() * 84 + 8}%`;
  heart.style.top = `${Math.random() * 70 + 18}%`;
  heart.style.animationDuration = `${Math.random() * 1.4 + 2.6}s`;
  heart.style.fontSize = `${Math.random() * 18 + 16}px`;
  sparkles.appendChild(heart);
  window.setTimeout(() => heart.remove(), 4200);
}

function burstHearts(amount) {
  for (let i = 0; i < amount; i += 1) {
    window.setTimeout(makeHeart, i * 45);
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.next;
    if (target === "good") {
      stage.classList.add("accepted");
    }
    showScreen(target);
  });
});

giftCard.addEventListener("click", () => {
  giftCard.classList.add("is-open");
  burstHearts(28);
  window.setTimeout(() => {
    giftCard.classList.remove("is-open");
    showScreen("surprise");
  }, 1050);
});

document.addEventListener("pointermove", (event) => {
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  stage.style.setProperty("--tilt-x", `${x * 8}deg`);
  stage.style.setProperty("--tilt-y", `${y * -8}deg`);
});

burstHearts(8);
