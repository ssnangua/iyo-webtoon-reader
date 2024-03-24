import model from "./model.js";
import { throttle } from "./util.js";
import contextmenu from "./contextmenu.js";

let _onIndexChange;

let firstIndex, curIndex, lastIndex, prevScreenHeight;
let scrollTop;

const $imagesContainer = document.querySelector("#images-container");
const $images = document.querySelector("#images");

// 加载图片
async function loadImage(index) {
  const image = model.images[index];
  if (image.img) return image.img;
  if (!image.src) {
    image.buffer = await image.zip.entryData(image.name);
    image.src = `data:image/*;base64,${image.buffer.toString("base64")}`;
  }
  return new Promise((resolve) => {
    const img = new Image();
    image.img = img;
    img.setAttribute("data-index", index);
    img.setAttribute("title", `${index + 1}/${model.total}: ${image.name}`);
    img.addEventListener("load", () => {
      img.width = image.width = img.naturalWidth;
      img.height = image.height = img.naturalHeight;
      resolve(img);
    });
    img.addEventListener("error", () => {
      img.classList.add("error");
      resolve(img);
    });
    img.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      contextmenu.popup(image, e.clientX, e.clientY);
      return false;
    });
    img.src = image.src;
  });
}

// 跳转到指定页码
let loading = false;
async function loadIndex(index) {
  if (loading) return;
  if (index < 0) return;
  if (index > model.total - 1) index = model.total - 1;
  loading = true;

  $images.innerHTML = "";
  firstIndex = curIndex = lastIndex = index;
  prevScreenHeight = 0;

  // 加载当前页
  const cur = await loadImage(curIndex);
  $images.append(cur);

  // 加载上一屏、当前屏、下一屏
  scrollTop = await loadPrevScreen();
  await loadCurAndNextScreen();

  // 滚动到当前页位置
  $imagesContainer.scrollTop = scrollTop + 1;

  loading = false;
}

function getTotalHeight(fromIndex, toIndex) {
  let total = 0;
  for (let i = fromIndex; i < toIndex; i++) {
    total += model.images[i].height;
  }
  return total;
}
// 加载上一屏
async function loadPrevScreen() {
  const containerHeight = $imagesContainer.offsetHeight;
  let totalHeight = getTotalHeight(firstIndex, curIndex);
  let prependHeight = 0;
  while (((totalHeight + prependHeight) * model.zoom < containerHeight || firstIndex === curIndex) && firstIndex > 0) {
    const img = await loadImage(--firstIndex);
    prependHeight += img.naturalHeight;
    $images.prepend(img);
  }
  return prependHeight;
}
// 加载当前屏和下一屏
async function loadCurAndNextScreen() {
  const containerHeight = $imagesContainer.offsetHeight;
  let totalHeight = getTotalHeight(curIndex, lastIndex);
  let appendHeight = 0;
  while (((totalHeight + appendHeight) * model.zoom < containerHeight * 2 || Math.abs(lastIndex - curIndex) < 2) && lastIndex < model.total - 1) {
    const img = await loadImage(++lastIndex);
    appendHeight += img.naturalHeight;
    $images.appendChild(img);
  }
  return appendHeight;
}

$images.addEventListener("mousewheel", (e) => {
  if (loading) return;
  const y = model.setting.scrollDelta * (e.deltaY > 0 ? 1 : -1);
  scrollBy(y);
});

function scrollBy(y) {
  $imagesContainer.scrollBy(0, y);
  onScroll(y);
}

// 滚动
const onScroll = throttle(async (deltaY) => {
  if (loading) return;

  const imgs = $images.children;
  if (imgs.length === 0) return;

  // 更新当前页码
  for (let i = imgs.length - 1; i >= 0; i--) {
    const img = imgs[i];
    if (img.getBoundingClientRect().top <= 0) {
      const index = parseInt(img.dataset.index);
      if (curIndex !== index) {
        curIndex = index;
        _onIndexChange(curIndex);
      }
      break;
    }
  }

  if (deltaY < 0) $imagesContainer.scrollTop += await loadPrevScreen();
  else await loadCurAndNextScreen();

  scrollTop = $imagesContainer.scrollTop;
}, 100);

// $imagesContainer.addEventListener("scroll", onScroll);

// 更新缩放比例
async function updateZoom() {
  const scrollTop = $imagesContainer.scrollTop / model.zoom;
  $imagesContainer.style.zoom = model.zoom;
  await loadPrevScreen();
  await loadCurAndNextScreen();
  $imagesContainer.scrollTop = scrollTop * model.zoom;
}

export default {
  onIndexChange: (callback) => (_onIndexChange = callback),
  loadIndex,
  updateZoom,
  scrollBy,
};
