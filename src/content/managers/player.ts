import { getLayoutSettings } from "../state";
import { YoutubeElements } from "../types";
import { getElements } from "../elements";
import { makeSticky } from "../utils/styles";

export function fixatePlayer(elements: YoutubeElements, isLargeScreen: boolean): void {
  const { isLargeDefaultPosition, isLargeStickyPlayer, isMediumDefaultPosition, isMediumStickyPlayer } = getLayoutSettings();
  const { player, ytdWatchFlexy, fullBleed } = elements;

  if (!player || !ytdWatchFlexy || !fullBleed) return;

  const applyStickyWhenReady = (targetElement: HTMLElement) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (ytdWatchFlexy.offsetTop !== 0) {
        makeSticky(targetElement, ytdWatchFlexy.offsetTop);
        clearInterval(interval);
      } else if (attempts > 20) {
        clearInterval(interval);
      }
    }, 100);
  };

  if (isLargeScreen) {
    if (!isLargeDefaultPosition && isLargeStickyPlayer) {
      applyStickyWhenReady(player);
    }
  } else {
    if (!isMediumDefaultPosition && isMediumStickyPlayer) {
      applyStickyWhenReady(fullBleed);
    }
  }
}

export function unlockPlayerFixation(isLargeScreen: boolean): void {
  const { isLargeDefaultPosition, isLargeStickyPlayer, isMediumDefaultPosition, isMediumStickyPlayer } = getLayoutSettings();
  const elements = getElements();

  if ((isLargeDefaultPosition || !isLargeStickyPlayer) && isLargeScreen) {
    const player = elements.player;
    if (!player) return;
    player.style.top = '0';
    player.style.position = 'relative';
  }

  if ((isMediumDefaultPosition || !isMediumStickyPlayer) && !isLargeScreen) {
    const player = elements.player;
    if (!player) return;
    player.style.top = '0';
    player.style.position = 'relative';
  }
}
