interface settings {
  play: boolean;
  quality: string;
  size: string;
  speed: number;
  style: string;
  subtitles: string;
  volumelevel: number;
}

const sendSettings = () => {
  browser.storage.sync.get((data: settings) => {
    window.postMessage({ type: "UPDATE_SETTINGS", sets: data }, "*");
  });
};

const s = document.createElement("script");
s.src = browser.runtime.getURL("scripts/ytutils.js");
s.id = "ytutils";
s.onload = () => {
  document.getElementById("ytutils")!.remove();
};
(document.head || document.documentElement).appendChild(s);

document.addEventListener("DOMContentLoaded", sendSettings);
browser.storage.onChanged.addListener(sendSettings);
