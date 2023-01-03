interface data {
  annotationsoff: boolean;
  autoexpanddescription: boolean;
  autosubtitles: string;
  embeddedvideoautoplaybehavior: string;
  installed: boolean;
  playlistvideoautoplaybehavior: string;
  quality: string;
  size: string;
  speed: string;
  suggestedautoplay: boolean;
  transition: boolean;
  version: string;
  volume: string;
  volumelevel: string;
  youtubevideoautoplaybehavior: string;
  isOptionHandle?: boolean;
}

const ytworker = {
  quality: null,
  size: null,
  change: (data: data) => {
    window.postMessage(
      { type: "FROM_CONTENT_SCRIPT_SET_VQ", text: data.quality },
      "*"
    );
    window.postMessage(
      { type: "FROM_CONTENT_SCRIPT_SET_VS", text: data.size },
      "*"
    );
    window.postMessage(
      {
        type: "FROM_CONTENT_SCRIPT_REQUEST_CHANGE",
        id: browser.extension.getURL(""),
        speed: data.speed,
        volume: data.volume,
        volumelevel: data.volumelevel,
        youtubevideoautoplaybehavior: data.youtubevideoautoplaybehavior,
        playlistvideoautoplaybehavior: data.playlistvideoautoplaybehavior,
        suggestedautoplay: data.suggestedautoplay,
        autoexpanddescription: data.autoexpanddescription,
        autosubtitles: data.autosubtitles,
        isOptionHandle: data.isOptionHandle,
      },
      "*"
    );
  },
  askQualitySize: () => {
    browser.storage.sync.get((data: data) => {
      ytworker.change(data);
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
    case "video_qualitysize_change":
      ytworker.change(request);
      break;
    case "storage_answer":
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
