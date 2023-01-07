interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getCurrentTime: () => number;
  getPlaybackQuality: () => string;
  getPlayerState: () => number;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (level: number) => void;
  unMute: () => void;
}

interface flexy extends HTMLElement {
  theaterModeChanged_: (state: boolean) => void;
}

const ytutils = {
  autoexpanddescription: true,
  autosubtitles: "default",
  embeddedvideoautoplaybehavior: "default",
  playlistvideoautoplaybehavior: "default",
  quality: "highres",
  size: "expand",
  speed: 1,
  suggestedautoplay: true,
  volume: "default",
  volumelevel: 100,
  youtubevideoautoplaybehavior: "default",
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
window.addEventListener("yt-navigate-finish", ytutils.onNavigateFinish);

window.onload = () => {
  const interval = window.setInterval(() => {
    if (document.location.pathname !== "/watch") window.clearInterval(interval);
    const player = document.querySelector<player>("#movie_player");
    if (player) {
      ytutils.player = player;
      ytutils.requestChange();
      ytutils.player.addEventListener("onStateChange", (state: number) => {
        if (state === -1) {
          ytutils.requestChange();
        }
      });
      window.clearInterval(interval);
    }
  }, 25);
};
