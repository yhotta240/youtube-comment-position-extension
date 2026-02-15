import { getLayoutSettings } from "../state";
import { getElements } from "../elements";

export function makeStickyComments(isLargeScreen: boolean): void {
  const { isLargeDefaultPosition, isLargeStickyComments, isMediumDefaultPosition, isMediumStickyComments } = getLayoutSettings();

  const shouldSticky =
    (isLargeScreen && !isLargeDefaultPosition && isLargeStickyComments) ||
    (!isLargeScreen && !isMediumDefaultPosition && isMediumStickyComments);

  const comments = getElements().comments;
  if (!comments) return;

  let count = 0;
  const interval = setInterval(() => {
    const header = comments.querySelector<HTMLElement>("#header.style-scope");
    if (header) {
      const headerRenderer = header.querySelector<HTMLElement>("ytd-comments-header-renderer");
      if (!headerRenderer) return;

      header.classList.toggle('ycp-comment-header-sticky', shouldSticky);
      clearInterval(interval);
    } else if (++count >= 20) {
      clearInterval(interval);
    }
  }, 100);
}
