interface player extends HTMLElement {
  getAvailableQualityLevels: () => string[];
  getLoopVideo(): boolean;
  getOption(module: string, option: string): object;
  isAtLiveHead(): () => boolean;
  pauseVideo(): void;
  setLoopVideo(state: boolean): void;
  setPlaybackQualityRange: (min: string, max: string) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (level: number) => void;
  toggleSubtitles(): void;
  toggleSubtitlesOn(): void;
  unMute: () => void;
  unloadModule(module: string): void;
  updateSubtitlesUserSettings: (styles: object) => void;
}

interface flexy extends HTMLElement {
  theater: boolean;
}

const ytutils = {
  play: false,
  quality: "highres",
  size: "expand",
  speed: 1,
  style: "default",
  subtitles: "default",
  volumelevel: 100,
  player: document.querySelector<player>("#movie_player")!,
  embed: location.pathname.includes("embed"),
  mobile: /Android|iPhone|iPad/.test(navigator.userAgent),
  setPlayer: () => {
    const id = setInterval(() => {
      ytutils.player = document.querySelector<player>("#movie_player")!;
      if (ytutils.player) {
        clearInterval(id);
        if (ytutils.mobile) {
          const id = setInterval(() => {
            try {
              ytutils.player.addEventListener(
                "onStateChange",
                (state: number | Event) => {
                  if (state === -1) ytutils.loopBtn();
                  else if (state === 1) ytutils.updatePlayer();
                  clearInterval(id);
                },
              );
            } catch {
              ytutils.player = document.querySelector<player>("#movie_player")!;
            }
          }, 100);
        } else if (ytutils.embed) {
          if (location.search.includes("youtube.com")) return;
          const fn = () => {
            ytutils.updatePlayer();
            ytutils.loopBtn();
            ytutils.player.removeEventListener("onStateChange", fn);
          };
          ytutils.player.addEventListener("onStateChange", fn);
        } else ytutils.updatePlayer();
      }
    }, 25);
    ytutils.loopBtn();
  },
  loopBtn: () => {
    document.querySelector("#ytutils-loop")?.remove();
    const btn = document.createElement("button");
    btn.id = "ytutils-loop";
    btn.className = "ytp-button";
    const uri = "http://www.w3.org/2000/svg";
    const loop = document.createElementNS(uri, "path");
    const check = document.createElementNS(uri, "path");
    loop.setAttribute(
      "d",
      "M1 3l1 5l5 -1M2 8A10 10 0 0 1 12 1A11 11 0 0 1 23 12M23 21l-1 -5l-5 1M22 16A10 10 0 0 1 12 23A11 11 0 0 1 1 12",
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
    if (ytutils.mobile && !ytutils.embed) {
      if (!ytutils.player) return;
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
          "fadein",
        )
          ? ""
          : "none";
      });
      const fn = () => {
        document.querySelector("#player-container-id")!.append(btn);
        const id = setInterval(() => {
          const ctrl = document.querySelector("#player-control-overlay");
          if (ctrl) {
            clearInterval(id);
            obver.observe(ctrl, {
              attributes: true,
              attributeFilter: ["class"],
            });
          }
        }, 100);
        ytutils.player.removeEventListener("onStateChange", fn);
      };
      ytutils.player.addEventListener("onStateChange", fn);
    } else {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.position = "relative";
      const size = "25%";
      svg.style.top = size;
      svg.style.left = size;
      btn.title = "Loop video (r)";
      btn.onclick = () => {
        ytutils.player.dispatchEvent(new CustomEvent("contextmenu"));
        document
          .querySelector<HTMLElement>(
            ".ytp-contextmenu [role='menuitemcheckbox']",
          )!
          .click();
        check.style.display = check.style.display === "" ? "none" : "";
      };
      document
        .querySelector(".ytp-right-controls")!
        .insertBefore(btn, document.querySelector(".ytp-subtitles-button"));
      const video = document.querySelector("video")!;
      const obver = new MutationObserver(() => {
        check.style.display = video.attributes.getNamedItem("loop")
          ? ""
          : "none";
      });
      obver.observe(video, {
        attributes: true,
        attributeFilter: ["loop"],
      });
    }
  },
  updatePlayer: () => {
    ytutils.setQuality();
    ytutils.player.setPlaybackRate(
      ytutils.mobile && ytutils.player.isAtLiveHead() ? 1 : ytutils.speed,
    );
    ytutils.setVolume();
    if (!ytutils.mobile) ytutils.setSize();
    try {
      ytutils.setSubtitles();
      ytutils.setStyle();
    } catch {
      // no available subtitles
    }
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
      if (
        Object.keys(ytutils.player.getOption("captions", "track")).length === 0
      )
        ytutils.mobile
          ? ytutils.player.toggleSubtitles()
          : ytutils.player.toggleSubtitlesOn();
    } else ytutils.player.unloadModule("captions");
  },
  setVolume: () => {
    ytutils.player.unMute();
    ytutils.player.setVolume(ytutils.volumelevel);
  },
  setQuality: () => {
    if (ytutils.quality === "default") return;
    const qualities = ytutils.player.getAvailableQualityLevels();
    const quality = qualities.includes(ytutils.quality)
      ? ytutils.quality
      : qualities[0];
    ytutils.player.setPlaybackQualityRange(quality, quality);
  },
  setSize: () => {
    if (ytutils.size === "default" || ytutils.embed || ytutils.mobile) return;
    const id = setInterval(() => {
      const flexy = document.querySelector<flexy>("ytd-watch-flexy");
      if (flexy) {
        clearInterval(id);
        switch (ytutils.size) {
          case "expand":
            ytutils.setTheater(true, flexy.theater);
            break;
          case "shrink":
            ytutils.setTheater(false, flexy.theater);
            break;
          case "chat":
            ytutils.setTheater(
              document.querySelector("#chat") === null,
              flexy.theater,
            );
            break;
        }
      }
    }, 100);
  },
  setTheater: (enable: boolean, state: boolean) => {
    if (enable === state) return;
    document.querySelector<HTMLButtonElement>(".ytp-size-button")!.click();
  },
};

window.addEventListener("message", (ev) => {
  if (ev.source === window && ev.data.type === "UPDATE_SETTINGS") {
    Object.assign(ytutils, ev.data.sets);
    ytutils.updatePlayer();
  }
});

window.addEventListener("load", ytutils.setPlayer);

window.addEventListener("yt-navigate-finish", () => {
  if (/user|channel|@/.test(location.pathname)) {
    if (!ytutils.play) return;
    let i = 0;
    const id = setInterval(() => {
      const player = document.querySelector<player>("#c4-player")!;
      if (player) {
        clearInterval(id);
        player.pauseVideo();
      }
      if (i++ === 20) clearInterval(id);
    }, 100);
  } else {
    ytutils.loopBtn();
    ytutils.updatePlayer();
  }
});

window.addEventListener("keydown", (ev) => {
  if (
    ev.altKey ||
    ev.ctrlKey ||
    ev.metaKey ||
    (ev.target as HTMLElement).tagName === "INPUT" ||
    (ev.target as HTMLElement).id === "contenteditable-root"
  )
    return;
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
    case "q":
      document
        .querySelectorAll<HTMLButtonElement>(
          ".ytp-suggested-action-badge-dismiss-button-icon, .dismiss-button",
        )
        .forEach((btn) => {
          btn.click();
          btn.blur();
        });
      break;
    case "r":
      document.querySelector<HTMLElement>("#ytutils-loop")!.click();
      break;
  }
});
