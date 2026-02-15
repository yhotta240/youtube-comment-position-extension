import { calculateHeight } from "./height";
import { getElements } from "../elements";

export function applyCommentStyles(comments: HTMLElement, isDefaultPosition: boolean): void {
  comments.classList.toggle('ycp-comments-custom', !isDefaultPosition);

  if (!isDefaultPosition) {
    comments.style.setProperty('--ycp-comments-height', `${calculateHeight()}px`);
  }
}

export function removeCinematics(): void {
  let attempts = 0;
  const interval = setInterval(() => {
    const cinematics = getElements().cinematics;
    if (cinematics) {
      cinematics.remove();
      clearInterval(interval);
    }
    if (++attempts >= 10) {
      clearInterval(interval);
    }
  }, 1000);
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
