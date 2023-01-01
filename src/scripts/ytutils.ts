interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getPlayerState: () => number;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (number: string) => void;
  unMute: () => void;
}

const ytutils = {
  quality: null,
  size: null,
  volume: null,
  volumelevel: null,
  youtubevideoautoplaybehavior: null,
  playlistvideoautoplaybehavior: null,
  suggestedautoplay: null,
  autoexpanddescription: null,
  autosubtitles: null,
  isOptionHandle: null,
  ytPlayer: null,
  requestChange: function(
    id,
    speed,
    volume,
    volumelevel,
    youtubevideoautoplaybehavior,
    playlistvideoautoplaybehavior,
    suggestedautoplay,
    autoexpanddescription,
    autosubtitles,
    isOptionHandle
  ) {
    ytutils.changeVideoQuality(
      document,
      ytutils.quality ? ytutils.quality : "highress",
      speed,
      volume,
      volumelevel,
      youtubevideoautoplaybehavior,
      playlistvideoautoplaybehavior,
      autosubtitles,
      isOptionHandle
    );
    ytutils.changeVideoSize(id, isOptionHandle);
    ytutils.expandVideoDescription(autoexpanddescription, isOptionHandle);
    ytutils.enablesuggestedautoplay(suggestedautoplay);
  },
  getIntendedQuality: (player: player) => {
    const currentvideoquality = ytutils.getVideoQuality();
    if (currentvideoquality === "highres")
      return player.getAvailableQualityLevels()[0];
    if (player.getAvailableQualityLevels().indexOf(currentvideoquality) === -1)
      return player.getAvailableQualityLevels()[0];
    return currentvideoquality;
  },
  getSetVideoQuality: (player: player) => {
    const currentvideoquality = ytutils.getVideoQuality();
    return currentvideoquality === "hd2160" &&
      player.getAvailableQualityLevels().indexOf(currentvideoquality) === -1
      ? player.getAvailableQualityLevels()[0]
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
  enablesuggestedautoplay: (checked: boolean) => {
    if (document.location.pathname.search(/^\/watch/) == 0) {
      const check =
        document.querySelector<HTMLInputElement>("#autoplay-checkbox");
      if (check) {
        check.click();
        check.checked = checked;
      }
      document
        .querySelector<HTMLInputElement>(
          `paper-toggle-button#toggle[aria-pressed*=${!checked}]`
        )
        ?.click();
    }
  },
  expandVideoDescription: (
    autoexpanddescription: boolean,
    isOptionHandle: boolean
  ) => {
    if (document.location.pathname.search(/^\/watch/) !== 0) return;
    if (autoexpanddescription) {
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
  getVolumeLevel: (volume: string, volumelevel: number) => {
    switch (volume) {
      case "default":
        return "default";
      case "mute":
        return 0;
      case "100%":
        return 100;
      default:
        return volumelevel;
    }
  },
  checkI: (quality: string) => {
    ytutils.ytPlayer.setPlaybackQualityRange(quality, quality);
  },
  onSPFDone: () => {
    window.postMessage(
      { type: "FROM_PAGE_SCRIPT_REQUEST_CHANGE", text: "NULL" },
      "*"
    );
  },
  onNavigateFinish: () => {
    window.setTimeout(() => {
      ytutils.expandVideoDescription(ytutils.autoexpanddescription, null);
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
  checkPlayerReady: (player: player) => {
    try {
      return player.getPlayerState() !== -1;
    } catch (e) {
      return false;
    }
  },
  changeVideoQuality: function(
    doc,
    quality,
    speed,
    volume,
    volumelevel,
    youtubevideoautoplaybehavior,
    playlistvideoautoplaybehavior,
    autosubtitles,
    isOptionHandle
  ) {
    if (location.hostname.search(/youtube.com$/) !== -1) {
      const player = document.querySelector<player>("#movie_player");
      if (player)
        player.addEventListener("onStateChange", "ythdonPlayerStateChange");
      window.addEventListener("spfdone", ytutils.onSPFDone);
      window.addEventListener("yt-navigate-start", ytutils.onSPFDone);
      window.addEventListener("yt-navigate-finish", ytutils.onNavigateFinish);
      window.addEventListener("transitionend", ytutils.Slistener, true);

      if (document.location.pathname.indexOf("/embed") === 0) {
        ytutils.checkI(quality);
      }

      if (doc.location.pathname === "/watch") {
        const currentvideoquality = quality;
        const volumespeed = speed;
        volumelevel = ytutils.getVolumeLevel(volume, volumelevel);
        try {
          player.getPlayerState();
        } catch (e) {
          const ythderrinterval = window.setInterval(() => {
            try {
              player.getPlayerState();
              window.clearTimeout(ythderrinterval);
              ytutils.changeVideoQuality(
                doc,
                quality,
                speed,
                volume,
                volumelevel,
                youtubevideoautoplaybehavior,
                playlistvideoautoplaybehavior,
                autosubtitles,
                isOptionHandle
              );
            } catch (e) { }
          }, 25);
          return;
        }
        const ythdinterval = window.setInterval(() => {
          if (ytutils.checkPlayerReady(player)) {
            if (currentvideoquality === "default") {
              if (volumelevel !== "default") {
                player.unMute();
                player.setVolume(volumelevel);
              }
              player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              player.setPlaybackRate(parseFloat(volumespeed));
            } else {
              if (volumelevel !== "default") {
                player.unMute();
                player.setVolume(volumelevel);
              }
              player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              player.setPlaybackRate(parseFloat(volumespeed));
            }
            window.clearInterval(ythdinterval);
          }
        }, 50);
      }
    }
  },
  changeVideoSize: (id, isOptionHandle) => {
    if (document.location.pathname.search(/^\/watch/) != 0) return;
    var channel = document.getElementById("playnav-player");
    if (channel) return; //do not let channels have a size because they cant
    if (ytutils.size === "fullpage") {
      if (!document.getElementById("ythdlink")) {
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("id", "ythdlink");
        link.setAttribute("href", id + "style/style.css");
        document.head.appendChild(link);
      }

      if (document.getElementById("player")) {
        document.getElementById("player").removeAttribute("style");
      }
      if (document.getElementsByClassName("html5-video-container")[0]) {
        document
          .getElementsByClassName("html5-video-container")[0]
          .removeAttribute("style");
      }
      if (document.getElementById("player-api")) {
        document
          .getElementById("player-api")
          .style.removeProperty("margin-left");
      }
      if (document.getElementById("watch-appbar-playlist")) {
        document
          .getElementById("watch-appbar-playlist")
          .style.removeProperty("left");
      }
      if (document.getElementById("watch-appbar-playlist")) {
        document
          .getElementById("watch-appbar-playlist")
          .style.removeProperty("margin-top");
      }

      if (
        (document.querySelector(".ytp-size-button path") &&
          document
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0) ||
        !document.querySelector("ytd-watch[theater]")
      ) {
        if (
          document.querySelector(".ytp-size-button path") &&
          document
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0 &&
          document.querySelector(".ytp-size-button path").parentNode.parentNode
        ) {
          document
            .querySelector(".ytp-size-button path")
            .parentNode.parentNode.click();
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
      if (
        document.getElementById("player") &&
        document
          .getElementById("player")
          .classList.contains("watch-playlist-collapsed")
      ) {
        document
          .getElementById("player")
          .classList.remove("watch-playlist-collapsed");
      }
      if (
        document.getElementById("player") &&
        document.getElementById("player").classList.contains("watch-medium")
      ) {
        document.getElementById("player").classList.remove("watch-medium");
      }
      if (
        document.getElementById("player") &&
        document.getElementById("player").classList.contains("watch-small")
      ) {
        document.getElementById("player").classList.remove("watch-small");
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

      function doTheRest() {
        if (
          document.getElementById("masthead-container") &&
          document.getElementById("page-manager")
        ) {
          ytutils.scrollTo();
          var interwal2 = document.defaultView.setInterval(function() {
            if (
              (document.querySelector(".ytp-size-button path") &&
                document
                  .querySelector(".ytp-size-button path")
                  .getAttribute("d")
                  .indexOf("m 28,") == 0) ||
              !document.querySelector("ytd-watch[theater]")
            ) {
              if (
                document.querySelector(".ytp-size-button path") &&
                document
                  .querySelector(".ytp-size-button path")
                  .getAttribute("d")
                  .indexOf("m 28,") == 0 &&
                document.querySelector(".ytp-size-button path").parentNode
                  .parentNode
              ) {
                document
                  .querySelector(".ytp-size-button path")
                  .parentNode.parentNode.click();
                document.defaultView.clearInterval(interwal2);
              }
            } else {
              document.defaultView.clearInterval(interwal2);
            }
          }, 1000);
        }
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
          doTheRest();
        }, 100);
      }

      if (
        document.getElementsByClassName("html5-video-container")[0] &&
        document.getElementById("movie_player")
      ) {
        document
          .getElementsByClassName("html5-video-container")[0]
          .setAttribute(
            "style",
            "width:" +
            document.body.clientWidth +
            "px !important;margin-left:-" +
            document.getElementById("movie_player").getBoundingClientRect()
              .x +
            "px !important;"
          );
      }

      if (
        document.getElementById("placeholder-playlist") &&
        document.getElementById("watch-appbar-playlist")
      ) {
        var element = document.getElementById("placeholder-playlist");
        var rect = element.getBoundingClientRect();
        var element2 = document.getElementById("watch-appbar-playlist");
        var rect2 = element2.getBoundingClientRect();
        if (rect.y != rect2.y) {
          if (document.getElementById("watch-appbar-playlist")) {
            document
              .getElementById("watch-appbar-playlist")
              .style.setProperty(
                "margin-top",
                rect.y - rect2.y + "px",
                "important"
              );
          }
        }
      }

      doTheRest();
    } else if (ytutils.size === "expand") {
      if (document.getElementById("ythdlink"))
        document
          .getElementById("ythdlink")
          .parentNode.removeChild(document.getElementById("ythdlink"));

      if (
        (document.querySelector(".ytp-size-button path") &&
          document
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0) ||
        !document.querySelector("ytd-watch[theater]")
      ) {
        if (
          document.querySelector(".ytp-size-button path") &&
          document
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0 &&
          document.querySelector(".ytp-size-button path").parentNode.parentNode
        ) {
          document
            .querySelector(".ytp-size-button path")
            .parentNode.parentNode.click();
        }
      }

      if (document.querySelector("#player.ytd-watch")) {
        document.querySelector("#player.ytd-watch").removeAttribute("style");
      }
      if (document.getElementsByClassName("html5-video-container")[0]) {
        document
          .getElementsByClassName("html5-video-container")[0]
          .removeAttribute("style");
      }
      if (document.getElementById("player-api")) {
        document
          .getElementById("player-api")
          .style.removeProperty("margin-left");
      }
      if (document.getElementById("watch-appbar-playlist")) {
        document
          .getElementById("watch-appbar-playlist")
          .style.removeProperty("left");
      }
      if (document.getElementById("watch-appbar-playlist")) {
        document
          .getElementById("watch-appbar-playlist")
          .style.removeProperty("margin-top");
      }

      if (document.getElementById("watch7-container")) {
        document.getElementById("watch7-container").classList.add("watch-wide");
      }
      if (document.getElementById("player")) {
        document
          .getElementById("player")
          .classList.add("watch-playlist-collapsed");
      }
      if (document.getElementById("player")) {
        document.getElementById("player").classList.add("watch-medium");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-stage-mode");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-wide");
      }
      if (
        document.getElementById("player") &&
        document.getElementById("player").classList.contains("watch-small")
      ) {
        document.getElementById("player").classList.remove("watch-small");
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
        if (
          (document.querySelector(".ytp-size-button path") &&
            document
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 28,") == 0) ||
          !document.querySelector("ytd-watch[theater]")
        ) {
          if (
            document.querySelector(".ytp-size-button path") &&
            document
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 28,") == 0 &&
            document.querySelector(".ytp-size-button path").parentNode
              .parentNode
          ) {
            document
              .querySelector(".ytp-size-button path")
              .parentNode.parentNode.click();
            document.defaultView.clearInterval(interwal);
          }
        } else {
          document.defaultView.clearInterval(interwal);
        }
      }, 1000);
    } else if (ytutils.size === "shrink") {
      if (document.getElementById("ythdlink"))
        document
          .getElementById("ythdlink")
          .parentNode.removeChild(document.getElementById("ythdlink"));

      if (document.querySelector("#player.ytd-watch")) {
        document.querySelector("#player.ytd-watch").removeAttribute("style");
      }
      if (document.getElementsByClassName("html5-video-container")[0]) {
        document
          .getElementsByClassName("html5-video-container")[0]
          .removeAttribute("style");
      }
      if (document.getElementById("player-api")) {
        document
          .getElementById("player-api")
          .style.removeProperty("margin-left");
      }
      if (document.getElementById("watch-appbar-playlist")) {
        document
          .getElementById("watch-appbar-playlist")
          .style.removeProperty("left");
      }
      if (document.getElementById("watch-appbar-playlist")) {
        document
          .getElementById("watch-appbar-playlist")
          .style.removeProperty("margin-top");
      }

      if (
        (document.querySelector(".ytp-size-button path") &&
          document
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 26,") == 0) ||
        document.querySelector("ytd-watch[theater]")
      ) {
        if (
          document.querySelector(".ytp-size-button path") &&
          document
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 26,") == 0 &&
          document.querySelector(".ytp-size-button path").parentNode.parentNode
        ) {
          document
            .querySelector(".ytp-size-button path")
            .parentNode.parentNode.click();
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
      if (
        document.getElementById("player") &&
        document
          .getElementById("player")
          .classList.contains("watch-playlist-collapsed")
      ) {
        document
          .getElementById("player")
          .classList.remove("watch-playlist-collapsed");
      }
      if (
        document.getElementById("player") &&
        document.getElementById("player").classList.contains("watch-medium")
      ) {
        document.getElementById("player").classList.remove("watch-medium");
      }
      if (document.getElementById("player")) {
        document.getElementById("player").classList.add("watch-small");
      }
      if (document.getElementById("page")) {
        document.getElementById("page").classList.add("watch-non-stage-mode");
      }
      if (
        document.getElementById("player") &&
        document.getElementById("player").classList.contains("watch-wide")
      ) {
        document.getElementById("player").classList.remove("watch-wide");
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
        if (
          (document.querySelector(".ytp-size-button path") &&
            document
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0) ||
          document.querySelector("ytd-watch[theater]")
        ) {
          if (
            document.querySelector(".ytp-size-button path") &&
            document
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0 &&
            document.querySelector(".ytp-size-button path").parentNode
              .parentNode
          ) {
            document
              .querySelector(".ytp-size-button path")
              .parentNode.parentNode.click();
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
        if (document.getElementsByClassName("html5-video-container")[0]) {
          document
            .getElementsByClassName("html5-video-container")[0]
            .removeAttribute("style");
        }
        if (document.getElementById("player-api")) {
          document
            .getElementById("player-api")
            .style.removeProperty("margin-left");
        }
        if (document.getElementById("watch-appbar-playlist")) {
          document
            .getElementById("watch-appbar-playlist")
            .style.removeProperty("left");
        }
        if (document.getElementById("watch-appbar-playlist")) {
          document
            .getElementById("watch-appbar-playlist")
            .style.removeProperty("margin-top");
        }

        if (
          (document.querySelector(".ytp-size-button path") &&
            document
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0) ||
          document.querySelector("ytd-watch[theater]")
        ) {
          if (
            document.querySelector(".ytp-size-button path") &&
            document
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0 &&
            document.querySelector(".ytp-size-button path").parentNode
              .parentNode
          ) {
            document
              .querySelector(".ytp-size-button path")
              .parentNode.parentNode.click();
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
        if (
          document.getElementById("player") &&
          document
            .getElementById("player")
            .classList.contains("watch-playlist-collapsed")
        ) {
          document
            .getElementById("player")
            .classList.remove("watch-playlist-collapsed");
        }
        if (
          document.getElementById("player") &&
          document.getElementById("player").classList.contains("watch-medium")
        ) {
          document.getElementById("player").classList.remove("watch-medium");
        }
        if (document.getElementById("player")) {
          document.getElementById("player").classList.add("watch-small");
        }
        if (document.getElementById("page")) {
          document.getElementById("page").classList.add("watch-non-stage-mode");
        }
        if (
          document.getElementById("player") &&
          document.getElementById("player").classList.contains("watch-wide")
        ) {
          document.getElementById("player").classList.remove("watch-wide");
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
          if (
            (document.querySelector(".ytp-size-button path") &&
              document
                .querySelector(".ytp-size-button path")
                .getAttribute("d")
                .indexOf("m 26,") == 0) ||
            document.querySelector("ytd-watch[theater]")
          ) {
            if (
              document.querySelector(".ytp-size-button path") &&
              document
                .querySelector(".ytp-size-button path")
                .getAttribute("d")
                .indexOf("m 26,") == 0 &&
              document.querySelector(".ytp-size-button path").parentNode
                .parentNode
            ) {
              document
                .querySelector(".ytp-size-button path")
                .parentNode.parentNode.click();
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

window.addEventListener(
  "message",
  function(event) {
    // We only accept messages from ourselves
    if (event.source != window) return;

    if (event.data.type && event.data.type == "FROM_CONTENT_SCRIPT") {
    } else if (
      event.data.type &&
      event.data.type == "FROM_CONTENT_SCRIPT_SET_VQ"
    ) {
      ytutils.quality = event.data.text;
    } else if (
      event.data.type &&
      event.data.type == "FROM_CONTENT_SCRIPT_SET_VS"
    ) {
      ytutils.size = event.data.text;
    } else if (
      event.data.type &&
      event.data.type == "FROM_CONTENT_SCRIPT_REQUEST_CHANGE"
    ) {
      ytutils.volume = event.data.volume;
      ytutils.speed = event.data.speed;
      ytutils.volumelevel = event.data.volumelevel;
      ytutils.youtubevideoautoplaybehavior =
        event.data.youtubevideoautoplaybehavior;
      ytutils.playlistvideoautoplaybehavior =
        event.data.playlistvideoautoplaybehavior;
      ytutils.suggestedautoplay = event.data.suggestedautoplay;
      ytutils.autoexpanddescription = event.data.autoexpanddescription;
      ytutils.autosubtitles = event.data.autosubtitles;
      ytutils.isOptionHandle = event.data.isOptionHandle;
      ytutils.requestChange(
        event.data.id,
        event.data.speed,
        event.data.volume,
        event.data.volumelevel,
        event.data.youtubevideoautoplaybehavior,
        event.data.playlistvideoautoplaybehavior,
        event.data.suggestedautoplay,
        event.data.autoexpanddescription,
        event.data.autosubtitles,
        event.data.isOptionHandle
      );
    }
  },
  false
);

window.addEventListener("spfdone", ytutils.onSPFDone);
window.addEventListener("yt-navigate-start", ytutils.onSPFDone);

try {
  if (window.ythdonPlayerStateChange && player.removeEventListener)
    player.removeEventListener("onStateChange", "ythdonPlayerStateChange");
  var ythdonPlayerStateChange = function(newState) {
    try {
      var player = document.getElementById("movie_player");
      var currentvideoquality = ytutils.getVideoQuality();
      var enableplaylistautoplay = ytutils.getPlaylistVideoAutoPlayBehavior();
      var enableautoplay = ytutils.getYoutubeVideoAutoPlayBehavior();
      if (player.getCurrentTime() == 0 && newState == 1) {
        if (document.location.search.indexOf("list=") != -1) {
          if (!enableplaylistautoplay) {
          }
        } else {
          if (!enableautoplay) {
          }
        }
      }
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
      if (
        document.getElementsByTagName("video").length == 0 &&
        newState == 1 &&
        player.getCurrentTime() < 1 &&
        window.ythdFlPlayerPaused == false
      ) {
        if (document.location.search.indexOf("list=") != -1) {
          if (!enableplaylistautoplay) {
            window.ythdFlPlayerPaused = true;
          }
        } else {
          if (!enableautoplay) {
            window.ythdFlPlayerPaused = true;
          }
        }
      }
      if (
        newState === -1 ||
        player.getPlaybackQuality() != ytutils.getIntendedQuality(player)
      ) {
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
        var ythdonPlayerStateChangeInterval = window.setInterval(function() {
          if (document.location.pathname != "/watch") {
            window.clearInterval(ythdonPlayerStateChangeInterval);
          }
          try {
            if (
              player.getPlaybackQuality() != ytutils.getIntendedQuality(player)
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
              window.clearInterval(ythdonPlayerStateChangeInterval);
            }
          } catch (e) {
            window.clearInterval(ythdonPlayerStateChangeInterval);
          }
        }, 25);
      }
    } catch (e) { }
  };

  if (window.onYouTubePlayerReady) window.onYouTubePlayerReady == null;
  var onYouTubePlayerReady = function(player) {
    ytutils.ytPlayer = player;
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
