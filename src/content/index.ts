import "./content.css";
import { loadSettings, isEnabled, preRespWidth, isReloaded, preUrl, setPreRespWidth, setIsReloaded, setPreUrl, settings } from "./state";
import { getElements } from "./elements";
import { isLargeScreenLayout } from "./utils/height";
import { handleFirstRender, insertSecondary, insertPrimary } from "./managers/layout";
import { applyPlayerSticky } from "./managers/player";
import { makeStickyComments } from "./managers/comment";
import { YoutubeElements } from "./types";
import { applySecondaryResizeSettings } from "./managers/secondary-resize";
import { Settings } from "settings";

function applyLayout(elements: YoutubeElements, isLargeScreen: boolean): void {
  applyPlayerSticky(elements, isLargeScreen);
  makeStickyComments(isLargeScreen);
  applySecondaryResizeSettings();
}

const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.primary || !elements.below || !elements.secondary || !elements.secondaryInner) return;

  const isLargeScreen = isLargeScreenLayout();

  if (!isReloaded) {
    handleFirstRender(elements, isLargeScreen);
    applyLayout(elements, isLargeScreen);
    setIsReloaded(true);
  } else {
    if (isLargeScreen && preRespWidth === 'medium') {
      insertSecondary(elements);
      applyLayout(elements, isLargeScreen);
    } else if (!isLargeScreen && preRespWidth === 'large') {
      insertPrimary(elements);
      applyLayout(elements, isLargeScreen);
    }
  }

  const url = new URL(window.location.href);
  const currentVideoId = url.searchParams.get("v");

  if (preUrl !== currentVideoId) {
    handleFirstRender(elements, isLargeScreen);
    applyLayout(elements, isLargeScreen);
    setPreUrl(currentVideoId);
  } else {
    setPreUrl(currentVideoId);
  }

  setPreRespWidth(isLargeScreen ? 'large' : 'medium');
});

(async () => {
  await loadSettings();
  if (isEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
})();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes.settings?.newValue) {
    const newSettings = changes.settings.newValue as Settings;
    const oldSettings = changes.settings.oldValue as Settings;

    // largeSidebarEnabledが変更された場合
    if (newSettings?.large?.largeSidebarEnabled !== oldSettings?.large?.largeSidebarEnabled) {
      applySecondaryResizeSettings();
    }
  }
});