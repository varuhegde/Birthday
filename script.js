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

  // Stop music when leaving surprise screen
  if (activeScreen === "surprise" && bgMusic) {
    stopMusic();
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
const videoModal = document.getElementById("videoModal");
const surpriseVideo = document.getElementById("surpriseVideo");
const closeBtns = document.querySelectorAll(".close-modal");

giftCards.forEach((gift) => {
  gift.addEventListener("click", () => {
    if (gift.classList.contains("is-open")) return;
    
    gift.classList.add("is-open");
    
    const action = gift.dataset.action;
    
    if (action === "empty" && videoModal && surpriseVideo) {
      surpriseVideo.currentTime = 0;
      surpriseVideo.muted = false;
      surpriseVideo.volume = 1;
      videoModal.classList.add("is-open");
      // Load and play immediately for mobile gesture chain
      surpriseVideo.load();
      surpriseVideo.play().catch(() => {
        // Fallback: try again after a tiny delay
        surpriseVideo.muted = false;
        surpriseVideo.play();
      });
      window.setTimeout(() => {
        gift.classList.remove("is-open");
      }, 1050);
    } else if (action === "gallery") {
      window.setTimeout(() => {
        gift.classList.remove("is-open");
        showScreen("song-select");
      }, 1050);
    } else {
      window.setTimeout(() => {
        gift.classList.remove("is-open");
        
        if (action === "quote" && quoteModal) {
          quoteModal.classList.add("is-open");
        }
      }, 1050);
    }
  });
});

// Auto-close video when it ends
if (surpriseVideo && videoModal) {
  surpriseVideo.addEventListener("ended", () => {
    videoModal.classList.remove("is-open");
    surpriseVideo.pause();
  });
}

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const modal = document.getElementById(targetId);
    if (modal) modal.classList.remove("is-open");
  });
});

[quoteModal, videoModal].forEach((modal) => {
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

// Music & Song Selection Logic
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
const musicPrompt = document.getElementById("musicPrompt");
const songDropdown = document.getElementById("songDropdown");
const songOptions = document.querySelectorAll(".song-option");
let isMusicPlaying = false;
let selectedSong = "song.mp3";

function loadSong(songFile) {
  selectedSong = songFile;
  bgMusic.src = "assets/" + songFile;
  bgMusic.load();
  if (songDropdown) {
    songDropdown.value = songFile;
  }
}

function playMusic() {
  bgMusic.play().then(() => {
    isMusicPlaying = true;
    if (musicToggle) {
      musicToggle.classList.remove("is-off");
      musicToggle.querySelector(".music-label").textContent = "Music ON";
    }
    if (musicPrompt) musicPrompt.classList.remove("is-visible");
  }).catch(() => {
    if (musicPrompt) musicPrompt.classList.add("is-visible");
  });
}

function stopMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
  isMusicPlaying = false;
  if (musicToggle) {
    musicToggle.classList.add("is-off");
    musicToggle.querySelector(".music-label").textContent = "Music OFF";
  }
  if (musicPrompt) musicPrompt.classList.remove("is-visible");
}

// Song selection buttons
if (songOptions.length > 0) {
  songOptions.forEach(btn => {
    btn.addEventListener("click", () => {
      const songFile = btn.dataset.song;
      loadSong(songFile);
      showScreen("surprise");
      // Play immediately - no delay for mobile gesture chain
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        if (musicToggle) {
          musicToggle.classList.remove("is-off");
          musicToggle.querySelector(".music-label").textContent = "Music ON";
        }
        if (musicPrompt) musicPrompt.classList.remove("is-visible");
      }).catch(() => {
        if (musicPrompt) musicPrompt.classList.add("is-visible");
      });
    });
  });
}

// Dropdown song change
if (songDropdown) {
  songDropdown.addEventListener("change", () => {
    const songFile = songDropdown.value;
    const wasPlaying = isMusicPlaying;
    loadSong(songFile);
    if (wasPlaying) {
      playMusic();
    }
  });
}

if (musicToggle && bgMusic) {
  // Handle prompt tap
  if (musicPrompt) {
    musicPrompt.addEventListener("click", () => {
      playMusic();
    });
  }

  musicToggle.addEventListener("click", () => {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  });
}

// Headphone Prompt
const headphonePrompt = document.getElementById("headphonePrompt");
const closePrompt = document.getElementById("closePrompt");

if (headphonePrompt && closePrompt) {
  closePrompt.addEventListener("click", () => {
    headphonePrompt.classList.add("is-hidden");
  });
}
