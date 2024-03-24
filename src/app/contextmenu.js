import { messages, $t } from "./language.js";
import { createMenu } from "./util.js";

const path = require("path");
const fs = require("fs");

let _image;

let menu;

const input = document.createElement("input");
input.setAttribute("type", "file");
input.addEventListener("change", () => {
  if (input.value) {
    fs.writeFileSync(input.value, _image.buffer);
    input.value = "";
  }
});

function init() {
  menu = createMenu([
    {
      label: $t("contextmenu.saveImage"),
      click() {
        input.setAttribute("nwsaveas", _image.name);
        input.setAttribute("accept", path.extname(_image.name));
        input.click();
      },
    },
  ]);
}

export default {
  init,
  popup: (image, x, y) => {
    _image = image;
    menu.popup(x, y);
  },
};
