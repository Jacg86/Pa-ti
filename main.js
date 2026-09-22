/**
 * main.js - Lógica interactiva para la página principal
 * Efectos: 3D Tilt, partículas flotantes e interactivas de corazones,
 * modales de fotos/carta, y generador de melodía romántica con Web Audio.
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initPolaroidTilt();
  initModals();
  initAudioPlayer();
  initClickHeartBursts();
});

/* -------------------------------------------------------------
 * 1. Sistema de Partículas de Fondo (Corazones y Destellos)
 * ------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const totalParticles = window.innerWidth < 600 ? 25 : 50;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
      this.color = Math.random() > 0.3 ? '#ff4d6d' : '#ffb3c1';
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'heart') {
        ctx.fillStyle = this.color;
        drawHeart(ctx, 0, 0, this.size);
      } else {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#ff758f';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // Left curve
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size * 1.15);
    // Right curve
    ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------------------------------
 * 2. Explosión de corazones en clics / toques
 * ------------------------------------------------------------- */
function initClickHeartBursts() {
  window.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.modal-container')) return;
    createHeartBurst(e.clientX, e.clientY);
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (!e.target.closest('button') && !e.target.closest('.modal-container')) {
        createHeartBurst(touch.clientX, touch.clientY);
      }
    }
  }, { passive: true });
}

function createHeartBurst(x, y) {
  const count = 7;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'burst-heart';
    heart.innerHTML = '❤️';
    document.body.appendChild(heart);

    const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4);
    const velocity = Math.random() * 60 + 40;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity - 30;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.position = 'fixed';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.fontSize = `${Math.random() * 12 + 14}px`;
    heart.style.transform = `translate(-50%, -50%) scale(0.5)`;
    heart.style.opacity = '1';
    heart.style.transition = 'all 0.8s cubic-bezier(0.1, 0.8, 0.2, 1)';

    requestAnimationFrame(() => {
      heart.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.2)`;
      heart.style.opacity = '0';
    });

    setTimeout(() => {
      heart.remove();
    }, 850);
  }
}

/* -------------------------------------------------------------
 * 3. Efecto 3D Tilt con física en las Polaroid Cards
 * ------------------------------------------------------------- */
function initPolaroidTilt() {
  const cards = document.querySelectorAll('.polaroid-card');

  cards.forEach((card) => {
    let bounds;

    function rotateToMouse(e) {
      bounds = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2,
      };

      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      const maxAngle = 14;
      const rotX = -(center.y / (bounds.height / 2)) * maxAngle;
      const rotY = (center.x / (bounds.width / 2)) * maxAngle;

      card.style.transform = `
        perspective(1000px)
        scale3d(1.08, 1.08, 1.08)
        rotateX(${rotX.toFixed(2)}deg)
        rotateY(${rotY.toFixed(2)}deg)
        translateZ(20px)
      `;
    }

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    });

    card.addEventListener('mousemove', rotateToMouse);

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease';
      // Restaurar rotación base original
      const initialRotation = card.getAttribute('data-rotation') || '0deg';
      card.style.transform = `rotate(${initialRotation})`;
    });
  });
}

/* -------------------------------------------------------------
 * 4. Modales: Lightbox de Fotos y Carta
 * ------------------------------------------------------------- */
const photoData = {
  '1': {
    title: 'Aventuras y Risas',
    quote: '"De esos momentos donde cualquier tontería se convertía en un ataque de risa. Gracias por ser una buena amiga."',
  },
  '2': {
    title: 'Siempre Presente',
    quote: '"Por las charlas, las anécdotas y por estar siempre ahí en las buenas y en las malas. Me alegra contar con tu amistad."',
  },
  '3': {
    title: 'Momentos Inolvidables',
    quote: '"Gracias por ser esa persona especial que siempre alegra el día."',
  },
  '4': {
    title: 'Para Ti Siempre 🤍',
    quote: '"Un pequeño detalle para recordarte lo mucho que vales y lo genial que eres."',
  }
};

function initModals() {
  const photoModal = document.getElementById('photoModal');
  const letterModal = document.getElementById('letterModal');
  const closeButtons = document.querySelectorAll('.modal-close-btn');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  // Abrir modal de foto al dar clic a una polaroid
  const cards = document.querySelectorAll('.polaroid-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const img = card.querySelector('img');
      const imgSrc = img ? img.src : '';
      const data = photoData[id] || { title: 'Nuestra Foto', quote: 'Un momento especial.' };

      const modalImg = document.getElementById('lightboxImg');
      const modalTitle = document.getElementById('lightboxTitle');
      const modalQuote = document.getElementById('lightboxQuote');

      if (modalImg) modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalQuote) modalQuote.textContent = data.quote;

      if (photoModal) photoModal.classList.add('active');
    });
  });

  // Abrir modal de carta
  const letterBtn = document.getElementById('openLetterBtn');
  if (letterBtn && letterModal) {
    letterBtn.addEventListener('click', () => {
      letterModal.classList.add('active');
    });
  }

  // Cerrar modales con botones de cierre
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllModals();
    });
  });

  // Cerrar al dar clic fuera del contenido
  modalOverlays.forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Cerrar con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  function closeAllModals() {
    if (photoModal) photoModal.classList.remove('active');
    if (letterModal) letterModal.classList.remove('active');
  }
}

/* -------------------------------------------------------------
 * 5. Generador de Melodía (Web Audio API Synth)
 * ------------------------------------------------------------- */
function initAudioPlayer() {
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audioBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let timerId = null;

  // Secuencia de notas suaves (Pentatónica)
  // Frecuencias en Hz (Do mayor / La menor suave: C4, D4, E4, G4, A4, C5, D5, E5)
  const notes = [
    261.63, 293.66, 329.63, 392.00, 440.00,
    523.25, 587.33, 659.25, 783.99, 880.00
  ];

  // Acordes suaves de fondo
  const chords = [
    [261.63, 329.63, 392.00], // C
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66], // G
  ];

  let chordIndex = 0;
  let melodyStep = 0;

  function playBellNote(freq, time, duration = 1.8, volume = 0.08) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Envolvente de volumen tipo cajita musical suave
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  function scheduleMusic() {
    if (!isPlaying || !audioCtx) return;

    const now = audioCtx.currentTime;

    // Tocar acorde de fondo cada 4 tiempos
    if (melodyStep % 4 === 0) {
      const currentChord = chords[chordIndex % chords.length];
      currentChord.forEach((f) => {
        playBellNote(f * 0.5, now, 3.5, 0.04); // Acorde bajo suave
      });
      chordIndex++;
    }

    // Melodía tipo arpegio suave
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    playBellNote(randomNote, now, 1.6, 0.07);

    melodyStep++;
    timerId = setTimeout(scheduleMusic, 600);
  }

  function togglePlay() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
      audioBtn.classList.add('playing');
      audioBtn.title = 'Pausar música';
      audioBtn.innerHTML = '🎵';
      scheduleMusic();
    } else {
      audioBtn.classList.remove('playing');
      audioBtn.title = 'Reproducir música';
      audioBtn.innerHTML = '🔇';
      if (timerId) clearTimeout(timerId);
    }
  }

  audioBtn.addEventListener('click', togglePlay);
}
