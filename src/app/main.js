let instanceId = 0;
function onOpen() {
  nw.Window.open(
    `app/index.html?id=${++instanceId}`,
    {
      id: "iyo-webtoon-reader",
      width: 800,
      height: 600,
      icon: "app/icon.png",
      min_width: 600,
      min_height: 400,
    },
    (win) => {}
  );
}

onOpen();

nw.App.on("open", onOpen);
process.on("openNewWindow", onOpen);
