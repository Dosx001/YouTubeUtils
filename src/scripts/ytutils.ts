interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getCurrentTime: () => number;
  getPlaybackQuality: () => string;
  getPlayerState: () => number;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (number: string) => void;
  unMute: () => void;
}

interface flexy extends HTMLElement {
  theaterModeChanged_: (state: boolean) => void;
}

const ytutils = {
  autoexpanddescription: null,
  autosubtitles: null,
  playlistvideoautoplaybehavior: null,
  quality: null,
  size: null,
  speed: null,
  suggestedautoplay: null,
  volume: null,
  volumelevel: null,
  youtubevideoautoplaybehavior: null,
  isOptionHandle: null,
  player: document.querySelector<player>("#movie_player"),
  requestChange: () => {
    ytutils.changeVideoQuality();
    ytutils.changeVideoSize();
    ytutils.expandVideoDescription(ytutils.isOptionHandle);
    ytutils.enablesuggestedautoplay();
  },
  getIntendedQuality: () => {
    const currentvideoquality = ytutils.getVideoQuality();
    if (currentvideoquality === "highres")
      return ytutils.player.getAvailableQualityLevels()[0];
    if (
      ytutils.player
        .getAvailableQualityLevels()
        .indexOf(currentvideoquality) === -1
    )
      return ytutils.player.getAvailableQualityLevels()[0];
    return currentvideoquality;
  },
  getSetVideoQuality: () => {
    const currentvideoquality = ytutils.getVideoQuality();
    return currentvideoquality === "hd2160" &&
      ytutils.player
        .getAvailableQualityLevels()
        .indexOf(currentvideoquality) === -1
      ? ytutils.player.getAvailableQualityLevels()[0]
      : currentvideoquality;
  },
  getVideoQuality: () =>
    ytutils.quality === "4k2160" ? "hd2160" : ytutils.quality,
  getPlaylistVideoAutoPlayBehavior: () => {
    switch (ytutils.playlistvideoautoplaybehavior) {
      case "default":
      case "autoplay":
        return true;
      case "autopause":
        return false;
    }
  },
  getYoutubeVideoAutoPlayBehavior: () => {
    switch (ytutils.youtubevideoautoplaybehavior) {
      case "default":
      case "autosubtitles":
        return true;
      case "autopause":
        return false;
    }
  },
  enablesuggestedautoplay: () => {
    if (document.location.pathname.search(/^\/watch/) == 0) {
      const check =
        document.querySelector<HTMLInputElement>("#autoplay-checkbox");
      if (check) {
        check.click();
        check.checked = ytutils.suggestedautoplay;
      }
      document
        .querySelector<HTMLInputElement>(
          `paper-toggle-button#toggle[aria-pressed*=${!ytutils.suggestedautoplay}]`
        )
        ?.click();
    }
  },
  expandVideoDescription: (isOptionHandle: boolean) => {
    if (document.location.pathname.search(/^\/watch/) !== 0) return;
    if (ytutils.autoexpanddescription) {
      if (document.getElementById("action-panel-details")) {
        document
          .getElementById("action-panel-details")
          .classList.remove("yt-uix-expander-collapsed");
      }
      if (document.querySelector("paper-button#more")) {
        document.querySelector<HTMLElement>("paper-button#more").click();
      } else {
        const interwal = document.defaultView.setInterval(() => {
          if (!document.querySelector("paper-button#more")) return;
          document.defaultView.clearInterval(interwal);
          document.querySelector<HTMLElement>("paper-button#more").click();
        }, 100);
      }
    } else if (isOptionHandle) {
      document.querySelector<HTMLElement>("paper-button#less").click();
    }
  },
  getVolumeLevel: () => {
    switch (ytutils.volume) {
      case "default":
        return "default";
      case "mute":
        return 0;
      case "100%":
        return 100;
      default:
        return ytutils.volumelevel;
    }
  },
  onSPFDone: () => {
    window.postMessage(
      { type: "FROM_PAGE_SCRIPT_REQUEST_CHANGE", text: "NULL" },
      "*"
    );
  },
  onNavigateFinish: () => {
    window.setTimeout(() => {
      ytutils.expandVideoDescription(null);
    }, 1000);
  },
  scrollTo: () => {
    let top = 0;
    let node = document.querySelector<HTMLElement>("#page-manager");
    do {
      top += node.offsetTop;
    } while ((node = node.offsetParent as HTMLElement));
    if (!document.body.classList.contains("fullytpagesize")) top /= 2;
    document.defaultView.scrollTo(0, top);
  },
  Slistener: (ev: TransitionEvent) => {
    if (
      ev.propertyName === "transform" &&
      (ev.target as HTMLElement).id === "progress" &&
      (ev.target as HTMLElement).style.transform === "scaleX(1)"
    )
      ytutils.scrollTo();
  },
  checkPlayerReady: () => {
    try {
      return ytutils.player.getPlayerState() !== -1;
    } catch (e) {
      return false;
    }
  },
  onPlayerStateChange: (newState: number) => {
    try {
      if (
        newState === -1 ||
        ytutils.player.getPlaybackQuality() !== ytutils.getIntendedQuality()
      ) {
        const interval = window.setInterval(() => {
          if (document.location.pathname !== "/watch") {
            window.clearInterval(interval);
          }
          try {
            const mxx = ytutils.getSetVideoQuality();
            ytutils.player.setPlaybackQualityRange(mxx, mxx);
            if (
              ytutils.player.getPlaybackQuality() ===
              ytutils.getIntendedQuality()
            ) {
              window.clearInterval(interval);
            }
          } catch (e) {
            window.clearInterval(interval);
          }
        }, 25);
      }
    } catch (e) { }
  },
  changeVideoQuality: () => {
    if (location.hostname.search(/youtube.com$/) !== -1) {
      ytutils.player?.addEventListener(
        "onStateChange",
        ytutils.onPlayerStateChange
      );
      window.addEventListener("spfdone", ytutils.onSPFDone);
      window.addEventListener("yt-navigate-start", ytutils.onSPFDone);
      window.addEventListener("yt-navigate-finish", ytutils.onNavigateFinish);
      window.addEventListener("transitionend", ytutils.Slistener, true);
      if (document.location.pathname.indexOf("/embed") === 0) {
        ytutils.player.setPlaybackQualityRange(
          ytutils.quality,
          ytutils.quality
        );
      }
      if (document.location.pathname === "/watch") {
        const currentvideoquality = ytutils.quality;
        const volumespeed = ytutils.speed;
        ytutils.volumelevel = ytutils.getVolumeLevel();
        try {
          ytutils.player.getPlayerState();
        } catch (e) {
          const ythderrinterval = window.setInterval(() => {
            try {
              ytutils.player.getPlayerState();
              window.clearTimeout(ythderrinterval);
              ytutils.changeVideoQuality();
            } catch (e) { }
          }, 25);
          return;
        }
        const ythdinterval = window.setInterval(() => {
          if (ytutils.checkPlayerReady()) {
            if (currentvideoquality === "default") {
              if (ytutils.volumelevel !== "default") {
                ytutils.player.unMute();
                ytutils.player.setVolume(ytutils.volumelevel);
              }
              ytutils.player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              ytutils.player.setPlaybackRate(parseFloat(volumespeed));
            } else {
              if (ytutils.volumelevel !== "default") {
                ytutils.player.unMute();
                ytutils.player.setVolume(ytutils.volumelevel);
              }
              ytutils.player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              ytutils.player.setPlaybackRate(parseFloat(volumespeed));
            }
            window.clearInterval(ythdinterval);
          }
        }, 50);
      }
    }
  },
  changeVideoSize: () => {
    if (
      document.getElementById("playnav-player") ||
      document.location.pathname.search(/^\/watch/) !== 0
    )
      return;
    switch (ytutils.size) {
      case "expand": {
        const id = setInterval(() => {
          const flexy = document.querySelector<flexy>("ytd-watch-flexy");
          if (flexy) {
            flexy.theaterModeChanged_(true);
            clearInterval(id);
          }
        }, 100);
        break;
      }
      // case "chat": {
      //   const outer = setInterval(() => {
      //     const flexy = document.querySelector("ytd-watch-flexy");
      //     if (flexy) {
      //       clearInterval(outer);
      //       let conut = 0;
      //       const inner = setInterval(() => {
      //         if (document.querySelector("#chat")) {
      //           flexy.theaterModeChanged_(false);
      //           clearInterval(inner);
      //         }
      //         if (conut++ === 20) {
      //           flexy.theaterModeChanged_(true);
      //           clearInterval(inner);
      //         }
      //       }, 100);
      //     }
      //   }, 100);
      //   break;
      // }
      default: {
        const id = setInterval(() => {
          const flexy = document.querySelector<flexy>("ytd-watch-flexy");
          if (flexy) {
            flexy.theaterModeChanged_(false);
            clearInterval(id);
          }
        }, 100);
      }
    }
  },
};

