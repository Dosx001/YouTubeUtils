document.addEventListener("DOMContentLoaded", () => {
  browser.storage.local.get("res").then((res) => {
    document.querySelector<HTMLSelectElement>("#sel")!.value = res.res ?? "5";
  });
  document.getElementById("sel")!.onchange = (ev) => {
    browser.storage.local.set({
      res: (ev.target as HTMLSelectElement).value,
    });
  };
});
