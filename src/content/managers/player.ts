import { isLargeScreenLayout } from "content/utils/responsive";
import { getLayoutSettings, isEnabled } from "../state";
import { YoutubeElements } from "../types";
import { hideCinematics, toggleSticky } from "../utils/styles";

let stickyPlayerTimer: number | undefined;
let stickyPlayerSizeObserver: ResizeObserver | undefined;

function clearStickyPlayerTimer(): void {
  if (stickyPlayerTimer !== undefined) {
    clearInterval(stickyPlayerTimer);
    stickyPlayerTimer = undefined;
  }
}

export function applyPlayerSticky(elements: YoutubeElements): void {
  const isLargeScreen = isLargeScreenLayout();
  clearStickyPlayerTimer();
  stickyPlayerSizeObserver?.disconnect();
  const { isLargeStickyPlayer, isMediumStickyPlayer } = getLayoutSettings();
  const { player, ytdWatchFlexy, fullBleed } = elements;
  ytdWatchFlexy?.style.removeProperty('--ycp-sticky-player-bottom');

  if (!player || !ytdWatchFlexy || !fullBleed) return;

  const targetElement = isLargeScreen ? player : fullBleed;
  const shouldSticky = isEnabled && ((isLargeScreen && isLargeStickyPlayer) || (!isLargeScreen && isMediumStickyPlayer));

  if (shouldSticky) {
    let attempts = 0;
    stickyPlayerTimer = window.setInterval(() => {
      const top = ytdWatchFlexy.offsetTop;
      if (top !== 0) {
        toggleSticky(targetElement, true, top);
        stickyPlayerSizeObserver = new ResizeObserver(() => {
          ytdWatchFlexy.style.setProperty('--ycp-sticky-player-bottom', `${top + targetElement.offsetHeight}px`);
        });
        stickyPlayerSizeObserver.observe(targetElement, { box: 'border-box' });
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
