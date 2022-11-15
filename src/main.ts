document.addEventListener("keydown", (ev) => {
  switch (ev.key) {
    case "a":
      document
        .querySelector<HTMLButtonElement>(".ytp-autonav-toggle-button")
        ?.click();
      break;
    case "r":
      document
        .querySelector(".ytp-contextmenu")
        ?.querySelector<HTMLButtonElement>(".ytp-menuitem")
        ?.click();
      break;
  }
});
