browser.storage.sync.get((data: settings) => {
  if (Object.keys(data).length === 0)
    browser.storage.sync.set({
      quality: "highres",
      size: "default",
      speed: 1,
      subtitles: "default",
      volume: "default",
      volumelevel: 100,
    });
});
