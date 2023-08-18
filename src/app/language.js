import model from "./model.js";

export const messages = {
  en: {
    languageName: "English",
    appName: "iYo Webtoon Reader",
    menubar: {
      file: {
        file: "File",
        openZipFile: "Open *.zip File",
        openFolder: "Open Folder",
        addTag: "Add Tag",
        showTagList: "Show Tag List",
        history: "History",
        clear: "Clear",
        setting: "Setting",
        exit: "Exit",
      },
      language: {
        language: "Language",
      },
      help: {
        help: "Help",
        homePage: "Home Page",
        about: "About",
      },
    },
    about: {
      version: "Version",
      os: "OS",
      nwjs: "NW.js",
      chromium: "Chromium",
      nodejs: "Node.js",
      v8: "V8",
    },
    toolbar: {
      zoomout: "Zoom Out",
      zoomin: "Zoom In",
      first: "First Page",
      prev: "Prev Page",
      next: "Next Page",
      last: "Last Page",
      tag: "Add Tag",
      fullscreen: "Fullscreen",
      leavefullscreen: "Leave Fullscreen",
    },
    setting: {
      title: "Setting",
      autoLoadHistory: "Auto Load History",
      readSubfolder: "Read Subfolder",
      backgroundColor: "Background Color",
      historyCount: "History Count",
      ok: "OK",
      cancel: "Cancel",
    },
    tags: {
      title: "Tags",
      clear: "Clear",
      comment: "Tag Comment",
    },
    notExist: "Path does not exist",
    nodata: "No data",
    empty: "(Empty)",
  },

  "zh-CN": {
    languageName: "中文",
    appName: "哎哟条漫阅读器",
    menubar: {
      file: {
        file: "文件",
        openZipFile: "打开 *.zip 文件",
        openFolder: "打开文件夹",
        addTag: "添加标签",
        showTagList: "显示标签列表",
        history: "历史",
        clear: "清空",
        setting: "设置",
        exit: "退出",
      },
      language: {
        language: "语言",
      },
      help: {
        help: "帮助",
        homePage: "主页",
        about: "关于",
      },
    },
    about: {
      version: "版本",
      os: "系统",
      nwjs: "NW.js",
      chromium: "Chromium",
      nodejs: "Node.js",
      v8: "V8",
      sharp: "sharp",
    },
    toolbar: {
      zoomout: "缩小",
      zoomin: "放大",
      first: "第一页",
      prev: "上一页",
      next: "下一页",
      last: "下一页",
      tag: "添加标签",
      fullscreen: "全屏",
      leavefullscreen: "退出全屏",
    },
    setting: {
      title: "设置",
      autoLoadHistory: "自动加载历史",
      readSubfolder: "读取子目录",
      backgroundColor: "背景颜色",
      historyCount: "历史数量",
      ok: "确定",
      cancel: "取消",
    },
    tags: {
      title: "标签",
      clear: "清空",
      comment: "标签说明",
    },
    notExist: "路径不存在",
    nodata: "无数据",
    empty: "(空)",
  },
};

export function $t(key) {
  let v = messages[model.locale];
  key.split(".").forEach((k) => {
    v = typeof v === "object" && v ? v[k] : undefined;
  });
  return v !== undefined ? v : key;
}
