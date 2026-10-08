/* =========================================================
   Tower Services · Landing page behaviour
   Sections: reveal flag · helpers · hero title · falling leaves
   · card tilt · scroll reveals · background shifts · modals
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
const hasObserver = "IntersectionObserver" in window;

// Runs immediately (script is in <head>) so cards never flash before they hide.
if (hasObserver && !reduceMotion.matches) {
  document.documentElement.classList.add("reveal-enabled");
}

/* ---------- Helpers ---------- */

/** Toggle `is-visible` on elements while they are on screen. */
function observeVisibility(elements, { threshold = 0.2, once = false } = {}) {
  if (!elements.length) return;

  // Very old browsers: just show everything.
  if (!hasObserver) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold }
  );

  elements.forEach((el) => observer.observe(el));
}

/** Add `className` to <body> while any of `targets` is on screen. */
function toggleBodyClass(targets, className, threshold) {
  if (!hasObserver || !targets.length) return;

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      document.body.classList.toggle(className, visible.size > 0);
    },
    { threshold }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Hero title: types "Tower Services" letter by letter ---------- */

async function initHeroTitle() {
  const title = document.getElementById("tower-title");
  const heroImage = document.querySelector(".hero-image");
  if (!title || !heroImage || reduceMotion.matches) return;

  const text = title.textContent.trim();
  title.setAttribute("aria-label", text);

  const letters = Array.from(text).map((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.opacity = "0";
    span.setAttribute("aria-hidden", "true");
    return span;
  });
  title.replaceChildren(...letters);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const TYPING_DELAY = 100;
  const HOLD_TIME = 3000;
  const RESTART_DELAY = 300;

  // Start typing only after the hero finished sliding in.
  const slideIns = heroImage
    .getAnimations()
    .filter((animation) => animation.animationName === "heroFromRight");
  await Promise.allSettled(slideIns.map((animation) => animation.finished));

  while (title.isConnected && !reduceMotion.matches) {
    letters.forEach((span) => (span.style.opacity = "0"));
    await wait(RESTART_DELAY);

    for (const span of letters) {
      if (!title.isConnected || reduceMotion.matches) break;
      span.style.opacity = "1";
      await wait(TYPING_DELAY);
    }
    await wait(HOLD_TIME);
  }

  letters.forEach((span) => (span.style.opacity = "1"));
}

/* ---------- Falling leaves inside the hero ---------- */

function initLeaves() {
  const canvas = document.getElementById("bg-particles");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero || reduceMotion.matches) return;

  const ctx = canvas.getContext("2d");
  const COLORS = [
    "rgba(168, 209, 132, 0.7)",
    "rgba(132, 178, 101, 0.6)",
    "rgba(214, 240, 138, 0.75)",
    "rgba(90, 150, 60, 0.55)",
  ];
  const LEAF_COUNT = window.innerWidth < 650 ? 18 : 35;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  class Leaf {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : -15;
      this.size = Math.random() * 5 + 4;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.flipX = Math.random() * Math.PI * 2;
      this.flipY = Math.random() * Math.PI * 2;
      this.flipSpeedX = Math.random() * 0.03 + 0.01;
      this.flipSpeedY = Math.random() * 0.02 + 0.01;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update() {
      this.y += this.speedY;
      this.sway += this.swaySpeed;
      this.x += Math.sin(this.sway) * 0.6 + this.speedX;
      this.rotation += this.rotationSpeed;
      this.flipX += this.flipSpeedX;
      this.flipY += this.flipSpeedY;

      const outside =
        this.y > canvas.height + 15 || this.x < -20 || this.x > canvas.width + 20;
      if (outside) this.reset();
    }

    draw() {
      const s = this.size;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.sin(this.flipX), Math.cos(this.flipY));
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s / 2, -s / 2, s / 2, s / 2, 0, s);
      ctx.bezierCurveTo(-s / 2, s / 2, -s / 2, -s / 2, 0, -s);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  resize();
  const leaves = Array.from({ length: LEAF_COUNT }, () => new Leaf());

  let running = true;
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    leaves.forEach((leaf) => {
      leaf.update();
      leaf.draw();
    });
    requestAnimationFrame(frame);
  }
  frame();

  // Keep the canvas matched to the hero, and pause when it is off-screen.
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(hero);
  } else {
    window.addEventListener("resize", resize);
  }

  if (hasObserver) {
    new IntersectionObserver(([entry]) => {
      const shouldRun = entry.isIntersecting;
      if (shouldRun && !running) {
        running = true;
        frame();
      } else if (!shouldRun) {
        running = false;
      }
    }).observe(hero);
  }
}

