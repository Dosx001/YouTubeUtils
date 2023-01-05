interface settings {
  autoexpanddescription: boolean;
  autosubtitles: string;
  embeddedvideoautoplaybehavior: string;
  playlistvideoautoplaybehavior: string;
  quality: string;
  size: string;
  speed: string;
  suggestedautoplay: boolean;
  volume: string;
  volumelevel: string;
  youtubevideoautoplaybehavior: string;
}

const ytworker = {
  askQualitySize: () => {
    browser.storage.sync.get((data: settings) => {
      window.postMessage(
        {
          type: "UPDATE_SETTINGS",
          quality: data.quality,
          size: data.size,
          speed: data.speed,
          volume: data.volume,
          volumelevel: data.volumelevel,
          youtubevideoautoplaybehavior: data.youtubevideoautoplaybehavior,
          playlistvideoautoplaybehavior: data.playlistvideoautoplaybehavior,
          suggestedautoplay: data.suggestedautoplay,
          autoexpanddescription: data.autoexpanddescription,
          autosubtitles: data.autosubtitles,
        },
        "*"
      );
    });
  },
  changeVideoQuality: () => {
    if (location.hostname.search(/youtube.com$/) !== -1) {
      const channel = document.getElementById("playnav-player");
      if (channel) {
        //need to remove listener here else it will create an infinite loop.
        channel.removeEventListener(
          "DOMNodeInserted",
          ytworker.handleChannelChange,
          true
        );
      }
      const player = document.getElementById("movie_player");
      if (player) {
        const playerparentnode = player.parentNode;
        playerparentnode.removeChild(player);
        playerparentnode.insertBefore(
          player.cloneNode(true),
          player.nextSibling
        );
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
  ytworker.askQualitySize();
}

document.addEventListener("DOMContentLoaded", ytworker.askQualitySize, false);

browser.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "update_settings":
      ytworker.askQualitySize();
      break;
  }
});

window.onmessage = (ev: MessageEvent) => {
  if (ev.source !== window) return;
  if (ev.data?.type === "FROM_PAGE_SCRIPT_REQUEST_CHANGE") {
    ytworker.askQualitySize();
  }
};
