const annotationsoff = false;

const settings = {
  installed: false,
  version: "",
  video_quality: "highres",
  video_size: "expand",
  video_speed: "1",
  annotationsoff: false,
  volume: "default",
  volumelevel: 100,
  youtubevideoautoplaybehavior: "default",
  playlistvideoautoplaybehavior: "default",
  suggestedautoplay: true,
  embeddedvideoautoplaybehavior: "default",
  autoexpanddescription: true,
  autosubtitles: "default",
  transition: false,
};

const Ext = {
  os: null,
  version: null,
  win: "CTRL+SHIFT+Y",
  mac: "CMD+SHIFT+Y",
  sto: "sync",
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
    Ext.getStorage().get(settings, function(items) {
      var ver = browser.runtime.getManifest().version;
      if (!items.installed) {
        items.installed = true;
        items.version = ver;
        items.transition = true;
      } else {
        if (ver != items.version) {
          items.version = ver;
          if (browser.runtime.getBrowserInfo) {
            items.transition = true;
            browser.runtime.getBrowserInfo(function(info) {
              Ext.version = info.version;
              var v = parseInt(Ext.version.split(".")[0]);
              //if(v==55 && browser.i18n.getUILanguage()=="en_US"){
              //Ext.oRTCT({'url': "http://barisderin.com/?p=1115"});
              //}
            });
          }
          Ext.getStorage().set(items, function() {
            //foo
          });
        }
      }
      annotationsoff = items.annotationsoff;
    });
  },
};

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.action == "video_quality_change") {
    changeVideoQuality(request.quality);
  } else if (request.action == "qualitysize_ask") {
    Ext.getStorage().get((items) => {
      browser.tabs.sendMessage(sender.tab.id, {
        action: "video_qualitysize_change",
        quality: items.video_quality,
        size: items.video_size,
      });
    });
  } else if (request.action == "storage_ask") {
    Ext.getStorage().get(() => {
      browser.tabs.sendMessage(sender.tab.id, {
        action: "storage_answer",
        sto: Ext.sto,
      });
    });
  } else if (request.action == "storage_ask_by_popup") {
    Ext.getStorage().get(() => {
      browser.runtime.sendMessage({
        action: "storage_answer_to_popup",
        sto: Ext.sto,
      });
    });
  } else if (request.action == "qualitysize_save") {
    Ext.getStorage().set(
      {
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
      },
      function() {
        annotationsoff = request.annotationsoff;
      }
    );
  }
});

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (annotationsoff)
      return {
        cancel:
          details.url.indexOf("/annotations_invideo") != -1 &&
          details.url.indexOf("instream_ad") == -1,
      };
    else return { cancel: false };
  },
  { urls: ["*://www.youtube.com/*"] },
  ["blocking"]
);

Ext.sto = "local";
Ext.init();
