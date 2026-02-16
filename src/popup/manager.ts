import './popup.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { PopupPanel } from './components/panel';
import { dateTime } from '../utils/date';
import { openLinkNewTab } from '../utils/dom';
import { getSiteAccessText } from '../utils/permissions';
import { DEFAULT_SETTINGS, getSettings, IMG_MAP, isEnabled, Layout, LayoutSetting, setEnabled, setSettings, Settings } from '../settings';
import meta from '../../public/manifest.meta.json';
import { applyTheme, setupThemeMenu, Theme } from './components/theme';
import { initShareMenu, SharePlatform } from './components/share';

type ManifestMetadata = {
  issues_url?: string;
  languages?: string[];
  publisher?: string;
  developer?: string;
  github_url?: string;
  [key: string]: any;
};

export class PopupManager {
  private panel: PopupPanel;
  private enabled: boolean = false;
  private settings: Settings = DEFAULT_SETTINGS;
  private manifestData: chrome.runtime.Manifest;
  private manifestMetadata: ManifestMetadata;
  private enabledElement: HTMLInputElement | null;

  constructor() {
    this.panel = new PopupPanel();
    this.manifestData = chrome.runtime.getManifest();
    this.manifestMetadata = meta || {};
    this.enabledElement = document.querySelector<HTMLInputElement>('#enabled');

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.settings = await getSettings();
      this.enabled = await isEnabled();
      if (this.enabledElement) this.enabledElement.checked = this.enabled;
      this.showMessage(`${this.manifestData.short_name} が起動しました`);
    } catch (err) {
      console.error('error', err);
      this.showMessage('設定の読み込みに失敗しました');
    }

