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

function initModal() {
  const openBtn = document.getElementById("openMethod");
  const closeBtn = document.getElementById("closeMethod");
  const overlay = document.getElementById("methodModal");
  if (!openBtn || !closeBtn || !overlay) return;

  function setOpen(isOpen) {
    overlay.classList.toggle("is-open", isOpen);
    overlay.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);
    (isOpen ? closeBtn : openBtn).focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) setOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initVideo();
  initModal();
});