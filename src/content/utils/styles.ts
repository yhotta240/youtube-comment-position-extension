import { calculateHeight } from "./height";
import { getElements } from "../elements";

export function applyCommentStyles(comments: HTMLElement, isDefaultPosition: boolean): void {
  if (isDefaultPosition) {
    comments.style.padding = '0';
    comments.style.margin = '0';
    comments.style.maxHeight = 'none';
    comments.style.overflowY = 'none';
    return;
  }

  comments.style.position = 'relative';
  comments.style.padding = '0 10px 0 10px';
  comments.style.margin = '0 0 20px 0';
  comments.style.maxHeight = `${calculateHeight()}px`;
  comments.style.overflowY = 'auto';
}

export function removeCinematics(): void {
  let attempts = 0;
  const interval = setInterval(() => {
    const cinematics = getElements().cinematics;
    if (cinematics) {
      cinematics.remove();
      clearInterval(interval);
    }
    attempts++;
    if (attempts >= 10) {
      clearInterval(interval);
    }
  }, 1000);
}

export function makeSticky(target: HTMLElement, top: number): void {
  const ytdApp = getElements().ytdApp;
  const parentElement = target.parentElement;
  if (!ytdApp || !parentElement) return;

  ytdApp.style.overflow = 'visible';
  target.style.position = 'sticky';
  target.style.zIndex = '1000';
  target.style.top = `${top}px`;
  parentElement.style.height = "100%";
}
