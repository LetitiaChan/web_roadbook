const journey = [
  {
    day: "D1",
    title: "茶卡盐湖",
    titleLines: ["茶卡盐湖"],
    route: "西宁 → 青海湖 → 茶卡镇",
    mileage: "300km",
    caption: "湖风把第一天吹成蓝色。",
    image: "assets/p_01.JPG",
    photoFocus: "50% 62%",
  },
  {
    day: "D2",
    title: "翡翠湖",
    titleLines: ["翡翠湖"],
    route: "茶卡镇 → 德令哈 → 大柴旦",
    mileage: "350km",
    caption: "绿色盐湖在暮色里亮起来。",
    image: "assets/p_02.JPG",
    photoFocus: "50% 55%",
  },
  {
    day: "D3",
    title: "中国版66号公路",
    titleLines: ["中国版", "66号公路"],
    route: "大柴旦 → 冷湖镇",
    mileage: "300km",
    caption: "公路笔直，戈壁把视线推向远方。",
    image: "assets/p_03.JPG",
    photoFocus: "50% 62%",
  },
  {
    day: "D4",
    title: "黑独山",
    titleLines: ["黑独山"],
    route: "冷湖全天",
    mileage: "100km",
    caption: "黑色山体像月面，风从火星吹过。",
    image: "assets/p_04.JPG",
    photoFocus: "50% 66%",
  },
  {
    day: "D5",
    title: "鸣沙山月牙泉",
    titleLines: ["鸣沙山", "月牙泉"],
    route: "冷湖 → 敦煌",
    mileage: "260km",
    caption: "沙丘收住落日，月泉留住最后一束光。",
    image: "assets/p_05.JPG",
    photoFocus: "50% 46%",
  },
  {
    day: "D6",
    title: "莫高窟+返程",
    titleLines: ["莫高窟", "返程"],
    route: "敦煌 → 飞回",
    mileage: "返程",
    caption: "壁画、机场、归途，故事在敦煌收束。",
    image: "assets/p_06.JPG",
    photoFocus: "50% 48%",
  },
];

const portraitImageExtensions = ["PNG", "JPG", "JPEG", "WEBP"];
const dwellExpandDelay = 1000;
const supportsDwellExpand = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const sceneImages = {
  cover: "assets/cover.JPG",
  food: "assets/p_07.JPG",
  back: "assets/back.JPG",
};

const dayNav = document.querySelector("#dayNav");
const routeMap = document.querySelector("#routeMap");
const storyFrames = document.querySelector("#storyFrames");
const range = document.querySelector("#journeyRange");
const ambientImage = document.querySelector("#ambientImage");
const activeTitle = document.querySelector("#activeTitle");
const activeCaption = document.querySelector("#activeCaption");
const activeRoute = document.querySelector("#activeRoute");
const activeMileage = document.querySelector("#activeMileage");

let currentIndex = 0;
let manualScrollTimer = 0;
let currentAmbientScene = "cover";

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

function setImageWithFallback(image, sources) {
  const candidates = (Array.isArray(sources) ? sources : [sources]).filter(Boolean);
  let sourceIndex = 0;

  image.classList.remove("is-missing");
  image.onload = () => image.classList.remove("is-missing");
  image.onerror = () => {
    sourceIndex += 1;
    if (sourceIndex < candidates.length) {
      image.src = candidates[sourceIndex];
      return;
    }
    image.classList.add("is-missing");
  };

  if (candidates.length === 0) {
    image.classList.add("is-missing");
    return;
  }

  image.src = candidates[sourceIndex];
}

function setAmbientImage(src) {
  if (!ambientImage || ambientImage.getAttribute("src") === src) {
    return;
  }
  setImageWithFallback(ambientImage, src);
}

function getAmbientSceneAtViewport() {
  const viewportLine = window.innerHeight * 0.5;
  const scenes = [...document.querySelectorAll("[data-scene]")];
  const currentScene = scenes.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= viewportLine && rect.bottom >= viewportLine;
  });

  return currentScene?.dataset.scene ?? currentAmbientScene;
}

