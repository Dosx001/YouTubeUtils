const [quality, size, speed] = document.querySelectorAll("select")!;
const volLvl = document.querySelector<HTMLInputElement>("#volumelevel")!;
const autoplay = document.querySelector<HTMLSelectElement>("#autoplay")!;

const updateSettings = async () => {
  browser.storage.sync.set({
    subtitles: document.querySelector<HTMLInputElement>(
      '#subtitles input[type="radio"][name="subtitles"]:checked'
    )!.value,
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speed.options[speed.selectedIndex].value),
    volume: document.querySelector<HTMLInputElement>(
      '#volume input[type="radio"][name="volume"]:checked'
    )!.value,
    volumelevel: Number(volLvl.value),
    autoplay: autoplay.value,
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
autoplay.onchange = updateSettings;

browser.storage.sync.get((data: settings) => {
  quality.value = data.quality;
  size.value = data.size;
  speed.value = data.speed.toString();
  volLvl.value = data.volumelevel.toString();
  autoplay.value = data.autoplay;
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`)!.checked =
    true;
  document.querySelector<HTMLInputElement>(`.subt_${data.subtitles}`)!.checked =
    true;
});
