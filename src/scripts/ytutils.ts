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
    //YouTubeHighDefinition.changeVideoQuality(document);
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
    ytutils.expandVideoDescription(
      document,
      autoexpanddescription,
      isOptionHandle
    );
    ytutils.enablesuggestedautoplay(document, suggestedautoplay);
  },
  getIntendedQuality: function(player, currentvideoquality) {
    if (currentvideoquality == "highres")
      return player.getAvailableQualityLevels()[0];
    else if (
      player.getAvailableQualityLevels().indexOf(currentvideoquality) == -1
    ) {
      return player.getAvailableQualityLevels()[0];
    } else return currentvideoquality;
  },
  getSetVideoQuality: function(player, currentvideoquality) {
    if (
      currentvideoquality == "hd2160" &&
      player.getAvailableQualityLevels().indexOf(currentvideoquality) == -1
    )
      return player.getAvailableQualityLevels()[0];
    else return currentvideoquality;
  },
  getVideoQuality: function() {
    var currentvideoquality = ytutils.quality;
    if (currentvideoquality == "4k2160") currentvideoquality = "hd2160";
    return currentvideoquality;
  },
  getPlaylistVideoAutoPlayBehavior: function() {
    var currentplaylistvideoautoplaybehavior =
      ytutils.playlistvideoautoplaybehavior;
    if (currentplaylistvideoautoplaybehavior == "default") return true;
    else if (currentplaylistvideoautoplaybehavior == "autoplay") return true;
    else if (currentplaylistvideoautoplaybehavior == "autopause") return false;
    //return YouTubeHighDefinition.getCurrentEmbeddedVideoAutoPlayBehavior() ? 1 : 0;
  },
  getYoutubeVideoAutoPlayBehavior: function(youtubevideoautoplaybehavior) {
    var currentyoutubevideoautoplaybehavior = youtubevideoautoplaybehavior;
    if (currentyoutubevideoautoplaybehavior == "default") return true;
    else if (currentyoutubevideoautoplaybehavior == "autoplay") return true;
    else if (currentyoutubevideoautoplaybehavior == "autopause") return false;
    //return YouTubeHighDefinition.getCurrentEmbeddedVideoAutoPlayBehavior() ? 1 : 0;
  },
  enablesuggestedautoplay: function(document, checked) {
    if (document.location.pathname.search(/^\/watch/) == 0) {
      if (document.getElementById("autoplay-checkbox"))
        document.getElementById("autoplay-checkbox").click();
      if (document.getElementById("autoplay-checkbox"))
        document.getElementById("autoplay-checkbox").checked = checked;
      if (
        document.querySelector(
          "paper-toggle-button#toggle[aria-pressed*=" + !checked + "]"
        )
      ) {
        document
          .querySelector(
            "paper-toggle-button#toggle[aria-pressed*=" + !checked + "]"
          )
          .click();
      }
    }
  },
  expandVideoDescription: function(
    doc,
    autoexpanddescription,
    isOptionHandle
  ) {
    if (document.location.pathname.search(/^\/watch/) != 0) return;
    if (autoexpanddescription) {
      if (doc.getElementById("action-panel-details")) {
        doc
          .getElementById("action-panel-details")
          .classList.remove("yt-uix-expander-collapsed");
      }
      var interwal;
      var it = 0;
      if (doc.querySelector("paper-button#more")) {
        doc.querySelector("paper-button#more").click();
      } else {
        interwal = doc.defaultView.setInterval(function() {
          if (!doc.querySelector("paper-button#more")) {
            it++;
            return;
          } else {
            doc.defaultView.clearInterval(interwal);
          }
          doc.querySelector("paper-button#more").click();
        }, 100);
      }
    } else {
      if (isOptionHandle) {
        doc.querySelector("paper-button#less").click();
      }
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
    //player.setPlaybackQuality(quality);
    player.setPlaybackQualityRange(quality, quality);
  },
  onSPFDone: function(event) {
    var doc = event.currentTarget.document;
    //YouTubeHighDefinition.changeVideoQuality(doc,true);
    window.postMessage(
      { type: "FROM_PAGE_SCRIPT_REQUEST_CHANGE", text: "NULL" },
      "*"
    );
  },
  onNavigateFinish: () => {
    window.setTimeout(() => {
      ytutils.expandVideoDescription(
        document,
        ytutils.autoexpanddescription,
        null
      );
    }, 1000);
  },
  scrollTo: function(document) {
    var dc = document;
    var xpos = 0;
    var ypos = parseInt(
      dc.defaultView
        .getComputedStyle(dc.getElementById("masthead-container"), null)
        .getPropertyValue("height")
        .replace("px", "")
    );
    var offsetTop = ytutils.findPosition(dc.getElementById("page-manager"))[1];
    if (!dc.body.classList.contains("fullytpagesize")) {
      if (spf) {
        dc.defaultView.scrollTo(xpos, offsetTop / 2);
      } else {
        dc.defaultView.scrollTo(xpos, offsetTop / 2); // requires half somehow.
      }
      //dc.getElementById("movie_player").scrollIntoView(false);
    } else {
      dc.defaultView.scrollTo(xpos, offsetTop); // requires whole for secondary requests
    }
  },
  findPosition: function(node) {
    var left_pos = (top_pos = 0);
    if (node.offsetParent) {
      do {
        left_pos += node.offsetLeft;
        top_pos += node.offsetTop;
      } while ((node = node.offsetParent));
    }
    return [left_pos, top_pos];
  },
  Slistener: function(event) {
    var doc = event.currentTarget.ownerDocument;
    if (
      event.propertyName === "transform" &&
      event.target.id === "progress" &&
      event.target.getAttribute("style") == "transform: scaleX(1);"
    ) {
      ytutils.scrollTo(document);
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
      //window.addEventListener("transitioncancel", YouTubeHighDefinition.Slistener2, true);
      //document.getElementById("progress").addEventListener("transitionend", YouTubeHighDefinition.Slistener, true);
      //document.body.addEventListener("transitionend", YouTubeHighDefinition.Slistener, true);

      /*if(YouTubeHighDefinition.flashBlockInstalled) {

        if (doc.location.pathname=="/watch") {
          YouTubeHighDefinition.handleFlashBlock(dc);
          YouTubeHighDefinition.changeVideoSize(doc);
        }
      	
        return;
    	
      }*/

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
        //var enableautoplay = YouTubeHighDefinition.getPrefValue("extensions.youtubehighdefinition.enableautoplay");
        var enableautoplay = ytutils.getYoutubeVideoAutoPlayBehavior(
          youtubevideoautoplaybehavior
        );
        var volumelevel = ytutils.getVolumeLevel(volume, volumelevel);

        /*player.setAttribute("wmode", "opaque");

        var flashvars = player.getAttribute("flashvars");

        function changeFlashvars(flashvars, option, value) 
        {
          var delimit = "&" + option;
          if (flashvars.indexOf(delimit) == -1 ) {
            flashvars += delimit + "=" + value;
          }
          else {
            var splitarray = flashvars.split(delimit);
            var result = splitarray[1].indexOf("&");
            if (result != -1) {
              flashvars = splitarray[0] + delimit + "=" + value + splitarray[1].substr(result);
            }
            else {
              flashvars = splitarray[0] + delimit + "=" + value;
            }
          }
          return flashvars;
        }				

        player.setAttribute("flashvars", changeFlashvars(flashvars,"vq",currentvideoquality ));
    	
        var oldplayer=player;
        var playerparentnode=oldplayer.parentNode;
        var playernextsibling=oldplayer.nextSibling; 
        playerparentnode.removeChild(oldplayer); 
        var playerclone=oldplayer.cloneNode(true); 
        playerparentnode.insertBefore(playerclone,playernextsibling);*/

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
              //if(isOptionHandle) player.stopVideo();
              //player.seekTo(cTime);
              //player.setPlaybackQuality("small");
              //player.setPlaybackQuality(currentvideoquality);
              player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              player.setPlaybackRate(parseFloat(volumespeed));

              //player.playVideo();
              if (!enableautoplay) {
              }
            } else {
              if (volumelevel != "default") {
                player.unMute();
                player.setVolume(volumelevel);
              }
              var cTime = player.getCurrentTime();
              //if(isOptionHandle) player.stopVideo();
              //player.seekTo(cTime);
              //player.setPlaybackQuality(currentvideoquality);
              player.setPlaybackQualityRange(
                currentvideoquality,
                currentvideoquality
              );
              player.setPlaybackRate(parseFloat(volumespeed));

              //player.playVideo();
              if (!enableautoplay) {
              }
              /*
              if(isOptionHandle) {
                player.playVideo();
              }
              */
            }

            window.clearInterval(ythdinterval);
            //YouTubeHighDefinition.changeVideoSize(doc,YouTubeHighDefinition.size);
          }
        }, 50);
      }

      //YouTubeHighDefinition.addOptionButton(dc);
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
      /*
      if(dc.getElementById("related")){
        dc.getElementById("related").style.removeProperty("top");
      }
      */
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty("left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty(
          "margin-top"
        );
      }

      /*
      if(dc.getElementsByClassName("ytp-size-toggle-large")[0]){
        dc.getElementsByClassName("ytp-size-toggle-large")[0].click();
      }
      */
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
          //dc.defaultView.clearInterval(interwal)
        }
      }

      if (
        dc.getElementById("watch7-container") &&
        dc.getElementById("watch7-container").classList.contains("watch-wide")
      ) {
        dc.getElementById("watch7-container").classList.remove("watch-wide");
      }
      /*if(dc.getElementById("watch7-container") && dc.getElementById("watch7-container").classList.contains('watch-medium')){
        dc.getElementById("watch7-container").classList.remove('watch-medium');
      }*/
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
      /*if(dc.getElementById("page") && dc.getElementById("page").classList.contains('watch-stage-mode')) {
        dc.getElementById("page").classList.remove('watch-stage-mode');
      }*/
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
          ytutils.scrollTo(document);
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

          /*
          var interwal3=dc.defaultView.setInterval(function(){
            YouTubeHighDefinition.scrollTo(document);									
            dc.defaultView.clearInterval(interwal3)
          },5000);
          */
        }
      }

      var interwal;
      var it = 0;

      if (dc.querySelector("#player.ytd-watch")) {
        //dc.getElementById("player").setAttribute('style','height:' + (dc.body.clientHeight) + 'px !important');
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

      //dc.defaultView.setTimeout(function(){dc.getElementById("movie_player").scrollIntoView(true);},1000)

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
        /*if(dc.getElementById("watch-appbar-playlist")) {
          dc.getElementById("watch-appbar-playlist").style.setProperty("left",((rect.right-rect2.right)+640+10)+"px", "important");
        }*/
      }

      doTheRest();
    } else if (currentvideosize == "expand") {
      if (dc.getElementById("ythdlink"))
        dc.getElementById("ythdlink").parentNode.removeChild(
          dc.getElementById("ythdlink")
        );

      /*
      if(dc.getElementsByClassName("ytp-size-toggle-large")[0]){
        dc.getElementsByClassName("ytp-size-toggle-large")[0].click();
      }
      */
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
          //dc.defaultView.clearInterval(interwal)
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
      /*
      if(dc.getElementById("related")){
        dc.getElementById("related").style.removeProperty("top");
      }
      */
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
      /*if(dc.getElementById("watch7-container")){
        dc.getElementById("watch7-container").classList.add('watch-medium');
      }*/
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

      //browser.cookies.set({"url": ".youtube.com", "name": "wide", "value": 1});
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
      /*
      if(dc.getElementById("related")){
        dc.getElementById("related").style.removeProperty("top");
      }
      */
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty("left");
      }
      if (dc.getElementById("watch-appbar-playlist")) {
        dc.getElementById("watch-appbar-playlist").style.removeProperty(
          "margin-top"
        );
      }

      /*
      if(dc.getElementsByClassName("ytp-size-toggle-small")[0]){
        dc.getElementsByClassName("ytp-size-toggle-small")[0].click();
      }					
      if (dc.querySelector("ytd-watch[theater]")) {
        dc.getElementsByClassName("ytp-size-button")[0].click();
      }						
      if(dc.querySelector(".ytp-size-button[title*=Default]") || dc.querySelector("ytd-watch[theater]")){
        if(dc.querySelector(".ytp-size-button[title*=Default]")) {
          dc.querySelector(".ytp-size-button[title*=Default]").click();
        }
      } 						
      */

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
          //dc.defaultView.clearInterval(interwal)
        }
      }

      if (
        dc.getElementById("watch7-container") &&
        dc.getElementById("watch7-container").classList.contains("watch-wide")
      ) {
        dc.getElementById("watch7-container").classList.remove("watch-wide");
      }
      /*if(dc.getElementById("watch7-container") && dc.getElementById("watch7-container").classList.contains('watch-medium')){
        dc.getElementById("watch7-container").classList.remove('watch-medium');
      }*/
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

      //browser.cookies.set({"url": ".youtube.com", "name": "wide", "value": 0});
    } else if (currentvideosize == "default") {
      if (isOptionHandle) {
        //if(dc.body.classList.contains("fullytpagesize")) {

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
        /*
        if(dc.getElementById("related")){
          dc.getElementById("related").style.removeProperty("top");
        }
        */
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

        /*
        if(dc.getElementsByClassName("ytp-size-toggle-small")[0]){
          dc.getElementsByClassName("ytp-size-toggle-small")[0].click();
        }					
        if (dc.querySelector("ytd-watch[theater]")) {
          dc.getElementsByClassName("ytp-size-button")[0].click();
        }						
        if(dc.querySelector(".ytp-size-button[title*=Default]") || dc.querySelector("ytd-watch[theater]")){
          if(dc.querySelector(".ytp-size-button[title*=Default]")) {
            dc.querySelector(".ytp-size-button[title*=Default]").click();
          }
        } 						
        */

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
        /*if(dc.getElementById("watch7-container") && dc.getElementById("watch7-container").classList.contains('watch-medium')){
          dc.getElementById("watch7-container").classList.remove('watch-medium');
        }*/
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
              //dc.defaultView.clearInterval(interwal)
            }
          } else {
            dc.defaultView.clearInterval(interwal);
          }
        }, 1000);

        //}
      }
    }

    if (dc.body) dc.body.classList.add("fullytpagesize");
  },
  setPSpeed: function() {
    var ythdinterval = window.setInterval(function() {
      var player = document.getElementById("movie_player");
      if (checkPlayerReady(player)) {
        player.setPlaybackRate(videoplayerspeed);
        window.clearInterval(ythdinterval);
        //YTVideoPlayerSpeed.changeVideoSize(doc,YTVideoPlayerSpeed.size);
      }
    }, 50);
  },
  setAutoSubtitles: function() {
    switch (autosubtitles) {
      case "default":
        break;
      case "on":
        player.loadModule("captions");
        break;
      case "off":
        player.unloadModule("captions");
        break;
    }
  },
};

