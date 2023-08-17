function getStorage(key, defaultValue) {
  return localStorage[key] ? JSON.parse(localStorage[key]) : defaultValue;
}
function setStorage(key, value) {
  localStorage[key] = JSON.stringify(value);
}

let _setting = Object.assign(
  {
    locale: navigator.language || process.env.VUE_APP_I18N_LOCALE || "en",
    minZoom: 0.25,
    maxZoom: 4,
    autoLoadHistory: true,
    readSubfolder: true,
    backgroundColor: "#000000",
    historyCount: 10,
  },
  getStorage("setting", {})
);
let _history = getStorage("history", []);
let _tags = getStorage("tags", {});

export default {
  zoom: 1,

  // 图片
  rootPath: "",
  images: [],
  index: -1,
  get total() {
    return this.images.length;
  },

  // 设置
  get setting() {
    return _setting;
  },
  set setting(obj) {
    _setting = obj;
    setStorage("setting", _setting);
  },

  // 历史
  get history() {
    return _history;
  },
  findHistory(path) {
    return _history.find((item) => item.path === path);
  },
  addHistory(newItem) {
    const oldIndex = _history.findIndex((item) => item.path === newItem.path);
    if (oldIndex !== -1) _history.splice(oldIndex, 1);
    _history.unshift(newItem);
    _history = _history.slice(0, _setting.historyCount);
    setStorage("history", _history);
  },
  clearHistory() {
    _history = [];
    setStorage("history", _history);
  },

  // 标签
  get tags() {
    return _tags;
  },
  addTag(item) {
    const group = item.path;
    if (!_tags[group]) _tags[group] = [];
    _tags[group].push(item);
    setStorage("tags", _tags);
  },
  deleteTag(group, index) {
    if (index !== undefined) {
      _tags[group].splice(index, 1);
      if (_tags[group].length === 0) delete _tags[group];
    } else {
      delete _tags[group];
    }
    setStorage("tags", _tags);
  },
  clearTags() {
    _tags = {};
    setStorage("tags", _tags);
  },
};
