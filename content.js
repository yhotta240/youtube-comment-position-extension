let isEnabled = false; // ツールの有効状態を示すフラグ（初期値は無効）
const manifestData = chrome.runtime.getManifest();
// Sampleツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    console.log(`${manifestData.name} がONになりました`);
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log(`${manifestData.name} がOFFになりました`);
    observer.disconnect();
  }
};

const height = () => {
  const header = document.querySelector('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  return windowHeight - headerHeight - 155;
};

// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
  handleSampleTool(isEnabled);
});

// // ストレージの値が変更されたときに実行される処理
// chrome.storage.onChanged.addListener((changes) => {
//   isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
//   handleSampleTool(isEnabled);
// });

const getElements = () => ({
  below: document.querySelector('#below.style-scope.ytd-watch-flexy'),
  secondary: document.querySelector('#secondary.style-scope.ytd-watch-flexy'),
  secondaryInner: document.querySelector('#secondary-inner.style-scope.ytd-watch-flexy'),
  comments: document.querySelector('#comments.style-scope.ytd-watch-flexy'),
  related: document.querySelector('#related.style-scope.ytd-watch-flexy'),
});

let preRespWidth = null;
let isReloaded = false;
const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.below || !elements.secondary || !elements.secondaryInner) return;
  const isLargeScreen = window.innerWidth >= 1017;

  if (!isReloaded) {
    handleFirstRender(elements, isLargeScreen);
    isReloaded = true;
  } else {
    if (isLargeScreen && preRespWidth === 'medium') {
      console.log("Switched to large screen layout");
      insertSecondary(elements);
    } else if (!isLargeScreen && preRespWidth === 'large') {
      console.log("Switched to medium screen layout");
      insertPrimary(elements);
    }
  }

  preRespWidth = isLargeScreen ? 'large' : 'medium';
});

const handleFirstRender = (elements, isLargeScreen) => {
  console.log("Custom tab is not present, rendering...");
  if (isLargeScreen) {
    console.log("large screen layout");
    insertSecondary(elements);
  } else {
    console.log("medium screen layout");
    insertPrimary(elements);
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
