let isEnabled = false;
let settings = {};

const settingsURL = chrome.runtime.getURL("popup/settings.js");
const manifestData = chrome.runtime.getManifest();

// Sampleツールの有効/無効を処理する関数
const handleEnabled = (isEnabled) => {
  if (isEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
};

// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled'], async (data) => {
  const { DEFAULT_SETTINGS, migrateSettings } = await import(settingsURL);

  isEnabled = data.isEnabled || isEnabled;
  settings = migrateSettings(data.settings) || DEFAULT_SETTINGS;
  handleEnabled(isEnabled);
});

const pageManager = () => {
  const pageManager = document.querySelectorAll("#page-manager > ytd-watch-flexy");
  const isTwoColumn = pageManager[0].attributes["default-two-column-layout"];
  const isTwoColumns = pageManager[0].attributes["is-two-columns_"]
  // const isThreeColumns = pageManager[0].attributes.length
  // console.log("pageManager", isTwoColumn, isTwoColumns, isThreeColumns);
  return !(isTwoColumn === undefined) && !(isTwoColumns === undefined);
};

const getElements = () => ({
  primary: document.querySelector("#primary.style-scope.ytd-watch-flexy"),
  primaryInner: document.querySelector("#primary-inner.style-scope.ytd-watch-flexy"),
  player: document.querySelector('#player.style-scope.ytd-watch-flexy'),
  playerContainerOuter: document.querySelector("#player-container-outer.style-scope.ytd-watch-flexy"),
  below: document.querySelector('#below.style-scope.ytd-watch-flexy'),
  secondary: document.querySelector('#secondary.style-scope.ytd-watch-flexy'),
  secondaryInner: document.querySelector('#secondary-inner.style-scope.ytd-watch-flexy'),
  comments: document.querySelector('#comments.style-scope.ytd-watch-flexy'),
  related: document.querySelector('#related.style-scope.ytd-watch-flexy'),
  cinematics: document.querySelector("#cinematics > div > div"),
  metaData: document.querySelector("#below > ytd-watch-metadata"),
  ytdApp: document.querySelector('ytd-app'),
  ytdWatchFlexy: document.querySelector("ytd-app ytd-watch-flexy"),
  fullBleed: document.querySelector("#full-bleed-container.style-scope.ytd-watch-flexy")
});

const settingsLayout = () => ({
  isLargeDefaultPosition: settings.largeLayout.position === "large-position-default",
  isLargeStickyPlayer: settings.largeLayout.options.stickyPlayer.option,
  isMediumDefaultPosition: settings.mediumLayout.position === "medium-position-default",
  isMediumStickyPlayer: settings.mediumLayout.options.stickyPlayer.option,
  largeLayoutPosition: settings.largeLayout.position,
  mediumLayoutPosition: settings.mediumLayout.position,
  largeHeight: settings.largeLayout.height,
  mediumHeight: settings.mediumLayout.height
});


let preRespWidth = null;
let isReloaded = false;
let preUrl = null;

const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.primary || !elements.below || !elements.secondary || !elements.secondaryInner) return;
  const isLargeScreen = pageManager();

  if (!isReloaded) {
    handleFirstRender(elements, isLargeScreen);

    isReloaded = true;
  } else {
    if (isLargeScreen && preRespWidth === 'medium') {
      // console.log("Switched to large screen layout");
      insertSecondary(elements);
      unlockFixationPlayer(isLargeScreen);
      fixationPlayer(elements, isLargeScreen);
    } else if (!isLargeScreen && preRespWidth === 'large') {
      // console.log("Switched to medium screen layout");
      insertPrimary(elements);
      unlockFixationPlayer(isLargeScreen);
      fixationPlayer(elements, isLargeScreen);
    }
  }

  const url = new URL(window.location.href);
  const currentVideoId = url.searchParams.get("v");

  if (preUrl !== currentVideoId) {
    // console.log("URL changed!");
    handleFirstRender(elements, isLargeScreen);
    preUrl = currentVideoId;
  } else {
    preUrl = currentVideoId;
  }
  removeCinematics();

  preRespWidth = isLargeScreen ? 'large' : 'medium';
});

const handleFirstRender = (elements, isLargeScreen) => {
  // console.log("Custom tab is not present, rendering...");

  if (isLargeScreen) {
    // console.log("large screen layout");
    insertSecondary(elements);
    fixationPlayer(elements, isLargeScreen);
  } else if (!isLargeScreen) {
    // console.log("medium screen layout");
    insertPrimary(elements);
    fixationPlayer(elements, isLargeScreen);
  }
};

const insertSecondary = (elements) => {
  const { isLargeDefaultPosition, largeLayoutPosition } = settingsLayout();
  const comments = elements.comments;
  const related = elements.related;
  styleComments(comments, isLargeDefaultPosition);
  if (!isLargeDefaultPosition) {
    if (largeLayoutPosition === "large-position-leftside") {
      elements.secondaryInner.insertBefore(comments, elements.secondaryInner.firstChild);
    }
    else if (largeLayoutPosition === "large-position-leftside-bottom") {
      elements.secondaryInner.insertBefore(comments, related);
    }
    else if (largeLayoutPosition === "large-position-switch") {
      elements.secondaryInner.appendChild(comments);
      setTimeout(() => {
        elements.below.appendChild(related);
      }, 100);
    }
  }
};

