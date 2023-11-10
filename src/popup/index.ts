const [quality, size, speed] = document.querySelectorAll("select")!;
const style = document.querySelector<HTMLSelectElement>("#style")!;
const subtitles = document.querySelector<HTMLSelectElement>("#subtitles")!;
const level = document.querySelector<HTMLInputElement>("#level")!;
const play = document.querySelector<HTMLInputElement>("#play")!;

const updateSettings = async () => {
  browser.storage.sync.set({
    play: play.checked,
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speed.options[speed.selectedIndex].value),
    style: style.value,
    subtitles: subtitles.value,
    volume: document.querySelector<HTMLInputElement>(
      'input[type="radio"]:checked',
    )!.value,
    volumelevel: Number(level.value),
  });
};

document.getElementById("volume")!.onchange = updateSettings;
level.onchange = updateSettings;
level.onfocus = () =>
  document.querySelector<HTMLInputElement>(".vol_level")!.click();
play.onchange = updateSettings;
quality.onchange = updateSettings;
size.onchange = updateSettings;
speed.onchange = updateSettings;
style.onchange = updateSettings;
subtitles.onchange = updateSettings;

browser.storage.sync.get((data: settings) => {
  play.checked = data.play;
  quality.value = data.quality;
  size.value = data.size;
  speed.value = data.speed.toString();
  style.value = data.style;
  subtitles.value = data.subtitles;
  level.value = data.volumelevel.toString();
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`)!.checked =
    true;
});
