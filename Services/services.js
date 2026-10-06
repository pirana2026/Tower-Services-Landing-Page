/* Add your YouTube URL or 11-character ID. Leave empty until the tutorial is ready. */
const SERVICE_VIDEOS = {
  drone: "https://www.youtube.com/watch?v=pwxeI1C284w",
  bioacoustic: "https://www.youtube.com/watch?v=6w0aUQSSL_E",
  "diy-lulc": "https://www.youtube.com/watch?v=I24Iw4L3Rrs"
};

function getYouTubeId(value) {
  const input = String(value || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id = null;
    if (host === "youtu.be") id = url.pathname.split("/")[1];
    else if (["youtube.com","www.youtube.com","m.youtube.com","youtube-nocookie.com","www.youtube-nocookie.com"].includes(host)) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "watch") id = url.searchParams.get("v");
      else if (["embed","shorts","live"].includes(parts[0])) id = parts[1];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

function initVideo() {
  const stage = document.querySelector("[data-video-stage]");
  if (!stage) return;
  const value = SERVICE_VIDEOS[document.body.dataset.service];
  const id = getYouTubeId(value);
  if (!id) { if (value) console.warn("Invalid YouTube URL"); return; }
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?controls=1&playsinline=1&rel=0`;
  iframe.title = `${stage.dataset.videoTitle} - YouTube tutorial`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  stage.replaceChildren(iframe);
  const help = document.querySelector("[data-video-help]");
  if (help) help.hidden = false;
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