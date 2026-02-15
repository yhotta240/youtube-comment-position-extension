import { getLayoutSettings } from "../state";
import { YoutubeElements } from "../types";
import { toggleSticky } from "../utils/styles";

export function applyPlayerSticky(elements: YoutubeElements, isLargeScreen: boolean): void {
  const { isLargeDefaultPosition, isLargeStickyPlayer, isMediumDefaultPosition, isMediumStickyPlayer } = getLayoutSettings();
  const { player, ytdWatchFlexy, fullBleed } = elements;

  if (!player || !ytdWatchFlexy || !fullBleed) return;

  const targetElement = isLargeScreen ? player : fullBleed;
  const shouldSticky = isLargeScreen
    ? (!isLargeDefaultPosition && isLargeStickyPlayer)
    : (!isMediumDefaultPosition && isMediumStickyPlayer);

  if (shouldSticky) {
    let attempts = 0;
    const interval = setInterval(() => {
      if (ytdWatchFlexy.offsetTop !== 0) {
        toggleSticky(targetElement, true, ytdWatchFlexy.offsetTop);
        clearInterval(interval);
      } else if (++attempts >= 20) {
        clearInterval(interval);
      }
    }, 100);
  } else {
    toggleSticky(targetElement, false, 0);
  }
}
