import model from "./model.js";

let _onIndexChange;

let firstIndex, curIndex, lastIndex;

const $main = document.querySelector("#main");
const $images = document.querySelector("#images");

// 加载图片
async function loadImage(index) {
  const image = model.images[index];
  if (!image.src) {
    const buffer = await image.zip.entryData(image.name);
    image.src = `data:image/*;base64,${buffer.toString("base64")}`;
  }
  const img = document.createElement("img");
  img.src = image.src;
  img.setAttribute("data-index", index);
  img.setAttribute("title", `${index + 1}/${model.total}: ${image.name}`);
  return new Promise((resolve) => {
    img.onload = () => resolve(img);
    img.onerror = () => {
      img.classList.add("error");
      resolve(img);
    };
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

  // 加载当前页
  const cur = await loadImage(curIndex);
  $images.appendChild(cur);

  // 加载下一页
  if (index < model.total - 1) {
    lastIndex = index + 1;
    const last = await loadImage(lastIndex);
    $images.appendChild(last);
  }

  // 加载上一页
  if (index > 0) {
    firstIndex = index - 1;
    const first = await loadImage(firstIndex);
    $images.insertBefore(first, cur);
    // 滚动到当前页位置
    $main.scrollTop = first.offsetHeight + 1;
  }

  await autoLoad();

  loading = false;
}

// 确保图片的总高度大于容器的高度（可以出现滚动条），避免无法触发滚动加载事件
async function autoLoad() {
  while (
    $images.offsetHeight * model.zoom < $main.offsetHeight &&
    lastIndex < model.total - 1
  ) {
    const last = await loadImage(++lastIndex);
    $images.appendChild(last);
  }
}

// 滚动
let timer = -1;
$main.addEventListener("scroll", () => {
  if (loading) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const imgs = $images.children;
    if (imgs.length === 0) return;

    // 加载上一页
    if ($main.scrollTop < imgs[0].offsetHeight && firstIndex > 0) {
      const first = await loadImage(--firstIndex);
      $images.insertBefore(first, $images.firstChild);
    }

    // 加载下一页
    if (
      $main.scrollTop + $main.offsetHeight >
        $main.scrollHeight - imgs[imgs.length - 1].offsetHeight &&
      lastIndex < model.total - 1
    ) {
      const last = await loadImage(++lastIndex);
      $images.appendChild(last);
    }

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
  }, 100);
});

// 更新缩放比例
async function updateZoom() {
  const scrollTop = $main.scrollTop / model.zoom;
  $main.style.zoom = model.zoom;
  await autoLoad();
  $main.scrollTop = scrollTop * model.zoom;
}

export default {
  onIndexChange: (callback) => (_onIndexChange = callback),
  loadIndex,
  updateZoom,
};
