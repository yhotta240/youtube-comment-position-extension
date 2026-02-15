import { loadSettings, isEnabled, preRespWidth, isReloaded, preUrl, setPreRespWidth, setIsReloaded, setPreUrl } from "./state";
import { getElements } from "./elements";
import { isLargeScreenLayout } from "./utils/height";
import { handleFirstRender, insertSecondary, insertPrimary } from "./managers/layout";
import { fixatePlayer, unlockPlayerFixation } from "./managers/player";
import { makeStickyComments } from "./managers/comment";
import { removeCinematics } from "./utils/styles";

const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.primary || !elements.below || !elements.secondary || !elements.secondaryInner) return;

  const isLargeScreen = isLargeScreenLayout();

  if (!isReloaded) {
    handleFirstRender(elements, isLargeScreen);
    fixatePlayer(elements, isLargeScreen);
    makeStickyComments(isLargeScreen);
    setIsReloaded(true);
  } else {
    if (isLargeScreen && preRespWidth === 'medium') {
      insertSecondary(elements);
      unlockPlayerFixation(isLargeScreen);
      fixatePlayer(elements, isLargeScreen);
      makeStickyComments(isLargeScreen);
    } else if (!isLargeScreen && preRespWidth === 'large') {
      insertPrimary(elements);
      unlockPlayerFixation(isLargeScreen);
      fixatePlayer(elements, isLargeScreen);
      makeStickyComments(isLargeScreen);
    }
  }

  const url = new URL(window.location.href);
  const currentVideoId = url.searchParams.get("v");

  if (preUrl !== currentVideoId) {
    handleFirstRender(elements, isLargeScreen);
    fixatePlayer(elements, isLargeScreen);
    makeStickyComments(isLargeScreen);
    setPreUrl(currentVideoId);
  } else {
    setPreUrl(currentVideoId);
  }

  removeCinematics();
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