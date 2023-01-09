interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getCurrentTime: () => number;
  getPlaybackQuality: () => string;
  getPlayerState: () => number;
  setAutonav: (state: boolean) => void;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (level: number) => void;
  toggleSubtitles: () => void;
  toggleSubtitlesOn: () => void;
  unMute: () => void;
}

interface flexy extends HTMLElement {
  theaterModeChanged_: (state: boolean) => void;
}

const ytutils = {
  autoexpanddescription: true,
  autoplay: "default",
  quality: "highres",
  size: "expand",
  speed: 1,
  subtitles: "default",
  volume: "default",
  volumelevel: 100,
  player: document.querySelector<player>("#movie_player")!,
  requestChange: () => {
    ytutils.changeVideoQuality();
    ytutils.changeVideoSize();
    ytutils.setSubtitles();
    ytutils.setAutoplay();
    ytutils.expandVideoDescription();
  },
  setSubtitles: () => {
    if (ytutils.subtitles === "default") return;
    ytutils.player.toggleSubtitlesOn();
    if (ytutils.subtitles === "off") ytutils.player.toggleSubtitles();
  },
  setAutoplay: () => {
    if (ytutils.autoplay === "default") return;
    let count = 0;
    const id = setInterval(() => {
      ytutils.player.setAutonav(ytutils.autoplay === "on");
      if (count++ === 20) clearInterval(id);
    }, 25);
  },
  getIntendedQuality: () => {
    const qualities = ytutils.player.getAvailableQualityLevels();
    return ytutils.quality === "highres" ||
      qualities.indexOf(ytutils.quality) === -1
      ? qualities[0]
      : ytutils.quality;
  },
  expandVideoDescription: () => {
    if (document.location.pathname.search(/^\/watch/) !== 0) return;
    if (ytutils.autoexpanddescription) {
      if (document.getElementById("action-panel-details")) {
        document
          .getElementById("action-panel-details")!
          .classList.remove("yt-uix-expander-collapsed");
      }
      if (document.querySelector("paper-button#more")) {
        document.querySelector<HTMLElement>("paper-button#more")!.click();
      } else {
        const interwal = document.defaultView!.setInterval(() => {
          if (!document.querySelector("paper-button#more")) return;
          document.defaultView!.clearInterval(interwal);
          document.querySelector<HTMLElement>("paper-button#more")!.click();
        }, 100);
      }
    }
  },
  getVolumeLevel: () => {
    switch (ytutils.volume) {
      case "default":
        return "default";
      case "mute":
        return 0;
      case "100":
        return 100;
      default:
        return ytutils.volumelevel;
    }
  },
  onSPFDone: () => {
    window.postMessage({ type: "GET_SETTINGS", text: "NULL" }, "*");
  },
  onNavigateFinish: () => {
    window.setTimeout(() => {
      ytutils.expandVideoDescription();
    }, 1000);
  },
  checkPlayerReady: () => {
    try {
      return ytutils.player.getPlayerState() !== -1;
    } catch (e) {
      return false;
    }
  },
  changeVideoQuality: () => {
    if (ytutils.quality !== "default") {
      const quality = ytutils.getIntendedQuality();
      ytutils.player.setPlaybackQualityRange(quality, quality);
    }
    const volume = ytutils.getVolumeLevel();
    if (volume !== "default") {
      ytutils.player.unMute();
      ytutils.player.setVolume(volume);
    }
    ytutils.player.setPlaybackRate(ytutils.speed);
  },
  changeVideoSize: () => {
    if (
      ytutils.size === "default" ||
      document.location.pathname.search(/^\/watch/) !== 0
    )
      return;
    const id = setInterval(() => {
      const flexy = document.querySelector<flexy>("ytd-watch-flexy");
      if (flexy) {
        clearInterval(id);
        switch (ytutils.size) {
          case "expand":
            flexy.theaterModeChanged_(true);
            break;
          case "shrink":
            flexy.theaterModeChanged_(false);
            break;
          case "chat": {
            let conut = 0;
            const id = setInterval(() => {
              flexy.theaterModeChanged_(
                !document
                  .querySelector("#show-hide-button")
                  ?.querySelector("button")
              );
              if (conut++ === 40) {
                clearInterval(id);
              }
            }, 50);
            break;
          }
        }
      }
    }, 100);
  },
};

window.onmessage = (ev: MessageEvent) => {
  if (ev.source !== window && ev.data.type) return;
  switch (ev.data.type) {
    case "UPDATE_SETTINGS":
      ytutils.autoexpanddescription = ev.data.autoexpanddescription;
      ytutils.autoplay = ev.data.autoplay;
      ytutils.quality = ev.data.quality;
      ytutils.size = ev.data.size;
      ytutils.speed = ev.data.speed;
      ytutils.subtitles = ev.data.subtitles;
      ytutils.volume = ev.data.volume;
      ytutils.volumelevel = ev.data.volumelevel;
      ytutils.requestChange();
      break;
  }
};

window.addEventListener("spfdone", ytutils.onSPFDone);
window.addEventListener("yt-navigate-start", ytutils.onSPFDone);
window.addEventListener("yt-navigate-finish", ytutils.onNavigateFinish);

window.onload = () => {
  const id = setInterval(() => {
    const player = document.querySelector<player>("#movie_player");
    if (player) {
      ytutils.player = player;
      ytutils.requestChange();
      ytutils.player.addEventListener("onStateChange", (state: number) => {
        if (state === -1) ytutils.requestChange();
      });
      clearInterval(id);
    }
  }, 25);
  if (document.location.pathname !== "/watch") clearInterval(id);
};
