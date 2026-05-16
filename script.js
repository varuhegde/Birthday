const stage = document.querySelector(".paper-stage");
const screens = [...document.querySelectorAll(".screen")];
const buttons = document.querySelectorAll("[data-next]");
const giftCards = document.querySelectorAll(".gift-card");

let activeScreen = "intro";
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

  // Auto-hide after 5 seconds
  setTimeout(() => {
    overlay.classList.remove('is-visible');
  }, 5000);
}

/* Removed makeHeart and burstHearts functions */

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.next;
    if (target === "good") {
      stage.classList.add("accepted");
    }
    showScreen(target);
  });
});

const quoteModal = document.getElementById("quoteModal");
const prankModal = document.getElementById("prankModal");
const closeBtns = document.querySelectorAll(".close-modal");

giftCards.forEach((gift) => {
  gift.addEventListener("click", () => {
    if (gift.classList.contains("is-open")) return;
    
    gift.classList.add("is-open");
    
    const action = gift.dataset.action;
    
    window.setTimeout(() => {
      // Remove is-open so the gift is reset and ready to be clicked again when they come back
      gift.classList.remove("is-open");
      
      if (action === "quote" && quoteModal) {
        quoteModal.classList.add("is-open");
      } else if (action === "empty" && prankModal) {
        prankModal.classList.add("is-open");
      } else if (action === "gallery") {
        showScreen("surprise");
      }
    }, 1050);
  });
});

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const modal = document.getElementById(targetId);
    if (modal) modal.classList.remove("is-open");
  });
});

[quoteModal, prankModal].forEach((modal) => {
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("is-open");
    });
  }
});

document.addEventListener("pointermove", (event) => {
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  stage.style.setProperty("--tilt-x", `${x * 8}deg`);
  stage.style.setProperty("--tilt-y", `${y * -8}deg`);
});

// Photo Gallery Modal Logic
const photoCards = document.querySelectorAll(".photo-card");
const photoModal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.querySelector(".modal-close");

if (photoCards.length > 0 && photoModal && modalImg && modalClose) {
  photoCards.forEach(card => {
    card.addEventListener("click", () => {
      const img = card.querySelector(".photo-img");
      if (img) {
        modalImg.src = img.src;
        photoModal.classList.add("is-open");
      }
    });
  });

  const closeModal = () => {
    photoModal.classList.remove("is-open");
    setTimeout(() => { modalImg.src = ""; }, 300);
  };

  modalClose.addEventListener("click", closeModal);
  
  photoModal.addEventListener("click", (e) => {
    if (e.target === photoModal) {
      closeModal();
    }
  });
}

// Music Toggle Logic
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
let isMusicPlaying = false;

if (musicToggle && bgMusic) {
  bgMusic.volume = 0.5;

  function resetMusicButton() {
    isMusicPlaying = false;
    musicToggle.classList.add("is-off");
    musicToggle.querySelector(".music-label").textContent = "Music OFF";
  }

  function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    resetMusicButton();
  }

  // Listen for screen changes
  const observer = new MutationObserver(() => {
    if (activeScreen === "surprise") {
      // On mobile, autoplay is blocked. Show button as OFF so user can tap to play.
      resetMusicButton();
    } else {
      stopMusic();
    }
  });
  observer.observe(stage, { attributes: true, attributeFilter: ["data-screen"] });

  musicToggle.addEventListener("click", () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      resetMusicButton();
    } else {
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicToggle.classList.remove("is-off");
        musicToggle.querySelector(".music-label").textContent = "Music ON";
      }).catch(() => {});
    }
  });
}
