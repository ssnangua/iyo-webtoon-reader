import dialog from "./dialog.js";
import model from "./model.js";

let _onChange;

const $ = (s) => document.querySelector(s);
const $autoLoadHistory = $("#auto-load-history");
const $readSubfolder = $("#read-subfolder");
const $backgroundColor = $("#background-color");
const $historyCount = $("#history-count");

function update() {
  const { autoLoadHistory, readSubfolder, backgroundColor, historyCount } =
    model.setting;
  $autoLoadHistory.checked = autoLoadHistory;
  $readSubfolder.checked = readSubfolder;
  $backgroundColor.value = backgroundColor;
  $historyCount.value = historyCount;
}

$historyCount.addEventListener("change", () => {
  const value = Math.min(100, Math.max(0, parseInt($historyCount.value)));
  if (value !== $historyCount.value) $historyCount.value = value;
});

$("#setting-ok").addEventListener("click", () => {
  dialog.close("#setting");
  const setting = {
    autoLoadHistory: $autoLoadHistory.checked,
    readSubfolder: $readSubfolder.checked,
    backgroundColor: $backgroundColor.value,
    historyCount: parseInt($historyCount.value),
  };
  _onChange(setting);
});
$("#setting-cancel").addEventListener("click", () => {
  dialog.close("#setting");
});

export default {
  onChange: (callback) => (_onChange = callback),
  update,
  show() {
    update();
    dialog.open("#setting");
  },
};
