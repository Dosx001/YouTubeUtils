const settings = {
  annotationsoff: false,
  autoexpanddescription: true,
  autosubtitles: "default",
  embeddedvideoautoplaybehavior: "default",
  playlistvideoautoplaybehavior: "default",
  quality: "highres",
  size: "expand",
  speed: "1",
  suggestedautoplay: true,
  volume: "default",
  volumelevel: 100,
  youtubevideoautoplaybehavior: "default",
};

browser.storage.sync.get((data: typeof settings) => {
  if (Object.keys(data).length === 0) browser.storage.sync.set(settings);
});

browser.runtime.onMessage.addListener((request, sender) => {
  switch (request.action) {
    case "qualitysize_ask":
      browser.storage.sync.get((items: typeof settings) => {
        browser.tabs.sendMessage(sender.tab.id, {
          action: "video_qualitysize_change",
          quality: items.quality,
          size: items.size,
        });
      });
      break;
    case "qualitysize_save":
      browser.storage.sync.set({
        annotationsoff: request.annotationsoff,
        autoexpanddescription: request.autoexpanddescription,
        autosubtitles: request.autosubtitles,
        embeddedvideoautoplaybehavior: request.embeddedvideoautoplaybehavior,
        playlistvideoautoplaybehavior: request.playlistvideoautoplaybehavior,
        quality: request.quality,
        size: request.size,
        speed: request.speed,
        suggestedautoplay: request.suggestedautoplay,
        volume: request.volume,
        volumelevel: request.volumelevel,
        youtubevideoautoplaybehavior: request.youtubevideoautoplaybehavior,
      });
      break;
    case "storage_ask":
      browser.storage.sync.get(() => {
        browser.tabs.sendMessage(sender.tab.id, {
          action: "storage_answer",
        });
      });
      break;
    case "storage_ask_by_popup":
      browser.storage.sync.get(() => {
        browser.runtime.sendMessage({
          action: "storage_answer_to_popup",
        });
      });
      break;
  }
});

browser.webRequest.onBeforeRequest.addListener(
  (details) =>
    settings.annotationsoff
      ? {
        cancel:
          details.url.indexOf("/annotations_invideo") !== -1 &&
          details.url.indexOf("instream_ad") === -1,
      }
      : { cancel: false },
  { urls: ["*://www.youtube.com/*"] },
  ["blocking"]
);
