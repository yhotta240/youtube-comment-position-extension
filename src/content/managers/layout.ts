import { getLayoutSettings } from "../state";
import { YoutubeElements } from "../types";
import { applyCommentStyles } from "../utils/styles";

function isFullscreen() {
  return document.fullscreenElement;
}

export function insertSecondary(elements: YoutubeElements): void {
  const { isLargeDefaultPosition, largeLayoutPosition } = getLayoutSettings();
  const { comments, related, secondary, secondaryInner, below } = elements;

  if (!comments || !related || !secondary || !secondaryInner || !below) return;

  applyCommentStyles(comments, isLargeDefaultPosition);

  if (!isLargeDefaultPosition) {
    if (largeLayoutPosition === "large-secondary") {
      secondary.prepend(comments);
    } else if (largeLayoutPosition === "large-secondary-bottom") {
      if (secondaryInner.contains(related)) {
        secondaryInner.insertBefore(comments, related);
      } else {
        secondaryInner.appendChild(comments);
        secondaryInner.appendChild(related);
      }
    } else if (largeLayoutPosition === "large-switch") {
      secondaryInner.appendChild(comments);
      setTimeout(() => {
        below.appendChild(related);
      }, 100);
    }
  }
}

export function insertPrimary(elements: YoutubeElements): void {
  if (isFullscreen()) return;

  const { isMediumDefaultPosition, isMediumCommentsUnderPlayer, isMediumUndermetadata } = getLayoutSettings();
  const { comments, metaData, below, related, belowFirstBox, belowSecondBox } = elements;

  if (!comments || !metaData || !below || !related || !belowFirstBox || !belowSecondBox) return;

  applyCommentStyles(comments, isMediumDefaultPosition);

  if (isMediumDefaultPosition) {
    belowSecondBox.appendChild(comments);
    return;
  } else if (isMediumCommentsUnderPlayer) {
    below.insertBefore(comments, belowFirstBox);
  } else if (isMediumUndermetadata) {
    belowFirstBox.insertAdjacentElement("afterend", comments);
  }

  // 意図しない位置に related が移動する可能性を防ぐため，delay を入れてから related を移動する
  setTimeout(() => {
    belowSecondBox.appendChild(related);
  }, 100);
}

export function handleFirstRender(elements: YoutubeElements, isLargeScreen: boolean): void {
  if (isLargeScreen) {
    insertSecondary(elements);
  } else {
    insertPrimary(elements);
  }
}
