/* Add your real YouTube video URL or 11-character video ID below.
   Leave empty until the tutorial is ready. No sample video is substituted. */
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
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'watch') id = url.searchParams.get('v');
      else if (['embed','shorts','live'].includes(parts[0])) id = parts[1];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

function initializeServicePage() {
  const stage = document.querySelector('[data-video-stage]');
  if (!stage) return;
  const key = document.body.dataset.service;
  const value = SERVICE_VIDEOS[key];
  const id = getYouTubeId(value);
  if (!id) {
    if (value) console.warn('Invalid YouTube URL for service:', key);
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?controls=1&playsinline=1&rel=0`;
  iframe.title = `${stage.dataset.videoTitle} — YouTube tutorial`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  stage.replaceChildren(iframe);
  document.querySelector('[data-video-help]').hidden = false;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeServicePage);
} else {
  initializeServicePage();
}
