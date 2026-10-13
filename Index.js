const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
const hasObserver = "IntersectionObserver" in window;

// Runs immediately (script is in <head>) so cards never flash before they hide.
if (hasObserver && !reduceMotion.matches) {
  document.documentElement.classList.add("reveal-enabled");
}

/* ---------- Helpers ---------- */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Toggle `is-visible` on elements while they are on screen (or once only). */
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


function watchOnScreen(element, onChange) {
  if (!hasObserver) return;
  new IntersectionObserver(([entry]) => onChange(entry.isIntersecting)).observe(element);
}

/* ---------- Hero title: types "Tower Services" letter by letter ---------- */

async function initHeroTitle() {
  const title = document.getElementById("tower-title");
  const heroImage = document.querySelector(".hero-image");
  if (!title || !heroImage || reduceMotion.matches) return;

  const TYPING_DELAY = 100;
  const HOLD_TIME = 3000;
  const RESTART_DELAY = 300;

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

  // Don't burn CPU on the typing loop while the hero is scrolled away.
  let onScreen = true;
  watchOnScreen(heroImage, (isVisible) => (onScreen = isVisible));

  const setAll = (opacity) => letters.forEach((span) => (span.style.opacity = opacity));
  const shouldStop = () => !title.isConnected || reduceMotion.matches;

  // Start typing only after the hero finished sliding in.
  const slideIns = heroImage
    .getAnimations()
    .filter((animation) => animation.animationName === "heroFromRight");
  await Promise.allSettled(slideIns.map((animation) => animation.finished));

  while (!shouldStop()) {
    if (!onScreen) {
      await wait(300);
      continue;
    }

    setAll("0");
    await wait(RESTART_DELAY);

    for (const span of letters) {
      if (shouldStop()) break;
      span.style.opacity = "1";
      await wait(TYPING_DELAY);
    }
    await wait(HOLD_TIME);
  }

  setAll("1");
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

  // All sizes below are in CSS pixels; the canvas is scaled for sharp retina screens.
  let width = 0;
  let height = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  class Leaf {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -15;
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

      const outside = this.y > height + 15 || this.x < -20 || this.x > width + 20;
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

  // One animation loop at a time: `frameId` doubles as the "is running" flag.
  let frameId = null;

  function frame() {
    ctx.clearRect(0, 0, width, height);
    leaves.forEach((leaf) => {
      leaf.update();
      leaf.draw();
    });
    frameId = requestAnimationFrame(frame);
  }

  function start() {
    if (frameId === null) frame();
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  start();

  // Keep the canvas matched to the hero, and pause while it is off-screen.
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(hero);
  } else {
    window.addEventListener("resize", resize);
  }

  watchOnScreen(hero, (isVisible) => (isVisible ? start() : stop()));
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

/**
 * Tilt angles follow the mouse. JS only writes two CSS variables;
 * the transform itself (and the dimmed neighbours) live in index.css.
 */
function initCardTilt() {
  const cards = document.querySelectorAll(".cards .card");
  if (!cards.length || !canHover.matches || reduceMotion.matches) return;

  const TILT_DIVISOR = 45; // higher = gentler tilt

  cards.forEach((card) => {
    let frameId = null;

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${y / TILT_DIVISOR}deg`);
        card.style.setProperty("--tilt-y", `${-x / TILT_DIVISOR}deg`);
      });
    });

    card.addEventListener("mouseleave", () => {
      cancelAnimationFrame(frameId);
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
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

  watchOnScreen(about, (isVisible) => {
    parts.forEach((el) => el.classList.toggle("is-visible", isVisible));
  });
}

/* ---------- Page background shifts while scrolling ---------- */

function initBackgroundShifts() {
  toggleBodyClass(document.querySelectorAll(".cards .card"), "cards-visible-bg", 0.15);
  toggleBodyClass(document.querySelectorAll("#how"), "how-visible-bg", 0.05);
  toggleBodyClass(document.querySelectorAll(".site-footer"), "footer-visible-bg", 0.1);
}

/* ---------- Modals (STACD + Infrastructure) ---------- */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Open popups, oldest first. The last one is the topmost
// (the Walk Through popup opens on top of the STACD popup).
const openModals = [];

function setupModal(openBtnId, overlayId, closeBtnId, onOpen) {
  const openBtn = document.getElementById(openBtnId);
  const overlay = document.getElementById(overlayId);
  const closeBtn = document.getElementById(closeBtnId);
  if (!openBtn || !overlay) return;

  const isTop = () => openModals[openModals.length - 1] === overlay;

  function open() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    if (!openModals.includes(overlay)) openModals.push(overlay);
    document.body.classList.add("modal-open");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    if (onOpen) onOpen();
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    const idx = openModals.indexOf(overlay);
    if (idx !== -1) openModals.splice(idx, 1);

    // Keep page scroll locked while any popup is still open.
    document.body.classList.toggle("modal-open", openModals.length > 0);

    // Stop any video that is playing inside this modal.
    overlay.querySelectorAll("video").forEach((video) => video.pause());
    // A YouTube player cannot be paused from here, so reloading it is what stops the sound.
    overlay.querySelectorAll(".modal-video iframe").forEach((frame) => {
      frame.src = frame.src;
    });
    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);

  // Click on the dark backdrop closes it; clicks inside the dialog do not.
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    // Only the topmost popup reacts to the keyboard.
    if (!isTop()) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    // Keep Tab / Shift+Tab inside the open dialog.
    if (event.key === "Tab") {
      const items = Array.from(overlay.querySelectorAll(FOCUSABLE)).filter(
        (el) => !el.hidden && el.offsetParent !== null
      );
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* ---------- STACD tutorial video (YouTube) ---------- */

const STACD_VIDEO = "https://www.youtube.com/watch?v=Y5AIbn2-YYY";

/** Turns any common YouTube link into an embeddable URL, or returns null if it is not one. */
function getYouTubeEmbedUrl(link) {
  let url;
  try {
    url = new URL(link);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
      if (match) id = match[1];
    }
  }

  if (!id || !/^[\w-]{11}$/.test(id)) return null;

  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  const start = url.searchParams.get("t") || url.searchParams.get("start");
  if (start && /^\d+s?$/.test(start)) params.set("start", parseInt(start, 10));

  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

/** Puts the player into the STACD popup, only the first time it opens. */
function loadStacdVideo() {
  const stage = document.querySelector("#stacdModalOverlay [data-video-stage]");
  if (!stage || stage.dataset.loaded) return;

  const embedUrl = getYouTubeEmbedUrl(STACD_VIDEO);
  if (!embedUrl) return; // keep the box hidden
  stage.dataset.loaded = "true";

  const frame = document.createElement("iframe");
  frame.src = embedUrl;
  frame.title = `${stage.dataset.videoTitle} tutorial`;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allow =
    "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.allowFullscreen = true;

  stage.replaceChildren(frame);
  stage.hidden = false;
}

/* ---------- STACD Walk Through slides (PDF) ---------- */

// Comes straight from the STACD GitHub repo (paste the normal /blob/ link here)
const STACD_SLIDES =
  "https://github.com/SaharshLaud/STACD_framework/blob/dev/report/STACD%20Methodology%20Deck.pdf";

/** Turns a github.com/.../blob/... link into the raw file link that PDF.js can download. Other links pass through. */
function getPdfFileUrl(link) {
  const match = link.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
  return match ? `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}` : link;
}

// Desktop browsers show the PDF in their own viewer (iframe). Phones and tablets cannot show a PDF
// inside an iframe (they only offer an "Open" button), so there the pages are drawn with PDF.js.
const PDFJS_VERSION = "3.11.174";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

function canShowPdfInline() {
  const touch = window.matchMedia("(pointer: coarse)").matches;
  return !touch && navigator.pdfViewerEnabled !== false;
}

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PDFJS_BASE}/pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function renderSlidePages(stage, src) {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument(src).promise;

  const pages = document.createElement("div");
  pages.className = "slides-pages";
  stage.classList.add("is-pages");
  stage.replaceChildren(pages);

  const width = pages.clientWidth || stage.clientWidth;
  const ratio = Math.min(window.devicePixelRatio || 1, 2); // sharp, but not huge on phones

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: (width / base.width) * ratio });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `Slide ${i} of ${pdf.numPages}`);
    pages.appendChild(canvas);

    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  }
}

/** Loads the PDF into the popup, only the first time it opens. */
function loadStacdSlides() {
  const overlay = document.getElementById("stacdWalkthroughModal");
  const stage = overlay && overlay.querySelector("[data-slides-stage]");
  if (!stage || stage.dataset.loaded) return;
  stage.dataset.loaded = "true";

  const help = overlay.querySelector("[data-slides-help]");
  const showHelp = () => {
    if (help) help.hidden = false;
  };

  const openLink = overlay.querySelector("[data-slides-open]");
  if (openLink) openLink.href = STACD_SLIDES;

  const fileUrl = getPdfFileUrl(STACD_SLIDES);
  const isExternal = /^https?:\/\//.test(fileUrl);

  // GitHub does not let its files be shown inside an iframe (it forces a download),
  // so external PDFs are always drawn with PDF.js. Local PDFs keep the browser's own viewer.
  if (!isExternal && canShowPdfInline()) {
    const frame = document.createElement("iframe");
    frame.src = `${STACD_SLIDES}#view=FitH`;
    frame.title = stage.dataset.slidesTitle || "Walk through slides";
    frame.allowFullscreen = true;
    frame.addEventListener("error", showHelp);
    stage.replaceChildren(frame);
  } else {
    renderSlidePages(stage, fileUrl).catch(() => {
      stage.replaceChildren();
      showHelp();
    });
  }
}

function initModals() {
  setupModal("openStacdModal", "stacdModalOverlay", "closeStacdModal", loadStacdVideo);
  setupModal("openInfraModal", "infraModalOverlay", "closeInfraModal");
  // Opens on top of the STACD popup; Esc / close returns to it.
  setupModal(
    "openStacdWalkthrough",
    "stacdWalkthroughModal",
    "closeStacdWalkthrough",
    loadStacdSlides
  );
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