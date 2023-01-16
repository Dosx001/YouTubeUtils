const [quality, size, speed] = document.querySelectorAll("select")!;
const style = document.querySelector<HTMLSelectElement>("#style")!;
const subtitles = document.querySelector<HTMLSelectElement>("#subtitles")!;
const volLvl = document.querySelector<HTMLInputElement>("#volumelevel")!;

const updateSettings = async () => {
  browser.storage.sync.set({
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speed.options[speed.selectedIndex].value),
    style: style.value,
    subtitles: subtitles.value,
    volume: document.querySelector<HTMLInputElement>(
      '#volume input[type="radio"][name="volume"]:checked'
    )!.value,
    volumelevel: Number(volLvl.value),
  });
};

document.getElementById("volume")!.onchange = updateSettings;
volLvl.onchange = updateSettings;
volLvl.onfocus = () =>
  document.querySelector<HTMLInputElement>("#volumelevelinput")!.click();
quality.onchange = updateSettings;
size.onchange = updateSettings;
speed.onchange = updateSettings;
style.onchange = updateSettings;
subtitles.onchange = updateSettings;

browser.storage.sync.get((data: settings) => {
  quality.value = data.quality;
  size.value = data.size;
  speed.value = data.speed.toString();
  style.value = data.style;
  subtitles.value = data.subtitles;
  volLvl.value = data.volumelevel.toString();
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`)!.checked =
    true;
});
