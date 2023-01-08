interface settings {
  autoexpanddescription: boolean;
  autosubtitles: string;
  embeddedvideoautoplaybehavior: string;
  playlistvideoautoplaybehavior: string;
  quality: string;
  size: string;
  speed: number;
  suggestedautoplay: boolean;
  volume: string;
  volumelevel: number;
  youtubevideoautoplaybehavior: string;
}

const sendSettings = () => {
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
};

const s = document.createElement("script");
s.src = browser.runtime.getURL("scripts/ytutils.js");
s.id = "ytutils";
s.onload = () => {
  document.getElementById("ytutils")!.remove();
};
(document.head || document.documentElement).appendChild(s);

//change to mutation event
if (document.location.pathname.indexOf("/embed") !== 0) {
  sendSettings();
}

document.addEventListener("DOMContentLoaded", sendSettings, false);

browser.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "update_settings":
      sendSettings();
      break;
  }
});

window.onmessage = (ev: MessageEvent) => {
  if (ev.source !== window) return;
  if (ev.data?.type === "GET_SETTINGS") {
    sendSettings();
  }
};