function syncAmbientToViewportScene(dayImage = journey[currentIndex].image) {
  const scene = getAmbientSceneAtViewport();
  currentAmbientScene = scene;

  if (scene === "story") {
    setAmbientImage(dayImage);
    return;
  }

  if (sceneImages[scene]) {
    setAmbientImage(sceneImages[scene]);
  }
}

function renderNavigation() {
  journey.forEach((stop, index) => {
    const button = createElement("button", "day-nav__button", stop.day);
    button.type = "button";
    button.setAttribute("aria-label", `${stop.day} ${stop.title}`);
    button.addEventListener("click", () => {
      setActiveScene(index, true);
    });
    dayNav.append(button);
  });
}

function renderRouteMap() {
  journey.forEach((stop) => {
    const item = createElement("article", "route-stop");
    const day = createElement("strong", "", stop.day);
    const title = createElement("span", "", stop.title);
    const mileage = createElement("span", "", stop.mileage);
    item.append(day, title, mileage);
    routeMap.append(item);
  });
}

function getPortraitImageCandidates(index, fallbackSrc) {
  const dayNumber = String(index + 1).padStart(2, "0");
  const portraitBase = `assets/p_${dayNumber}_a`;
  return [...portraitImageExtensions.map((extension) => `${portraitBase}.${extension}`), fallbackSrc];
}

function renderActiveTitle(stop) {
  const titleLines = stop.titleLines?.length ? stop.titleLines : [stop.title];
  const lineElements = titleLines.map((line, lineIndex) => {
    const titleLine = createElement(
      "span",
      "active-title__line",
      lineIndex === 0 ? `${stop.day} ${line}` : line,
    );
    return titleLine;
  });

  activeTitle.replaceChildren(...lineElements);
}

function setCardExpanded(card, isExpanded) {
  const toggle = card.querySelector(".scene-card__toggle");
  const details = card.querySelector(".scene-card__copy");

  card.classList.toggle("is-expanded", isExpanded);
  toggle?.setAttribute("aria-expanded", String(isExpanded));
  details?.setAttribute("aria-hidden", String(!isExpanded));
}

function expandOnlyCard(card, index) {
  setActiveScene(index);
  document.querySelectorAll(".scene-card").forEach((sceneCard) => {
    setCardExpanded(sceneCard, sceneCard === card);
  });
}

function bindDwellExpand(card, photo, toggle, index) {
  if (!supportsDwellExpand) {
    return () => {};
  }

  let dwellTimer = 0;

  const clearDwellTimer = () => {
    window.clearTimeout(dwellTimer);
    dwellTimer = 0;
  };

  const scheduleDwellExpand = () => {
    if (card.classList.contains("is-expanded")) {
      return;
    }

    clearDwellTimer();
    dwellTimer = window.setTimeout(() => {
      expandOnlyCard(card, index);
      dwellTimer = 0;
    }, dwellExpandDelay);
  };

  photo.addEventListener("mouseenter", scheduleDwellExpand);
  photo.addEventListener("mouseleave", clearDwellTimer);
  toggle.addEventListener("focus", scheduleDwellExpand);
  toggle.addEventListener("blur", clearDwellTimer);

  return clearDwellTimer;
}

