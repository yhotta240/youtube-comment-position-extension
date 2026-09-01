import { getLayoutSettings, isEnabled } from "../state";
import { getElements } from "../elements";
import { isLargeScreenLayout } from "content/utils/responsive";

let stickyCommentsObserver: MutationObserver | undefined;

function clearStickyCommentsObserver(): void {
  stickyCommentsObserver?.disconnect();
  stickyCommentsObserver = undefined;
}

function applyStickyComments(comments: HTMLElement, shouldSticky: boolean): boolean {
  const header = comments.querySelector<HTMLElement>("#header.style-scope");
  if (!header?.querySelector<HTMLElement>("ytd-comments-header-renderer")) return false;

  header.classList.toggle('ycp-comment-header-sticky', shouldSticky);
  return true;
}

export function makeStickyComments(): void {
  const isLargeScreen = isLargeScreenLayout();
  clearStickyCommentsObserver();
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

  if (applyStickyComments(comments, shouldSticky)) return;

  stickyCommentsObserver = new MutationObserver(() => {
    if (applyStickyComments(comments, shouldSticky)) {
      clearStickyCommentsObserver();
    }
  });
  stickyCommentsObserver.observe(comments, { childList: true, subtree: true });
}
