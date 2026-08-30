import "./content.css";
import { loadSettings, isEnabled, preRespWidth, isReloaded, preUrl, setPreRespWidth, setIsReloaded, setPreUrl } from "./state";
import { getElements } from "./elements";
import { isLargeScreenLayout } from "./utils/responsive";
import { handleFirstRender, insertCommentsSecondary, insertCommentsPrimary, resetCommentsLayout } from "./managers/layout";
import { applyPlayerSticky } from "./managers/player";
import { makeStickyComments } from "./managers/comment";
import { YoutubeElements } from "./types";
import { applySecondaryResizeSettings } from "./managers/secondary-resize";

let settingsLoaded = false;

function applyOptions(elements: YoutubeElements): void {
  applyPlayerSticky(elements);
  makeStickyComments();
  applySecondaryResizeSettings();
}

function hasLayoutElements(elements: YoutubeElements): boolean {
  return Boolean(elements.primary && elements.below && elements.secondary && elements.secondaryInner);
}

function getCurrentVideoId(): string | null {
  return new URL(window.location.href).searchParams.get("v");
}

function applyCurrentLayout(): void {
  const elements = getElements();
  if (!hasLayoutElements(elements)) return;

  handleFirstRender(elements);
  applyOptions(elements);

  const currentVideoId = getCurrentVideoId();
  setIsReloaded(Boolean(currentVideoId));
  setPreUrl(currentVideoId);
  setPreRespWidth(isLargeScreenLayout() ? "large" : "medium");
}

function startObserver(): void {
  if (!settingsLoaded || !document.body) return;

  observer.observe(document.body, { childList: true, subtree: true });
  applyCurrentLayout();
}

function stopObserver(): void {
  observer.disconnect();

  const elements = getElements();
  resetCommentsLayout(elements);
  applyOptions(elements);

  setIsReloaded(false);
  setPreUrl(null);
  setPreRespWidth(null);
}

const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!hasLayoutElements(elements)) return;

  const isLargeScreen = isLargeScreenLayout();

  const url = new URL(window.location.href);
  const currentVideoId = url.searchParams.get("v");

  const isInitialRender = !isReloaded && Boolean(currentVideoId);
  const isVideoChanged = preUrl !== currentVideoId;

  if (isInitialRender || isVideoChanged) {
    handleFirstRender(elements);
    applyOptions(elements);
    if (isInitialRender) setIsReloaded(true);
  } else {
    if (isLargeScreen && preRespWidth === "medium") {
      insertCommentsSecondary(elements);
      applyOptions(elements);
    } else if (!isLargeScreen && preRespWidth === "large") {
      insertCommentsPrimary(elements);
      applyOptions(elements);
    }
  }

  setPreUrl(currentVideoId);
  setPreRespWidth(isLargeScreen ? "large" : "medium");
});

(async () => {
  await loadSettings();
  settingsLoaded = true;
  if (isEnabled) {
    startObserver();
  } else {
    stopObserver();
  }
})();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.settings?.newValue) {
    if (!isEnabled) return;

    applyCurrentLayout();
  }

  if (changes.isEnabled?.newValue !== undefined) {
    if (changes.isEnabled.newValue === true) {
      startObserver();
    } else {
      stopObserver();
    }
  }
});
