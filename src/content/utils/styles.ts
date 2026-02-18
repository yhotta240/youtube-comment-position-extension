import { calculateHeight } from "./height";
import { getElements } from "../elements";
import { getLayoutSettings } from "../state";

export function applyCommentStyles(comments: HTMLElement, isDefaultPosition: boolean): void {
  comments.classList.toggle('ycp-comments-custom', !isDefaultPosition);

  if (!isDefaultPosition) {
    comments.style.setProperty('--ycp-comments-height', `${calculateHeight()}px`);
  }
}

export function applySidebarWidth(): void {
  const { isLargeDefaultPosition, largeSidebarWidth } = getLayoutSettings();
  const { ytdWatchFlexy, columns, primary, video, secondary } = getElements();

  if (!ytdWatchFlexy || !primary || !video || !secondary) return;

  if (!isLargeDefaultPosition && largeSidebarWidth !== null && largeSidebarWidth !== undefined) {
    const columnsWidth = columns ? columns.clientWidth : window.innerWidth;
    // n/12でカラム幅に対する割合を計算し，そこから余白分を差し引いてpxに変換
    // 切り捨てでpxに変換
    const primaryWidth = Math.floor(columnsWidth * ((12 - largeSidebarWidth) / 12));
    const sidebarWidth = Math.floor(columnsWidth * (largeSidebarWidth / 12));
    primary.style.setProperty('--ycp-primary-width', `${primaryWidth}px`, 'important');
    primary.classList.add('ycp-custom-sidebar-width');
    secondary.style.setProperty('--ycp-secondary-width', `${sidebarWidth}px`, 'important');
    secondary.classList.add('ycp-custom-sidebar-width');
    ytdWatchFlexy.classList.add('ycp-custom-sidebar-width');
    video.classList.add('ycp-custom-sidebar-width');
  }
}

export function hideCinematics(shouldHide: boolean): void {
  const cinematics = getElements().cinematics;
  if (cinematics && shouldHide && !cinematics.classList.contains('ycp-hidden')) {
    cinematics.classList.add('ycp-hidden');
  }
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
