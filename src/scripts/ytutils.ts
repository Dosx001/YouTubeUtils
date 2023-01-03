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

const ytutils = {
  quality: null,
  size: null,
  speed: null,
  volume: null,
  volumelevel: null,
  youtubevideoautoplaybehavior: null,
  playlistvideoautoplaybehavior: null,
  suggestedautoplay: null,
  autoexpanddescription: null,
  autosubtitles: null,
  isOptionHandle: null,
  player: document.querySelector<player>("#movie_player"),
  requestChange: () => {
    ytutils.changeVideoQuality();
    ytutils.changeVideoSize(ytutils.isOptionHandle);
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
  ythdonPlayerStateChange: (newState: number) => {
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
        ytutils.ythdonPlayerStateChange
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
  doTheRest: (size: HTMLElement, watch: HTMLElement) => {
    if (
      document.getElementById("masthead-container") &&
      document.getElementById("page-manager")
    ) {
      ytutils.scrollTo();
      const interval = document.defaultView.setInterval(() => {
        if (size?.getAttribute("d").indexOf("m 28,") === 0 || !watch) {
          if (size.parentNode.parentNode) {
            (size.parentNode.parentNode as HTMLElement).click();
            document.defaultView.clearInterval(interval);
          }
        } else {
          document.defaultView.clearInterval(interval);
        }
      }, 1000);
    }
  },
  changeVideoSize: (isOptionHandle) => {
    if (
      document.getElementById("playnav-player") ||
      document.location.pathname.search(/^\/watch/) !== 0
    )
      return;
    const player = document.querySelector("#player");
    const container = document.querySelector(".html5-video-container");
    const api = document.querySelector<HTMLElement>("#player-api");
    const size = document.querySelector<HTMLElement>(".ytp-size-button path");
    const watch = document.querySelector<HTMLElement>("ytd-watch[theater]");
    const appbar = document.querySelector<HTMLElement>(
      "#watch-appbar-playlist"
    );
    if (ytutils.size === "fullpage") {
      if (player) {
        player.removeAttribute("style");
      }
      if (container) {
        container.removeAttribute("style");
      }
      if (api) {
        api.style.removeProperty("margin-left");
      }
      if (appbar) {
        appbar.style.removeProperty("left");
      }
      if (appbar) {
        appbar.style.removeProperty("margin-top");
      }

      if ((size && size.getAttribute("d").indexOf("m 28,") == 0) || !watch) {
        if (
          size &&
          size.getAttribute("d").indexOf("m 28,") == 0 &&
          size.parentNode.parentNode
        ) {
          size.parentNode.parentNode.click();
        }
      }

      if (
        document.getElementById("watch7-container") &&
        document
          .getElementById("watch7-container")
          .classList.contains("watch-wide")
      ) {
        document
          .getElementById("watch7-container")
          .classList.remove("watch-wide");
      }
      if (player && player.classList.contains("watch-playlist-collapsed")) {
        player.classList.remove("watch-playlist-collapsed");
      }
      if (player && player.classList.contains("watch-medium")) {
        player.classList.remove("watch-medium");
      }
      if (player && player.classList.contains("watch-small")) {
        player.classList.remove("watch-small");
      }
      if (
        document.getElementById("page") &&
        document
          .getElementById("page")
          .classList.contains("watch-non-stage-mode")
      ) {
        document
          .getElementById("page")
          .classList.remove("watch-non-stage-mode");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-stage-mode");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-wide");
      }
      var interwal;
      var it = 0;

      if (document.querySelector("#player.ytd-watch")) {
        document
          .querySelector("#player.ytd-watch")
          .setAttribute(
            "style",
            "height:" + document.defaultView.innerHeight + "px !important"
          );
      } else {
        interwal = document.defaultView.setInterval(function() {
          if (!document.querySelector("#player.ytd-watch")) {
            it++;
            return;
          } else {
            document.defaultView.clearInterval(interwal);
          }
          document
            .querySelector("#player.ytd-watch")
            .setAttribute(
              "style",
              "height:" + document.defaultView.innerHeight + "px !important"
            );
          ytutils.doTheRest(size);
        }, 100);
      }

      if (container && ytutils.player) {
        container.setAttribute(
          "style",
          "width:" +
          document.body.clientWidth +
          "px !important;margin-left:-" +
          ytutils.player.getBoundingClientRect().x +
          "px !important;"
        );
      }

      if (document.getElementById("placeholder-playlist") && appbar) {
        var element = document.getElementById("placeholder-playlist");
        var rect = element.getBoundingClientRect();
        var element2 = appbar;
        var rect2 = element2.getBoundingClientRect();
        if (rect.y != rect2.y) {
          if (appbar) {
            appbar.style.setProperty(
              "margin-top",
              rect.y - rect2.y + "px",
              "important"
            );
          }
        }
      }
      ytutils.doTheRest(size);
    } else if (ytutils.size === "expand") {
      if ((size && size.getAttribute("d").indexOf("m 28,") == 0) || !watch) {
        if (
          size &&
          size.getAttribute("d").indexOf("m 28,") == 0 &&
          size.parentNode.parentNode
        ) {
          size.parentNode.parentNode.click();
        }
      }

      if (document.querySelector("#player.ytd-watch")) {
        document.querySelector("#player.ytd-watch").removeAttribute("style");
      }
      if (container) {
        container.removeAttribute("style");
      }
      if (api) {
        api.style.removeProperty("margin-left");
      }
      if (appbar) {
        appbar.style.removeProperty("left");
      }
      if (appbar) {
        appbar.style.removeProperty("margin-top");
      }

      if (document.getElementById("watch7-container")) {
        document.getElementById("watch7-container").classList.add("watch-wide");
      }
      if (player) {
        player.classList.add("watch-playlist-collapsed");
      }
      if (player) {
        player.classList.add("watch-medium");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-stage-mode");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-wide");
      }
      if (player && player.classList.contains("watch-small")) {
        player.classList.remove("watch-small");
      }
      if (
        document.getElementById("page") &&
        document
          .getElementById("page")
          .classList.contains("watch-non-stage-mode")
      ) {
        document
          .getElementById("page")
          .classList.remove("watch-non-stage-mode");
      }

      if (isOptionHandle) {
        document.defaultView.scrollTo(0, 0);
      }

      if (document.getElementsByClassName("html5-main-video")[0]) {
        document.getElementsByClassName("html5-main-video")[0].style.top =
          "0px";
      }

      var interwal = document.defaultView.setInterval(function() {
        if ((size && size.getAttribute("d").indexOf("m 28,") == 0) || !watch) {
          if (
            size &&
            size.getAttribute("d").indexOf("m 28,") == 0 &&
            size.parentNode.parentNode
          ) {
            size.parentNode.parentNode.click();
            document.defaultView.clearInterval(interwal);
          }
        } else {
          document.defaultView.clearInterval(interwal);
        }
      }, 1000);
    } else if (ytutils.size === "shrink") {
      if (document.querySelector("#player.ytd-watch")) {
        document.querySelector("#player.ytd-watch").removeAttribute("style");
      }
      if (container) {
        container.removeAttribute("style");
      }
      if (api) {
        api.style.removeProperty("margin-left");
      }
      if (appbar) {
        appbar.style.removeProperty("left");
      }
      if (appbar) {
        appbar.style.removeProperty("margin-top");
      }

      if ((size && size.getAttribute("d").indexOf("m 26,") == 0) || watch) {
        if (
          size &&
          size.getAttribute("d").indexOf("m 26,") == 0 &&
          size.parentNode.parentNode
        ) {
          size.parentNode.parentNode.click();
        }
      }

      if (
        document.getElementById("watch7-container") &&
        document
          .getElementById("watch7-container")
          .classList.contains("watch-wide")
      ) {
        document
          .getElementById("watch7-container")
          .classList.remove("watch-wide");
      }
      if (player && player.classList.contains("watch-playlist-collapsed")) {
        player.classList.remove("watch-playlist-collapsed");
      }
      if (player && player.classList.contains("watch-medium")) {
        player.classList.remove("watch-medium");
      }
      if (player) {
        player.classList.add("watch-small");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-non-stage-mode");
      }
      if (player && player.classList.contains("watch-wide")) {
        player.classList.remove("watch-wide");
      }
      if (
        document.getElementById("page") &&
        document.getElementById("page").classList.contains("watch-stage-mode")
      ) {
        document.getElementById("page").classList.remove("watch-stage-mode");
      }
      if (
        document.getElementById("page") &&
        document.getElementById("page").classList.contains("watch-wide")
      ) {
        document.getElementById("page").classList.remove("watch-wide");
      }

      if (isOptionHandle) {
        document.defaultView.scrollTo(0, 0);
      }

      var interwal = document.defaultView.setInterval(function() {
        if ((size && size.getAttribute("d").indexOf("m 26,") == 0) || watch) {
          if (
            size &&
            size.getAttribute("d").indexOf("m 26,") == 0 &&
            size.parentNode.parentNode
          ) {
            size.parentNode.parentNode.click();
            document.defaultView.clearInterval(interwal);
          }
        } else {
          document.defaultView.clearInterval(interwal);
        }
      }, 1000);
    } else if (ytutils.size === "default") {
      if (isOptionHandle) {
        if (document.querySelector("#player.ytd-watch")) {
          document.querySelector("#player.ytd-watch").removeAttribute("style");
        }
        if (container) {
          container.removeAttribute("style");
        }
        if (api) {
          api.style.removeProperty("margin-left");
        }
        if (appbar) {
          appbar.style.removeProperty("left");
        }
        if (appbar) {
          appbar.style.removeProperty("margin-top");
        }

        if ((size && size.getAttribute("d").indexOf("m 26,") == 0) || watch) {
          if (
            size &&
            size.getAttribute("d").indexOf("m 26,") == 0 &&
            size.parentNode.parentNode
          ) {
            size.parentNode.parentNode.click();
          }
        }

        if (
          document.getElementById("watch7-container") &&
          document
            .getElementById("watch7-container")
            .classList.contains("watch-wide")
        ) {
          document
            .getElementById("watch7-container")
            .classList.remove("watch-wide");
        }
        if (player && player.classList.contains("watch-playlist-collapsed")) {
          player.classList.remove("watch-playlist-collapsed");
        }
        if (player && player.classList.contains("watch-medium")) {
          player.classList.remove("watch-medium");
        }
        if (player) {
          player.classList.add("watch-small");
        }
        if (document.getElementById("page")) {
          document.getElementById("page").classList.add("watch-non-stage-mode");
        }
        if (player && player.classList.contains("watch-wide")) {
          player.classList.remove("watch-wide");
        }
        if (
          document.getElementById("page") &&
          document.getElementById("page").classList.contains("watch-stage-mode")
        ) {
          document.getElementById("page").classList.remove("watch-stage-mode");
        }

        if (isOptionHandle) {
          document.defaultView.scrollTo(0, 0);
        }

        var interwal = document.defaultView.setInterval(function() {
          if ((size && size.getAttribute("d").indexOf("m 26,") == 0) || watch) {
            if (
              size &&
              size.getAttribute("d").indexOf("m 26,") == 0 &&
              size.parentNode.parentNode
            ) {
              size.parentNode.parentNode.click();
            }
          } else {
            document.defaultView.clearInterval(interwal);
          }
        }, 1000);
      }
    }

    if (document.body) document.body.classList.add("fullytpagesize");
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

try {
  if (window.ythdonPlayerStateChange && ytutils.player.removeEventListener)
    ytutils.player.removeEventListener(
      "onStateChange",
      ytutils.ythdonPlayerStateChange
    );

  if (window.onYouTubePlayerReady) window.onYouTubePlayerReady == null;
  var onYouTubePlayerReady = function(player) {
    ytutils.player = player;
    var currentvideoquality = ytutils.getVideoQuality();
    var enableplaylistautoplay = ytutils.getPlaylistVideoAutoPlayBehavior();
    var enableautoplay = ytutils.getYoutubeVideoAutoPlayBehavior();
    if (player.getPlaybackQuality() != ytutils.getIntendedQuality(player)) {
      if (
        typeof player.getAdState !== "undefined" &&
        player.getAdState() != 1
      ) {
        if (document.location.search.indexOf("list=") != -1) {
          if (!enableplaylistautoplay) {
          }
        } else {
          if (!enableautoplay) {
          }
        }
      }
    }
    var onYouTubePlayerReadyInterval = window.setInterval(function() {
      if (document.location.pathname != "/watch") {
        window.clearInterval(onYouTubePlayerReadyInterval);
      }
      try {
        if (
          player.getPlaybackQuality() !== ytutils.getIntendedQuality(player)
        ) {
          if (
            typeof player.getAdState !== "undefined" &&
            player.getAdState() != 1
          ) {
            if (document.location.search.indexOf("list=") != -1) {
              if (!enableplaylistautoplay) {
              }
            } else {
              if (!enableautoplay) {
              }
            }
          }
        }
        var mxx = ytutils.getSetVideoQuality(player);
        player.setPlaybackQualityRange(mxx, mxx);
        if (
          player.getPlaybackQuality() === ytutils.getIntendedQuality(player)
        ) {
          window.clearInterval(onYouTubePlayerReadyInterval);
        }
      } catch (e) {
        window.clearInterval(onYouTubePlayerReadyInterval);
      }
    }, 25);
  };
  window.onYouTubePlayerReady = onYouTubePlayerReady;
} catch (e) { }
