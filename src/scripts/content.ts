const ytworker = {
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
      ytworker.askQualitySize();
    } else {
      ytworker.change(
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
    if (!ytworker.sto) {
      browser.runtime.sendMessage({ action: "storage_ask" }, function(o) {
        //
      });
      return;
    }
    ytworker.getStorage().get(null, function(items) {
      ytworker.change(
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
    return ytworker.sto == "sync"
      ? browser.storage.sync
      : browser.storage.local;
  },
  changeVideoQuality: function() {
    if (location.hostname.search(/youtube.com$/) != -1) {
      var dc = document;
      var player = dc.getElementById("movie_player");
      var channel = dc.getElementById("playnav-player");
      if (channel) {
        //need to remove listener here else it will create an infinite loop.
        channel.removeEventListener(
          "DOMNodeInserted",
          ytworker.handleChannelChange,
          true
        );
      }
      if (player) {
        let flashvars = player.getAttribute("flashvars");
        const delimit = "&vq";
        if (flashvars.indexOf(delimit) === -1) {
          flashvars += `${delimit}=${ytworker.quality}`;
        } else {
          const splitarray = flashvars.split(delimit);
          const result = splitarray[1].indexOf("&");
          flashvars =
            result !== -1
              ? `${splitarray[0]}${delimit}=${ytworker.quality
              }${splitarray[1].substring(result)}`
              : `${splitarray[0]}${delimit}=${ytworker.quality}`;
        }
        player.setAttribute("flashvars", flashvars);
        var oldplayer = player;
        var playerparentnode = oldplayer.parentNode;
        var playernextsibling = oldplayer.nextSibling;
        playerparentnode.removeChild(oldplayer);
        var playerclone = oldplayer.cloneNode(true);
        playerparentnode.insertBefore(playerclone, playernextsibling);

        if (channel) {
          channel.addEventListener(
            "DOMNodeInserted",
            ytworker.handleChannelChange,
            true
          );
        }
      }
    }
  },
  handleChannelChange: (ev: Event) => {
    if ((ev.target as HTMLElement).nodeName == "EMBED")
      window.setTimeout(() => {
        ytworker.changeVideoQuality();
      }, 1);
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

ytworker.addScript();

//change to mutation event
if (document.location.pathname.indexOf("/embed") !== 0) {
  ytworker.requestChange();
}

document.addEventListener(
  "DOMContentLoaded",
  function(event) {
    ytworker.requestChange();
  },
  false
);

browser.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "video_qualitysize_change":
      ytworker.requestChange(
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
      ytworker.sto = request.sto;
      ytworker.askQualitySize();
      break;
  }
});

window.onmessage = (ev: MessageEvent) => {
  if (ev.source !== window) return;
  if (ev.data?.type === "FROM_PAGE_SCRIPT_REQUEST_CHANGE") {
    ytworker.requestChange();
  }
};
