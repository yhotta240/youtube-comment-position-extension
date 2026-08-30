import { isLargeScreenLayout } from "content/utils/responsive";
import { getLayoutSettings, isEnabled } from "../state";
import { YoutubeElements } from "../types";
import { hideCinematics, toggleSticky } from "../utils/styles";

let stickyPlayerTimer: number | undefined;

function clearStickyPlayerTimer(): void {
  if (stickyPlayerTimer !== undefined) {
    clearInterval(stickyPlayerTimer);
    stickyPlayerTimer = undefined;
  }
}

export function applyPlayerSticky(elements: YoutubeElements): void {
  const isLargeScreen = isLargeScreenLayout();
  clearStickyPlayerTimer();
  const { isLargeDefaultPosition, isLargeStickyPlayer, isMediumDefaultPosition, isMediumStickyPlayer } = getLayoutSettings();
  const { player, ytdWatchFlexy, fullBleed } = elements;

  if (!player || !ytdWatchFlexy || !fullBleed) return;

  const targetElement = isLargeScreen ? player : fullBleed;
  const shouldSticky = isEnabled && (isLargeScreen
    ? (!isLargeDefaultPosition && isLargeStickyPlayer)
    : (!isMediumDefaultPosition && isMediumStickyPlayer));

  if (shouldSticky) {
    let attempts = 0;
    stickyPlayerTimer = window.setInterval(() => {
      if (ytdWatchFlexy.offsetTop !== 0) {
        toggleSticky(targetElement, true, ytdWatchFlexy.offsetTop);
        hideCinematics(true);
        clearStickyPlayerTimer();
      } else if (++attempts >= 20) {
        clearStickyPlayerTimer();
      }
    }, 100);
  } else {
    toggleSticky(targetElement, false, 0);
    const otherElement = isLargeScreen ? fullBleed : player;
    if (otherElement !== targetElement) toggleSticky(otherElement, false, 0);
    hideCinematics(false);
  }
}
