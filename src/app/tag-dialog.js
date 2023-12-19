import { $, dialog } from "./util.js";
import model from "./model.js";

const $tagDialog = $("#tag-dialog");
const $tagPage = $("#tag-page");
const $tagComment = $("#tag-comment");

let _callback;
function show(page = 1, comment = "", callback = () => {}) {
  _callback = callback;
  $tagPage.value = page;
  $tagComment.value = comment;
  dialog.open($tagDialog);
  $tagComment.focus();
}
function hide() {
  dialog.close($tagDialog);
}

function apply() {
  _callback({
    page: parseInt($tagPage.value) || 1,
    comment: $tagComment.value,
  });
}
function applyByEnter(e) {
  if (e.key === "Enter") {
    hide();
    apply();
  }
}

$("#tag-updatepage").addEventListener(
  "click",
  () => ($tagPage.value = model.index + 1)
);
$("#tag-ok").addEventListener("click", apply);
$tagComment.addEventListener("keydown", applyByEnter);
$tagComment.addEventListener("keydown", applyByEnter);

export default { show, hide };
