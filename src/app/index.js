import model from "./model.js";
import zip from "./zip.js";
import images from "./images.js";
import toolbar from "./toolbar.js";
import menubar from "./menubar.js";
import setting from "./setting.js";
import tags from "./tags.js";
import { $t } from "./language.js";

const path = require("path");
const fs = require("fs");
const url = require("url");

function applyStorage(key) {
  switch (key) {
    case "locale":
      onLocaleChange();
      break;
    // case "setting": break;
    case "history":
      menubar.init();
      break;
  }
}
model.onStorageChange(applyStorage);

// 多语言
function onLocaleChange() {
  updateTitle();
  menubar.init();
  document.querySelectorAll("[lang-title]").forEach((el) => {
    const key = el.getAttribute("lang-title");
    el.title = $t(key);
  });
  document.querySelectorAll("[lang-text]").forEach((el) => {
    const key = el.getAttribute("lang-text");
    el.innerText = $t(key);
  });
}
onLocaleChange();

// 设置
function applySetting(setting) {
  document.body.style.backgroundColor = model.setting.backgroundColor;
  applyStorage("setting");
}
applySetting(model.setting);
setting.onChange((setting) => {
  model.setting = setting;
  applySetting();
});

// 菜单栏
menubar.onMenuItemClick((key, data) => {
  switch (key) {
    case "language":
      model.locale = data;
      onLocaleChange();
      break;
    case "open":
      const history = model.findHistory(data) || { path: data, index: 0 };
      loadPath(history.path, history.index);
      break;
    case "addTag":
      tags.addTag();
      break;
    case "showTagList":
      tags.toggle();
      break;
    case "loadHistory":
      loadPath(data.path, data.index);
      break;
    case "showSetting":
      setting.toggle();
      break;
  }
});

// 标题
function updateTitle() {
  if (model.index === -1) {
    document.title = `${$t("appName")} - ${nw.App.manifest.version}`;
  } else {
    const image = model.images[model.index];
    document.title = `${model.index + 1}/${model.total}: 
      ${image.name} <${image.folder}>`;
  }
}

// 图片
images.onIndexChange((index) => {
  model.index = index;
  toolbar.updateIndex();
  updateTitle();
});

// 工具栏
function setIndex(index) {
  model.index = Math.max(0, Math.min(model.total - 1, index));
  images.loadIndex(model.index);
  toolbar.updateIndex();
  updateTitle();
}
function setZoom(zoom) {
  const { minZoom, maxZoom } = model.setting;
  model.zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  images.updateZoom();
  toolbar.updateZoom();
}
toolbar.updateSize();
toolbar.onIndexChange(setIndex);
toolbar.onZoomChange(setZoom);

// 标签
toolbar.onAddTag(() => tags.addTag());
tags.onLoadTag((index) => loadIndex(index));

// 窗口尺寸变更
let timer = -1;
window.addEventListener("resize", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    toolbar.updateSize();
    images.updateZoom();
  }, 100);
});

const imageRule = /\.(jpg|jpeg|png|webp|gif|bmp)$/i;

// 递归获取图片（会读取压缩包内的图片，但不会读取压缩包内的压缩包）
async function getImages(files, images = [], readFolder = true, folder) {
  for (let i = 0, length = files.length; i < length; i++) {
    const file = files[i];
    if (!folder) folder = file;
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      if (readFolder) {
        const subfiles = fs.readdirSync(file);
        await getImages(
          subfiles.map((subfile) => path.join(file, subfile)),
          images,
          model.setting.readSubfolder,
          folder
        );
      }
    } else {
      if (file.endsWith(".zip")) {
        const zipImages = await zip.load(file);
        images.push(...zipImages);
      } else if (imageRule.test(file)) {
        images.push({
          folder,
          path: file,
          name: path.relative(folder, file),
          basename: path.basename(file),
          src: url.pathToFileURL(file).toString(),
        });
      }
    }
  }
  return images;
}

// 跳转到指定页码
async function loadIndex(index) {
  model.index = index;
  toolbar.updateIndex();
  updateTitle();
  await images.loadIndex(index);
}

// 加载指定路径
async function loadPath(path, index) {
  if (!fs.existsSync(path)) return alert($t("notExist"));

  if (model.rootPath === path) return loadIndex(index);

  // 更新历史记录的页码
  if (model.total > 0) {
    model.addHistory({ path: model.rootPath, index: model.index });
  }

  model.rootPath = path;

  zip.closeAll();
  model.images = [];
  loadIndex(-1);
  document.body.classList.add("no-image");
  toolbar.updateTotal();

  const _images = await getImages([path]);
  if (_images.length > 0) {
    model.images = _images;
    document.body.classList[model.total > 0 ? "remove" : "add"]("no-image");
    toolbar.updateTotal();
    loadIndex(index);
    tags.load();
    model.addHistory({ path, index });
  }

  menubar.init();
}

// 文件拖放
const preventDefault = (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};
window.addEventListener("dragenter", preventDefault);
window.addEventListener("dragover", preventDefault);
window.addEventListener("dragleave", preventDefault);
window.addEventListener("drop", preventDefault);
window.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const path = files[0].path;
    const history = model.findHistory(path) || { path, index: 0 };
    loadPath(history.path, history.index);
  }
});

// 自动打开上次关闭时的记录
if (location.search === "?id=1" && model.setting.autoLoadHistory) {
  setTimeout(() => {
    const history = model.history[0];
    if (history) loadPath(history.path, history.index);
  }, 0);
}

// 关闭窗口前的操作
nw.Window.get().on("close", function () {
  this.hide();
  if (model.total > 0) {
    zip.closeAll();
    if (model.total > 0) {
      model.addHistory({ path: model.rootPath, index: model.index });
    }
  }
  this.close(true);
});

let scrollTimer = -1;
function startScroll(y) {
  stopScroll();
  scrollTimer = setInterval(() => {
    images.scrollBy(y);
  }, 10);
}
function stopScroll() {
  if (scrollTimer > 0) {
    clearInterval(scrollTimer);
    scrollTimer = -1;
  }
}

// 按键
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  // console.log(e);
  if (e.code === "ArrowUp") {
    startScroll(-10);
  } else if (e.code === "ArrowDown") {
    startScroll(10);
  } else if (e.code === "ArrowLeft" || e.code === "PageUp") {
    setIndex(model.index - 1);
  } else if (e.code === "ArrowRight" || e.code === "PageDown") {
    setIndex(model.index + 1);
  } else if (e.code === "Home") {
    setIndex(0);
  } else if (e.code === "End") {
    setIndex(model.total - 1);
  } else if ((e.ctrlKey || e.metaKey) && e.code === "Equal") {
    setZoom(model.zoom + 0.25);
  } else if ((e.ctrlKey || e.metaKey) && e.code === "Minus") {
    setZoom(model.zoom - 0.25);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown" || e.code === "ArrowUp") {
    stopScroll();
  }
});