const insertPrimary = (elements) => {
  // フルスクリーン中はなにもしない
  if (isFullscreen()) return;

  const { isMediumDefaultPosition, mediumLayoutPosition } = settingsLayout();
  const comments = elements.comments;
  const metaData = elements.metaData;
  styleComments(comments, isMediumDefaultPosition);

  if (isMediumDefaultPosition) {
    elements.below.appendChild(comments);
    setTimeout(() => {
      elements.below.insertBefore(elements.related, comments);
    }, 100);
    return;
  }

  if (mediumLayoutPosition === "medium-position-underplayer") {
    // elements.below.insertBefore(comments, elements.below.firstChild);
    elements.below.insertBefore(comments, metaData);
  } else if (mediumLayoutPosition === "medium-position-undermetadata") {
    elements.below.appendChild(comments);
  }
  setTimeout(() => {
    elements.below.appendChild(elements.related);
  }, 100);
};

const styleComments = (comments, isDefaultPosition) => {
  if (isDefaultPosition) {
    comments.style.padding = 0;
    comments.style.margin = 0;
    comments.style.maxHeight = 'none';
    comments.style.overflowY = 'none';
    return;
  };
  comments.style.position = 'relative';
  comments.style.padding = '0 10px 0 10px';
  comments.style.margin = '0 0 20px 0';
  comments.style.maxHeight = `${height()}px`;
  comments.style.overflowY = 'auto';

};

const fixationPlayer = (elements, isLargeScreen) => {
  const { isLargeDefaultPosition, isLargeStickyPlayer, isMediumDefaultPosition, isMediumStickyPlayer } = settingsLayout();
  const { player, ytdWatchFlexy, fullBleed } = elements;

  if (!player || !ytdWatchFlexy || !fullBleed) return;

  // offsetTopが計算されるのを待ってからstickyを適用するヘルパー関数
  const applyStickyWhenReady = (targetElement) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (ytdWatchFlexy.offsetTop !== 0) {
        sticky(targetElement, ytdWatchFlexy.offsetTop);
        clearInterval(interval);
      } else if (attempts > 20) { // 2秒後にタイムアウト
        clearInterval(interval);
      }
    }, 100);
  };

  if (isLargeScreen) {
    // Large screen layout
    if (!isLargeDefaultPosition && isLargeStickyPlayer) {
      applyStickyWhenReady(player);
    }
  } else {
    // Medium screen layout
    if (!isMediumDefaultPosition && isMediumStickyPlayer) {
      applyStickyWhenReady(fullBleed);
    }
  }
};

const unlockFixationPlayer = (isLargeScreen) => {
  const { isLargeDefaultPosition, isLargeStickyPlayer, isMediumDefaultPosition, isMediumStickyPlayer } = settingsLayout();
  const elements = getElements();
  // console.log(' large layout unlockFixationPlayer', isLargeDefaultPosition, !isLargeStickyPlayer, isLargeScreen, ":", (isLargeDefaultPosition || !isLargeStickyPlayer) && isLargeScreen);
  if ((isLargeDefaultPosition || !isLargeStickyPlayer) && isLargeScreen) {
    // console.log('large layout unlockFixationPlayer', elements.below);
    const player = elements.player;
    player.style.top = '0';
    player.style.position = 'relative';
  }
  // console.log('medium layout unlockFixationPlayer', isMediumDefaultPosition, !isMediumStickyPlayer, !isLargeScreen, ":", (isMediumDefaultPosition || !isMediumStickyPlayer) && !isLargeScreen);
  if ((isMediumDefaultPosition || !isMediumStickyPlayer) && !isLargeScreen) {
    // console.log('medium layout unlockFixationPlayer');
    const player = elements.player;
    player.style.top = '0';
    player.style.position = 'relative';
  }
}


const height = () => {
  const header = document.querySelector('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  // console.log(headerHeight, windowHeight, windowHeight - headerHeight - 155);
  const isLargeScreen = pageManager();
  let height = null;
  if (isLargeScreen) {
    height = settingsLayout().largeHeight;
    settings.largeLayout.height = height ? height : windowHeight - headerHeight - 155;
  } else {
    height = settingsLayout().mediumHeight;
    settings.mediumLayout.height = height ? height : windowHeight - headerHeight - 205;
  }
  chrome.storage.local.set({ settings: settings });
  return height ? height : windowHeight - headerHeight - 155;
};


const removeCinematics = () => {
  let attempts = 0;
  const interval = setInterval(() => {
    const cinematics = getElements().cinematics;
    if (cinematics) {
      cinematics.remove();
      clearInterval(interval);
    }
    attempts++;
    if (attempts >= 10) {
      clearInterval(interval);
    }
  }, 1000);
};


/** フルスクリーン判定 */
function isFullscreen() {
  return document.fullscreenElement;
}

/** Elementをstickyにする */
function sticky(target, top) {
  const ytdApp = getElements().ytdApp;
  const parentElement = target.parentElement;
  if (!ytdApp || !parentElement) return;
  ytdApp.style.overflow = 'visible';

  target.style.position = 'sticky';
  target.style.zIndex = '1000';
  target.style.top = `${top}px`;
  parentElement.style.height = "100%";
};