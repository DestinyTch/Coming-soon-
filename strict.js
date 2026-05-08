
(() => {
  // Prevent multiple initializations
  if (window._premiumLoaderActive) return;
  window._premiumLoaderActive = true;

  // Configuration
  const LOGO_SRC = 'favicon.png'; // Change if your logo has a different name/path
  const PARTICLE_COUNT = 40;
  const FADE_OUT_DURATION = 800; // ms

  // Create stylesheet
  const style = document.createElement('style');
  style.textContent = `
    #premium-loader-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: #000;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    #premium-loader-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
      animation: spin 4s linear infinite;
      filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));
      z-index: 10;
      pointer-events: none;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .premium-particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      pointer-events: none;
      z-index: 5;
    }
    @media (max-width: 768px) {
      #premium-loader-logo { width: 90px; height: 90px; }
    }
    #premium-loader-overlay.fade-out {
      animation: fadeOut ${FADE_OUT_DURATION}ms ease-out forwards;
    }
    @keyframes fadeOut {
      to { opacity: 0; visibility: hidden; }
    }
  `;
  document.head.appendChild(style);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'premium-loader-overlay';

  // Create logo
  const logo = new Image();
  logo.id = 'premium-loader-logo';
  logo.src = LOGO_SRC;
  logo.alt = 'Loading...';
  logo.onerror = () => {
    // Fallback if logo fails to load
    logo.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTYwIDBDMzMuMSAwIDYgMzMuMSA2IDYwczI3LjEgNjAgNjAgNjA2MC02MCA2MC02MC0yNy4xLTYwLTYwLTYwem0wIDEwNGMtMjQuMyAwLTQ0LTIwLTQ0LTQ0czE5LjctNDQgNDQtNDRjMjQuNCAwIDQ0IDIwIDQ0IDQ0czE5LjcgNDQgNDQgNDR6IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNCIvPjwvc3ZnPg==';
  };

  overlay.appendChild(logo);

  // Floating particles canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  overlay.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = [];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 4 + 1;
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    if (!overlay.isConnected) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  // Handle resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  // Disable interactions while loading
  const disableInteractions = (e) => {
    if (!overlay.isConnected) return;
    const key = e.key?.toLowerCase();
    const forbiddenKeys = ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12'];
    
    if (
      e.ctrlKey || 
      e.metaKey || 
      e.shiftKey && (e.ctrlKey || e.metaKey) ||
      forbiddenKeys.includes(key) ||
      e.type === 'contextmenu' ||
      (e.type === 'selectstart') ||
      (e.type === 'dragstart')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const eventsToBlock = [
    'contextmenu',
    'selectstart',
    'dragstart',
    'keydown',
    'keyup',
    'keypress'
  ];

  eventsToBlock.forEach(event => {
    document.addEventListener(event, disableInteractions, { capture: true, passive: false });
  });

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    eventsToBlock.forEach(event => {
      document.removeEventListener(event, disableInteractions, { capture: true });
    });
    window._premiumLoaderActive = false;
  };

  // Wait for everything to load
  const removeLoader = () => {
    if (overlay.classList.contains('fade-out')) return;
    
    overlay.classList.add('fade-out');
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      cleanup();
    }, FADE_OUT_DURATION);
  };

  // Comprehensive load detection
  const checkLoadComplete = () => {
    if (
      document.readyState === 'complete' &&
      (!window.loadFired || performance.getEntriesByType?.('navigation')[0]?.loadEventEnd > 0)
    ) {
      setTimeout(removeLoader, 300); // Small delay for polish
    }
  };

  // Multiple fallback methods
  window.addEventListener('load', () => {
    window.loadFired = true;
    checkLoadComplete();
  });

  document.addEventListener('readystatechange', checkLoadComplete);

  // Final fallback
  setTimeout(() => {
    if (overlay.isConnected) removeLoader();
  }, 8000);

  // Start animation
  document.documentElement.appendChild(overlay);
  animateParticles();

  // Immediate check if page already loaded (for cached pages)
  if (document.readyState === 'complete') {
    setTimeout(removeLoader, 600);
  }
})();