window.onmessage = (ev: MessageEvent) => {
  if (ev.source !== window && ev.data.type) return;
  switch (ev.data.type) {
    case "FROM_CONTENT_SCRIPT_SET_VQ":
      ytutils.quality = ev.data.text;
      break;
    case "FROM_CONTENT_SCRIPT_SET_VS":
      ytutils.size = ev.data.text;
      break;
    case "FROM_CONTENT_SCRIPT_REQUEST_CHANGE":
      ytutils.volume = ev.data.volume;
      ytutils.speed = ev.data.speed;
      ytutils.volumelevel = ev.data.volumelevel;
      ytutils.youtubevideoautoplaybehavior =
        ev.data.youtubevideoautoplaybehavior;
      ytutils.playlistvideoautoplaybehavior =
        ev.data.playlistvideoautoplaybehavior;
      ytutils.suggestedautoplay = ev.data.suggestedautoplay;
      ytutils.autoexpanddescription = ev.data.autoexpanddescription;
      ytutils.autosubtitles = ev.data.autosubtitles;
      ytutils.isOptionHandle = ev.data.isOptionHandle;
      ytutils.requestChange();
      break;
  }
};

window.addEventListener("spfdone", ytutils.onSPFDone);
window.addEventListener("yt-navigate-start", ytutils.onSPFDone);
if (window.onPlayerStateChange)
  ytutils.player.removeEventListener(
    "onStateChange",
    ytutils.onPlayerStateChange
  );

window.onYouTubePlayerReady = (player: player) => {
  ytutils.player = player;
  const interval = window.setInterval(() => {
    if (document.location.pathname !== "/watch") {
      window.clearInterval(interval);
    }
    try {
      const quality = ytutils.getSetVideoQuality();
      player.setPlaybackQualityRange(quality, quality);
      if (player.getPlaybackQuality() === ytutils.getIntendedQuality()) {
        window.clearInterval(interval);
      }
    } catch {
      window.clearInterval(interval);
    }
  }, 25);
};
