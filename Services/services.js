const SERVICE_VIDEOS = {
  drone: "../../resources/videos/drone.mp4",
  "diy-lulc": "../../resources/videos/diy_lulc.mp4",
  bioacoustic: "../../resources/videos/bioacoustic.mp4",
};

// Walk Through slides, exported as PDF and kept in resources/ppt (browsers cannot show .pptx directly)
const SERVICE_SLIDES = {
  drone: "../../resources/ppt/drone.pdf",
  "diy-lulc": "../../resources/ppt/diy_lulc.pdf",
  bioacoustic: "../../resources/ppt/bioacoustic.pdf",
};

function initVideo() {
  const stage = document.querySelector("[data-video-stage]");
  if (!stage) return;

  const src = SERVICE_VIDEOS[document.body.dataset.service];
  if (!src) return;

  const video = document.createElement("video");
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata"; // do not download the whole file on page load
  video.title = `${stage.dataset.videoTitle} tutorial`;
  video.src = src;

  const help = document.querySelector("[data-video-help]");
  video.addEventListener("error", () => {
    if (help) help.hidden = false;
  });

  stage.replaceChildren(video);
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

  if (canShowPdfInline()) {
    const frame = document.createElement("iframe");
    frame.src = `${src}#view=FitH`;
    frame.title = stage.dataset.slidesTitle || "Walk through slides";
    frame.allowFullscreen = true;
    frame.addEventListener("error", showHelp);
    stage.replaceChildren(frame);
  } else {
    renderSlidePages(stage, src).catch(() => {
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