let isEnabled = false; // ツールの有効状態を示すフラグ（初期値は無効）
const manifestData = chrome.runtime.getManifest();
// Sampleツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    console.log(`${manifestData.name} がONになりました`);
  } else {
    console.log(`${manifestData.name} がOFFになりました`);
  }
};


// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
  handleSampleTool(isEnabled);
});

// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  handleSampleTool(isEnabled);
});


console.log("start");


const observer = new MutationObserver(() => {
  // コメントセクション（#sections）を取得
  const commentSection = document.querySelector('#sections.style-scope.ytd-comments');
  const relatedVideo = document.querySelector('#related.style-scope.ytd-watch-flexy');
  const secondary = document.querySelector('#secondary');

  if (commentSection && secondary && !document.querySelector('#custom-sidebar')) {
    insertSidebar(secondary, commentSection);
  }
  if (relatedVideo && secondary && !document.querySelector('#custom-sidebar')) {
    relatedVideo.remove();
  }
});

// ページ全体を監視（YouTubeの動的な読み込み対応）
observer.observe(document.body, { childList: true, subtree: true });


function insertSidebar(secondary, commentSection) {

  const windowHeight = window.innerHeight;
  const sidebar = document.createElement('div');
  sidebar.id = 'custom-sidebar';
  sidebar.className = 'style-scope ytd-comments';
  sidebar.style.padding = '10px';
  sidebar.style.marginBottom = '10px';
  sidebar.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  sidebar.style.borderRadius = '4px';
  sidebar.style.overflowY = 'auto';
  sidebar.style.maxHeight = '600px';

  // コメントセクションをサイドバーに移動
  sidebar.appendChild(commentSection);

  // サイドバー用の要素を作成
  // const commentsHeader = commentSection.querySelector('#header.style-scope.ytd-item-section-renderer');
  // if (commentsHeader) {
  //   const footer = document.createElement('div');
  //   footer.id = 'custom-footer';
  //   footer.style.position = 'absolute';
  //   footer.style.bottom = '0';
  //   footer.style.left = '0';
  //   footer.style.width = '100%';
  //   footer.style.zIndex = '1000';
  //   footer.appendChild(commentsHeader);

  //   // フッタをサイドバーに追加
  //   sidebar.appendChild(footer);
  // } else {
  //   console.log('コメントセクションのヘッダーが見つかりません');
  // }
  // secondaryの先頭に挿入
  secondary.insertBefore(sidebar, secondary.firstChild);

}


