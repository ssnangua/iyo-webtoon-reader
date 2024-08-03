import model from "./model.js";
import menubar from "./menubar.js";
import { $ } from "./util.js";

let _onIndexChange, _onZoomChange, _onAddTag, _onFullscreen;

const $toolbar = $("#toolbar");
const $tooltip = $("#tooltip");
const $page = $("#page");
const $canvas = $("#canvas");
const $handlerPreview = $("#handler-preview");
const $handler = $("#handler");
const $first = $("#btn-first");
const $prev = $("#btn-prev");
const $next = $("#btn-next");
const $last = $("#btn-last");

const ctx = $canvas.getContext("2d", { willReadFrequently: true });

function setBtnEnable(btn, enable) {
  btn.classList[enable ? "remove" : "add"]("disabled");
}

let barW, barH, barX;

// 窗口尺寸变更，更新画布大小
function updateSize() {
  barW = window.innerWidth - 310;
  barH = 20;
  barX = 90;
  $canvas.width = barW;
  $canvas.height = barH;
  updateTotal();
  updateIndex();
}

// 总页数变更
function updateTotal() {
  $toolbar.classList[model.total > 1 ? "remove" : "add"]("no-handler");

  // 进度条刻度
  ctx.clearRect(0, 0, barW, barH);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000";

  // 横线
  ctx.beginPath();
  ctx.moveTo(0, barH / 2);
  ctx.lineTo(barW, barH / 2);
  ctx.closePath();
  ctx.stroke();

  // 刻度
  if (model.total > 1) {
    const len =
      model.total /
      Math.max(1, Math.pow(10, Math.floor(Math.log10(model.total)) - 2));
    for (let i = 0, w = (barW - 2) / (len - 1); i < len; i++) {
      ctx.beginPath();
      ctx.moveTo(i * w + 1, barH - 3);
      ctx.lineTo(i * w + 1, barH);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

// 当前页变更
function updateIndex() {
  if (model.index < 0) {
    $page.innerText = "*/*";
  } else {
    $page.innerText = `${model.index + 1}/${model.total}`;
    // 进度条游标
    const w = (barW - 2) / (model.total - 1);
    $handler.style.left = model.index * w + 90 + "px";
  }

  // 翻页按钮
  setBtnEnable($first, model.index > 0);
  setBtnEnable($prev, model.index > 0);
  setBtnEnable($next, model.index < model.total - 1);
  setBtnEnable($last, model.index < model.total - 1);
}

function getIndexByMouse(e) {
  const index = Math.round(((e.pageX - barX) / barW) * (model.total - 1));
  return Math.max(0, Math.min(model.total - 1, index));
}

// 点击进度条/拖动进度条游标，跳转相应页码
let isMovingHandler = false;
$canvas.addEventListener("mousedown", (e) => {
  if (model.total < 2) return;
  isMovingHandler = true;
  $toolbar.classList.add("handler-moving");
  window.addEventListener("mousemove", moveHandler);
  window.addEventListener("mouseup", applyHandler);
  $toolbar.classList.add("tip");
  updateTip(e);
});
function moveHandler(e) {
  updateTip(e);
  const index = getIndexByMouse(e);
  const w = (barW - 2) / (model.total - 1);
  $handler.style.left = index * w + 90 + "px";
}
function applyHandler(e) {
  window.removeEventListener("mousemove", moveHandler);
  window.removeEventListener("mouseup", applyHandler);
  isMovingHandler = false;
  $toolbar.classList.remove("handler-moving");
  if (e.target !== $canvas) $toolbar.classList.remove("tip");
  _onIndexChange(getIndexByMouse(e));
}

// 进度条提示
function updateTip(e) {
  const index = getIndexByMouse(e);
  const count = model.total;
  const name = model.images[index].basename;
  $tooltip.innerHTML = `<b>${index + 1}/${count}</b> : ${name}`;
  const tipW = $tooltip.offsetWidth;
  const w = (barW - 2) / (count - 1);
  const left = index * w + 90;
  $tooltip.style.left =
    Math.min(Math.max(0, left - tipW / 2), window.innerWidth - tipW) + "px";
  $handlerPreview.style.left = left + "px";
}
$canvas.addEventListener("mouseenter", (e) => {
  if (model.total < 2) return;
  $canvas.addEventListener("mousemove", updateTip);
  $toolbar.classList.add("tip");
  updateTip(e);
});
$canvas.addEventListener("mouseleave", () => {
  $canvas.removeEventListener("mousemove", updateTip);
  if (!isMovingHandler) $toolbar.classList.remove("tip");
});

// 跳转按钮
$first.addEventListener("click", () => _onIndexChange(0));
$prev.addEventListener("click", () => _onIndexChange(model.index - 1));
$next.addEventListener("click", () => _onIndexChange(model.index + 1));
$last.addEventListener("click", () => _onIndexChange(model.total - 1));

// 输入框全选
function inputSelectAll($input) {
  $input.selectionStart = 0;
  $input.selectionEnd = $input.value.length;
}

// 页码
const $pagination = $("#pagination");
const $pageInput = $("#page-input");
function cancelPageInput(e) {
  if (e.key === "Escape") {
    $pageInput.value = model.index + 1;
    $pageInput.blur();
  }
}
$("#page").addEventListener("click", () => {
  $pagination.classList.add("input");
  $pageInput.value = model.index + 1;
  inputSelectAll($pageInput);
  $pageInput.focus();
  document.addEventListener("keydown", cancelPageInput);
});
$pageInput.addEventListener("blur", () => {
  $pagination.classList.remove("input");
  document.removeEventListener("keydown", cancelPageInput);
});
$pageInput.addEventListener("change", () => {
  const index = parseInt($pageInput.value) - 1;
  if (!isNaN(index) && index !== model.index) _onIndexChange(index);
  $pageInput.value = model.index + 1;
  inputSelectAll($pageInput);
});

// 缩放
const $zoomtool = $("#zoomtool");
const $zoom = $("#zoom");
const $zoomInput = $("#zoom-input");
const $zoomout = $("#btn-zoomout");
const $zoomin = $("#btn-zoomin");
function updateZoom() {
  const zoom = Math.round(model.zoom * 100);
  $zoom.innerText = zoom + "%";
  $zoomInput.value = zoom;
  const { minZoom, maxZoom } = model.setting;
  setBtnEnable($zoomout, model.zoom > minZoom);
  setBtnEnable($zoomin, model.zoom < maxZoom);
}
function cancelZoomInput(e) {
  if (e.key === "Escape") {
    $zoomInput.value = model.zoom * 100;
    $zoomInput.blur();
  }
}
$zoomout.addEventListener("click", () => {
  _onZoomChange(model.zoom - 0.25);
});
$zoomin.addEventListener("click", () => {
  _onZoomChange(model.zoom + 0.25);
});
$zoom.addEventListener("click", () => {
  $zoomtool.classList.add("input");
  inputSelectAll($zoomInput);
  $zoomInput.focus();
  document.addEventListener("keydown", cancelZoomInput);
});
$zoomInput.addEventListener("blur", () => {
  $zoomtool.classList.remove("input");
  document.removeEventListener("keydown", cancelZoomInput);
});
$zoomInput.addEventListener("change", () => {
  const zoom = parseInt($zoomInput.value);
  if (!isNaN(zoom)) _onZoomChange(zoom / 100);
  inputSelectAll($zoomInput);
});

// 标签
const $tag = $("#btn-tag");
$tag.addEventListener("click", () => _onAddTag());

// 全屏
const win = nw.Window.get();
function enterFullscreen() {
  win.enterFullscreen();
  nw.App.registerGlobalHotKey(esc);
  menubar.hide();
  _onFullscreen(true);
}
function leaveFullscreen() {
  win.leaveFullscreen();
  nw.App.unregisterGlobalHotKey(esc);
  menubar.show();
  _onFullscreen(false);
}
const esc = new nw.Shortcut({
  key: "Escape",
  active: leaveFullscreen,
});
$("#btn-fullscreen").addEventListener("click", enterFullscreen);
$("#btn-leavefullscreen").addEventListener("click", leaveFullscreen);
$("#images-container").addEventListener("dblclick", () => {
  if (model.total > 0) {
    if (win.isFullscreen) leaveFullscreen();
    else enterFullscreen();
  }
});

export default {
  onIndexChange: (callback) => (_onIndexChange = callback),
  onZoomChange: (callback) => (_onZoomChange = callback),
  onAddTag: (callback) => (_onAddTag = callback),
  onFullscreen: (callback) => (_onFullscreen = callback),
  updateSize,
  updateTotal,
  updateIndex,
  updateZoom,
};
