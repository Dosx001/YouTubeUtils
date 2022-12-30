const ExtPop = {
  sto: null,
  getStorage: () =>
    ExtPop.sto === "sync" ? browser.storage.sync : browser.storage.local,
};

const requestVideoQualitySizeChange = async (event) => {
  const [sel0, sel1, sel2] = document.querySelectorAll("select");
  var quality = sel0.options[sel0.selectedIndex].getAttribute("value");
  var size = sel1.options[sel1.selectedIndex].getAttribute("value");
  var speed = sel2.options[sel2.selectedIndex].getAttribute("value");
  var j = document.getElementById("annotationsoff");
  var a = j.checked;

  var v = document.getElementById("volume");
  var vl = document.getElementById("volumelevel");

  var volume = document.querySelector(
    '#volume input[type="radio"][name="volume"]:checked'
  ).value;
  var volumelevel = document.querySelector("#volumelevel").value;

  var youtubevideoautoplaybehavior = document.querySelector(
    "#youtubevideoautoplaybehavior"
  ).value;
  var playlistvideoautoplaybehavior = document.querySelector(
    "#playlistvideoautoplaybehavior"
  ).value;

  var suggestedautoplay = document.getElementById("suggestedautoplay").checked;

  var embeddedvideoautoplaybehavior = document.querySelector(
    "#embeddedvideoautoplaybehavior"
  ).value;

  var autoexpanddescription = document.getElementById(
    "autoexpanddescription"
  ).checked;

  var autosubtitles = document.querySelector(
    '#autosubtitles input[type="radio"][name="autosubtitles"]:checked'
  ).value;
  for (const tab of await browser.tabs.query({
    active: true,
    currentWindow: true,
  })) {
    browser.tabs.sendMessage(tab.id, {
      action: "video_qualitysize_change",
      quality: quality,
      size: size,
      speed: speed,
      volume: volume,
      volumelevel: volumelevel,
      suggestedautoplay: suggestedautoplay,
      autoexpanddescription: autoexpanddescription,
      autosubtitles: autosubtitles,
      isOptionHandle: true,
    });
  }
  browser.runtime.sendMessage({
    action: "qualitysize_save",
    quality: quality,
    size: size,
    speed: speed,
    annotationsoff: a,
    volume: volume,
    volumelevel: volumelevel,
    youtubevideoautoplaybehavior: youtubevideoautoplaybehavior,
    playlistvideoautoplaybehavior: playlistvideoautoplaybehavior,
    suggestedautoplay: suggestedautoplay,
    embeddedvideoautoplaybehavior: embeddedvideoautoplaybehavior,
    autoexpanddescription: autoexpanddescription,
    autosubtitles: autosubtitles,
  });
};

function adjustOptions(
  quality,
  size,
  speed,
  annotationsoff,
  volume,
  volumelevel,
  youtubevideoautoplaybehavior,
  playlistvideoautoplaybehavior,
  suggestedautoplay,
  embeddedvideoautoplaybehavior,
  autoexpanddescription,
  autosubtitles
) {
  var a;
  var b;
  var c;
  var si;
  var sib;
  var sic;

  a = document.getElementsByTagName("select")[0];

  for (var i = 0; i < a.length; i++) {
    if (a[i].getAttribute("value") == quality) {
      si = i;
      break;
    }
  }

  a.selectedIndex = si;

  document
    .getElementsByTagName("select")[0]
    .addEventListener("change", requestVideoQualitySizeChange, true);

  b = document.getElementsByTagName("select")[1];

  for (var i = 0; i < b.length; i++) {
    if (b[i].getAttribute("value") == size) {
      sib = i;
      break;
    }
  }

  b.selectedIndex = sib;

  document
    .getElementsByTagName("select")[1]
    .addEventListener("change", requestVideoQualitySizeChange, true);

  c = document.getElementsByTagName("select")[2];

  for (var i = 0; i < c.length; i++) {
    if (c[i].getAttribute("value") == speed) {
      sic = i;
      break;
    }
  }

  c.selectedIndex = sic;

  document
    .getElementsByTagName("select")[2]
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.getElementById("annotationsoff").checked = annotationsoff;
  document
    .getElementById("annotationsoff")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.querySelector(
    '#volume input[type="radio"].vol_' + volume + ""
  ).checked = true;
  document.querySelector("#volumelevel").value = volumelevel;
  document
    .getElementById("volume")
    .addEventListener("change", requestVideoQualitySizeChange, true);
  document.getElementById("volumelevel").addEventListener(
    "focus",
    function(event) {
      document.getElementById("volumelevelinput").checked = true;
    },
    true
  );
  document
    .getElementById("volumelevel")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.querySelector(
    '#youtubevideoautoplaybehavior [value="' +
    youtubevideoautoplaybehavior +
    '"]'
  ).selected = true;
  document
    .querySelector("#youtubevideoautoplaybehavior")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.querySelector(
    '#playlistvideoautoplaybehavior [value="' +
    playlistvideoautoplaybehavior +
    '"]'
  ).selected = true;
  document
    .querySelector("#playlistvideoautoplaybehavior")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.getElementById("suggestedautoplay").checked = suggestedautoplay;
  document
    .getElementById("suggestedautoplay")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.querySelector(
    '#embeddedvideoautoplaybehavior [value="' +
    embeddedvideoautoplaybehavior +
    '"]'
  ).selected = true;
  document
    .querySelector("#embeddedvideoautoplaybehavior")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.getElementById("autoexpanddescription").checked =
    autoexpanddescription;
  document
    .getElementById("autoexpanddescription")
    .addEventListener("change", requestVideoQualitySizeChange, true);

  document.querySelector(
    '#autosubtitles input[type="radio"].subt_' +
    (autosubtitles ? autosubtitles : "default") +
    ""
  ).checked = true;
  document
    .getElementById("autosubtitles")
    .addEventListener("change", requestVideoQualitySizeChange, true);
}

const askQualitySize = () => {
  if (!ExtPop.sto) {
    browser.runtime.sendMessage({ action: "storage_ask_by_popup" });
    return;
  }
  ExtPop.getStorage().get(null, (items) => {
    adjustOptions(
      items["video_quality"],
      items["video_size"],
      items["video_speed"],
      items["annotationsoff"],
      items["volume"],
      items["volumelevel"],
      items["youtubevideoautoplaybehavior"],
      items["playlistvideoautoplaybehavior"],
      items["suggestedautoplay"],
      items["embeddedvideoautoplaybehavior"],
      items["autoexpanddescription"],
      items["autosubtitles"]
    );
  });
};

browser.runtime.onMessage.addListener((req) => {
  if (req.action == "storage_answer_to_popup") {
    ExtPop.sto = req.sto;
    askQualitySize();
  }
});

ExtPop.sto = "local";

document.addEventListener("DOMContentLoaded", () => askQualitySize(), false);
