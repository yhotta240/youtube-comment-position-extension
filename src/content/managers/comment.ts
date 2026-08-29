import { getLayoutSettings, isEnabled } from "../state";
import { getElements } from "../elements";
import { isLargeScreenLayout } from "content/utils/responsive";

let stickyCommentsTimer: number | undefined;

function clearStickyCommentsTimer(): void {
  if (stickyCommentsTimer !== undefined) {
    clearInterval(stickyCommentsTimer);
    stickyCommentsTimer = undefined;
  }
}

export function makeStickyComments(): void {
  const isLargeScreen = isLargeScreenLayout();
  clearStickyCommentsTimer();
  const { isLargeDefaultPosition, isLargeStickyComments, isMediumDefaultPosition, isMediumStickyComments } = getLayoutSettings();

  const shouldSticky =
    isEnabled && (
      (isLargeScreen && !isLargeDefaultPosition && isLargeStickyComments) ||
      (!isLargeScreen && !isMediumDefaultPosition && isMediumStickyComments)
    );

  const comments = getElements().comments;
  if (!comments) return;

  if (!isEnabled) {
    comments.querySelector<HTMLElement>("#header.style-scope")?.classList.remove('ycp-comment-header-sticky');
    return;
  }

  let count = 0;
  stickyCommentsTimer = window.setInterval(() => {
    const header = comments.querySelector<HTMLElement>("#header.style-scope");
    if (header) {
      const headerRenderer = header.querySelector<HTMLElement>("ytd-comments-header-renderer");
      if (!headerRenderer) return;

      header.classList.toggle('ycp-comment-header-sticky', shouldSticky);
      clearStickyCommentsTimer();
    } else if (++count >= 20) {
      clearStickyCommentsTimer();
    }
  }, 100);
}
