import { calculateHeight } from "./height";
import { getElements } from "../elements";

export function applyCommentStyles(comments: HTMLElement, isDefaultPosition: boolean): void {
  comments.classList.toggle('ycp-comments-custom', !isDefaultPosition);

  if (isDefaultPosition) {
    comments.style.removeProperty('--ycp-comments-height');
  } else {
    comments.style.setProperty('--ycp-comments-height', `${calculateHeight()}px`);
  }
}

export function hideCinematics(shouldHide: boolean): void {
  const cinematics = getElements().cinematics;
  cinematics?.classList.toggle('ycp-hidden', shouldHide);
}

export function toggleSticky(target: HTMLElement, shouldSticky: boolean, top: number): void {
  const ytdApp = getElements().ytdApp;
  const parentElement = target.parentElement;
  if (!ytdApp || !parentElement) return;

  ytdApp.classList.toggle('ycp-app-overflow', shouldSticky);
  target.classList.toggle('ycp-sticky', shouldSticky);
  parentElement.classList.toggle('ycp-sticky-parent', shouldSticky);

  if (shouldSticky) {
    target.style.setProperty('--ycp-sticky-top', `${top}px`);
  } else {
    target.style.removeProperty('--ycp-sticky-top');
  }
}