function renderFrames() {
  journey.forEach((stop, index) => {
    const card = createElement("article", "scene-card");
    card.id = `day-${index + 1}`;
    card.dataset.index = String(index);
    const detailsId = `${card.id}-details`;

    const photo = createElement("div", "scene-card__photo");
    photo.style.setProperty("--photo-focus", stop.photoFocus);
    const image = document.createElement("img");
    image.alt = `${stop.day} ${stop.title}`;
    image.loading = index > 1 ? "lazy" : "eager";
    image.decoding = "async";
    setImageWithFallback(image, getPortraitImageCandidates(index, stop.image));

    const copy = createElement("div", "scene-card__copy");
    copy.id = detailsId;
    copy.setAttribute("aria-hidden", "true");
    copy.append(
      createElement("h3", "", stop.title),
      createElement("p", "", stop.caption),
      createElement("span", "scene-card__route", stop.route),
      createElement("span", "scene-card__mileage", stop.mileage),
    );

    const toggle = createElement("button", "scene-card__toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-label", `查看${stop.day} ${stop.title}路线详情`);
    toggle.setAttribute("aria-controls", detailsId);
    toggle.setAttribute("aria-expanded", "false");
    const clearDwellExpand = bindDwellExpand(card, photo, toggle, index);
    toggle.addEventListener("click", () => {
      clearDwellExpand();
      const shouldExpand = !card.classList.contains("is-expanded");
      if (shouldExpand) {
        expandOnlyCard(card, index);
        return;
      }

      setCardExpanded(card, false);
    });
    photo.append(image, copy, toggle);

    card.append(photo);
    storyFrames.append(card);
  });
}

function updateRouteProgress(index) {
  const progress = journey.length === 1 ? 100 : (index / (journey.length - 1)) * 100;
  routeMap.style.setProperty("--route-progress", `${progress}%`);

  document.querySelectorAll(".route-stop").forEach((stop, stopIndex) => {
    stop.classList.toggle("is-active", stopIndex === index);
    stop.classList.toggle("is-passed", stopIndex <= index);
  });
}

function updateNavigation(index) {
  document.querySelectorAll(".day-nav__button").forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
}

function updateCards(index) {
  document.querySelectorAll(".scene-card").forEach((card, cardIndex) => {
    const isActive = cardIndex === index;
    card.classList.toggle("is-active", isActive);
    if (!isActive) {
      setCardExpanded(card, false);
    }
  });
}

function setActiveScene(index, shouldScroll = false, updateAmbient = true) {
  const nextIndex = Math.max(0, Math.min(index, journey.length - 1));
  const stop = journey[nextIndex];
  currentIndex = nextIndex;

  renderActiveTitle(stop);
  activeCaption.textContent = stop.caption;
  activeRoute.textContent = stop.route;
  activeMileage.textContent = stop.mileage;
  range.value = String(nextIndex);

  if (updateAmbient) {
    syncAmbientToViewportScene(stop.image);
  }
  updateNavigation(nextIndex);
  updateRouteProgress(nextIndex);
  updateCards(nextIndex);

  if (shouldScroll) {
    window.clearTimeout(manualScrollTimer);
    manualScrollTimer = window.setTimeout(() => {
      document.querySelector(`#day-${nextIndex + 1}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 30);
  }
}

function observeJourneyFrames() {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      const index = Number(visible.target.dataset.index);
      if (Number.isInteger(index)) {
        setActiveScene(index);
      }
    },
    {
      root: null,
      rootMargin: "-30% 0px -35% 0px",
      threshold: [0.2, 0.4, 0.6],
    },
  );

  document.querySelectorAll(".scene-card").forEach((card) => observer.observe(card));
}

function observeAmbientSections() {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      syncAmbientToViewportScene();
    },
    {
      rootMargin: "-20% 0px -40% 0px",
      threshold: [0.25, 0.55],
    },
  );

  document.querySelectorAll("[data-scene]").forEach((section) => sectionObserver.observe(section));
}

function bindRangeControl() {
  range.max = String(journey.length - 1);
  range.addEventListener("input", (event) => {
    const index = Number(event.target.value);
    if (Number.isInteger(index)) {
      setActiveScene(index);
    }
  });
  range.addEventListener("change", (event) => {
    const index = Number(event.target.value);
    if (Number.isInteger(index)) {
      setActiveScene(index, true);
    }
  });
}

function init() {
  renderNavigation();
  renderRouteMap();
  renderFrames();
  bindRangeControl();
  setImageWithFallback(ambientImage, sceneImages.cover);
  observeJourneyFrames();
  observeAmbientSections();
  setActiveScene(0, false, false);
}

init();
