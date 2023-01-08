const [quality, size, speed] = document.querySelectorAll("select")!;
const volLvl = document.querySelector<HTMLInputElement>("#volumelevel")!;
const autoexpand = document.querySelector<HTMLInputElement>(
  "#autoexpanddescription"
)!;
const embedded = document.querySelector<HTMLSelectElement>(
  "#embeddedvideoautoplaybehavior"
)!;
const playlist = document.querySelector<HTMLSelectElement>(
  "#playlistvideoautoplaybehavior"
)!;
const autoplay = document.querySelector<HTMLSelectElement>(
  "#youtubevideoautoplaybehavior"
)!;
const sugguest =
  document.querySelector<HTMLInputElement>("#suggestedautoplay")!;

const updateSettings = async () => {
  browser.storage.sync.set({
    autoexpanddescription: autoexpand.checked,
    subtitles: document.querySelector<HTMLInputElement>(
      '#subtitles input[type="radio"][name="subtitles"]:checked'
    )!.value,
    embeddedvideoautoplaybehavior: embedded.value,
    playlistvideoautoplaybehavior: playlist.value,
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speed.options[speed.selectedIndex].value),
    suggestedautoplay: sugguest.checked,
    volume: document.querySelector<HTMLInputElement>(
      '#volume input[type="radio"][name="volume"]:checked'
    )!.value,
    volumelevel: Number(volLvl.value),
    youtubevideoautoplaybehavior: autoplay.value,
  });
  for (const tab of await browser.tabs.query({
    active: true,
    currentWindow: true,
  })) {
    browser.tabs.sendMessage(tab.id!, {
      action: "update_settings",
    });
  }
};

document.getElementById("volume")!.onchange = updateSettings;
volLvl.onchange = updateSettings;
volLvl.onfocus = () =>
  document.querySelector<HTMLInputElement>("#volumelevelinput")!.click();
document.querySelector<HTMLSelectElement>("#subtitles")!.onchange =
  updateSettings;
quality.onchange = updateSettings;
size.onchange = updateSettings;
speed.onchange = updateSettings;
sugguest.onchange = updateSettings;
autoplay.onchange = updateSettings;
playlist.onchange = updateSettings;
embedded.onchange = updateSettings;
autoexpand.onchange = updateSettings;

browser.storage.sync.get((data: settings) => {
  quality.value = data.quality;
  size.value = data.size;
  speed.value = data.speed.toString();
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`)!.checked =
    true;
  volLvl.value = data.volumelevel.toString();
  sugguest.checked = data.suggestedautoplay;
  autoexpand.checked = data.autoexpanddescription;
  document.querySelector<HTMLInputElement>(`.subt_${data.subtitles}`)!.click();
  autoplay.value = data.youtubevideoautoplaybehavior;
  playlist.value = data.playlistvideoautoplaybehavior;
  embedded.value = data.embeddedvideoautoplaybehavior;
});
