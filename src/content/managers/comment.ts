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

      if (shouldSticky) {
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.zIndex = '999';
        header.style.background = 'var(--yt-spec-base-background)';
        header.style.paddingBottom = '5px';
        headerRenderer.style.marginBottom = '5px';
      } else {
        header.style.position = 'relative';
        header.style.top = '0';
        header.style.zIndex = '0';
        header.style.background = 'transparent';
        header.style.paddingBottom = '0';
        headerRenderer.style.marginBottom = 'var(--comments-header-renderer-margin-bottom,32px)';
      }

      clearInterval(interval);
    } else if (++count > 20) {
      clearInterval(interval);
    }
  }, 100);
}
