const welcomeModal = document.getElementById('welcomeModal');
const startButton = document.getElementById('startButton');
const button = document.getElementById('unicornButton');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let bestScore = Number(localStorage.getItem('unicorn-clicker-best') || 0);
let confettiPieces = [];
let animationFrameId = null;

function updateScoreboard() {
  scoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
}

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function burstConfetti(x, y) {
  const colors = ['#ffd166', '#ff78c4', '#7df9ff', '#ffffff', '#ff6b6b'];

  for (let i = 0; i < 32; i += 1) {
    const piece = {
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.8) * 8,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: Math.random() * 45 + 55,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
    };
    confettiPieces.push(piece);
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = confettiPieces.length - 1; i >= 0; i -= 1) {
    const piece = confettiPieces[i];
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += 0.08;
    piece.rotation += piece.spin;
    piece.life -= 1;
    piece.alpha = Math.max(piece.life / 80, 0);

    if (piece.life <= 0) {
      confettiPieces.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.globalAlpha = piece.alpha;
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
    ctx.restore();
  }

  if (confettiPieces.length > 0) {
    animationFrameId = window.requestAnimationFrame(animateConfetti);
  } else {
    animationFrameId = null;
  }
}

function startConfettiAnimation() {
  if (!animationFrameId) {
    animationFrameId = window.requestAnimationFrame(animateConfetti);
  }
}

function playClickSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function handleClick(event) {
  score += 1;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('unicorn-clicker-best', String(bestScore));
  }

  updateScoreboard();
  playClickSound();
  button.classList.remove('pop');
  void button.offsetWidth;
  button.classList.add('pop');

  const rect = button.getBoundingClientRect();
  const x = event.clientX || rect.left + rect.width / 2;
  const y = event.clientY || rect.top + rect.height / 2;

  burstConfetti(x, y);
  startConfettiAnimation();
}

function closeWelcomeModal() {
  welcomeModal.classList.add('hidden');
}

startButton.addEventListener('click', closeWelcomeModal);
button.addEventListener('click', handleClick);
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
updateScoreboard();
