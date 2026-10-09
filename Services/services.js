const SERVICE_VIDEOS = {
  drone: "../../resources/videos/drone.mp4",
  "diy-lulc": "../../resources/videos/diy-lulc.mp4",
  bioacoustic: "../../resources/videos/bioacoustic.mp4",
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

function setupModal(openIds, overlayId, closeId) {
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

function initModal() {
  setupModal("openMethod", "methodModal", "closeMethod");
  // Bioacoustic page only: repo popup opens from the page and from inside Methodology
  setupModal(["openRepoModal", "openRepoFromMethod"], "repoModal", "closeRepo");
}

document.addEventListener("DOMContentLoaded", () => {
  initVideo();
  initModal();
});