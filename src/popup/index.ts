const [quality, size] = document.querySelectorAll("select")!;
const speedNum = document.querySelector<HTMLInputElement>("#speed_num")!;
const speedRange = document.querySelector<HTMLInputElement>("#speed_range")!;
const style = document.querySelector<HTMLSelectElement>("#style")!;
const subtitles = document.querySelector<HTMLSelectElement>("#subtitles")!;
const level = document.querySelector<HTMLInputElement>("#level")!;
const play = document.querySelector<HTMLInputElement>("#play")!;

const updateSettings = () => {
  browser.storage.sync.set({
    play: play.checked,
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speedNum.value),
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
style.onchange = updateSettings;
subtitles.onchange = updateSettings;

speedNum.onchange = () => {
  speedRange.value = speedNum.value;
  updateSettings();
};
speedRange.oninput = () => {
  speedNum.value = speedRange.value;
  updateSettings();
};

browser.storage.sync.get((data: settings) => {
  play.checked = data.play;
  quality.value = data.quality;
  size.value = data.size;
  speedNum.value = data.speed.toString();
  speedRange.value = data.speed.toString();
  style.value = data.style;
  subtitles.value = data.subtitles;
  level.value = data.volumelevel.toString();
  document.querySelector<HTMLInputElement>(`.vol_${data.volume}`)!.checked =
    true;
});
