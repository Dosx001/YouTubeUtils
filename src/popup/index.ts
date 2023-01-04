const [sel0, sel1, sel2] = document.querySelectorAll("select");
const volLvl = document.querySelector<HTMLInputElement>("#volumelevel");
const autoexpand = document.querySelector<HTMLInputElement>(
  "#autoexpanddescription"
);
const embedded = document.querySelector<HTMLSelectElement>(
  "#embeddedvideoautoplaybehavior"
);
const playlist = document.querySelector<HTMLSelectElement>(
  "#playlistvideoautoplaybehavior"
);
const autoplay = document.querySelector<HTMLSelectElement>(
  "#youtubevideoautoplaybehavior"
);
const sugguest = document.querySelector<HTMLInputElement>("#suggestedautoplay");

const updateSettings = async () => {
  browser.storage.sync.set({
    autoexpanddescription: autoexpand.checked,
    autosubtitles: document.querySelector<HTMLInputElement>(
      '#autosubtitles input[type="radio"][name="autosubtitles"]:checked'
    ).value,
    embeddedvideoautoplaybehavior: embedded.value,
    playlistvideoautoplaybehavior: playlist.value,
    quality: sel0.options[sel0.selectedIndex].value,
    size: sel1.options[sel1.selectedIndex].value,
    speed: sel2.options[sel2.selectedIndex].value,
    suggestedautoplay: sugguest.checked,
    volume: document.querySelector<HTMLInputElement>(
      '#volume input[type="radio"][name="volume"]:checked'
    ).value,
    volumelevel: volLvl.value,
    youtubevideoautoplaybehavior: autoplay.value,
  });
  for (const tab of await browser.tabs.query({
    active: true,
    currentWindow: true,
  })) {
    browser.tabs.sendMessage(tab.id, {
      action: "update_settings",
    });
  }
};

browser.storage.sync.get((data: settings) => {
  sel0.value = data.quality;
  sel1.value = data.size;
  sel2.value = data.speed;
  sel0.onchange = updateSettings;
  sel1.onchange = updateSettings;
  sel2.onchange = updateSettings;
  document.getElementById("volume").onchange = updateSettings;
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`).checked =
    true;
  volLvl.value = data.volumelevel;
  volLvl.onchange = updateSettings;
  volLvl.onfocus = () =>
    document.querySelector<HTMLInputElement>("#volumelevelinput").click();
  sugguest.checked = data.suggestedautoplay;
  sugguest.onchange = updateSettings;
  autoexpand.checked = data.autoexpanddescription;
  autoexpand.addEventListener("change", updateSettings, true);
  document.querySelector<HTMLSelectElement>("#autosubtitles").onchange =
    updateSettings;
  document
    .querySelector<HTMLInputElement>(`.subt_${data.autosubtitles}`)
    .click();
  autoplay.onchange = updateSettings;
  autoplay.value = data.youtubevideoautoplaybehavior;
  playlist.onchange = updateSettings;
  playlist.value = data.playlistvideoautoplaybehavior;
  embedded.onchange = updateSettings;
  embedded.value = data.embeddedvideoautoplaybehavior;
});
