interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getCurrentTime: () => number;
  getLoopVideo: () => boolean;
  getPlaybackQuality: () => string;
  getPlayerState: () => number;
  resetSubtitlesUserSettings: () => void;
  setAutonav: (state: boolean) => void;
  setLoopVideo: (state: boolean) => void;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (level: number) => void;
  toggleSubtitles: () => void;
  toggleSubtitlesOn: () => void;
  unMute: () => void;
  updateSubtitlesUserSettings: (styles: object) => void;
}

interface flexy extends HTMLElement {
  theaterModeChanged_: (state: boolean) => void;
}

const ytutils = {
  quality: "highres",
  size: "expand",
  speed: 1,
  subtitles: "default",
  style: "default",
  volume: "default",
  volumelevel: 100,
  player: document.querySelector<player>("#movie_player")!,
  setPlayer: () => {
    const id = setInterval(() => {
      const player = document.querySelector<player>("#movie_player");
      if (player) {
        ytutils.player = player;
        ytutils.updatePlayer();
        ytutils.player.addEventListener("onStateChange", (state: number) => {
          if (state === -1) ytutils.updatePlayer();
        });
        clearInterval(id);
      }
    }, 25);
    if (document.location.pathname !== "/watch") clearInterval(id);
    const btn = document.createElement("button");
    btn.id = "ytutils-loop";
    btn.className = "ytp-button";
    const uri = "http://www.w3.org/2000/svg";
    const loop = document.createElementNS(uri, "path");
    const check = document.createElementNS(uri, "path");
    loop.setAttribute(
      "d",
      "M1 3l1 5l5 -1M2 8A10 10 0 0 1 12 1A11 11 0 0 1 23 12M23 21l-1 -5l-5 1M22 16A10 10 0 0 1 12 23A11 11 0 0 1 1 12"
    );
    check.setAttribute("d", "M8 12l3 3l6 -6");
    check.style.display = "none";
    btn.onclick = () => {
      const boo = !ytutils.player.getLoopVideo();
      ytutils.player.setLoopVideo(boo);
      check.style.display = boo ? "" : "none";
    };
    const svg = document.createElementNS(uri, "svg");
    svg.setAttribute("viewbox", "0 0 24 24");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.fill = "transparent";
    svg.style.stroke = "#e6e6e6";
    svg.style.strokeWidth = "2px";
    svg.style.strokeLinecap = "round";
    svg.style.position = "relative";
    svg.style.top = "1rem";
    svg.style.left = "1rem";
    svg.append(check);
    svg.append(loop);
    btn.append(svg);
    document
      .querySelector(".ytp-right-controls")
      ?.insertBefore(btn, document.querySelector(".ytp-subtitles-button"));
  },
  updatePlayer: () => {
    ytutils.setQuality();
    ytutils.setSize();
    ytutils.setStyle();
    ytutils.setSubtitles();
    ytutils.player.setPlaybackRate(ytutils.speed);
    const volume = ytutils.getVolume();
    if (volume !== "default") {
      ytutils.player.unMute();
      ytutils.player.setVolume(volume);
    }
  },
  setStyle: () => {
    if (ytutils.style === "default") return;
    ytutils.player.resetSubtitlesUserSettings();
    if (ytutils.style === "tv") return;
    const styles = {
      backgroundOpacity: 0,
      charEdgeStyle: 3,
      color: "#fff",
    };
    if (ytutils.style === "old") styles.color = "#ff0";
    ytutils.player.updateSubtitlesUserSettings(styles);
  },
  setSubtitles: () => {
    if (ytutils.subtitles === "default") return;
    ytutils.player.toggleSubtitlesOn();
    if (ytutils.subtitles === "off") ytutils.player.toggleSubtitles();
  },
  getVolume: () => {
    switch (ytutils.volume) {
      case "default":
        return "default";
      case "mute":
        return 0;
      case "100":
        return 100;
      default:
        return ytutils.volumelevel;
    }
  },
  setQuality: () => {
    if (ytutils.quality !== "default") {
      const qualities = ytutils.player.getAvailableQualityLevels();
      const quality =
        ytutils.quality === "highres" ||
          qualities.indexOf(ytutils.quality) === -1
          ? qualities[0]
          : ytutils.quality;
      ytutils.player.setPlaybackQualityRange(quality, quality);
    }
  },
  setSize: () => {
    if (
      ytutils.size === "default" ||
      document.location.pathname.search(/^\/watch/) !== 0
    )
      return;
    const id = setInterval(() => {
      const flexy = document.querySelector<flexy>("ytd-watch-flexy");
      if (flexy) {
        clearInterval(id);
        switch (ytutils.size) {
          case "expand":
            flexy.theaterModeChanged_(true);
            break;
          case "shrink":
            flexy.theaterModeChanged_(false);
            break;
          case "chat": {
            let conut = 0;
            const id = setInterval(() => {
              flexy.theaterModeChanged_(
                !document
                  .querySelector("#show-hide-button")
                  ?.querySelector("button")
              );
              if (conut++ === 40) {
                clearInterval(id);
              }
            }, 50);
            break;
          }
        }
      }
    }, 100);
  },
};

window.addEventListener("message", (ev) => {
  if (ev.source === window && ev.data.type === "UPDATE_SETTINGS") {
    ytutils.quality = ev.data.sets.quality;
    ytutils.size = ev.data.sets.size;
    ytutils.speed = ev.data.sets.speed;
    ytutils.style = ev.data.sets.style;
    ytutils.subtitles = ev.data.sets.subtitles;
    ytutils.volume = ev.data.sets.volume;
    ytutils.volumelevel = ev.data.sets.volumelevel;
    ytutils.updatePlayer();
  }
});

window.addEventListener("load", ytutils.setPlayer);

window.addEventListener("yt-navigate-finish", () => {
  if (!ytutils.player) ytutils.setPlayer();
  ytutils.updatePlayer();
  document
    .querySelector("#ytutils-loop")!
    .querySelector("path")!.style.display = "none";
});

window.addEventListener("keydown", (ev) => {
  switch (ev.key) {
    case "e": {
      const collapse = document.querySelector<HTMLElement>("#collapse")!;
      (collapse.hidden
        ? document.querySelector<HTMLElement>("#expand")
        : collapse)!.click();
      break;
    }
    case "p":
      document
        .querySelector<HTMLElement>(".ytp-autonav-toggle-button")
        ?.click();
      break;
    case "r":
      document.querySelector<HTMLElement>("#ytutils-loop")!.click();
      break;
  }
});
