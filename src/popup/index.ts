const [quality, size, speed] = document.querySelectorAll("select")!;
const volLvl = document.querySelector<HTMLInputElement>("#volumelevel")!;
const subtitles = document.querySelector<HTMLSelectElement>("#subtitles")!;

const updateSettings = async () => {
  browser.storage.sync.set({
    subtitles: subtitles.value,
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speed.options[speed.selectedIndex].value),
    volume: document.querySelector<HTMLInputElement>(
      '#volume input[type="radio"][name="volume"]:checked'
    )!.value,
    volumelevel: Number(volLvl.value),
  });
  for (const tab of await browser.tabs.query({})) {
    if (tab.url?.search("youtube.com/watch") !== -1)
      browser.tabs.sendMessage(tab.id!, {
        action: "update_settings",
      });
  }
};

document.getElementById("volume")!.onchange = updateSettings;
volLvl.onchange = updateSettings;
volLvl.onfocus = () =>
  document.querySelector<HTMLInputElement>("#volumelevelinput")!.click();
subtitles.onchange = updateSettings;
quality.onchange = updateSettings;
size.onchange = updateSettings;
speed.onchange = updateSettings;

browser.storage.sync.get((data: settings) => {
  quality.value = data.quality;
  size.value = data.size;
  speed.value = data.speed.toString();
  volLvl.value = data.volumelevel.toString();
  subtitles.value = data.subtitles;
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`)!.checked =
    true;
});
