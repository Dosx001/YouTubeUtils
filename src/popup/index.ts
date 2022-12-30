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

const askQualitySize = () => {
  if (!ExtPop.sto) {
    browser.runtime.sendMessage({ action: "storage_ask_by_popup" });
    return;
  }
  ExtPop.getStorage().get(
    (keys: {
      annotationsoff: boolean;
      autoexpanddescription: boolean;
      autosubtitles: string;
      embeddedvideoautoplaybehavior: string;
      playlistvideoautoplaybehavior: string;
      quality: string;
      size: string;
      speed: string;
      suggestedautoplay: boolean;
      volume: string;
      volumelevel: string;
      youtubevideoautoplaybehavior: string;
    }) => {
      const [sel0, sel1, sel2] = document.querySelectorAll("select");
      sel0.onchange = () => requestVideoQualitySizeChange();
      sel1.onchange = () => requestVideoQualitySizeChange();
      sel2.onchange = () => requestVideoQualitySizeChange();
      for (let i = 0; i < sel0.length; i++) {
        if ((sel0[i] as HTMLOptionElement).value === keys.quality) {
          sel0.selectedIndex = i;
          break;
        }
      }
      for (let i = 0; i < sel1.length; i++) {
        if ((sel1[i] as HTMLOptionElement).value === keys.size) {
          sel1.selectedIndex = i;
          break;
        }
      }
      for (let i = 0; i < sel2.length; i++) {
        if ((sel2[i] as HTMLOptionElement).value === keys.speed) {
          sel2.selectedIndex = i;
          break;
        }
      }
      const anno = document.querySelector<HTMLInputElement>("#annotationsoff");
      anno.checked = annotationsoff;
      anno.addEventListener("change", requestVideoQualitySizeChange, true);
      document
        .getElementById("volume")
        .addEventListener("change", requestVideoQualitySizeChange, true);
      const volLvl = document.querySelector<HTMLInputElement>("#volumelevel");
      volLvl.value = keys.volumelevel;
      volLvl.onchange = () => requestVideoQualitySizeChange();
      volLvl.onfocus = () =>
        document.querySelector<HTMLInputElement>("#volumelevelinput").click();
      const sug =
        document.querySelector<HTMLInputElement>("#suggestedautoplay");
      sug.checked = keys.suggestedautoplay;
      sug.addEventListener("change", requestVideoQualitySizeChange, true);
      document.querySelector<HTMLInputElement>(
        "#autoexpanddescription"
      ).checked = keys.autoexpanddescription;
      document
        .getElementById("autosubtitles")
        .addEventListener("change", requestVideoQualitySizeChange, true);
      document
        .getElementById("autoexpanddescription")
        .addEventListener("change", requestVideoQualitySizeChange, true);
      document
        .querySelector("#youtubevideoautoplaybehavior")
        .addEventListener("change", requestVideoQualitySizeChange, true);
      document
        .querySelector("#playlistvideoautoplaybehavior")
        .addEventListener("change", requestVideoQualitySizeChange, true);
      document
        .querySelector("#embeddedvideoautoplaybehavior")
        .addEventListener("change", requestVideoQualitySizeChange, true);
      document.querySelector<HTMLInputElement>(
        '#volume input[type="radio"].vol_' + keys.volume + ""
      ).checked = true;
      document.querySelector<HTMLInputElement>(
        '#autosubtitles input[type="radio"].subt_' +
        (keys.autosubtitles ? keys.autosubtitles : "default") +
        ""
      ).checked = true;
      document.querySelector(
        '#youtubevideoautoplaybehavior [value="' +
        keys.youtubevideoautoplaybehavior +
        '"]'
      ).selected = true;
      document.querySelector(
        '#playlistvideoautoplaybehavior [value="' +
        playlistvideoautoplaybehavior +
        '"]'
      ).selected = true;
      document.querySelector(
        '#embeddedvideoautoplaybehavior [value="' +
        keys.embeddedvideoautoplaybehavior +
        '"]'
      ).selected = true;
    }
  );
};

browser.runtime.onMessage.addListener((req) => {
  if (req.action == "storage_answer_to_popup") {
    ExtPop.sto = req.sto;
    askQualitySize();
  }
});

ExtPop.sto = "local";

document.addEventListener("DOMContentLoaded", () => askQualitySize(), false);
