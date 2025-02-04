// 初期化処理
let isEnabled = false;
const enabledElement = document.getElementById('enabled');
const panelButton = document.getElementById('panelButton');
const messagePanel = document.getElementById('messagePanel');
const messageDiv = document.getElementById('message');
const manifestData = chrome.runtime.getManifest();

const imagesPosition = {
  "large-position-default": "./images/large-layout-comments-default.png",
  "large-position-leftside": "./images/large-layout-comments-secondary.png",
  "medium-position-default": "./images/medium-layout-comments-default.png",
  "medium-position-undermetadata": "./images/medium-layout-comments-under-metadata.png",
  "medium-position-underplayer": "./images/medium-layout-comments-under-player.png",
};

const defaultSettings = {
  largeLayout: {
    positionId: "large-layout-position",
    position: "large-position-leftside",
    positionImgId: "large-image",
    positionImage: "./images/large-layout-comments-secondary-left.png",
    heightId: "large-height-comments",
    height: '',
    optionId: "large-layout-option",
    option: false,
    positionPrefix: "large",
  },
  mediumLayout: {
    positionId: "medium-layout-position",
    position: "medium-position-default",
    positionImgId: "medium-image",
    positionImage: "./images/medium-layout-comments-default.png",
    heightId: "medium-height-comments",
    height: '',
    optionId: "medium-layout-option",
    option: false,
    positionPrefix: "medium",
  }
}

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

function popupLoad(data) {
  if (!data) {
    data = defaultSettings;
    chrome.storage.local.set({ settings: data });
  };
  const settings = data;

  // console.log("settings", settings);
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

  const positionLarge = document.getElementById(settings.largeLayout.positionId);
  const optionLarge = document.getElementById(settings.largeLayout.optionId);
  const heightLarge = document.getElementById(settings.largeLayout.heightId);

  const isLargeDefault = settings.largeLayout.position === "large-position-default";
  optionLarge.checked = settings.largeLayout.option;
  optionLarge.disabled = isLargeDefault;
  heightLarge.disabled = isLargeDefault;
  heightLarge.value = isLargeDefault ? '' : settings.largeLayout.height;
  positionLarge.addEventListener("change", () => {
    const isLargeDefault = settings.largeLayout.position === "large-position-default";
    optionLarge.disabled = isLargeDefault;
    heightLarge.disabled = isLargeDefault;
    heightLarge.value = isLargeDefault ? '' : settings.largeLayout.height;
  });
  optionLarge.addEventListener("change", () => {
    settings.largeLayout.option = optionLarge.checked;
    // console.log("選択変更:", optionLarge.checked, settings);
    chrome.storage.local.set({ settings });
  });

  const positionMedium = document.getElementById(settings.mediumLayout.positionId);
  const optionMedium = document.getElementById(settings.mediumLayout.optionId);
  const heightMedium = document.getElementById(settings.mediumLayout.heightId);

  const isMediumDefault = settings.mediumLayout.position === "medium-position-default";
  optionMedium.checked = settings.mediumLayout.option;
  optionMedium.disabled = isMediumDefault;
  heightMedium.disabled = isMediumDefault;
  heightMedium.value = isMediumDefault ? '' : settings.mediumLayout.height;
  positionMedium.addEventListener("change", () => {
    const isMediumDefault = settings.mediumLayout.position === "medium-position-default";
    optionMedium.disabled = isMediumDefault;
    heightMedium.disabled = isMediumDefault;
    heightMedium.value = isMediumDefault ? '' : settings.mediumLayout.height;
  });
  optionMedium.addEventListener("change", () => {
    settings.mediumLayout.option = optionMedium.checked;
    // console.log("選択変更:", optionMedium.checked, settings);
    chrome.storage.local.set({ settings });
  });

}

// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {


  const title = document.getElementById('title');
  title.textContent = `${manifestData.name}`;
  const titleHeader = document.getElementById('title-header');
  titleHeader.textContent = `${manifestData.name}`;
  const enabledLabel = document.getElementById('enabled-label');
  enabledLabel.textContent = `${manifestData.name} を有効にする`;

  panelButton.addEventListener('click', function () {
    const panelHeight = '170px';

    if (messagePanel.style.height === panelHeight) {
      messagePanel.style.height = '0';
      panelButton.textContent = 'メッセージパネルを開く';
    } else {
      messagePanel.style.height = panelHeight;
      panelButton.textContent = 'メッセージパネルを閉じる';
    }
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
document.getElementById('messageClearButton').addEventListener('click', () => {
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


