const ExtPop = {
  sto: null,
  getStorage: () =>
    ExtPop.sto === "sync" ? browser.storage.sync : browser.storage.local,
};

const requestVideoQualitySizeChange = async () => {
  const [sel0, sel1, sel2] = document.querySelectorAll("select");
  const quality = sel0.options[sel0.selectedIndex].value;
  const size = sel1.options[sel1.selectedIndex].value;
  const speed = sel2.options[sel2.selectedIndex].value;
  const volume = document.querySelector<HTMLInputElement>(
    '#volume input[type="radio"][name="volume"]:checked'
  ).value;
  const volumelevel =
    document.querySelector<HTMLInputElement>("#volumelevel").value;
  const suggestedautoplay =
    document.querySelector<HTMLInputElement>("#suggestedautoplay").checked;
  const autoexpanddescription = document.querySelector<HTMLInputElement>(
    "#autoexpanddescription"
  ).checked;
  const autosubtitles = document.querySelector<HTMLInputElement>(
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
    volume: volume,
    volumelevel: volumelevel,
    suggestedautoplay: suggestedautoplay,
    autoexpanddescription: autoexpanddescription,
    autosubtitles: autosubtitles,
    annotationsoff:
      document.querySelector<HTMLInputElement>("#annotationsoff").checked,
    youtubevideoautoplaybehavior: document.querySelector<HTMLInputElement>(
      "#youtubevideoautoplaybehavior"
    ).value,
    playlistvideoautoplaybehavior: document.querySelector<HTMLInputElement>(
      "#playlistvideoautoplaybehavior"
    ).value,
    embeddedvideoautoplaybehavior: document.querySelector<HTMLInputElement>(
      "#embeddedvideoautoplaybehavior"
    ).value,
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
  const [sel0, sel1, sel2] = document.querySelectorAll("select");
  sel0.onchange = () => requestVideoQualitySizeChange();
  sel1.onchange = () => requestVideoQualitySizeChange();
  sel2.onchange = () => requestVideoQualitySizeChange();
  for (let i = 0; i < sel0.length; i++) {
    if ((sel0[i] as HTMLOptionElement).value === quality) {
      sel0.selectedIndex = i;
      break;
    }
  }
  for (let i = 0; i < sel1.length; i++) {
    if ((sel1[i] as HTMLOptionElement).value === size) {
      sel1.selectedIndex = i;
      break;
    }
  }
  for (let i = 0; i < sel2.length; i++) {
    if ((sel2[i] as HTMLOptionElement).value === speed) {
      sel2.selectedIndex = i;
      break;
    }
  }
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
