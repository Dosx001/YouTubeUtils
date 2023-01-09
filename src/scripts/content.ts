interface settings {
  autoexpanddescription: boolean;
  autoplay: string;
  quality: string;
  size: string;
  speed: number;
  subtitles: string;
  volume: string;
  volumelevel: number;
}

const sendSettings = () => {
  browser.storage.sync.get((data: settings) => {
    window.postMessage(
      {
        type: "UPDATE_SETTINGS",
        autoexpanddescription: data.autoexpanddescription,
        autoplay: data.autoplay,
        quality: data.quality,
        size: data.size,
        speed: data.speed,
        subtitles: data.subtitles,
        volume: data.volume,
        volumelevel: data.volumelevel,
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
