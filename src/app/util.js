export function $(el) {
  if (el instanceof HTMLElement) return el;
  else if (typeof el === "string") return document.querySelector(el);
}
export function $$(s) {
  return document.querySelectorAll(s);
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