/* ---------- Service cards ---------- */

function initCardReveal() {
  const cards = document.querySelectorAll(".cards .card");
  if (!cards.length || !document.documentElement.classList.contains("reveal-enabled")) return;

  cards.forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${index * 180}ms`);
  });
  observeVisibility(cards, { threshold: 0.15 });
}

/** Gentle 3D tilt that follows the mouse. Skipped on touch screens. */
function initCardTilt() {
  const grid = document.querySelector(".cards");
  const cards = document.querySelectorAll(".cards .card");
  if (!grid || !cards.length || !canHover.matches || reduceMotion.matches) return;

  const REST = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)";
  let frameId = null;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(1000px) rotateX(${y / 45}deg) rotateY(${-x / 45}deg) scale(1.025) translateY(-4px)`;
        card.style.opacity = "1";

        cards.forEach((other) => {
          if (other === card) return;
          other.style.transform = "perspective(1000px) scale(0.98)";
          other.style.opacity = "0.85";
        });
      });
    });
  });

  grid.addEventListener("mouseleave", () => {
    cancelAnimationFrame(frameId);
    cards.forEach((card) => {
      card.style.transform = REST;
      card.style.opacity = "1";
    });
  });
}

/* ---------- Scroll reveals ---------- */

function initResourceReveal() {
  const links = document.querySelectorAll(".resource-links a");
  if (!links.length || !hasObserver || reduceMotion.matches) return;

  links.forEach((link, index) => {
    link.classList.add("reveal-resource");
    link.style.setProperty("--reveal-delay", `${index * 300}ms`);
  });
  observeVisibility(links, { threshold: 0.15, once: true });
}

function initTextReveal() {
  observeVisibility(document.querySelectorAll(".animate-text"), { threshold: 0.2 });
}

function initAboutReveal() {
  const about = document.getElementById("about");
  if (!about) return;

  // Card and its texts reveal together, once the section is in view.
  const parts = about.querySelectorAll(".animate-about-card, .animate-about-text");
  if (!hasObserver) {
    parts.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      parts.forEach((el) => el.classList.toggle("is-visible", entry.isIntersecting));
    },
    { threshold: 0.1 }
  );
  observer.observe(about);
}

/* ---------- Page background shifts while scrolling ---------- */

function initBackgroundShifts() {
  toggleBodyClass(document.querySelectorAll(".cards .card"), "cards-visible-bg", 0.15);
  toggleBodyClass(document.querySelectorAll("#how"), "how-visible-bg", 0.05);
  toggleBodyClass(document.querySelectorAll(".site-footer"), "footer-visible-bg", 0.1);
}

/* ---------- Modals (STACD + Infrastructure) ---------- */

function setupModal(openBtnId, overlayId, closeBtnId) {
  const openBtn = document.getElementById(openBtnId);
  const overlay = document.getElementById(overlayId);
  const closeBtn = document.getElementById(closeBtnId);
  if (!openBtn || !overlay) return;

  function open() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
}

function initModals() {
  setupModal("openStacdModal", "stacdModalOverlay", "closeStacdModal");
  setupModal("openInfraModal", "infraModalOverlay", "closeInfraModal");
}

/* ---------- Start everything ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initHeroTitle();
  initLeaves();
  initCardReveal();
  initCardTilt();
  initResourceReveal();
  initTextReveal();
  initAboutReveal();
  initBackgroundShifts();
  initModals();
});
