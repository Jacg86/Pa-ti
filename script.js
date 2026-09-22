window.addEventListener('load', () => {
  document.body.classList.remove('container');
  initFlowerHeartBursts();
});

function initFlowerHeartBursts() {
  window.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    createHeartBurst(e.clientX, e.clientY);
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (!e.target.closest('a') && !e.target.closest('button')) {
        createHeartBurst(touch.clientX, touch.clientY);
      }
    }
  }, { passive: true });
}

function createHeartBurst(x, y) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'burst-heart';
    heart.innerHTML = ['💖', '✨', '🌸', '🌹'][Math.floor(Math.random() * 4)];
    document.body.appendChild(heart);

    const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4);
    const velocity = Math.random() * 70 + 40;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity - 30;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.position = 'fixed';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.fontSize = `${Math.random() * 12 + 16}px`;
    heart.style.transform = `translate(-50%, -50%) scale(0.5)`;
    heart.style.opacity = '1';
    heart.style.transition = 'all 0.9s cubic-bezier(0.1, 0.8, 0.2, 1)';

    requestAnimationFrame(() => {
      heart.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.3)`;
      heart.style.opacity = '0';
    });

    setTimeout(() => {
      heart.remove();
    }, 950);
  }
}