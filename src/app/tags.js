import dialog from "./dialog.js";
import model from "./model.js";
import { $t } from "./language.js";

const path = require("path");

let _onLoadTag, _onDeleteTag, _onClearTags;

const $ = (s) => document.querySelector(s);
const $tagsList = $("#tags-list");

function update() {
  const list = Object.entries(model.tags);
  $tagsList.innerHTML =
    list.length > 0
      ? list
          .map(([group, items]) => {
            return (
              `<div class="tag-group" data-group="${group}">
                <div class="tag-group-name" title="${group}">
                  ${path.basename(group)}
                </div>
                <div class="tag-delete">
                  <span class="iconfont icon-delete"></span>
                </div>
              </div>` +
              items
                .map((item, index) => {
                  return `<div class="tag-item" data-group="${group}" data-index="${index}">
                    <div class="tag-info">
                      <div class="tag-comment">
                        <span class="tag-page">
                          ${item.index + 1}/${item.total}: 
                        </span>
                        <span title="${item.comment}">${item.comment}</span>
                      </div>
                    </div>
                    <div class="tag-delete">
                      <span class="iconfont icon-delete"></span>
                    </div>
                  </div>`;
                })
                .join("")
            );
          })
          .join("")
      : `<div class="nodata" lang-text="nodata">${$t("nodata")}</div>`;
}

$tagsList.addEventListener("click", (e) => {
  const item = e.target.closest("[data-group]");
  if (item) {
    const hasIndex = item.dataset.index !== undefined;
    const index = parseInt(item.dataset.index);
    const group = item.dataset.group;
    const isDelete = e.target.classList.contains("tag-delete");
    if (isDelete) {
      if (hasIndex) _onDeleteTag(group, index);
      else _onDeleteTag(group);
    } else if (hasIndex) {
      _onLoadTag(group, index);
      dialog.close("#tags");
    }
  }
});

$("#tags-clear").addEventListener("click", () => _onClearTags());

export default {
  update,
  onLoadTag: (callback) => (_onLoadTag = callback),
  onDeleteTag: (callback) => (_onDeleteTag = callback),
  onClearTags: (callback) => (_onClearTags = callback),
};
