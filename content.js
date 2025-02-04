let isEnabled = false;
let settings = {};

const manifestData = chrome.runtime.getManifest();
// Sampleツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    console.log(`${manifestData.name} がONになりました`);
    observer.observe(document.body, { childList: true, subtree: true });
    removeCinematics();
  } else {
    console.log(`${manifestData.name} がOFFになりました`);
    observer.disconnect();
  }
};


// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;

  handleSampleTool(isEnabled);
});

// // ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  handleSampleTool(isEnabled);
});


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
  cinematics: document.querySelector("#cinematics > div > div")
});

let preRespWidth = null;
let isReloaded = false;
let preUrl = null;

const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.primary || !elements.below || !elements.secondary || !elements.secondaryInner) return;
  const isLargeScreen = window.innerWidth >= 1017;

  if (!isReloaded) {
    handleFirstRender(elements, isLargeScreen);
    isReloaded = true;
  } else {
    if (isLargeScreen && preRespWidth === 'medium') {
      console.log("Switched to large screen layout");
      insertSecondary(elements);
      fixationPlayer(elements);
    } else if (!isLargeScreen && preRespWidth === 'large') {
      console.log("Switched to medium screen layout");
      insertPrimary(elements);
      unlockFixationPlayer(elements);
    }
  }

  const url = new URL(window.location.href);
  const currentVideoId = url.searchParams.get("v");

  if (preUrl !== currentVideoId && preUrl) {
    console.log("URL changed!");
    removeCinematics();
    preUrl = currentVideoId;
  } else {
    preUrl = currentVideoId;
  }

  preRespWidth = isLargeScreen ? 'large' : 'medium';
});

const handleFirstRender = (elements, isLargeScreen) => {
  console.log("Custom tab is not present, rendering...");
  if (isLargeScreen) {
    console.log("large screen layout");
    insertSecondary(elements);
    fixationPlayer(elements);
  } else {
    console.log("medium screen layout");
    insertPrimary(elements);
    unlockFixationPlayer(elements);
  }
};

const insertSecondary = (elements) => {
  const comments = elements.comments;
  styleComments(comments);
  elements.secondaryInner.insertBefore(comments, elements.secondaryInner.firstChild);
};

const insertPrimary = (elements) => {
  const comments = elements.comments;
  styleComments(comments);
  elements.below.appendChild(comments);
  setTimeout(() => {
    elements.below.appendChild(elements.related);
  }, 100);
};

const styleComments = (comments) => {
  comments.style.padding = '0 10px 0 10px';
  comments.style.margin = '0 0 20px 0';
  comments.style.maxHeight = `${height()}px`;
  comments.style.overflowY = 'auto';
};

const fixationPlayer = (elements) => {
  const player = elements.player;
  player.style.position = 'fixed';
  player.style.width = '100%'; // 親要素の幅に合わせる
  player.style.zIndex = '999';
  window.addEventListener('resize', handleResize);
}

const unlockFixationPlayer = (elements) => {
  const player = elements.player;
  player.style.position = 'relative';
  console.log('unlockFixationPlayer');
  elements.below.style.paddingTop = `${0}px`;
}

const handleResize = () => {
  setTimeout(() => {
    const isLargeScreen = window.innerWidth >= 1017;
    const elements = getElements();
    if (!elements.primary) return;
    const primaryInner = elements.primaryInner;
    const primaryInnerWidth = primaryInner.offsetWidth;
    const playerHeight = elements.player.offsetHeight;
    elements.player.style.maxWidth = primaryInnerWidth + 'px'; // 親要素の幅に合わせる
    if (isLargeScreen) {
      elements.below.style.paddingTop = `${primaryInnerWidth * (9 / 16)}px`;
    } else {
      elements.below.style.paddingTop = '0px';
    }
    // console.log(playerHeight, primaryInnerWidth, primaryInnerWidth * (9 / 16), window.innerWidth);
  }, 100);
};

const height = () => {
  const header = document.querySelector('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  return windowHeight - headerHeight - 155;
};

const removeCinematics = () => {
  let attempts = 0;
  const interval = setInterval(() => {
    const cinematics = getElements().cinematics;
    console.log('cinematics', cinematics);
    if (cinematics) {
      cinematics.remove();
      console.log('cinematics removed');
      clearInterval(interval);
    }
    attempts++;
    if (attempts >= 10) {
      clearInterval(interval);
      console.log('Max attempts reached, stopping interval');
    }
  }, 1000);
};



