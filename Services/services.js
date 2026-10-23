const SERVICE_VIDEOS = {
  drone: "https://www.youtube.com/watch?v=Rz-QJ0uBXRM",
  "diy-lulc": "https://www.youtube.com/watch?v=xGK4WGlHD3Y",
  bioacoustic: "https://www.youtube.com/watch?v=VIFJE174oDU",
  bioacaustic2: "https://www.youtube.com/watch?v=W1ebMReGzmQ&t=8s",
  "pest-forecasting": "https://www.youtube.com/watch?v=_mscAv_evlQ&feature=youtu.be",
  "drone-phenology": "https://drive.google.com/file/d/1v8fkMk2dLyIXxLwQBRDRm2hX9SSWeyRM/view"
};

const SERVICE_SLIDES = {
  drone: "https://github.com/stuck-in-infinity/TreeCrownDetection/blob/main/Drone_TreeCrown_Methodology_final.pdf",
  "diy-lulc": "https://github.com/salil-123/Project/blob/main/DIY%20LULC%20-%20methodology.pdf",
  bioacoustic: "https://github.com/err400/cem-backend/blob/master/BIOMON%20-%20methodology.pdf",
  "pest-forecasting": "https://github.com/ssjgit08/maharashtraPestDiseaseForecasting/blob/tower-deployment/docs/walkthroughDeck.pdf",
  "drone-phenology": "https://github.com/hbot07/Drone-Phenology-Monitoring/blob/main/Drone_Phenology_Monitoring.pdf"
};

/** Turns a github.com/.../blob/... link into the raw file link that PDF.js can download. Other links pass through. */
function getPdfFileUrl(link) {
  const match = link.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
  return match ? `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}` : link;
}

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

function initVideo() {
  document.querySelectorAll("[data-video-stage]").forEach(initVideoStage);
}

function initVideoStage(stage) {
  // A stage can pick its own link with data-video-key, otherwise the page's service is used
  const key = stage.dataset.videoKey || document.body.dataset.service;
  const embedUrl = getYouTubeEmbedUrl(SERVICE_VIDEOS[key] || "");
  if (!embedUrl) return; // keep the "Tutorial coming soon" placeholder

  const frame = document.createElement("iframe");
  frame.src = embedUrl;
  frame.title = `${stage.dataset.videoTitle} tutorial`;
  frame.loading = "lazy"; // do not load the player until it is near the screen
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allow =
    "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.allowFullscreen = true;

  const help = stage.closest(".video-section")?.querySelector("[data-video-help]");
  frame.addEventListener("error", () => {
    if (help) help.hidden = false;
  });

  stage.replaceChildren(frame);
}

// Open popups, oldest first. The last one is the topmost (a popup can open on top of another).
const openModals = [];

function setupModal(openIds, overlayId, closeId, onOpen) {
  const openBtns = [].concat(openIds).map((id) => document.getElementById(id)).filter(Boolean);
  const closeBtn = document.getElementById(closeId);
  const overlay = document.getElementById(overlayId);
  if (!openBtns.length || !closeBtn || !overlay) return;

  let lastOpener = openBtns[0];

  function setOpen(isOpen) {
    overlay.classList.toggle("is-open", isOpen);
    overlay.setAttribute("aria-hidden", String(!isOpen));

    const idx = openModals.indexOf(overlay);
    if (isOpen && idx === -1) openModals.push(overlay);
    if (!isOpen && idx !== -1) openModals.splice(idx, 1);

    // Keep page scroll locked while any popup is still open
    document.body.classList.toggle("modal-open", openModals.length > 0);
    (isOpen ? closeBtn : lastOpener).focus({ preventScroll: true });

    if (isOpen && onOpen) onOpen();
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      lastOpener = btn; // focus returns to whichever button opened it
      setOpen(true);
    });
  });
  closeBtn.addEventListener("click", () => setOpen(false));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) setOpen(false);
  });

  // Escape closes only the topmost popup
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && openModals[openModals.length - 1] === overlay) setOpen(false);
  });
}

// Walk Through popup: the PDF is only loaded the first time the popup opens.
// Desktop browsers show it in their own PDF viewer (iframe). Phones and tablets cannot show a PDF
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

function loadSlides() {
  const stage = document.querySelector("[data-slides-stage]");
  const src = SERVICE_SLIDES[document.body.dataset.service];
  if (!stage || !src || stage.dataset.loaded) return;
  stage.dataset.loaded = "true";

  const help = document.querySelector("[data-slides-help]");
  const showHelp = () => {
    if (help) help.hidden = false;
  };

  const openLink = document.querySelector("[data-slides-open]");
  if (openLink) openLink.href = src;

  const fileUrl = getPdfFileUrl(src);
  const isExternal = /^https?:\/\//.test(fileUrl);

  // GitHub does not let its files be shown inside an iframe (it forces a download),
  // so external PDFs are always drawn with PDF.js. Local PDFs keep the browser's own viewer.
  if (!isExternal && canShowPdfInline()) {
    const frame = document.createElement("iframe");
    frame.src = `${src}#view=FitH`;
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

function initModal() {
  setupModal("openMethod", "methodModal", "closeMethod");
  setupModal("openWalkthrough", "walkthroughModal", "closeWalkthrough", loadSlides);
  // Bioacoustic page only: repo popup opens from the page and from inside Methodology
  setupModal(["openRepoModal", "openRepoFromMethod"], "repoModal", "closeRepo");
}

document.addEventListener("DOMContentLoaded", () => {
  initVideo();
  initModal();
});