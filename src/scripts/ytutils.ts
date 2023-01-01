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
    ytutils.changeVideoSize(
      document,
      ytutils.size ? ytutils.size : "expand",
      id,
      isOptionHandle
    );
    ytutils.expandVideoDescription(autoexpanddescription, isOptionHandle);
    ytutils.enablesuggestedautoplay(suggestedautoplay);
  },
  getIntendedQuality: function(player, currentvideoquality) {
    ytutils.quality;
    if (currentvideoquality == "highres")
      return player.getAvailableQualityLevels()[0];
    else if (
      player.getAvailableQualityLevels().indexOf(currentvideoquality) == -1
    ) {
      return player.getAvailableQualityLevels()[0];
    } else return currentvideoquality;
  },
  getSetVideoQuality: (player) => {
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
  checkI: function(
    doc,
    quality,
    volume,
    volumelevel,
    youtubevideoautoplaybehavior,
    playlistvideoautoplaybehavior,
    isOptionHandle
  ) {
    var player = ytutils.ytPlayer;
    player.setPlaybackQualityRange(quality, quality);
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
    try {
      var domain = doc.domain;
    } catch (err) {
      return;
    }
    if (!domain) {
      return;
    }

    if (domain.search(/youtube.com$/) != -1) {
      var dc = document;
      var player = document.getElementById("movie_player");

      if (player)
        player.addEventListener("onStateChange", "ythdonPlayerStateChange");
      else {
      }
      window.addEventListener("spfdone", ytutils.onSPFDone);
      window.addEventListener("yt-navigate-start", ytutils.onSPFDone);
      window.addEventListener("yt-navigate-finish", ytutils.onNavigateFinish);
      window.addEventListener("transitionend", ytutils.Slistener, true);

      if (document.location.pathname.indexOf("/embed") == 0) {
        ytutils.checkI(
          doc,
          quality,
          volume,
          volumelevel,
          youtubevideoautoplaybehavior,
          playlistvideoautoplaybehavior,
          autosubtitles,
          isOptionHandle
        );
      }

      if (doc.location.pathname == "/watch") {
        var currentvideoquality = quality;
        var volumespeed = speed;
        var enableautoplay = ytutils.getYoutubeVideoAutoPlayBehavior();
        var volumelevel = ytutils.getVolumeLevel(volume, volumelevel);

        var prelogs_enabled = true;
        if (prelogs_enabled) {
          try {
            try {
              player.getPlayerState();
            } catch (e) {
              throw e;
            }
          } catch (e) {
            var ythderrinterval = window.setInterval(function() {
              try {
                document.getElementById("movie_player").getPlayerState();
                window.clearTimeout(ythderrinterval);
                ytutils.changeVideoQuality(
                  doc,
                  quality,
                  speed,
                  volume,
                  volumelevel,
                  youtubevideoautoplaybehavior,
                  playlistvideoautoplaybehavior,
                  isOptionHandle
                );
              } catch (e) { }
            }, 25);
            return;
          }
        }

        function checkPlayerReady(player) {
          try {
            if (player.getPlayerState() != -1) return true;
            else return false;
          } catch (e) {
            return false;
          }
        }

        var ythdinterval = window.setInterval(function() {
          var player = document.getElementById("movie_player");
          if (checkPlayerReady(player)) {
            if (currentvideoquality == "default") {
              if (volumelevel != "default") {
                player.unMute();
                player.setVolume(volumelevel);
              }
              var cTime = player.getCurrentTime();
              player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              player.setPlaybackRate(parseFloat(volumespeed));

              if (!enableautoplay) {
              }
            } else {
              if (volumelevel != "default") {
                player.unMute();
                player.setVolume(volumelevel);
              }
              var cTime = player.getCurrentTime();
              player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              player.setPlaybackRate(parseFloat(volumespeed));

              if (!enableautoplay) {
              }
            }

            window.clearInterval(ythdinterval);
          }
        }, 50);
      }
    }
  },
  changeVideoSize: function(doc, size, id, isOptionHandle) {
    var dc = doc;

    if (doc.location.pathname.search(/^\/watch/) != 0) return;

    if (size) ytutils.size = size;
    var channel = dc.getElementById("playnav-player");
    if (channel) return; //do not let channels have a size because they cant

    var currentvideosize = size ? size : ytutils.size;

    if (currentvideosize == "fullpage") {
      if (!dc.getElementById("ythdlink")) {
        var link = dc.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("id", "ythdlink");
        link.setAttribute("href", id + "style/style.css");
        dc.head.appendChild(link);
      }

      if (dc.getElementById("player")) {
        dc.getElementById("player").removeAttribute("style");
      }
      if (dc.getElementsByClassName("html5-video-container")[0]) {
        dc.getElementsByClassName("html5-video-container")[0].removeAttribute(
          "style"
        );
      }
      if (dc.getElementById("player-api")) {
        dc.getElementById("player-api").style.removeProperty("margin-left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty("left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty(
          "margin-top"
        );
      }

      if (
        (dc.querySelector(".ytp-size-button path") &&
          dc
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0) ||
        !dc.querySelector("ytd-watch[theater]")
      ) {
        if (
          dc.querySelector(".ytp-size-button path") &&
          dc
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0 &&
          dc.querySelector(".ytp-size-button path").parentNode.parentNode
        ) {
          dc.querySelector(
            ".ytp-size-button path"
          ).parentNode.parentNode.click();
        }
      }

      if (
        dc.getElementById("watch7-container") &&
        dc.getElementById("watch7-container").classList.contains("watch-wide")
      ) {
        dc.getElementById("watch7-container").classList.remove("watch-wide");
      }
      if (
        dc.getElementById("player") &&
        dc
          .getElementById("player")
          .classList.contains("watch-playlist-collapsed")
      ) {
        dc.getElementById("player").classList.remove(
          "watch-playlist-collapsed"
        );
      }
      if (
        dc.getElementById("player") &&
        dc.getElementById("player").classList.contains("watch-medium")
      ) {
        dc.getElementById("player").classList.remove("watch-medium");
      }
      if (
        dc.getElementById("player") &&
        dc.getElementById("player").classList.contains("watch-small")
      ) {
        dc.getElementById("player").classList.remove("watch-small");
      }
      if (
        dc.getElementById("page") &&
        dc.getElementById("page").classList.contains("watch-non-stage-mode")
      ) {
        dc.getElementById("page").classList.remove("watch-non-stage-mode");
      }
      if (dc.getElementById("page")) {
        dc.getElementById("page").classList.add("watch-stage-mode");
      }
      if (dc.getElementById("page")) {
        dc.getElementById("page").classList.add("watch-wide");
      }

      function doTheRest() {
        if (
          dc.getElementById("masthead-container") &&
          dc.getElementById("page-manager")
        ) {
          ytutils.scrollTo();
          var interwal2 = dc.defaultView.setInterval(function() {
            if (
              (dc.querySelector(".ytp-size-button path") &&
                dc
                  .querySelector(".ytp-size-button path")
                  .getAttribute("d")
                  .indexOf("m 28,") == 0) ||
              !dc.querySelector("ytd-watch[theater]")
            ) {
              if (
                dc.querySelector(".ytp-size-button path") &&
                dc
                  .querySelector(".ytp-size-button path")
                  .getAttribute("d")
                  .indexOf("m 28,") == 0 &&
                dc.querySelector(".ytp-size-button path").parentNode.parentNode
              ) {
                dc.querySelector(
                  ".ytp-size-button path"
                ).parentNode.parentNode.click();
                dc.defaultView.clearInterval(interwal2);
              }
            } else {
              dc.defaultView.clearInterval(interwal2);
            }
          }, 1000);
        }
      }

      var interwal;
      var it = 0;

      if (dc.querySelector("#player.ytd-watch")) {
        dc.querySelector("#player.ytd-watch").setAttribute(
          "style",
          "height:" + dc.defaultView.innerHeight + "px !important"
        );
      } else {
        interwal = dc.defaultView.setInterval(function() {
          if (!dc.querySelector("#player.ytd-watch")) {
            it++;
            return;
          } else {
            dc.defaultView.clearInterval(interwal);
          }
          dc.querySelector("#player.ytd-watch").setAttribute(
            "style",
            "height:" + dc.defaultView.innerHeight + "px !important"
          );
          doTheRest();
        }, 100);
      }

      if (
        dc.getElementsByClassName("html5-video-container")[0] &&
        dc.getElementById("movie_player")
      ) {
        dc.getElementsByClassName("html5-video-container")[0].setAttribute(
          "style",
          "width:" +
          dc.body.clientWidth +
          "px !important;margin-left:-" +
          dc.getElementById("movie_player").getBoundingClientRect().x +
          "px !important;"
        );
      }

      if (
        dc.getElementById("placeholder-playlist") &&
        dc.getElementById("watch-appbar-playlist")
      ) {
        var element = dc.getElementById("placeholder-playlist");
        var rect = element.getBoundingClientRect();
        var element2 = dc.getElementById("watch-appbar-playlist");
        var rect2 = element2.getBoundingClientRect();
        if (rect.y != rect2.y) {
          if (dc.getElementById("watch-appbar-playlist")) {
            dc.getElementById("watch-appbar-playlist").style.setProperty(
              "margin-top",
              rect.y - rect2.y + "px",
              "important"
            );
          }
        }
      }

      doTheRest();
    } else if (currentvideosize == "expand") {
      if (dc.getElementById("ythdlink"))
        dc.getElementById("ythdlink").parentNode.removeChild(
          dc.getElementById("ythdlink")
        );

      if (
        (dc.querySelector(".ytp-size-button path") &&
          dc
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0) ||
        !dc.querySelector("ytd-watch[theater]")
      ) {
        if (
          dc.querySelector(".ytp-size-button path") &&
          dc
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 28,") == 0 &&
          dc.querySelector(".ytp-size-button path").parentNode.parentNode
        ) {
          dc.querySelector(
            ".ytp-size-button path"
          ).parentNode.parentNode.click();
        }
      }

      if (dc.querySelector("#player.ytd-watch")) {
        dc.querySelector("#player.ytd-watch").removeAttribute("style");
      }
      if (dc.getElementsByClassName("html5-video-container")[0]) {
        dc.getElementsByClassName("html5-video-container")[0].removeAttribute(
          "style"
        );
      }
      if (dc.getElementById("player-api")) {
        dc.getElementById("player-api").style.removeProperty("margin-left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty("left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty(
          "margin-top"
        );
      }

      if (dc.getElementById("watch7-container")) {
        dc.getElementById("watch7-container").classList.add("watch-wide");
      }
      if (dc.getElementById("player")) {
        dc.getElementById("player").classList.add("watch-playlist-collapsed");
      }
      if (dc.getElementById("player")) {
        dc.getElementById("player").classList.add("watch-medium");
      }
      if (dc.getElementById("page")) {
        dc.getElementById("page").classList.add("watch-stage-mode");
      }
      if (dc.getElementById("page")) {
        dc.getElementById("page").classList.add("watch-wide");
      }
      if (
        dc.getElementById("player") &&
        dc.getElementById("player").classList.contains("watch-small")
      ) {
        dc.getElementById("player").classList.remove("watch-small");
      }
      if (
        dc.getElementById("page") &&
        dc.getElementById("page").classList.contains("watch-non-stage-mode")
      ) {
        dc.getElementById("page").classList.remove("watch-non-stage-mode");
      }

      if (isOptionHandle) {
        dc.defaultView.scrollTo(0, 0);
      }

      if (dc.getElementsByClassName("html5-main-video")[0]) {
        dc.getElementsByClassName("html5-main-video")[0].style.top = "0px";
      }

      var interwal = dc.defaultView.setInterval(function() {
        if (
          (dc.querySelector(".ytp-size-button path") &&
            dc
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 28,") == 0) ||
          !dc.querySelector("ytd-watch[theater]")
        ) {
          if (
            dc.querySelector(".ytp-size-button path") &&
            dc
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 28,") == 0 &&
            dc.querySelector(".ytp-size-button path").parentNode.parentNode
          ) {
            dc.querySelector(
              ".ytp-size-button path"
            ).parentNode.parentNode.click();
            dc.defaultView.clearInterval(interwal);
          }
        } else {
          dc.defaultView.clearInterval(interwal);
        }
      }, 1000);
    } else if (currentvideosize == "shrink") {
      if (dc.getElementById("ythdlink"))
        dc.getElementById("ythdlink").parentNode.removeChild(
          dc.getElementById("ythdlink")
        );

      if (dc.querySelector("#player.ytd-watch")) {
        dc.querySelector("#player.ytd-watch").removeAttribute("style");
      }
      if (dc.getElementsByClassName("html5-video-container")[0]) {
        dc.getElementsByClassName("html5-video-container")[0].removeAttribute(
          "style"
        );
      }
      if (dc.getElementById("player-api")) {
        dc.getElementById("player-api").style.removeProperty("margin-left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty("left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty(
          "margin-top"
        );
      }

      if (
        (dc.querySelector(".ytp-size-button path") &&
          dc
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 26,") == 0) ||
        dc.querySelector("ytd-watch[theater]")
      ) {
        if (
          dc.querySelector(".ytp-size-button path") &&
          dc
            .querySelector(".ytp-size-button path")
            .getAttribute("d")
            .indexOf("m 26,") == 0 &&
          dc.querySelector(".ytp-size-button path").parentNode.parentNode
        ) {
          dc.querySelector(
            ".ytp-size-button path"
          ).parentNode.parentNode.click();
        }
      }

      if (
        dc.getElementById("watch7-container") &&
        dc.getElementById("watch7-container").classList.contains("watch-wide")
      ) {
        dc.getElementById("watch7-container").classList.remove("watch-wide");
      }
      if (
        dc.getElementById("player") &&
        dc
          .getElementById("player")
          .classList.contains("watch-playlist-collapsed")
      ) {
        dc.getElementById("player").classList.remove(
          "watch-playlist-collapsed"
        );
      }
      if (
        dc.getElementById("player") &&
        dc.getElementById("player").classList.contains("watch-medium")
      ) {
        dc.getElementById("player").classList.remove("watch-medium");
      }
      if (dc.getElementById("player")) {
        dc.getElementById("player").classList.add("watch-small");
      }
      if (dc.getElementById("page")) {
        dc.getElementById("page").classList.add("watch-non-stage-mode");
      }
      if (
        dc.getElementById("player") &&
        dc.getElementById("player").classList.contains("watch-wide")
      ) {
        dc.getElementById("player").classList.remove("watch-wide");
      }
      if (
        dc.getElementById("page") &&
        dc.getElementById("page").classList.contains("watch-stage-mode")
      ) {
        dc.getElementById("page").classList.remove("watch-stage-mode");
      }
      if (
        dc.getElementById("page") &&
        dc.getElementById("page").classList.contains("watch-wide")
      ) {
        dc.getElementById("page").classList.remove("watch-wide");
      }

      if (isOptionHandle) {
        dc.defaultView.scrollTo(0, 0);
      }

      var interwal = dc.defaultView.setInterval(function() {
        if (
          (dc.querySelector(".ytp-size-button path") &&
            dc
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0) ||
          dc.querySelector("ytd-watch[theater]")
        ) {
          if (
            dc.querySelector(".ytp-size-button path") &&
            dc
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0 &&
            dc.querySelector(".ytp-size-button path").parentNode.parentNode
          ) {
            dc.querySelector(
              ".ytp-size-button path"
            ).parentNode.parentNode.click();
            dc.defaultView.clearInterval(interwal);
          }
        } else {
          dc.defaultView.clearInterval(interwal);
        }
      }, 1000);
    } else if (currentvideosize == "default") {
      if (isOptionHandle) {
        if (dc.querySelector("#player.ytd-watch")) {
          dc.querySelector("#player.ytd-watch").removeAttribute("style");
        }
        if (dc.getElementsByClassName("html5-video-container")[0]) {
          dc.getElementsByClassName("html5-video-container")[0].removeAttribute(
            "style"
          );
        }
        if (dc.getElementById("player-api")) {
          dc.getElementById("player-api").style.removeProperty("margin-left");
        }
        if (dc.getElementById("watch-appbar-playlist")) {
          dc.getElementById("watch-appbar-playlist").style.removeProperty(
            "left"
          );
        }
        if (dc.getElementById("watch-appbar-playlist")) {
          dc.getElementById("watch-appbar-playlist").style.removeProperty(
            "margin-top"
          );
        }

        if (
          (dc.querySelector(".ytp-size-button path") &&
            dc
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0) ||
          dc.querySelector("ytd-watch[theater]")
        ) {
          if (
            dc.querySelector(".ytp-size-button path") &&
            dc
              .querySelector(".ytp-size-button path")
              .getAttribute("d")
              .indexOf("m 26,") == 0 &&
            dc.querySelector(".ytp-size-button path").parentNode.parentNode
          ) {
            dc.querySelector(
              ".ytp-size-button path"
            ).parentNode.parentNode.click();
          }
        }

        if (
          dc.getElementById("watch7-container") &&
          dc.getElementById("watch7-container").classList.contains("watch-wide")
        ) {
          dc.getElementById("watch7-container").classList.remove("watch-wide");
        }
        if (
          dc.getElementById("player") &&
          dc
            .getElementById("player")
            .classList.contains("watch-playlist-collapsed")
        ) {
          dc.getElementById("player").classList.remove(
            "watch-playlist-collapsed"
          );
        }
        if (
          dc.getElementById("player") &&
          dc.getElementById("player").classList.contains("watch-medium")
        ) {
          dc.getElementById("player").classList.remove("watch-medium");
        }
        if (dc.getElementById("player")) {
          dc.getElementById("player").classList.add("watch-small");
        }
        if (dc.getElementById("page")) {
          dc.getElementById("page").classList.add("watch-non-stage-mode");
        }
        if (
          dc.getElementById("player") &&
          dc.getElementById("player").classList.contains("watch-wide")
        ) {
          dc.getElementById("player").classList.remove("watch-wide");
        }
        if (
          dc.getElementById("page") &&
          dc.getElementById("page").classList.contains("watch-stage-mode")
        ) {
          dc.getElementById("page").classList.remove("watch-stage-mode");
        }

        if (isOptionHandle) {
          dc.defaultView.scrollTo(0, 0);
        }

        var interwal = dc.defaultView.setInterval(function() {
          if (
            (dc.querySelector(".ytp-size-button path") &&
              dc
                .querySelector(".ytp-size-button path")
                .getAttribute("d")
                .indexOf("m 26,") == 0) ||
            dc.querySelector("ytd-watch[theater]")
          ) {
            if (
              dc.querySelector(".ytp-size-button path") &&
              dc
                .querySelector(".ytp-size-button path")
                .getAttribute("d")
                .indexOf("m 26,") == 0 &&
              dc.querySelector(".ytp-size-button path").parentNode.parentNode
            ) {
              dc.querySelector(
                ".ytp-size-button path"
              ).parentNode.parentNode.click();
            }
          } else {
            dc.defaultView.clearInterval(interwal);
          }
        }, 1000);
      }
    }

    if (dc.body) dc.body.classList.add("fullytpagesize");
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
      if (
        player.getPlaybackQuality() !=
        ytutils.getIntendedQuality(player, currentvideoquality)
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
        player.getPlaybackQuality() !=
        ytutils.getIntendedQuality(player, currentvideoquality)
      ) {
        if (
          player.getPlaybackQuality() !=
          ytutils.getIntendedQuality(player, currentvideoquality)
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
        var ythdonPlayerStateChangeInterval = window.setInterval(function() {
          if (document.location.pathname != "/watch") {
            window.clearInterval(ythdonPlayerStateChangeInterval);
          }
          try {
            if (
              player.getPlaybackQuality() !=
              ytutils.getIntendedQuality(player, currentvideoquality)
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
              player.getPlaybackQuality() ===
              ytutils.getIntendedQuality(player, currentvideoquality)
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
    if (
      player.getPlaybackQuality() !=
      ytutils.getIntendedQuality(player, currentvideoquality)
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
    var onYouTubePlayerReadyInterval = window.setInterval(function() {
      if (document.location.pathname != "/watch") {
        window.clearInterval(onYouTubePlayerReadyInterval);
      }
      try {
        if (
          player.getPlaybackQuality() !==
          ytutils.getIntendedQuality(player, currentvideoquality)
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
          player.getPlaybackQuality() ===
          ytutils.getIntendedQuality(player, currentvideoquality)
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
