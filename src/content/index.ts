import "./content.css";
import { loadSettings, isEnabled, preRespWidth, isReloaded, preUrl, setPreRespWidth, setIsReloaded, setPreUrl } from "./state";
import { getElements } from "./elements";
import { isLargeScreenLayout } from "./utils/height";
import { handleFirstRender, insertSecondary, insertPrimary } from "./managers/layout";
import { applyPlayerSticky } from "./managers/player";
import { makeStickyComments } from "./managers/comment";
import { applySidebarWidth } from "./utils/styles";
import { YoutubeElements } from "./types";

function applyLayout(elements: YoutubeElements, isLargeScreen: boolean): void {
  applyPlayerSticky(elements, isLargeScreen);
  makeStickyComments(isLargeScreen);
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
    window.addEventListener('yt-navigate-finish', () => {
      requestAnimationFrame(() => {
        applySidebarWidth();
      });
    });
    // ウィンドウリサイズ時にサイドバー幅を再計算
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        const isLargeScreen = isLargeScreenLayout();
        if (isLargeScreen) {
          applySidebarWidth();
        }
      }, 100);
    });
  } else {
    observer.disconnect();
  }
})();