let _onStorageChange;

function getStorage(key, defaultValue) {
  return localStorage[key] ? JSON.parse(localStorage[key]) : defaultValue;
}
function setStorage(key, value) {
  localStorage[key] = JSON.stringify(value);
}

class StorageItem {
  #data;
  constructor(key, defaultData, initData) {
    this.key = key;
    this.defaultData = defaultData;
    this.initData = initData;
    this.init();
  }
  get data() {
    return this.#data;
  }
  set data(newData) {
    this.#data = newData;
  }
  init() {
    this.#data = Object.assign(
      JSON.parse(JSON.stringify(this.initData)),
      getStorage(this.key, this.defaultData)
    );
  }
  save() {
    setStorage(this.key, this.#data);
  }
}

const storage = {
  locale: new StorageItem(
    "locale",
    {},
    {
      value: navigator.language || process.env.VUE_APP_I18N_LOCALE || "en",
    }
  ),
  setting: new StorageItem(
    "setting",
    {},
    {
      minZoom: 0.25,
      maxZoom: 4,
      autoLoadHistory: true,
      readSubfolder: true,
      backgroundColor: "#000000",
      historyCount: 10,
    }
  ),
  history: new StorageItem("history", [], []),
  tags: new StorageItem("tags", {}, {}),
};

window.addEventListener("storage", ({ key }) => {
  storage[key].init();
  _onStorageChange(key);
});

const { locale, setting, history, tags } = storage;

export default {
  zoom: 1,

  // 图片
  rootPath: "",
  images: [],
  index: -1,
  get total() {
    return this.images.length;
  },

  onStorageChange: (callback) => (_onStorageChange = callback),

  // 语言
  get locale() {
    return locale.data.value;
  },
  set locale(newLocale) {
    locale.data.value = newLocale;
    locale.save();
  },

  // 设置
  get setting() {
    return setting.data;
  },
  set setting(newSetting) {
    setting.data = newSetting;
    setting.save();
  },

  // 历史
  get history() {
    return history.data;
  },
  findHistory(path) {
    return history.data.find((item) => item.path === path);
  },
  addHistory(newItem) {
    const { data } = history;
    const oldIndex = data.findIndex((item) => item.path === newItem.path);
    if (oldIndex !== -1) data.splice(oldIndex, 1);
    data.unshift(newItem);
    history.data = data.slice(0, setting.data.historyCount);
    history.save();
  },
  clearHistory() {
    history.data = [];
    history.save();
  },

  // 标签
  get tags() {
    return tags.data;
  },
  addTag(item) {
    const group = item.path;
    if (!tags.data[group]) tags.data[group] = [];
    tags.data[group].push(item);
    tags.save();
  },
  deleteTag(group, index) {
    if (index !== undefined) {
      tags.data[group].splice(index, 1);
      if (tags.data[group].length === 0) delete tags.data[group];
    } else {
      delete tags.data[group];
    }
    tags.save();
  },
  clearTags() {
    tags.data = {};
    tags.save();
  },
};
