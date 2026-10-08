/* Add your YouTube URL or 11-character ID. Leave empty until the tutorial is ready. */

/* Path to your own video, relative to the service page (e.g. services/drone/drone.html). */
const SERVICE_VIDEOS = {
  drone: "../../resources/videos/drone.mp4",
  bioacoustic: "../../resources/videos/bioacoustic.mp4",
  "diy-lulc": "../../resources/videos/diy-lulc.mp4"
};

function initVideo() {
  const stage = document.querySelector("[data-video-stage]");
  if (!stage) return;
  const src = SERVICE_VIDEOS[document.body.dataset.service];
  if (!src) return;                       // empty hai to "Tutorial coming soon" dikhega

  const video = document.createElement("video");
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";             // page khulte hi poori video download nahi hogi
  video.title = `${stage.dataset.videoTitle} - tutorial`;
  video.src = src;

  const help = document.querySelector("[data-video-help]");
  video.addEventListener("error", () => { if (help) help.hidden = false; });

  stage.replaceChildren(video);
}

function initModal() {
  const open = document.getElementById("openMethod");
  const overlay = document.getElementById("methodModal");
  if (!open || !overlay) return;
  const set = (on) => { overlay.classList.toggle("is-open", on); overlay.setAttribute("aria-hidden", String(!on)); };
  open.addEventListener("click", () => set(true));
  document.getElementById("closeMethod").addEventListener("click", () => set(false));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
}

document.addEventListener("DOMContentLoaded", () => { initVideo(); initModal(); });