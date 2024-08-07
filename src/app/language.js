import model from "./model.js";

export const messages = {
  "en": {
    languageName: "English",
    appName: "iYo Webtoon Reader",
    menubar: {
      file: {
        file: "File",
        openZipFile: "Open *.zip File",
        openFolder: "Open Folder",
        showInFileManager: "Show In File Manager",
        addTag: "Add Tag",
        showTagList: "Show Tag List",
        showChapterList: "Show Chapter List",
        history: "History",
        clear: "Clear",
        setting: "Setting",
        openNewWindow: "Open New Window",
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
    dialog: {
      ok: "OK",
      cancel: "Cancel",
    },
    setting: {
      title: "Setting",
      scrollDelta: "Scroll Delta",
      autoLoadHistory: "Auto Load History",
      readSubfolder: "Read Subfolder",
      backgroundColor: "Background Color",
      historyCount: "History Count",
      chapterRule: "Chapter Rule",
      displayPage: "(Fullscreen) Display Page",
      displayTime: "(Fullscreen) Display Time",
    },
    tags: {
      tags: "Tags",
      chapters: "Chapters",
      add: "Add",
      clear: "Clear",
      tag: "Tag",
      page: "Page",
      comment: "Comment",
      updatePage: "Update Page",
    },
    notExist: "Path does not exist",
    nodata: "No data",
    empty: "(Empty)",
    contextmenu: {
      saveImage: "Save Image",
    },
  },

  "zh-CN": {
    languageName: "中文",
    appName: "哎哟条漫阅读器",
    menubar: {
      file: {
        file: "文件",
        openZipFile: "打开 *.zip 文件",
        openFolder: "打开文件夹",
        showInFileManager: "在文件管理器中显示",
        addTag: "添加书签",
        showTagList: "显示书签列表",
        showChapterList: "显示章节列表",
        history: "历史",
        clear: "清空",
        setting: "设置",
        openNewWindow: "打开新窗口",
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
      tag: "添加书签",
      fullscreen: "全屏",
      leavefullscreen: "退出全屏",
    },
    dialog: {
      ok: "确定",
      cancel: "取消",
    },
    setting: {
      title: "设置",
      scrollDelta: "滚动大小",
      autoLoadHistory: "自动加载历史",
      readSubfolder: "读取子目录",
      backgroundColor: "背景颜色",
      historyCount: "历史数量",
      chapterRule: "章节规则",
      displayPage: "（全屏）显示页码",
      displayTime: "（全屏）显示时间",
    },
    tags: {
      tags: "书签",
      chapters: "章节",
      add: "添加",
      clear: "清空",
      tag: "书签",
      page: "页码",
      comment: "描述",
      setPage: "更新页码",
    },
    notExist: "路径不存在",
    nodata: "无数据",
    empty: "(空)",
    contextmenu: {
      saveImage: "保存图片",
    },
  },
};

export function $t(key) {
  let v = messages[model.locale];
  key.split(".").forEach((k) => {
    v = typeof v === "object" && v ? v[k] : undefined;
  });
  return v !== undefined ? v : key;
}
