import model from "./model.js";
import { $, dialog } from "./util.js";

let _onChange;

const $settingDialog = $("#setting-dialog");
const $scrollDelta = $("#scroll-delta");
const $autoLoadHistory = $("#auto-load-history");
const $readSubfolder = $("#read-subfolder");
const $backgroundColor = $("#background-color");
const $historyCount = $("#history-count");
const $displayPage = $("#display-page");
const $displayTime = $("#display-time");

function update() {
  const {
    scrollDelta,
    autoLoadHistory,
    readSubfolder,
    backgroundColor,
    historyCount,
    displayPage,
    displayTime,
  } = model.setting;
  $scrollDelta.value = scrollDelta;
  $autoLoadHistory.checked = autoLoadHistory;
  $readSubfolder.checked = readSubfolder;
  $backgroundColor.value = backgroundColor;
  $historyCount.value = historyCount;
  $displayPage.checked = displayPage;
  $displayTime.checked = displayTime;
}

function forceInt($input) {
  $input.addEventListener("change", () => {
    let value = parseInt($input.value);
    if ($input.min) value = Math.max(parseInt($input.min), value);
    if ($input.max) value = Math.min(parseInt($input.max), value);
    if (value !== $input.value) $input.value = value;
  });
}
forceInt($scrollDelta);
forceInt($historyCount);

$("#setting-ok").addEventListener("click", () => {
  const setting = {
    scrollDelta: parseInt($scrollDelta.value),
    autoLoadHistory: $autoLoadHistory.checked,
    readSubfolder: $readSubfolder.checked,
    backgroundColor: $backgroundColor.value,
    historyCount: parseInt($historyCount.value),
    displayPage: $displayPage.checked,
    displayTime: $displayTime.checked,
  };
  _onChange(setting);
});

export default {
  onChange: (callback) => (_onChange = callback),
  update,
  toggle() {
    if (dialog.isOpen($settingDialog)) {
      dialog.close($settingDialog);
    } else {
      update();
      dialog.open($settingDialog);
    }
  },
};
