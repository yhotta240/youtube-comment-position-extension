import { isLargeScreenLayout } from "content/utils/responsive";
import { getLayoutSettings } from "../state";
import { YoutubeElements } from "../types";
import { applyCommentStyles } from "../utils/styles";

const originalPositionMarkers = new WeakMap<HTMLElement, Comment>();
let relatedMoveTimer: number | undefined;

function cancelRelatedMove(): void {
  if (relatedMoveTimer === undefined) return;

  clearTimeout(relatedMoveTimer);
  relatedMoveTimer = undefined;
}

function scheduleRelatedMove(related: HTMLElement, target: HTMLElement): void {
  cancelRelatedMove();
  relatedMoveTimer = window.setTimeout(() => {
    target.appendChild(related);
    relatedMoveTimer = undefined;
  }, 100);
}

function rememberOriginalPosition(element: HTMLElement | null): void {
  if (!element || originalPositionMarkers.has(element) || !element.parentNode) return;

  const marker = document.createComment('ycp-original-position');
  element.parentNode.insertBefore(marker, element);
  originalPositionMarkers.set(element, marker);
}

function restoreOriginalPosition(element: HTMLElement | null): void {
  if (!element) return;

  const marker = originalPositionMarkers.get(element);
  const parent = marker?.parentNode;
  if (!marker || !parent || marker.nextSibling === element) return;

  parent.insertBefore(element, marker.nextSibling);
}

function rememberOriginalPositions(elements: YoutubeElements): void {
  rememberOriginalPosition(elements.comments);
  rememberOriginalPosition(elements.related);
}

function restoreOriginalPositions(elements: YoutubeElements): void {
  cancelRelatedMove();
  restoreOriginalPosition(elements.comments);
  restoreOriginalPosition(elements.related);
}

export function resetCommentsLayout(elements: YoutubeElements): void {
  restoreOriginalPositions(elements);
  if (elements.comments) applyCommentStyles(elements.comments, true);
}

function isFullscreen() {
  return document.fullscreenElement;
}

export function insertCommentsSecondary(elements: YoutubeElements): void {
  const { isLargeDefaultPosition, isLargeSecondary, isLargeSecondaryBottom, isLargeSwitch } = getLayoutSettings();
  const { comments, related, secondary, secondaryInner, below } = elements;

  if (!comments || !related || !secondary || !secondaryInner || !below) return;

  restoreOriginalPositions(elements);
  applyCommentStyles(comments, isLargeDefaultPosition);

  if (isLargeDefaultPosition) return;

  if (isLargeSecondary) {
    secondary.prepend(comments);
  } else if (isLargeSecondaryBottom) {
    if (secondaryInner.contains(related)) {
      secondaryInner.insertBefore(comments, related);
    } else {
      secondaryInner.appendChild(comments);
      secondaryInner.appendChild(related);
    }
  } else if (isLargeSwitch) {
    secondaryInner.appendChild(comments);
    scheduleRelatedMove(related, below);
  }
}

export function insertCommentsPrimary(elements: YoutubeElements): void {
  if (isFullscreen()) return;

  const { isMediumDefaultPosition, isMediumCommentsUnderPlayer, isMediumUndermetadata } = getLayoutSettings();
  const { comments, metaData, below, related, belowFirstBox, belowSecondBox } = elements;

  if (!comments || !metaData || !below || !related || !belowFirstBox || !belowSecondBox) return;

  restoreOriginalPositions(elements);
  applyCommentStyles(comments, isMediumDefaultPosition);

  if (isMediumDefaultPosition) return;

  if (isMediumCommentsUnderPlayer) {
    below.insertBefore(comments, belowFirstBox);
  } else if (isMediumUndermetadata) {
    belowFirstBox.insertAdjacentElement("afterend", comments);
  }

  // 意図しない位置に related が移動する可能性を防ぐため，delay を入れてから related を移動する
  scheduleRelatedMove(related, belowSecondBox);
}

export function handleFirstRender(elements: YoutubeElements): void {
  rememberOriginalPositions(elements);

  if (isLargeScreenLayout()) {
    insertCommentsSecondary(elements);
  } else {
    insertCommentsPrimary(elements);
  }
}
