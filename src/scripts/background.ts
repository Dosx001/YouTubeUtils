browser.storage.sync.get((data: settings) => {
  if (Object.keys(data).length === 0)
    browser.storage.sync.set({
      autoplay: "default",
      quality: "highres",
      size: "expand",
      speed: 1,
      subtitles: "default",
      volume: "default",
      volumelevel: 100,
    });
});
