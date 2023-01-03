let annotationsoff = false;

const settings = {
  annotationsoff: false,
  autoexpanddescription: true,
  autosubtitles: "default",
  embeddedvideoautoplaybehavior: "default",
  installed: false,
  playlistvideoautoplaybehavior: "default",
  quality: "highres",
  size: "expand",
  speed: "1",
  suggestedautoplay: true,
  transition: false,
  version: "",
  volume: "default",
  volumelevel: 100,
  youtubevideoautoplaybehavior: "default",
};

const Ext = {
  os: null,
  version: null,
  win: "CTRL+SHIFT+Y",
  mac: "CMD+SHIFT+Y",
  sto: "local",
  checkStorage: {
    checkHTMLLocalStorage: function() {
      if (typeof localStorage !== "undefined") {
        Ext.sto = "localStorage";
        Ext.init();
      } else {
        //??????????????
      }
    },
    checkLocal: () => {
      if (browser.runtime.lastError) {
        Ext.checkStorage.checkHTMLLocalStorage();
      } else {
        Ext.sto = "local";
        Ext.init();
        //remove test variable
      }
    },
    checkSync: () => {
      if (browser.runtime.lastError) {
        browser.storage.local.get(null, Ext.checkStorage.checkLocal);
      } else {
        Ext.sto = "sync";
        Ext.init();
        //remove test variable
      }
    },
    init: () => {
      browser.storage.sync.get(null, Ext.checkStorage.checkSync);
    },
  },
  getStorage: () =>
    Ext.sto === "sync" ? browser.storage.sync : browser.storage.local,
  init: () => {
    Ext.getStorage().get(async (items: typeof settings) => {
      const ver = browser.runtime.getManifest().version;
      if (!items.installed) {
        items.installed = true;
        items.version = ver;
        items.transition = true;
        Ext.getStorage().set(settings);
      } else {
        if (ver != items.version) {
          items.version = ver;
          if (browser.runtime.getBrowserInfo) {
            items.transition = true;
            const info = await browser.runtime.getBrowserInfo();
            Ext.version = info.version;
          }
        }
      }
      annotationsoff = items.annotationsoff;
    });
  },
};

browser.runtime.onMessage.addListener((request, sender) => {
  switch (request.action) {
    case "qualitysize_ask":
      Ext.getStorage().get((items: typeof settings) => {
        browser.tabs.sendMessage(sender.tab.id, {
          action: "video_qualitysize_change",
          quality: items.quality,
          size: items.size,
        });
      });
      break;
    case "qualitysize_save":
      Ext.getStorage().set({
        video_quality: request.quality,
        video_size: request.size,
        video_speed: request.speed,
        annotationsoff: request.annotationsoff,
        volume: request.volume,
        volumelevel: request.volumelevel,
        youtubevideoautoplaybehavior: request.youtubevideoautoplaybehavior,
        playlistvideoautoplaybehavior: request.playlistvideoautoplaybehavior,
        suggestedautoplay: request.suggestedautoplay,
        embeddedvideoautoplaybehavior: request.embeddedvideoautoplaybehavior,
        autoexpanddescription: request.autoexpanddescription,
        autosubtitles: request.autosubtitles,
      });
      break;
    case "storage_ask":
      Ext.getStorage().get(() => {
        browser.tabs.sendMessage(sender.tab.id, {
          action: "storage_answer",
          sto: Ext.sto,
        });
      });
      break;
    case "storage_ask_by_popup":
      Ext.getStorage().get(() => {
        browser.runtime.sendMessage({
          action: "storage_answer_to_popup",
          sto: Ext.sto,
        });
      });
      break;
  }
});

browser.webRequest.onBeforeRequest.addListener(
  (details) =>
    annotationsoff
      ? {
        cancel:
          details.url.indexOf("/annotations_invideo") !== -1 &&
          details.url.indexOf("instream_ad") === -1,
      }
      : { cancel: false },
  { urls: ["*://www.youtube.com/*"] },
  ["blocking"]
);

Ext.init();
