export function $(el) {
  if (el instanceof HTMLElement) return el;
  else if (typeof el === "string") return document.querySelector(el);
}
export function $$(s) {
  return document.querySelectorAll(s);
}

export function throttle(fn, delay) {
  let timestamp = 0;
  let timer = -1;
  return function () {
    let now = Date.now();
    if (now - timestamp > delay) {
      fn.apply(this, arguments);
      timestamp = now;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

// dialog
export const dialog = {
  visible: {},
  isOpen(el) {
    return this.visible[$(el)] === true;
  },
  open(el) {
    this.closeAll();
    $(el).classList.remove("hide");
    this.visible[$(el)] = true;
  },
  close(el) {
    $(el).classList.add("hide");
    this.visible[$(el)] = false;
  },
  closeAll() {
    $$(".dialog-modal").forEach((dialog) => {
      dialog.classList.add("hide");
      this.visible[dialog] = false;
    });
  },
};
$$("[dialog-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    dialog.close(btn.closest(".dialog-modal"));
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") dialog.closeAll();
});

// menu
export function createMenu(items, option = { type: "contextmenu" }) {
  const menu = new nw.Menu(option);
  items.forEach((item) => {
    menu.append(new nw.MenuItem(item));
  });
  return menu;
}
