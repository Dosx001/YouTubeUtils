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
  player: document.querySelector<player>("#movie_player"),
  requestChange: () => {
    ytutils.changeVideoQuality();
    ytutils.changeVideoSize();
    ytutils.expandVideoDescription();
    ytutils.enablesuggestedautoplay();
  },
  getIntendedQuality: () => {
    const quality = ytutils.getVideoQuality();
    if (quality === "highres")
      return ytutils.player.getAvailableQualityLevels()[0];
    if (ytutils.player.getAvailableQualityLevels().indexOf(quality) === -1)
      return ytutils.player.getAvailableQualityLevels()[0];
    return quality;
  },
  getSetVideoQuality: () => {
    const quality = ytutils.getVideoQuality();
    return quality === "hd2160" &&
      ytutils.player.getAvailableQualityLevels().indexOf(quality) === -1
      ? ytutils.player.getAvailableQualityLevels()[0]
      : quality;
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
  expandVideoDescription: () => {
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
  onPlayerStateChange: (newState: number) => {
    if (
      newState === -1 ||
      ytutils.player.getPlaybackQuality() !== ytutils.getIntendedQuality()
    ) {
      const interval = window.setInterval(() => {
        if (document.location.pathname !== "/watch") {
          window.clearInterval(interval);
        }
        try {
          const quality = ytutils.getSetVideoQuality();
          ytutils.player.setPlaybackQualityRange(quality, quality);
          if (
            ytutils.player.getPlaybackQuality() === ytutils.getIntendedQuality()
          ) {
            window.clearInterval(interval);
          }
        } catch (e) {
          window.clearInterval(interval);
        }
      }, 25);
    }
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
      if (document.location.pathname.indexOf("/embed") === 0) {
        ytutils.player.setPlaybackQualityRange(
          ytutils.quality,
          ytutils.quality
        );
      }
      if (document.location.pathname === "/watch") {
        const volumespeed = ytutils.speed;
        ytutils.volumelevel = ytutils.getVolumeLevel();
        try {
          ytutils.player.getPlayerState();
        } catch (e) {
          const ythderrinterval = window.setInterval(() => {
            ytutils.player.getPlayerState();
            window.clearTimeout(ythderrinterval);
            ytutils.changeVideoQuality();
          }, 25);
          return;
        }
        const ythdinterval = window.setInterval(() => {
          if (ytutils.checkPlayerReady()) {
            if (ytutils.quality === "default") {
              if (ytutils.volumelevel !== "default") {
                ytutils.player.unMute();
                ytutils.player.setVolume(ytutils.volumelevel);
              }
              ytutils.player.setPlaybackQualityRange(
                ytutils.quality,
                ytutils.quality
              );
              ytutils.player.setPlaybackRate(parseFloat(volumespeed));
            } else {
              if (ytutils.volumelevel !== "default") {
                ytutils.player.unMute();
                ytutils.player.setVolume(ytutils.volumelevel);
              }
              ytutils.player.setPlaybackQualityRange(
                ytutils.quality,
                ytutils.quality
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
    case "UPDATE_SETTINGS":
      ytutils.quality = ev.data.quality;
      ytutils.size = ev.data.size;
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
