browser.storage.sync.get((data: settings) => {
  if (Object.keys(data).length === 0)
    browser.storage.sync.set({
      play: false,
      quality: "highres",
      size: "default",
      speed: 1,
      style: "default",
      subtitles: "default",
      volume: "default",
      volumelevel: 100,
    });
});
