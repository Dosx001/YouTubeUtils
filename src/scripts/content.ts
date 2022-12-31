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
  addScript: () => {
    const s = document.createElement("script");
    s.src = browser.runtime.getURL("scripts/ytutils.js");
    s.id = "ytutils";
    s.onload = () => {
      document.getElementById("ytutils").remove();
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
