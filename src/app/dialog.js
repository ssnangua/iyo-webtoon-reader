document.querySelectorAll(".dialog-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".dialog-modal").style.display = "none";
  });
});

export default {
  open(selector) {
    this.closeAll();
    document.querySelector(selector).style.display = "block";
  },
  close(selector) {
    document.querySelector(selector).style.display = "none";
  },
  closeAll() {
    document.querySelectorAll(".dialog-modal").forEach((dialog) => {
      dialog.style.display = "none";
    });
  },
};
