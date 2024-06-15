import "./styles.scss";

const [quality, size] = document.querySelectorAll("select")!;
const speed = document.querySelectorAll<HTMLInputElement>("#speed input")!;
const volume = document.querySelectorAll<HTMLInputElement>("#volume input")!;
const style = document.querySelector<HTMLSelectElement>("#style")!;
const subtitles = document.querySelector<HTMLSelectElement>("#subtitles")!;
const play = document.querySelector<HTMLInputElement>("#play")!;

const updateSettings = () => {
  browser.storage.sync.set({
    play: play.checked,
    quality: quality.options[quality.selectedIndex].value,
    size: size.options[size.selectedIndex].value,
    speed: Number(speed[0].value),
    style: style.value,
    subtitles: subtitles.value,
    volumelevel: Number(volume[0].value),
  });
};

play.onchange = updateSettings;
quality.onchange = updateSettings;
size.onchange = updateSettings;
style.onchange = updateSettings;
subtitles.onchange = updateSettings;

volume[0].onchange = () => {
  volume[1].value = volume[0].value;
  updateSettings();
};
volume[1].oninput = () => {
  volume[0].value = volume[1].value;
  updateSettings();
};

speed[0].onchange = () => {
  speed[1].value = speed[0].value;
  updateSettings();
};
speed[1].oninput = () => {
  speed[0].value = speed[1].value;
  updateSettings();
};

browser.storage.sync.get((data: settings) => {
  play.checked = data.play;
  quality.value = data.quality;
  size.value = data.size;
  speed[0].value = data.speed.toString();
  speed[1].value = data.speed.toString();
  volume[0].value = data.volumelevel.toString();
  volume[1].value = data.volumelevel.toString();
  style.value = data.style;
  subtitles.value = data.subtitles;
});
