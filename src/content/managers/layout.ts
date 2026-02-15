import { getLayoutSettings } from "../state";
import { YoutubeElements } from "../types";
import { applyCommentStyles } from "../utils/styles";

function isFullscreen() {
  return document.fullscreenElement;
}

export function insertSecondary(elements: YoutubeElements): void {
  const { isLargeDefaultPosition, largeLayoutPosition } = getLayoutSettings();
  const { comments, related, secondaryInner, below } = elements;

  if (!comments || !related || !secondaryInner || !below) return;

  applyCommentStyles(comments, isLargeDefaultPosition);

  if (!isLargeDefaultPosition) {
    if (largeLayoutPosition === "large-position-leftside") {
      secondaryInner.insertBefore(comments, secondaryInner.firstChild);
    }
    if (!secondaryInner.contains(related)) {
      secondaryInner.appendChild(related);
    }
    else if (largeLayoutPosition === "large-position-leftside-bottom") {
      if (secondaryInner.contains(related)) {
        secondaryInner.insertBefore(comments, related);
      } else {
        secondaryInner.appendChild(comments);
        secondaryInner.appendChild(related);
      }
    }
    else if (largeLayoutPosition === "large-position-switch") {
      secondaryInner.appendChild(comments);
      setTimeout(() => {
        below.appendChild(related);
      }, 100);
    }
  }
}

export function insertPrimary(elements: YoutubeElements): void {
  if (isFullscreen()) return;

  const { isMediumDefaultPosition, mediumLayoutPosition } = getLayoutSettings();
  const { comments, metaData, below, related } = elements;

  if (!comments || !metaData || !below || !related) return;

  applyCommentStyles(comments, isMediumDefaultPosition);

  if (isMediumDefaultPosition) {
    below.appendChild(comments);
    setTimeout(() => {
      below.insertBefore(related, comments);
    }, 100);
    return;
  }

  if (mediumLayoutPosition === "medium-position-underplayer") {
    below.insertBefore(comments, metaData);
  } else if (mediumLayoutPosition === "medium-position-undermetadata") {
    below.appendChild(comments);
  }

  setTimeout(() => {
    below.appendChild(related);
  }, 100);
}

export function handleFirstRender(elements: YoutubeElements, isLargeScreen: boolean): void {
  if (isLargeScreen) {
    insertSecondary(elements);
  } else {
    insertPrimary(elements);
  }
}
