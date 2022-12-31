const YouTubeHighDefinition = {
  quality: null,
  size: null,
  requestChange: function(
    quality,
    size,
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
    if (!quality) {
      YouTubeHighDefinition.askQualitySize();
    } else {
      YouTubeHighDefinition.change(
        quality,
        size,
        speed,
        volume,
        volumelevel,
        youtubevideoautoplaybehavior,
        playlistvideoautoplaybehavior,
        suggestedautoplay,
        autoexpanddescription,
        autosubtitles,
        isOptionHandle
      );
      //YouTubeHighDefinition.changeVideoQuality(document);
    }
  },
  change: function(
    quality,
    size,
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
    //YouTubeHighDefinition.changeVideoQuality(document,o['video_quality']);
    //YouTubeHighDefinition.changeVideoSize(document,o['video_size']);
    window.postMessage(
      { type: "FROM_CONTENT_SCRIPT_SET_VQ", text: quality },
      "*"
    );
    window.postMessage({ type: "FROM_CONTENT_SCRIPT_SET_VS", text: size }, "*");
    window.postMessage(
      {
        type: "FROM_CONTENT_SCRIPT_REQUEST_CHANGE",
        id: browser.extension.getURL(""),
        speed: speed,
        volume: volume,
        volumelevel: volumelevel,
        youtubevideoautoplaybehavior: youtubevideoautoplaybehavior,
        playlistvideoautoplaybehavior: playlistvideoautoplaybehavior,
        suggestedautoplay: suggestedautoplay,
        autoexpanddescription: autoexpanddescription,
        autosubtitles: autosubtitles,
        isOptionHandle: isOptionHandle,
      },
      "*"
    );
  },
  askQualitySize: function() {
    if (!YouTubeHighDefinition.sto) {
      browser.runtime.sendMessage({ action: "storage_ask" }, function(o) {
        //
      });
      return;
    }
    YouTubeHighDefinition.getStorage().get(null, function(items) {
      YouTubeHighDefinition.change(
        items["video_quality"],
        items["video_size"],
        items["video_speed"],
        items["volume"],
        items["volumelevel"],
        items["youtubevideoautoplaybehavior"],
        items["playlistvideoautoplaybehavior"],
        items["suggestedautoplay"],
        items["autoexpanddescription"],
        items["autosubtitles"]
      );
    });
  },
  sto: "local",
  getStorage: function() {
    return YouTubeHighDefinition.sto == "sync"
      ? browser.storage.sync
      : browser.storage.local;
  },
  changeVideoQuality: function(doc, quality) {
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
      var player = dc.getElementById("movie_player");
      var channel = dc.getElementById("playnav-player");

      if (quality) YouTubeHighDefinition.quality = quality; //for channel event listener

      if (channel) {
        //need to remove listener here else it will create an infinite loop.
        channel.removeEventListener(
          "DOMNodeInserted",
          YouTubeHighDefinition.handleChannelChange,
          true
        );
      }

      if (player) {
        var currentvideoquality = quality
          ? quality
          : YouTubeHighDefinition.quality; //for channel listener

        var flashvars = player.getAttribute("flashvars");

        function changeFlashvars(flashvars, option, value) {
          var delimit = "&" + option;
          if (flashvars.indexOf(delimit) == -1) {
            flashvars += delimit + "=" + value;
          } else {
            var splitarray = flashvars.split(delimit);
            var result = splitarray[1].indexOf("&");
            if (result != -1) {
              flashvars =
                splitarray[0] +
                delimit +
                "=" +
                value +
                splitarray[1].substr(result);
            } else {
              flashvars = splitarray[0] + delimit + "=" + value;
            }
          }
          return flashvars;
        }

        player.setAttribute(
          "flashvars",
          changeFlashvars(flashvars, "vq", currentvideoquality)
        );

        var oldplayer = player;
        var playerparentnode = oldplayer.parentNode;
        var playernextsibling = oldplayer.nextSibling;
        playerparentnode.removeChild(oldplayer);
        var playerclone = oldplayer.cloneNode(true);
        playerparentnode.insertBefore(playerclone, playernextsibling);

        if (channel) {
          channel.addEventListener(
            "DOMNodeInserted",
            YouTubeHighDefinition.handleChannelChange,
            true
          );
        }
      }
    }
  },
  handleChannelChange: function(event) {
    if (event.target.nodeName == "EMBED") {
      var doc = event.target.ownerDocument;

      window.setTimeout(function() {
        YouTubeHighDefinition.changeVideoQuality(doc);
      }, 1);
    }
  },
  changeVideoSize: function(doc, size) {
    var dc = doc;
    if (size) YouTubeHighDefinition.size = size;
    var channel = dc.getElementById("playnav-player");
    if (channel) return; //do not let channels have a size because they cant

    var currentvideosize = size ? size : YouTubeHighDefinition.size;

    if (currentvideosize == "expand") {
      dc.getElementById("watch7-container").classList.add("watch-wide");
      //dc.getElementById("watch7-container").classList.add('watch-medium');
      dc.getElementById("player").classList.add("watch-playlist-collapsed");
      dc.getElementById("player").classList.add("watch-medium");

      //dc.getElementById("watch-video").classList.add("wide");
      //dc.getElementById("content").classList.add("watch-wide");
      //browser.cookies.set({"url": ".youtube.com", "name": "wide", "value": 1});
    } else {
      dc.getElementById("watch7-container").classList.remove("watch-wide");
      //dc.getElementById("watch7-container").classList.remove('watch-medium');
      dc.getElementById("player").classList.remove("watch-playlist-collapsed");
      dc.getElementById("player").classList.remove("watch-medium");

      //dc.getElementById("content").classList.remove("watch-wide");
      //dc.getElementById("watch-video").classList.remove("wide");
      //browser.cookies.set({"url": ".youtube.com", "name": "wide", "value": 0});
    }
  },
  decodeFlashvars: function(passedFlashvar) {
    var flashVars = {};
    var flashVarsArray = passedFlashvar.split("&");
    for (i = 0; i < flashVarsArray.length; i++) {
      var a = flashVarsArray[i].split("=");
      flashVars[a[0]] = decodeURIComponent(a[1]).replace(/\+/g, " "); //?------------------ replace may create problems
    }
    return flashVars;
  },
  encodeFlashvars: function(passedFlashvar) {
    var newFlashVars = "";
    for (var prop in passedFlashvar) {
      if (!/^(?:ad|ctb|rec)_/i.test(prop)) {
        newFlashVars +=
          "&" + prop + "=" + encodeURIComponent(passedFlashvar[prop]);
      }
    }
    return newFlashVars;
  },
  addStyle: function(css) {
    if (document.getElementById("youtubehighdefinition-stylesheet") == null) {
      var link = document.createElement("link");
      link.setAttribute("type", "text/css");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("id", "youtubehighdefinition-stylesheet");
      link.setAttribute("href", css);
      document.getElementsByTagName("head")[0].appendChild(link);
      //document.getElementById("page").classList.add('watch-wide');
      //document.getElementById("watch-video").classList.add('medium');
    } else {
      document
        .getElementById("youtubehighdefinition-stylesheet")
        .parentNode.removeChild(
          document.getElementById("youtubehighdefinition-stylesheet")
        );
    }
  },
  addScript: function(css) {
    var s = document.createElement("script");
    s.src = browser.extension.getURL("scripts/ytutils.js");
    s.onload = function() {
      this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
  },
};

YouTubeHighDefinition.addScript();

//change to mutation event
if (document.location.pathname.indexOf("/embed") !== 0) {
  YouTubeHighDefinition.requestChange();
}

document.addEventListener(
  "DOMContentLoaded",
  function(event) {
    YouTubeHighDefinition.requestChange();
  },
  false
);

browser.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "video_qualitysize_change":
      YouTubeHighDefinition.requestChange(
        request.quality,
        request.size,
        request.speed,
        request.volume,
        request.volumelevel,
        request.youtubevideoautoplaybehavior,
        request.playlistvideoautoplaybehavior,
        request.suggestedautoplay,
        request.autoexpanddescription,
        request.autosubtitles,
        request.isOptionHandle
      );
      break;
    case "storage_answer":
      YouTubeHighDefinition.sto = request.sto;
      YouTubeHighDefinition.askQualitySize();
      break;
  }
});

window.onmessage = (ev: MessageEvent) => {
  if (ev.source !== window) return;
  if (ev.data?.type === "FROM_PAGE_SCRIPT_REQUEST_CHANGE") {
    YouTubeHighDefinition.requestChange();
  }
};
