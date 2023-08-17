import model from "./model.js";
import zip from "./zip.js";
import images from "./images.js";
import toolbar from "./toolbar.js";
import menubar from "./menubar.js";
import "./dialog.js";
import setting from "./setting.js";
import tags from "./tags.js";
import { locale, $t } from "./language.js";

const path = require("path");
const fs = require("fs");
const url = require("url");

// 多语言
function onLocaleChange(newLocale) {
  locale(newLocale);
  resetTitle();
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
onLocaleChange(locale());
menubar.onLocaleChange(onLocaleChange);

// 设置
function applySetting(setting) {
  model.setting = setting;
  document.body.style.backgroundColor = setting.backgroundColor;
}
applySetting(model.setting);
setting.onChange(applySetting);

// 菜单栏
menubar.onOpen((path) => {
  const history = model.findHistory(path) || { path, index: 0 };
  loadPath(history.path, history.index);
});
menubar.onLoadHistory(loadPath);

// 标题
function resetTitle() {
  document.title = `${$t("appName")} - ${nw.App.manifest.version}`;
}
function updateTitle() {
  const image = model.images[model.index];
  document.title = `${model.index + 1}/${model.total}: 
    ${image.name} <${image.folder}>`;
}

// 图片
images.onIndexChange((index) => {
  model.index = index;
  toolbar.updateIndex();
  updateTitle();
});

// 工具栏
toolbar.updateSize();
toolbar.onIndexChange((index) => {
  model.index = Math.max(0, Math.min(model.total - 1, index));
  images.loadIndex(model.index);
  toolbar.updateIndex();
  updateTitle();
});
toolbar.onZoomChange((zoom) => {
  const { minZoom, maxZoom } = model.setting;
  model.zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  images.updateZoom();
});

// 窗口尺寸变更
let timer = -1;
window.addEventListener("resize", () => {
  clearTimeout(timer);
  timer = setTimeout(() => toolbar.updateSize(), 10);
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
  await images.loadIndex(index);
  toolbar.updateIndex();
  if (index === -1) resetTitle();
  else updateTitle();
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
  document.body.classList.add("no-image");
  toolbar.updateTotal();
  loadIndex(-1);

  const _images = await getImages([path]);
  if (_images.length > 0) {
    model.images = _images;
    document.body.classList[model.total > 0 ? "remove" : "add"]("no-image");
    toolbar.updateTotal();
    loadIndex(index);
    model.addHistory({ path, index });
  }

  menubar.init();
}

// 标签
toolbar.onAddTag(() => {
  const comment = prompt($t("tags.comment"));
  if (comment) {
    model.addTag({
      path: model.rootPath,
      index: model.index,
      total: model.total,
      comment,
    });
  }
  tags.update();
});
tags.onLoadTag((group, index) => {
  const tag = model.tags[group][index];
  loadPath(tag.path, tag.index);
});
tags.onDeleteTag((group, index) => {
  model.deleteTag(group, index);
  tags.update();
});
tags.onClearTags(() => {
  model.clearTags();
  tags.update();
});

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

nw.Window.get().on("close", function () {
  this.hide();
  if (model.total > 0) {
    model.addHistory({ path: model.rootPath, index: model.index });
  }
  this.close(true);
});

if (model.setting.autoLoadHistory) {
  setTimeout(() => {
    const history = model.history[0];
    if (history) loadPath(history.path, history.index);
  }, 0);
}
