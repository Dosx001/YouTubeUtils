// Resolution
const vals = {
  "2160": 7,
  "1440": 6,
  "1080": 5,
  "720": 4,
  "480": 3,
  "360": 2,
  "250": 1,
  "144": 0,
};
document.querySelector<HTMLButtonElement>(".ytp-settings-button")?.click();
const menu = document
  .querySelector(".ytp-panel")
  ?.querySelectorAll<HTMLButtonElement>(".ytp-menuitem");
menu![menu!.length - 1].click();
const items = document
  .querySelector(".ytp-quality-menu")
  ?.querySelectorAll<HTMLButtonElement>(".ytp-menuitem");
browser.storage.local.get("res").then((res) => {
  const val = Number(res.res ?? 5);
  for (const item of items!) {
    const text = item.innerText;
    const p = vals[text.substring(0, text.search("p")) as keyof typeof vals];
    if (p <= val) {
      item.click();
      break;
    }
  }
});

// Replay
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("viewbox", "0 0 24 24");
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
svg.style.fill = "#e6e6e6";
svg.style.position = "relative";
svg.style.top = "1rem";
svg.style.left = "1rem";

const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
const on =
  "m2.164 10.201c.055-.298.393-.734.934-.59.377.102.612.476.543.86-.077.529-.141.853-.141 1.529 0 4.47 3.601 8.495 8.502 8.495 2.173 0 4.241-.84 5.792-2.284l-1.251-.341c-.399-.107-.636-.519-.53-.919.108-.4.52-.637.919-.53l3.225.864c.399.108.637.519.53.919l-.875 3.241c-.107.399-.519.636-.919.53-.399-.107-.638-.518-.53-.918l.477-1.77c-1.829 1.711-4.27 2.708-6.838 2.708-5.849 0-9.968-4.8-10.002-9.93-.003-.473.027-1.119.164-1.864zm5.396 2.857 2.924 2.503c.142.128.321.19.499.19.202 0 .405-.081.552-.242l4.953-5.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-4.453 4.962-2.371-2.011c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557zm14.276.743c-.054.298-.392.734-.933.59-.378-.102-.614-.476-.543-.86.068-.48.139-.848.139-1.53 0-4.479-3.609-8.495-8.5-8.495-2.173 0-4.241.841-5.794 2.285l1.251.341c.4.107.638.518.531.918-.108.4-.519.637-.919.53l-3.225-.864c-.4-.107-.637-.518-.53-.918l.875-3.241c.107-.4.518-.638.918-.531.4.108.638.518.531.919l-.478 1.769c1.83-1.711 4.272-2.708 6.839-2.708 5.865 0 10.002 4.83 10.002 9.995 0 .724-.081 1.356-.164 1.8z";
const off =
  "m2.179 10.201c.055-.298.393-.734.934-.59.377.102.612.476.543.86-.077.529-.141.853-.141 1.529 0 4.47 3.601 8.495 8.502 8.495 2.173 0 4.241-.84 5.792-2.284l-1.251-.341c-.399-.107-.636-.519-.53-.919.108-.4.52-.637.919-.53l3.225.864c.399.108.637.519.53.919l-.875 3.241c-.107.399-.519.636-.919.53-.399-.107-.638-.518-.53-.918l.477-1.77c-1.829 1.711-4.27 2.708-6.838 2.708-5.849 0-9.968-4.8-10.002-9.93-.003-.473.027-1.119.164-1.864zm19.672 3.6c-.054.298-.392.734-.933.59-.378-.102-.614-.476-.543-.86.068-.48.139-.848.139-1.53 0-4.479-3.609-8.495-8.5-8.495-2.173 0-4.241.841-5.794 2.285l1.251.341c.4.107.638.518.531.918-.108.4-.519.637-.919.53l-3.225-.864c-.4-.107-.637-.518-.53-.918l.875-3.241c.107-.4.518-.638.918-.531.4.108.638.518.531.919l-.478 1.769c1.83-1.711 4.272-2.708 6.839-2.708 5.865 0 10.002 4.83 10.002 9.995 0 .724-.081 1.356-.164 1.8z";
path.setAttribute("d", off);
let state = false;

const btn = document.createElement("button");
btn.className = "ytp-button";
btn.id = "replay";
btn.onclick = () => {
  document
    .getElementById("movie_player")
    ?.dispatchEvent(new CustomEvent("contextmenu"));
  document
    .querySelector(".ytp-contextmenu")
    ?.querySelector<HTMLButtonElement>(".ytp-menuitem")
    ?.click();
};

svg.append(path);
btn.append(svg);
document
  .querySelector(".ytp-right-controls")
  ?.insertBefore(btn, document.querySelector(".ytp-subtitles-button"));

// Hotkeys
document.addEventListener("keydown", (ev) => {
  switch (ev.key) {
    case "a":
      document
        .querySelector<HTMLButtonElement>(".ytp-autonav-toggle-button")
        ?.click();
      break;
    case "r":
      document.getElementById("replay")?.click();
      state = !state;
      path.setAttribute("d", state ? on : off);
      break;
  }
});
