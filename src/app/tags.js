import model from "./model.js";
import tagDialog from "./tag-dialog.js";
import { $ } from "./util.js";
import { $t } from "./language.js";

const fs = require("fs");
const path = require("path");

let visible = false;
let _onLoadTag;

const $tags = $("#tags");
const $tagsList = $("#tags-list");
const $toolbar = $("#toolbar");

let showType; // "tags" | "chapters"
let tags, chapters;

function reset() {
  tags = null;
  chapters = null;
  if (visible) updateView();
}

// tags
function getTagsPath() {
  const { dir, name } = path.parse(model.rootPath);
  return path.join(dir, name + ".tags");
}
function loadTags() {
  const tagsPath = getTagsPath();
  if (fs.existsSync(tagsPath)) {
    tags = fs
      .readFileSync(tagsPath)
      .toString()
      .split("\n")
      .map((line) => {
        const [_, page, comment] = line.trim().match(/^(\d+)\|(.*)/);
        return { page: parseInt(page), comment };
      })
      .filter((tag) => typeof tag.page === "number" && !isNaN(tag.page));
  } else {
    tags = [];
  }
  return tags;
}
function save() {
  const tagsPath = getTagsPath();
  fs.writeFileSync(tagsPath, tags.map(({ page, comment }) => `${page}|${comment}`).join("\n"));
}
function sortTagsByPage() {
  tags.sort((a, b) => a.page - b.page);
}
function addTag() {
  tagDialog.show(model.index + 1, "", (tag) => {
    tags.push(tag);
    sortTagsByPage();
    updateView();
    save();
  });
}
function editTag(index) {
  const tag = tags[index];
  tagDialog.show(tag.page, tag.comment, (newTag) => {
    Object.assign(tag, newTag);
    sortTagsByPage();
    updateView();
    save();
  });
}
function deleteTag(index) {
  tags.splice(index, 1);
  updateView();
  if (tags.length > 0) save();
  else fs.rmSync(getTagsPath());
}
function clearTags() {
  tags = [];
  updateView();
  fs.rmSync(getTagsPath());
}

// chapters
function generateChapters() {
  const chMap = {};
  chapters = [];
  model.images.forEach((image, index) => {
    const [, ch] = image.basename.match(/([\d.]+)_(\d+)/) ?? [];
    const page = index + 1;
    const comment = ch;
    if (ch && !chMap[comment]) {
      chMap[comment] = page;
      chapters.push({ page, comment });
    }
  });
  return chapters;
}

function setShowType(type) {
  if (showType === type) return;
  showType = type;
  $tags.classList.remove("type-tags", "type-chapters");
  $tags.classList.add(`type-${type}`);
  if (type === "chapters" && !chapters) generateChapters();
  updateView();
}

function updateView() {
  const length = String(model.images.length).length;
  const list = showType === "tags" ? tags ?? loadTags() : chapters ?? generateChapters();
  $tagsList.innerHTML =
    list.length > 0
      ? list
          .map((tag, index) => {
            const comment = tag.comment
              ? `<span title="${tag.comment}">${tag.comment}</span>`
              : `<span class="no-comment" lang-text="empty">${$t("empty")}</span>`;
            return `<div class="tag-item" data-index="${index}">
                    <div class="tag-info">
                      <div class="tag-comment">
                        <span class="tag-page">
                          ${String(tag.page)
                            .padStart(length, " ")
                            .replace(/ /g, '<span class="tag-pad">0</span>')}: 
                        </span>
                        ${comment}
                      </div>
                    </div>
                    <div class="tag-btn" data-type="edit">
                      <span class="iconfont icon-edit"></span>
                    </div>
                    <div class="tag-btn" data-type="delete">
                      <span class="iconfont icon-delete"></span>
                    </div>
                  </div>`;
          })
          .join("")
      : `<div class="nodata" lang-text="nodata">${$t("nodata")}</div>`;
}

$tagsList.addEventListener("click", (e) => {
  const item = e.target.closest("[data-index]");
  if (item) {
    const index = parseInt(item.dataset.index);
    const { type } = e.target.dataset;
    if (type == "edit") editTag(index);
    else if (type == "delete") deleteTag(index);
    else _onLoadTag((showType === "tags" ? tags : chapters)[index].page - 1);
  }
});

$("#tags-tags").addEventListener("click", () => setShowType("tags"));
$("#tags-chapters").addEventListener("click", () => setShowType("chapters"));
$("#tags-close").addEventListener("click", () => {
  $tags.classList.add("hide");
  visible = false;
});
$("#tags-add").addEventListener("click", () => addTag());
$("#tags-clear").addEventListener("click", () => clearTags());

let resizing = false;

// 全屏状态
$("#tags-hover").addEventListener("mouseenter", () => {
  if ($toolbar.classList.contains("handler-moving")) return;
  if (!showType) setShowType("tags");
  $tags.classList.add("show");
});
$tags.addEventListener("mouseleave", () => {
  if (model.isFullscreen && !resizing) $tags.classList.remove("show");
});

// 调整面板大小
let mousedown;
$("#tags-resize").addEventListener("mousedown", (e) => {
  mousedown = { width: parseInt($tags.offsetWidth), e };
  resizing = true;
  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", stopResize);
});
function resize(e) {
  const width = mousedown.width + e.x - mousedown.e.x;
  $tags.style.width = width + "px";
}
function stopResize() {
  window.removeEventListener("mousemove", resize);
  window.removeEventListener("mouseup", stopResize);
  resizing = false;
}

export default {
  toggle(type) {
    if (!visible || type !== showType) {
      visible = true;
      $tags.classList.remove("hide");
      setShowType(type);
    } else {
      visible = false;
      $tags.classList.add("hide");
    }
  },
  reset,
  addTag,
  onLoadTag: (callback) => (_onLoadTag = callback),
};
