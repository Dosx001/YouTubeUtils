const updateSettings = async () => {
  const [sel0, sel1, sel2] = document.querySelectorAll("select");
  browser.storage.sync.set({
    autoexpanddescription: document.querySelector<HTMLInputElement>(
      "#autoexpanddescription"
    ).checked,
    autosubtitles: document.querySelector<HTMLInputElement>(
      '#autosubtitles input[type="radio"][name="autosubtitles"]:checked'
    ).value,
    embeddedvideoautoplaybehavior: document.querySelector<HTMLInputElement>(
      "#embeddedvideoautoplaybehavior"
    ).value,
    playlistvideoautoplaybehavior: document.querySelector<HTMLInputElement>(
      "#playlistvideoautoplaybehavior"
    ).value,
    quality: sel0.options[sel0.selectedIndex].value,
    size: sel1.options[sel1.selectedIndex].value,
    speed: sel2.options[sel2.selectedIndex].value,
    suggestedautoplay:
      document.querySelector<HTMLInputElement>("#suggestedautoplay").checked,
    volume: document.querySelector<HTMLInputElement>(
      '#volume input[type="radio"][name="volume"]:checked'
    ).value,
    volumelevel: document.querySelector<HTMLInputElement>("#volumelevel").value,
    youtubevideoautoplaybehavior: document.querySelector<HTMLInputElement>(
      "#youtubevideoautoplaybehavior"
    ).value,
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
  const [sel0, sel1, sel2] = document.querySelectorAll("select");
  sel0.value = data.quality;
  sel1.value = data.size;
  sel2.value = data.speed;
  sel0.onchange = updateSettings;
  sel1.onchange = updateSettings;
  sel2.onchange = updateSettings;
  document.getElementById("volume").onchange = updateSettings;
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`).checked =
    true;
  const volLvl = document.querySelector<HTMLInputElement>("#volumelevel");
  volLvl.value = data.volumelevel;
  volLvl.onchange = updateSettings;
  volLvl.onfocus = () =>
    document.querySelector<HTMLInputElement>("#volumelevelinput").click();
  const sug = document.querySelector<HTMLInputElement>("#suggestedautoplay");
  sug.checked = data.suggestedautoplay;
  sug.onchange = updateSettings;
  const expand = document.querySelector<HTMLInputElement>(
    "#autoexpanddescription"
  );
  expand.checked = data.autoexpanddescription;
  expand.addEventListener("change", updateSettings, true);
  document.querySelector<HTMLSelectElement>("#autosubtitles").onchange =
    updateSettings;
  document
    .querySelector<HTMLInputElement>(`.subt_${data.autosubtitles}`)
    .click();
  const autoplybehr = document.querySelector<HTMLSelectElement>(
    "#youtubevideoautoplaybehavior"
  );
  autoplybehr.onchange = updateSettings;
  autoplybehr.value = data.youtubevideoautoplaybehavior;
  const playlist = document.querySelector<HTMLSelectElement>(
    "#playlistvideoautoplaybehavior"
  );
  playlist.onchange = updateSettings;
  playlist.value = data.playlistvideoautoplaybehavior;
  const embedded = document.querySelector<HTMLSelectElement>(
    "#embeddedvideoautoplaybehavior"
  );
  embedded.onchange = updateSettings;
  embedded.value = data.embeddedvideoautoplaybehavior;
});