window.addEventListener(
  "message",
  function(event) {
    // We only accept messages from ourselves
    if (event.source != window) return;

    if (event.data.type && event.data.type == "FROM_CONTENT_SCRIPT") {
      //window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
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

/*window.addEventListener("DOMContentLoaded",function(event){
  //YouTubeHighDefinition.requestChange();
  YouTubeHighDefinition.changeVideoSize(document,YouTubeHighDefinition.size);
},false);*/

window.addEventListener("spfdone", ytutils.onSPFDone);
window.addEventListener("yt-navigate-start", ytutils.onSPFDone);

try {
  if (window.ythdonPlayerStateChange && player.removeEventListener)
    player.removeEventListener("onStateChange", "ythdonPlayerStateChange");
  var ythdonPlayerStateChange = function(newState) {
    try {
      //var window=window;
      //var window=this;
      //var document=window.document;
      var player = document.getElementById("movie_player");
      var currentvideoquality = ytutils.getVideoQuality();
      var enableplaylistautoplay = ytutils.getPlaylistVideoAutoPlayBehavior();
      var enableautoplay = ytutils.getYoutubeVideoAutoPlayBehavior(
        ytutils.youtubevideoautoplaybehavior
      );
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
            var mxx = ytutils.getSetVideoQuality(player, currentvideoquality);
            //player.setPlaybackQuality(mxx);
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
    //player.addEventListener('onStateChange','ythdonPlayerStateChange');
    var currentvideoquality = ytutils.getVideoQuality();
    var enableplaylistautoplay = ytutils.getPlaylistVideoAutoPlayBehavior();
    var enableautoplay = ytutils.getYoutubeVideoAutoPlayBehavior(
      ytutils.youtubevideoautoplaybehavior
    );
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
        var mxx = ytutils.getSetVideoQuality(player, currentvideoquality);
        //player.setPlaybackQuality(mxx);
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
