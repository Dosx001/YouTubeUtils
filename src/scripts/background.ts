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
  gotPlatformInfo: function(info) {
    Ext.os = info.os;
    var v = 61;
    try {
      v = /Chrome\/([0-9.]+)/.exec(window.navigator.userAgent)[1];
    } catch (e) { }
    if (browser.runtime.getBrowserInfo)
      browser.runtime.getBrowserInfo(Ext.gotBrowserInfo);
    else Ext.faq(v);
  },
  gotBrowserInfo: function(info) {
    Ext.version = info.version;
    Ext.faq(Ext.version);
  },
  faq: function(version) {
    var v = parseInt(version.split(".")[0]);
    if (
      v < 55 ||
      (v == 55 && browser.i18n.getUILanguage() == "en_US") ||
      v > 55
    ) {
      Ext.oRTCT({ url: "http://barisderin.com/?p=1115" });
    }
  },
  checkStorage: {
    checkHTMLLocalStorage: function() {
      if (typeof localStorage !== "undefined") {
        Ext.sto = "localStorage";
        Ext.init();
      } else {
        //??????????????
      }
    },
    checkLocal: function(items) {
      if (browser.runtime.lastError) {
        Ext.checkStorage.checkHTMLLocalStorage();
      } else {
        Ext.sto = "local";
        Ext.init();
        //remove test variable
      }
    },
    checkSync: function(items) {
      if (browser.runtime.lastError) {
        browser.storage.local.get(null, Ext.checkStorage.checkLocal);
      } else {
        Ext.sto = "sync";
        Ext.init();
        //remove test variable
      }
    },
    init: function() {
      browser.storage.sync.get(null, Ext.checkStorage.checkSync);
    },
  },
  getStorage: function() {
    return Ext.sto == "sync" ? browser.storage.sync : browser.storage.local;
  },
  init: function() {
    Ext.getStorage().get(settings, function(items) {
      var ver = browser.runtime.getManifest().version;
      if (!items.installed) {
        items.installed = true;
        items.version = ver;
        items.transition = true;
        Ext.getStorage().set(items, function() {
          browser.runtime.getPlatformInfo(Ext.gotPlatformInfo);
        });
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
  oRTCT: function(passedObject) {
    browser.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function(tabs) {
        if (tabs.length != 0) {
          var index = tabs[0].index;
          //var windowId=tabs[0].windowId;
          browser.tabs.create(
            {
              //windowId:windowId,
              url: passedObject["url"],
              index: index + 1,
            },
            function(tab) { }
          );
        } else {
          //last focused
          browser.tabs.create(
            {
              url: passedObject["url"],
            },
            function(tab) { }
          );
        }
      }
    );
  },
  bs: function(v) {
    if (v.split(".").length == 2) return v;
    return v.substring(0, v.lastIndexOf("."));
    //return ((v.split(".").length==2) ? v : v.substring(0,v.lastIndexOf(".")));
  },
};

function onRequest(request, sender, callback) {
  if (request.action == "video_quality_change") {
    changeVideoQuality(request.quality);
  } else if (request.action == "qualitysize_ask") {
    Ext.getStorage().get(null, function(items) {
      browser.tabs.sendMessage(
        sender.tab.id,
        {
          action: "video_qualitysize_change",
          quality: items.video_quality,
          size: items.video_size,
        },
        function(response) {
          //foo
        }
      );
    });
  } else if (request.action == "storage_ask") {
    Ext.getStorage().get(null, function(items) {
      browser.tabs.sendMessage(
        sender.tab.id,
        { action: "storage_answer", sto: Ext.sto },
        function(response) {
          //foo
        }
      );
    });
  } else if (request.action == "storage_ask_by_popup") {
    Ext.getStorage().get(null, function(items) {
      browser.runtime.sendMessage(
        { action: "storage_answer_to_popup", sto: Ext.sto },
        function(response) {
          //foo
        }
      );
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
}
browser.runtime.onMessage.addListener(onRequest);
const response = function(details) {
  if (annotationsoff)
    return {
      cancel:
        details.url.indexOf("/annotations_invideo") != -1 &&
        details.url.indexOf("instream_ad") == -1,
    };
  else return { cancel: false };
};
browser.webRequest.onBeforeRequest.addListener(
  response,
  { urls: ["*://www.youtube.com/*"] },
  ["blocking"]
);
//Ext.checkStorage.init();
Ext.sto = "local";
Ext.init();
