chrome.action.onClicked.addListener((tab) => {
  if (tab.url?.includes("youtube.com/watch")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleDynamicFullscreen,
    });
  }
});

function toggleDynamicFullscreen() {
  const STYLE_ID = "yt-dynamic-fullscreen-style";
  const existingStyle = document.getElementById(STYLE_ID);

  //OFF
  if (existingStyle) {
    existingStyle.remove();
    window.dispatchEvent(new Event("resize"));
    return;
  }

  const moviePlayer = document.querySelector("#movie_player");
  if (!moviePlayer) return alert("Player not found.");

  //Injected CSS
  const css = `
    ytd-app, ytd-watch-flexy, #columns, #primary, #primary-inner, #player {
      transform: none !important;
      animation: none !important;
      perspective: none !important;
      filter: none !important;
      will-change: auto !important;
      contain: none !important;
    }

    html, body, ytd-app {
      overflow: hidden !important;
    }

    #movie_player {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      background-color: #000 !important;
    }

    .html5-video-container {
      width: 100% !important;
      height: 100% !important;
      top: 0 !important;
      left: 0 !important;
    }

    video.html5-main-video {
      width: 100% !important;
      height: 100% !important;
      top: 0 !important;
      left: 0 !important;
      object-fit: contain !important; 
      display: block !important;
      visibility: visible !important;
    }

    #masthead-container, 
    #secondary, 
    #comments, 
    #info, 
    #meta,
    ytd-merch-shelf-renderer {
      display: none !important;
    }

    .ytd-watch-metadata {
      display: none !important;
    }
  `;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);

  setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
}
