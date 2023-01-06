const settings = {
  autoexpanddescription: true,
  autosubtitles: "default",
  embeddedvideoautoplaybehavior: "default",
  playlistvideoautoplaybehavior: "default",
  quality: "highres",
  size: "expand",
  speed: 1,
  suggestedautoplay: true,
  volume: "default",
  volumelevel: 100,
  youtubevideoautoplaybehavior: "default",
};

browser.storage.sync.get((data: typeof settings) => {
  if (Object.keys(data).length === 0) browser.storage.sync.set(settings);
});
