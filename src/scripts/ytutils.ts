interface player extends HTMLElement {
  setLoopVideo(state: boolean): void;
  getLoopVideo(): boolean;
  getAvailableQualityLevels: () => string[];
  getOption(module: string, option: string): { languageCode: string };
  loadModule(module: string): void;
  setOption(module: string, option: string, track: object): void;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (level: number) => void;
  unMute: () => void;
  unloadModule(module: string): void;
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
  embed: location.pathname.search("embed") !== -1,
  mobile: /Android|iPhone|iPad/i.test(navigator.userAgent),
  setPlayer: () => {
    if (location.pathname !== "/watch" && !ytutils.embed) return;
    const id = setInterval(() => {
      ytutils.player = document.querySelector<player>("#movie_player")!;
      if (ytutils.player) {
        clearInterval(id);
        if (ytutils.embed) {
          const fn = () => {
            ytutils.updatePlayer();
            ytutils.loopBtn();
            ytutils.player.removeEventListener("onStateChange", fn);
          };
          ytutils.player.addEventListener("onStateChange", fn);
        } else {
          ytutils.updatePlayer();
        }
      }
    }, 25);
    ytutils.loopBtn();
  },
  loopBtn: () => {
    const zombie = document.querySelector("#ytutils-loop");
    if (zombie) zombie.remove();
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
    const svg = document.createElementNS(uri, "svg");
    svg.setAttribute("viewbox", "0 0 24 24");
    svg.style.fill = "transparent";
    svg.style.stroke = "#e6e6e6";
    svg.style.strokeWidth = "2px";
    svg.style.strokeLinecap = "round";
    svg.append(check);
    svg.append(loop);
    btn.append(svg);
    if (ytutils.mobile) {
      svg.setAttribute("width", "24px");
      svg.setAttribute("height", "24px");
      svg.style.position = "relative";
      svg.style.left = "10px";
      btn.style.position = "absolute";
      btn.style.display = "none";
      btn.style.left = "5px";
      btn.style.top = "5px";
      btn.style.height = "40px";
      btn.style.width = "45px";
      btn.onclick = () => {
        const boo = !ytutils.player.getLoopVideo();
        ytutils.player.setLoopVideo(boo);
        check.style.display = boo ? "" : "none";
      };
      const obver = new MutationObserver((ev) => {
        btn.style.display = (ev[0].target as HTMLElement).classList.contains(
          "fadein"
        )
          ? ""
          : "none";
      });
      const fn = () => {
        document.querySelector("#player-container-id")!.append(btn);
        obver.observe(document.querySelector("#player-control-overlay")!, {
          attributes: true,
          attributeFilter: ["class"],
          childList: false,
          characterData: false,
        });
        ytutils.player.removeEventListener("onStateChange", fn);
      };
      const id = setInterval(() => {
        if (ytutils.player) {
          ytutils.player.addEventListener("onStateChange", fn);
          clearInterval(id);
        }
      }, 100);
    } else {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.position = "relative";
      const size = `${ytutils.embed ? 0.5 : 1}rem`;
      svg.style.top = size;
      svg.style.left = size;
      btn.onclick = () => {
        ytutils.player.dispatchEvent(new CustomEvent("contextmenu"));
        document
          .querySelector<HTMLElement>(
            ".ytp-contextmenu [role='menuitemcheckbox']"
          )!
          .click();
        check.style.display = check.style.display === "" ? "none" : "";
      };
      document
        .querySelector(".ytp-right-controls")!
        .insertBefore(btn, document.querySelector(".ytp-subtitles-button"));
    }
  },
  updatePlayer: () => {
    ytutils.setQuality();
    ytutils.setSize();
    ytutils.player.setPlaybackRate(ytutils.speed);
    const volume = ytutils.getVolume();
    if (volume !== "default") {
      ytutils.player.unMute();
      ytutils.player.setVolume(volume);
    }
    ytutils.setSubtitles();
    ytutils.setStyle();
  },
  setStyle: () => {
    if (ytutils.style === "default") return;
    ytutils.player.updateSubtitlesUserSettings({
      background: "#080808",
      backgroundOpacity: ytutils.style !== "tv" ? 0 : 0.75,
      charEdgeStyle: ytutils.style !== "tv" ? 3 : 0,
      color: ytutils.style !== "old" ? "#fff" : "#ff0",
      fontFamily: 4,
      fontSizeIncrement: 0,
      fontStyle: 0,
      textOpacity: 1,
      windowColor: "#080808",
      windowOpacity: 0,
    });
  },
  setSubtitles: () => {
    if (ytutils.subtitles === "default") return;
    if (ytutils.subtitles === "on") {
      const track = ytutils.player.getOption("captions", "track");
      if (track) {
        ytutils.player.loadModule("captions");
        ytutils.player.setOption("captions", "track", {
          languageCode: track.languageCode,
        });
      }
    } else ytutils.player.unloadModule("captions");
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
    if (ytutils.size === "default" || ytutils.embed || ytutils.mobile) return;
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
                !document.querySelector("#show-hide-button button")
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
  ytutils.player ? ytutils.updatePlayer() : ytutils.setPlayer();
  document.querySelector<HTMLElement>("#ytutils-loop path")!.style.display =
    "none";
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