    this.addEventListeners();
    this.setupUI();
  }

  private addEventListeners(): void {
    this.enabledElement?.addEventListener('change', async (event) => {
      this.enabled = (event.target as HTMLInputElement).checked;
      try {
        await setEnabled(this.enabled);
        const shortName = this.manifestData.short_name || this.manifestData.name;
        this.showMessage(this.enabled ? `${shortName} は有効になりました` : `${shortName} は無効になりました`);
      } catch (err) {
        console.error('failed to save enabled state', err);
        this.showMessage('有効状態の保存に失敗しました');
      }
    });

    // テーマ設定のイベントリスナー
    setupThemeMenu((value: Theme) => {
      try {
        applyTheme(value);
        this.showMessage(`テーマを ${value} に変更しました`);
      } catch (e) {
        this.showMessage('テーマ設定の保存に失敗しました');
      }
    });

    // シェアメニューの初期化
    initShareMenu((platform: SharePlatform, success: boolean) => {
      const platformNames: Record<SharePlatform, string> = {
        twitter: 'X (Twitter)',
        facebook: 'Facebook',
        copy: 'クリップボード',
      };
      if (success) {
        if (platform === 'copy') {
          this.showMessage('URLをコピーしました');
        } else {
          this.showMessage(`${platformNames[platform]}でシェアしました`);
        }
      } else {
        this.showMessage('シェアに失敗しました');
      }
    });

    // レイアウト設定のイベントリスナー
    const layouts: Layout[] = ['large', 'medium'];
    layouts.forEach((layout: Layout) => {
      const layoutSetting: LayoutSetting = this.settings[layout];
      const heightInput = document.getElementById(`${layout}-height`) as HTMLInputElement | null;
      const positionEl = document.getElementById(`${layout}-position`) as HTMLSelectElement | null;
      const imageEl = document.getElementById(`${layout}-image`) as HTMLImageElement | null;
      if (positionEl && heightInput && imageEl) {
        positionEl.addEventListener('change', () => {
          const selectedPosition = positionEl.value as keyof typeof IMG_MAP;
          imageEl.src = IMG_MAP[selectedPosition] || '';
          const patch: Partial<Settings> = {
            [layout]: {
              ...layoutSetting,
              position: selectedPosition,
              img: IMG_MAP[selectedPosition] || layoutSetting.img,
            }
          };
          this.updateSettings(patch, 'レイアウトの位置を保存しました', 'レイアウトの位置の保存に失敗しました');
        });

        heightInput.addEventListener('change', () => {
          const heightValue = heightInput.value ? parseInt(heightInput.value) : null;
          const patch: Partial<Settings> = {
            [layout]: {
              ...layoutSetting,
              height: heightValue,
            }
          };
          this.updateSettings(patch, 'コメント欄の高さを保存しました', 'コメント欄の高さの保存に失敗しました');
        });
      }

      // オプション設定のイベントリスナー
      const optionIds = ['stickyPlayer', 'stickyComments'] as const;
      optionIds.forEach(optionId => {
        const optionEl = document.getElementById(`${layout}-sticky-${optionId === 'stickyPlayer' ? 'player' : 'comments'}`) as HTMLInputElement | null;
        optionEl?.addEventListener('change', () => {
          const value = optionEl.checked;
          const patch: Partial<Settings> = {
            [layout]: {
              ...layoutSetting,
              [optionId]: value,
            }
          };
          this.updateSettings(patch, 'オプション設定を保存しました', 'オプション設定の保存に失敗しました');
        });
      });
    });
  }

  private async updateSettings(patch: Partial<Settings>, successMessage?: string, failedMessage?: string): Promise<void> {
    try {
      this.settings = { ...this.settings, ...patch };
      console.log('updated settings', this.settings);
      await setSettings(this.settings);
      if (successMessage) this.showMessage(successMessage);
    } catch (err) {
      console.error('failed to save settings', err);
      this.showMessage(failedMessage || '設定の保存に失敗しました');
    }
  }

  private setupUI(): void {
    const short_name = this.manifestData.short_name || this.manifestData.name;
    const title = document.getElementById('title');
    if (title) {
      title.textContent = short_name;
    }
    const titleHeader = document.getElementById('title-header');
    if (titleHeader) {
      titleHeader.textContent = short_name;
    }
    const enabledLabel = document.getElementById('enabled-label');
    if (enabledLabel) {
      enabledLabel.textContent = `${short_name} を有効にする`;
    }

    this.setupSettingsUI();
    this.setupMoreMenu();
    this.setupInfoTab();
  }

  private setupSettingsUI(): void {
    const setLayout = (layout: Layout): void => {
      const layoutSettings: LayoutSetting = this.settings[layout];
      const heightInput = document.getElementById(`${layout}-height`) as HTMLInputElement | null;
      const positionEl = document.getElementById(`${layout}-position`) as HTMLSelectElement | null;
      const image = document.getElementById(`${layout}-image`) as HTMLImageElement | null;
      if (positionEl && heightInput && image) {
        heightInput.value = layoutSettings.height !== null ? String(layoutSettings.height) : '';
        positionEl.value = layoutSettings.position;
        image.src = layoutSettings.img;
      }
    };
    const setOptions = (layout: Layout): void => {
      const layoutSettings: LayoutSetting = this.settings[layout];
      const stickyPlayerEl = document.getElementById(`${layout}-sticky-player`) as HTMLInputElement | null;
      const stickyCommentsEl = document.getElementById(`${layout}-sticky-comments`) as HTMLInputElement | null;
      if (stickyPlayerEl) stickyPlayerEl.checked = layoutSettings.stickyPlayer;
      if (stickyCommentsEl) stickyCommentsEl.checked = layoutSettings.stickyComments;
    };
    setLayout('large');
    setLayout('medium');
    setOptions('large');
    setOptions('medium');
  }

  private setupMoreMenu(): void {
    const moreButton = document.getElementById('more-button');
    const moreMenu = document.getElementById('more-menu');
    const themeButton = document.getElementById('theme-button');
    const newTabButton = document.getElementById('new-tab-button');

    if (!moreButton || !moreMenu) return;

    moreButton.addEventListener('click', (e) => {
      e.stopPropagation();
      moreMenu.classList.toggle('d-none');
    });

    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (!moreMenu.contains(target) && !moreButton.contains(target)) {
        moreMenu.classList.add('d-none');
      }
    });

    themeButton?.addEventListener('click', () => {
      moreMenu.classList.add('d-none');
    });

    newTabButton?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'popup.html' });
      moreMenu.classList.add('d-none');
    });
  }

  private setupInfoTab(): void {
    const storeLink = document.getElementById('store-link') as HTMLAnchorElement;
    if (storeLink) {
      storeLink.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
      openLinkNewTab(storeLink);
    }

    const extensionLink = document.getElementById('extension-link') as HTMLAnchorElement;
    if (extensionLink) {
      extensionLink.href = `chrome://extensions/?id=${chrome.runtime.id}`;
      openLinkNewTab(extensionLink);
    }

    const issuesLink = document.getElementById('issues-link') as HTMLAnchorElement;
    const issuesHref = this.manifestMetadata.issues_url;
    if (issuesLink && issuesHref) {
      issuesLink.href = issuesHref;
      openLinkNewTab(issuesLink);
    }

    const extensionId = document.getElementById('extension-id');
    if (extensionId) extensionId.textContent = chrome.runtime.id;

    const extensionName = document.getElementById('extension-name');
    if (extensionName) extensionName.textContent = this.manifestData.name;

    const extensionVersion = document.getElementById('extension-version');
    if (extensionVersion) extensionVersion.textContent = this.manifestData.version;

    const extensionDescription = document.getElementById('extension-description');
    if (extensionDescription) extensionDescription.textContent = this.manifestData.description ?? '';

    chrome.permissions.getAll((result) => {
      const permissionInfo = document.getElementById('permission-info');
      if (permissionInfo && result.permissions) {
        permissionInfo.textContent = result.permissions.join(', ');
      }

      const siteAccess = getSiteAccessText(result.origins);
      const siteAccessElement = document.getElementById('site-access');
      if (siteAccessElement) siteAccessElement.innerHTML = siteAccess;
    });

    chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
      const incognitoEnabled = document.getElementById('incognito-enabled');
      if (incognitoEnabled) incognitoEnabled.textContent = isAllowedAccess ? '有効' : '無効';
    });

    const languageMap: { [key: string]: string } = { 'en': '英語', 'ja': '日本語' };
    const language = document.getElementById('language') as HTMLElement | null;
    const languages = this.manifestMetadata.languages || [];
    if (language) language.textContent = languages.map((lang: string) => languageMap[lang]).join(', ');

    const publisherName = document.getElementById('publisher-name') as HTMLElement | null;
    const publisher = this.manifestMetadata.publisher || '不明';
    if (publisherName) publisherName.textContent = publisher;

    const developerName = document.getElementById('developer-name') as HTMLElement | null;
    const developer = this.manifestMetadata.developer || '不明';
    if (developerName) developerName.textContent = developer;

    const githubLink = document.getElementById('github-link') as HTMLAnchorElement;
    const githubHref = this.manifestMetadata.github_url;
    if (githubLink && githubHref) {
      githubLink.href = githubHref;
      githubLink.textContent = githubHref;
      openLinkNewTab(githubLink);
    }
  }

  private showMessage(message: string, timestamp: string = dateTime()) {
    this.panel.messageOutput(message, timestamp);
  }
}
