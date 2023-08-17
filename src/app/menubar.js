import { messages, locale, $t } from "./language.js";
import model from "./model.js";
import dialog from "./dialog.js";
import setting from "./setting.js";
import tags from "./tags.js";

const os = require("os");
const path = require("path");

let _onLocaleChange, _onOpen, _onLoadHistory;

const win = nw.Window.get();
let menubar;

function init() {
  menubar = createMenubar();
  win.menu = menubar;
}

const input = document.createElement("input");
input.setAttribute("type", "file");
input.addEventListener("change", () => _onOpen(input.value));

function createMenu(items, option = { type: "contextmenu" }) {
  const menu = new nw.Menu(option);
  items.forEach((item) => {
    menu.append(new nw.MenuItem(item));
  });
  return menu;
}

function createHistorySubmenu() {
  if (model.history.length > 0) {
    return createMenu(
      model.history
        .map((item, index) => {
          return {
            label: `${index + 1}: ${path.basename(item.path)}`,
            click: () => _onLoadHistory(item.path, item.index),
          };
        })
        .concat([
          { type: "separator" },
          {
            label: $t("menubar.file.clear"),
            click() {
              model.clearHistory();
              init();
            },
          },
        ])
    );
  } else {
    return createMenu([{ label: $t("menubar.file.empty"), enabled: false }]);
  }
}

function createMenubar() {
  return createMenu(
    [
      {
        label: $t("menubar.file.file"),
        submenu: createMenu([
          {
            label: $t("menubar.file.openZipFile"),
            key: "o",
            modifiers: "ctrl",
            click() {
              input.removeAttribute("nwdirectory");
              input.setAttribute("accept", ".zip");
              input.click();
            },
          },
          {
            label: $t("menubar.file.openFolder"),
            key: "o",
            modifiers: "ctrl+shift",
            click() {
              input.removeAttribute("accept");
              input.setAttribute("nwdirectory", "nwdirectory");
              input.click();
            },
          },
          {
            type: "separator",
          },
          {
            label: $t("menubar.file.tags"),
            key: "t",
            modifiers: "ctrl",
            click() {
              tags.update();
              dialog.open("#tags");
            },
          },
          {
            label: $t("menubar.file.history"),
            submenu: createHistorySubmenu(),
          },
          {
            type: "separator",
          },
          {
            label: $t("menubar.file.setting"),
            key: "F5",
            click() {
              setting.update();
              dialog.open("#setting");
            },
          },
          {
            label: $t("menubar.file.exit"),
            key: "q",
            modifiers: "ctrl",
            click() {
              nw.App.quit();
            },
          },
        ]),
      },
      {
        label: $t("menubar.language.language"),
        submenu: createMenu(
          Object.entries(messages).map(([lang, message]) => {
            return {
              label: message.languageName,
              type: "checkbox",
              checked: lang === locale(),
              click: () => _onLocaleChange(lang),
            };
          })
        ),
      },
      {
        label: $t("menubar.help.help"),
        submenu: createMenu([
          {
            label: $t("menubar.help.homePage"),
            click() {
              nw.Shell.openExternal(
                "https://github.com/ssnangua/iyo-webtoon-reader"
              );
            },
          },
          {
            type: "separator",
          },
          {
            label: $t("menubar.help.about"),
            click() {
              const ver = process.versions;
              const osInfo = [os.version(), os.arch(), os.release()].join(" ");
              alert(
                [
                  $t("appName"),
                  "",
                  `${$t("about.version")}：${nw.App.manifest.version}`,
                  `${$t("about.os")}：${osInfo}`,
                  `${$t("about.nwjs")}：${ver.nw}`,
                  `${$t("about.chromium")}：${ver.chromium}`,
                  `${$t("about.nodejs")}：${ver.node}`,
                  `${$t("about.v8")}：${ver.v8}`,
                ].join("\r\n")
              );
            },
          },
        ]),
      },
    ],
    { type: "menubar" }
  );
}

export default {
  init,
  onLocaleChange: (callback) => (_onLocaleChange = callback),
  onOpen: (callback) => (_onOpen = callback),
  onLoadHistory: (callback) => (_onLoadHistory = callback),
  show: () => (win.menu = menubar),
  hide: () => (win.menu = null),
};
