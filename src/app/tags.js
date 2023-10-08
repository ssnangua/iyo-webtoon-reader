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

let tags = [];
function sortTagsByPage() {
  tags.sort((a, b) => a.page - b.page);
}

function getTagsPath() {
  const { dir, name } = path.parse(model.rootPath);
  return path.join(dir, name + ".tags");
}
function load() {
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
  update(false);
}
function save() {
  const tagsPath = getTagsPath();
  fs.writeFileSync(
    tagsPath,
    tags.map(({ page, comment }) => `${page}|${comment}`).join("\n")
  );
}

function addTag() {
  tagDialog.show(model.index + 1, "", (tag) => {
    tags.push(tag);
    sortTagsByPage();
    update();
    save();
  });
}
function editTag(index) {
  const tag = tags[index];
  tagDialog.show(tag.page, tag.comment, (newTag) => {
    Object.assign(tag, newTag);
    sortTagsByPage();
    update();
    save();
  });
}
function deleteTag(index) {
  tags.splice(index, 1);
  update();
  if (tags.length > 0) save();
  else fs.rmSync(getTagsPath());
}
function clearTags() {
  tags = [];
  update();
  fs.rmSync(getTagsPath());
}

function update() {
  $tagsList.innerHTML =
    tags.length > 0
      ? tags
          .map((tag, index) => {
            const comment = tag.comment
              ? `<span title="${tag.comment}">${tag.comment}</span>`
              : `<span class="no-comment" lang-text="empty">${$t(
                  "empty"
                )}</span>`;
            return `<div class="tag-item" data-index="${index}">
                    <div class="tag-info">
                      <div class="tag-comment">
                        <span class="tag-page">
                          ${tag.page}: 
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
    else _onLoadTag(tags[index].page - 1);
  }
});

$("#tags-close").addEventListener("click", () => {
  $tags.classList.add("hide");
  visible = false;
});
$("#tags-add").addEventListener("click", () => addTag());
$("#tags-clear").addEventListener("click", () => clearTags());

let resizing = false;

// 全屏状态下
$("#tags-hover").addEventListener("mouseenter", () => {
  if ($toolbar.classList.contains("handler-moving")) return;
  $tags.classList.add("show");
});
$tags.addEventListener("mouseleave", () => {
  const isFullscreen = document.body.classList.contains("fullscreen");
  if (isFullscreen && !resizing) $tags.classList.remove("show");
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
  toggle() {
    visible = !visible;
    $tags.classList[visible ? "remove" : "add"]("hide");
  },
  update,
  load,
  addTag,
  onLoadTag: (callback) => (_onLoadTag = callback),
};
