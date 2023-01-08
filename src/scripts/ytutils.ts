interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getCurrentTime: () => number;
  getPlaybackQuality: () => string;
  getPlayerState: () => number;
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
  subtitles: "default",
  embeddedvideoautoplaybehavior: "default",
  playlistvideoautoplaybehavior: "default",
  quality: "highres",
  size: "expand",
  speed: 1,
  suggestedautoplay: true,
  volume: "default",
  volumelevel: 100,
  youtubevideoautoplaybehavior: "default",
  player: document.querySelector<player>("#movie_player")!,
  requestChange: () => {
    ytutils.changeVideoQuality();
    ytutils.changeVideoSize();
    ytutils.setSubtitles();
    ytutils.expandVideoDescription();
    ytutils.enablesuggestedautoplay();
  },
  setSubtitles: () => {
    if (ytutils.subtitles === "default") return;
    ytutils.player.toggleSubtitlesOn();
    if (ytutils.subtitles === "off") ytutils.player.toggleSubtitles();
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
      case "subtitles":
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
      ytutils.subtitles = ev.data.subtitles;
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
