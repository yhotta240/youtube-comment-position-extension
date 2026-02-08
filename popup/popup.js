import { DEFAULT_SETTINGS } from './settings.js';

// 初期化処理
let isEnabled = false;
const enabledElement = document.getElementById('enabled');
const messageDiv = document.getElementById('message');
const manifestData = chrome.runtime.getManifest();

const imagesPosition = {
  "large-position-default": "./images/large-layout-comments-default.png",
  "large-position-leftside": "./images/large-layout-comments-secondary.png",
  "large-position-leftside-bottom": "./images/large-layout-comments-secondary-bottom.png",
  "large-position-switch": "./images/large-layout-comments-related-switch.png",
  "medium-position-default": "./images/medium-layout-comments-default.png",
  "medium-position-undermetadata": "./images/medium-layout-comments-under-metadata.png",
  "medium-position-underplayer": "./images/medium-layout-comments-under-player.png",
};

// チェックボックス（トグルボタン）の状態が変更されたとき，ツールの有効/無効状態を更新
enabledElement.addEventListener('change', (event) => {
  isEnabled = event.target.checked;
  chrome.storage.local.set({ isEnabled: isEnabled }, () => {
    messageOutput(dateTime(), isEnabled ? `${manifestData.name} はONになっています` : `${manifestData.name} はOFFになっています`);
  });
});

// 保存された設定（'settings'と'isEnabled'）を読み込む
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false;
    enabledElement.checked = isEnabled;
  }
  popupLoad(data.settings);
  messageOutput(dateTime(), isEnabled ? `${manifestData.name} はONになっています` : `${manifestData.name} はOFFになっています`);
});

function popupLoad(settingData) {
  if (!settingData) {
    settingData = DEFAULT_SETTINGS;
    chrome.storage.local.set({ settings: settingData });
  };
  const settings = settingData;

  ["largeLayout", "mediumLayout"].forEach((layout) => {

    ["height", "position"].forEach((prop) => {
      const key = settings[layout];
      const elem = document.getElementById(key[`${prop}Id`]);
      if (!elem) return;
      elem.value = key[prop];
      elem.addEventListener("change", (event) => {
        key[prop] = event.target.value;
        chrome.storage.local.set({ settings });
      });
    });
  });

  ["largeLayout", "mediumLayout"].forEach((layout) => {
    const layoutKey = settings[layout];
    const imgId = document.getElementById(layoutKey.positionImgId);
    imgId.src = imagesPosition[layoutKey.position];
    // console.log(layoutKey, positionImage, imgId, imagesPosition[layoutKey.position]);
    const position = document.getElementById(layoutKey.positionId);
    position.addEventListener("change", (e) => {
      imgId.src = imagesPosition[e.target.value];
    })
  });

  const { largeLayout, mediumLayout } = settings;
  // 両方を初期化
  setupLayout(largeLayout);
  setupLayout(mediumLayout);

  /** レイアウトを初期化 */
  function setupLayout(layoutSettings) {
    const { heightId, positionId, options } = layoutSettings;
    const heightEl = document.getElementById(heightId);
    const positionEl = document.getElementById(positionId);
    const optionEls = document.querySelectorAll(`.${positionId.replace("-position", "")}-option`);

    updateLayoutState(layoutSettings, heightEl, optionEls);

    positionEl.addEventListener("change", () => {
      layoutSettings.position = positionEl.value;
      updateLayoutState(layoutSettings, heightEl, optionEls);
    });

    initializeOptions(layoutSettings, optionEls);
  }

  /** レイアウト状態（disabled・heightなど）を更新 */
  function updateLayoutState(layoutSettings, heightEl, optionEls) {
    const isDefault = layoutSettings.position.endsWith("-position-default");

    heightEl.disabled = isDefault;
    heightEl.value = isDefault ? "" : layoutSettings.height;

    optionEls.forEach((el) => {
      el.disabled = isDefault;
    });
  }

  /** 各オプションの初期化 */
  function initializeOptions(layoutSettings, optionEls) {
    optionEls.forEach((el) => {
      const key = el.dataset.id;
      const optionData = layoutSettings.options[key];

      el.checked = optionData.option;
      el.disabled = layoutSettings.position.endsWith("-position-default");

      el.addEventListener("change", (e) => {
        optionData.option = e.target.checked;
        chrome.storage.local.set({ settings });
      });
    });
  }
}

// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {
  const title = document.getElementById('title');
  title.textContent = `YouTube コメントポジション`;
  const titleHeader = document.getElementById('title-header');
  titleHeader.textContent = `YouTube コメントポジション`;
  const enabledLabel = document.getElementById('enabled-label');
  enabledLabel.textContent = `YouTube コメントポジションを有効にする`;
  const newTabButton = document.getElementById('new-tab-button');
  newTabButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'popup/popup.html' });
  });
  // 情報タブ:
  const storeLink = document.getElementById('store_link');
  storeLink.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
  if (storeLink) clickURL(storeLink);
  const extensionLink = document.getElementById('extension_link');
  extensionLink.href = `chrome://extensions/?id=${chrome.runtime.id}`;
  if (extensionLink) clickURL(extensionLink);
  const issueLink = document.getElementById('issue-link');
  if (issueLink) clickURL(issueLink);
  // manifest.jsonから拡張機能の情報を取得し，表示
  document.getElementById('extension-id').textContent = `${chrome.runtime.id}`;
  document.getElementById('extension-name').textContent = `${manifestData.name}`;
  document.getElementById('extension-version').textContent = `${manifestData.version}`;
  document.getElementById('extension-description').textContent = `${manifestData.description}`;
  chrome.permissions.getAll((result) => {
    document.getElementById('permission-info').textContent = `${result.permissions[0]}`;

    let siteAccess;
    if (result.origins.length > 0) {
      if (result.origins.includes("<all_urls>")) {
        siteAccess = "すべてのサイト";
      } else {
        siteAccess = result.origins.join("<br>");
      }
    } else {
      siteAccess = "クリックされた場合のみ";
    }
    document.getElementById('site-access').innerHTML = siteAccess;
  });
  // シークレットモードでのアクセス権を確認し，結果を表示
  chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
    document.getElementById('incognito-enabled').textContent = `${isAllowedAccess ? '有効' : '無効'}`;
  });
  // GitHubリンクのクリックイベントを設定
  const githubLink = document.getElementById('github-link');
  if (githubLink) clickURL(githubLink);

});

// popup.html内のリンクを新しいタブで開けるように設定する関数
function clickURL(link) {
  const url = link.href ? link.href : link;
  if (link instanceof HTMLElement) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      chrome.tabs.create({ url });
    });
  }
}


function messageOutput(datetime, message) {
  messageDiv.innerHTML += '<p class="m-0">' + datetime + ' ' + message + '</p>'; // <p> タグで囲んでメッセージを新しい行に追加
}
document.getElementById('clear-button').addEventListener('click', () => {
  messageDiv.innerHTML = '<p class="m-0">' + '' + '</p>'; // メッセージ表示エリアを空にする
});


// 現在の時間を取得する
function dateTime() {
  const now = new Date();
  const year = now.getFullYear();                                    // 年
  const month = String(now.getMonth() + 1).padStart(2, '0');         // 月（0始まりのため+1）
  const day = String(now.getDate()).padStart(2, '0');                // 日
  const hours = String(now.getHours()).padStart(2, '0');             // 時
  const minutes = String(now.getMinutes()).padStart(2, '0');         // 分

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  return formattedDateTime;
}


