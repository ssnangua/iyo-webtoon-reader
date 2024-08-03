import model from "./model.js";
import { $ } from "./util.js";

const $time = $("#fs-time");
function update() {
  const [h, m, s] = new Date().toLocaleTimeString().split(":");
  $time.innerHTML = `${h}:${m}`;
}

let timer = -1;
function toggle() {
  if (model.isFullscreen && model.setting.displayTime) {
    if (timer === -1) {
      update();
      timer = setInterval(update, 1000);
    }
  } else {
    clearInterval(timer);
    timer = -1;
  }
}
toggle();

export default {
  toggle,
};
