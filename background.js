chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleDynamicFullscreen,
  });
});

function toggleDynamicFullscreen() {
  const FLAG = "__yt_dynamic_fullscreen__";

  const video = document.querySelector("video");
  const player =
    document.querySelector("#player") ||
    document.querySelector("#movie_player");
  const thumbnailOverlay = document.querySelector(
    ".ytp-cued-thumbnail-overlay"
  );

  if (!video || !player) {
    alert("This doesn't look like a YouTube video page.");
    return;
  }

  //TURN OFF
  if (window[FLAG]) {
    clearInterval(window[FLAG].intervalId);
    window.removeEventListener("resize", window[FLAG].resizeHandler);
    if (window[FLAG].resizeObserver) window[FLAG].resizeObserver.disconnect();

    document.body.style = window[FLAG].originalBodyStyle;
    document.documentElement.style = window[FLAG].originalHtmlStyle;
    document.documentElement.style.overflow = window[FLAG].originalHtmlOverflow || "";

    for (const [el, display] of window[FLAG].hiddenElements) {
      el.style.display = display;
    }

    if (video) video.style = window[FLAG].originalVideoStyle;
    if (player) player.style = window[FLAG].originalPlayerStyle;
    if (thumbnailOverlay)
      thumbnailOverlay.style.display = window[FLAG].originalThumbnailDisplay;

    delete window[FLAG];
    return;
  }

  //TURN ON
  const hiddenElements = [];
  for (const el of document.body.children) {
    if (!el.contains(player)) {
      hiddenElements.push([el, el.style.display]);
      el.style.display = "none";
    }
  }

  const originalStyles = {
    originalBodyStyle: document.body.getAttribute("style") || "",
    originalHtmlStyle: document.documentElement.getAttribute("style") || "",
    originalHtmlOverflow: document.documentElement.style.overflow || "",
    originalVideoStyle: video.getAttribute("style") || "",
    originalPlayerStyle: player.getAttribute("style") || "",
    originalThumbnailDisplay: thumbnailOverlay?.style.display || "",
    hiddenElements,
  };

  document.body.style.margin = "0";
  document.body.style.backgroundColor = "black";
  document.body.style.overflow = "hidden";
  document.documentElement.style.backgroundColor = "black";
  document.documentElement.style.overflow = "hidden";

  if (thumbnailOverlay) thumbnailOverlay.style.display = "none";

  player.style.position = "fixed";
  player.style.top = "50%";
  player.style.left = "50%";
  player.style.transform = "translate(-50%, -50%)";
  player.style.zIndex = "9999";
  player.style.margin = "0";
  player.style.backgroundColor = "black";

  video.style.display = "block";
  video.style.backgroundColor = "black";
  video.style.objectFit = "contain";
  video.style.maxWidth = "100vw";
  video.style.maxHeight = "100vh";

  const resize = () => {
    if (!video.videoWidth || !video.videoHeight) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const aspect = video.videoWidth / video.videoHeight;

    let newW = winW;
    let newH = winW / aspect;

    if (newH > winH) {
      newH = winH;
      newW = newH * aspect;
    }

    video.style.width = `${newW}px`;
    video.style.height = `${newH}px`;
    player.style.width = `${newW}px`;
    player.style.height = `${newH}px`;

    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (isFullscreen) {
      video.style.maxWidth = "100%";
      video.style.maxHeight = "100%";
    }
  };

  const resizeHandler = () => resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(video);

  const intervalId = setInterval(resize, 500);
  window.addEventListener("resize", resizeHandler);
  resize();

  window[FLAG] = {
    ...originalStyles,
    intervalId,
    resizeHandler,
    resizeObserver,
  };
}
